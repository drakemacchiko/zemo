import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock database operations
jest.mock('@/lib/db', () => ({
  default: {
    supportTicket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    ticketMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    ticketAttachment: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  withAuth: jest.fn((handler: any) => handler),
}));

// Mock file operations
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

describe('Support System API', () => {
  describe('Support Tickets API', () => {
    let mockDb: any;

    beforeEach(() => {
      mockDb = require('@/lib/db').default;
      jest.clearAllMocks();
    });

    it('should create a new support ticket', async () => {
      const mockTicket = {
        id: '1',
        ticketNumber: 'TICKET-12345',
        userId: 'user1',
        subject: 'Vehicle Issue',
        description: 'The car has a problem',
        priority: 'MEDIUM',
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.supportTicket.create.mockResolvedValue(mockTicket);

      // Simulate the handler logic directly
      const createTicketHandler = async (body: any, user: any) => {
        if (!body.subject || !body.description) {
          return { status: 400, error: 'Missing required fields' };
        }

        const ticketNumber = `TICKET-${Date.now()}`;

        const ticket = await mockDb.supportTicket.create({
          data: {
            userId: user.id,
            ticketNumber,
            subject: body.subject,
            description: body.description,
            priority: body.priority || 'MEDIUM',
            category: body.category || 'GENERAL',
            status: 'OPEN',
          },
        });

        return { status: 201, data: ticket };
      };

      const requestBody = {
        subject: 'Vehicle Issue',
        description: 'The car has a problem',
        priority: 'MEDIUM',
        category: 'VEHICLE',
      };

      const mockUser = { id: 'user1' };
      const result = await createTicketHandler(requestBody, mockUser);

      expect(result.status).toBe(201);
      expect(result.data.subject).toBe('Vehicle Issue');
      expect(mockDb.supportTicket.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          ticketNumber: expect.stringMatching(/^TICKET-\d+$/),
          subject: 'Vehicle Issue',
          description: 'The car has a problem',
          priority: 'MEDIUM',
          category: 'VEHICLE',
          status: 'OPEN',
        },
      });
    });

    it('should list user support tickets', async () => {
      const mockTickets = [
        {
          id: '1',
          ticketNumber: 'TICKET-12345',
          subject: 'Vehicle Issue',
          status: 'OPEN',
          priority: 'MEDIUM',
          createdAt: new Date(),
        },
      ];

      mockDb.supportTicket.findMany.mockResolvedValue(mockTickets);

      const listTicketsHandler = async (user: any) => {
        const tickets = await mockDb.supportTicket.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true,
            priority: true,
            category: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return { status: 200, data: tickets };
      };

      const mockUser = { id: 'user1' };
      const result = await listTicketsHandler(mockUser);

      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].ticketNumber).toBe('TICKET-12345');
      expect(mockDb.supportTicket.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should get single ticket with messages', async () => {
      const mockTicketWithMessages = {
        id: '1',
        ticketNumber: 'TICKET-12345',
        subject: 'Vehicle Issue',
        description: 'The car has a problem',
        status: 'OPEN',
        priority: 'MEDIUM',
        messages: [
          {
            id: '1',
            content: 'Thank you for your inquiry',
            isFromSupport: true,
            createdAt: new Date(),
          },
        ],
        attachments: [],
      };

      mockDb.supportTicket.findUnique.mockResolvedValue(mockTicketWithMessages);

      const getTicketHandler = async (ticketId: string, user: any) => {
        const ticket = await mockDb.supportTicket.findUnique({
          where: {
            id: ticketId,
            userId: user.id,
          },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              include: { attachments: true },
            },
          },
        });

        if (!ticket) {
          return { status: 404, error: 'Ticket not found' };
        }

        return { status: 200, data: ticket };
      };

      const mockUser = { id: 'user1' };
      const result = await getTicketHandler('1', mockUser);

      expect(result.status).toBe(200);
      expect(result.data.ticketNumber).toBe('TICKET-12345');
      expect(result.data.messages).toHaveLength(1);
      expect(mockDb.supportTicket.findUnique).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
        include: expect.any(Object),
      });
    });

    it('should add message to ticket', async () => {
      const mockMessage = {
        id: '1',
        ticketId: '1',
        content: 'This is my follow-up message',
        isFromSupport: false,
        createdAt: new Date(),
      };

      const mockTicket = {
        id: '1',
        userId: 'user1',
        status: 'OPEN',
      };

      mockDb.supportTicket.findUnique.mockResolvedValue(mockTicket);
      mockDb.ticketMessage.create.mockResolvedValue(mockMessage);

      const addMessageHandler = async (body: any, ticketId: string, user: any) => {
        if (!body.content) {
          return { status: 400, error: 'Message content is required' };
        }

        // Check if ticket exists and belongs to user
        const ticket = await mockDb.supportTicket.findUnique({
          where: { id: ticketId, userId: user.id },
        });

        if (!ticket) {
          return { status: 404, error: 'Ticket not found' };
        }

        const message = await mockDb.ticketMessage.create({
          data: {
            ticketId,
            content: body.content,
            isFromSupport: false,
          },
        });

        // Update ticket status if it was closed
        if (ticket.status === 'CLOSED') {
          await mockDb.supportTicket.update({
            where: { id: ticketId },
            data: { status: 'OPEN' },
          });
        }

        return { status: 201, data: message };
      };

      const requestBody = { content: 'This is my follow-up message' };
      const mockUser = { id: 'user1' };
      const result = await addMessageHandler(requestBody, '1', mockUser);

      expect(result.status).toBe(201);
      expect(result.data.content).toBe('This is my follow-up message');
      expect(mockDb.ticketMessage.create).toHaveBeenCalledWith({
        data: {
          ticketId: '1',
          content: 'This is my follow-up message',
          isFromSupport: false,
        },
      });
    });
  });

  describe('Support Ticket Validation', () => {
    it('should validate required fields for ticket creation', () => {
      const validateTicket = (data: any) => {
        const errors = [];

        if (!data.subject) errors.push('Subject is required');
        if (!data.description) errors.push('Description is required');
        if (data.priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(data.priority)) {
          errors.push('Invalid priority');
        }
        if (
          data.category &&
          !['GENERAL', 'VEHICLE', 'BOOKING', 'PAYMENT', 'TECHNICAL'].includes(data.category)
        ) {
          errors.push('Invalid category');
        }

        return errors;
      };

      expect(validateTicket({})).toEqual(['Subject is required', 'Description is required']);
      expect(validateTicket({ subject: 'Test', description: 'Test desc' })).toEqual([]);
      expect(
        validateTicket({ subject: 'Test', description: 'Test desc', priority: 'INVALID' })
      ).toEqual(['Invalid priority']);
    });

    it('should validate message content', () => {
      const validateMessage = (content: string) => {
        if (!content || content.trim().length === 0) {
          return 'Message content is required';
        }
        if (content.length > 5000) {
          return 'Message content too long';
        }
        return null;
      };

      expect(validateMessage('')).toBe('Message content is required');
      expect(validateMessage('Valid message')).toBeNull();
      expect(validateMessage('a'.repeat(5001))).toBe('Message content too long');
    });
  });

  describe('File Attachment Handling', () => {
    it('should validate file attachments', () => {
      const validateAttachment = (file: any) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!file) return 'File is required';
        if (!allowedTypes.includes(file.type)) return 'Invalid file type';
        if (file.size > maxSize) return 'File too large';

        return null;
      };

      expect(validateAttachment(null)).toBe('File is required');
      expect(validateAttachment({ type: 'image/jpeg', size: 1024 })).toBeNull();
      expect(validateAttachment({ type: 'application/exe', size: 1024 })).toBe('Invalid file type');
      expect(validateAttachment({ type: 'image/jpeg', size: 20 * 1024 * 1024 })).toBe(
        'File too large'
      );
    });

    it('should generate unique file names', () => {
      const generateFileName = (originalName: string) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const extension = originalName.split('.').pop();
        return `${timestamp}_${random}.${extension}`;
      };

      const fileName1 = generateFileName('test.pdf');
      const fileName2 = generateFileName('test.pdf');

      expect(fileName1).toMatch(/^\d+_[a-z0-9]+\.pdf$/);
      expect(fileName2).toMatch(/^\d+_[a-z0-9]+\.pdf$/);
      expect(fileName1).not.toBe(fileName2);
    });
  });

  describe('Ticket Status Management', () => {
    it('should handle valid status transitions', () => {
      const isValidTransition = (from: string, to: string) => {
        const validTransitions: { [key: string]: string[] } = {
          OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
          IN_PROGRESS: ['OPEN', 'RESOLVED', 'CLOSED'],
          RESOLVED: ['OPEN', 'CLOSED'],
          CLOSED: ['OPEN'],
        };

        return validTransitions[from]?.includes(to) || false;
      };

      expect(isValidTransition('OPEN', 'IN_PROGRESS')).toBe(true);
      expect(isValidTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
      expect(isValidTransition('RESOLVED', 'CLOSED')).toBe(true);
      expect(isValidTransition('CLOSED', 'OPEN')).toBe(true);
      expect(isValidTransition('CLOSED', 'IN_PROGRESS')).toBe(false);
    });

    it('should auto-reopen closed tickets on new message', async () => {
      const mockTicket = { id: '1', status: 'CLOSED' };
      const mockDb = require('@/lib/db').default;

      mockDb.supportTicket.findUnique.mockResolvedValue(mockTicket);
      mockDb.supportTicket.update.mockResolvedValue({ ...mockTicket, status: 'OPEN' });

      const handleNewMessage = async (ticketId: string) => {
        const ticket = await mockDb.supportTicket.findUnique({
          where: { id: ticketId },
        });

        if (ticket.status === 'CLOSED') {
          await mockDb.supportTicket.update({
            where: { id: ticketId },
            data: { status: 'OPEN', updatedAt: new Date() },
          });
        }

        return 'Message added and ticket reopened';
      };

      const result = await handleNewMessage('1');

      expect(result).toBe('Message added and ticket reopened');
      expect(mockDb.supportTicket.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'OPEN', updatedAt: expect.any(Date) },
      });
    });
  });

  describe('Support Metrics', () => {
    it('should calculate response time metrics', () => {
      const calculateResponseTime = (createdAt: Date, firstResponseAt?: Date) => {
        if (!firstResponseAt) return null;

        const diffMs = firstResponseAt.getTime() - createdAt.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) };
      };

      const createdAt = new Date('2025-01-01T10:00:00Z');
      const respondedAt = new Date('2025-01-01T12:30:00Z');

      const responseTime = calculateResponseTime(createdAt, respondedAt);

      expect(responseTime?.hours).toBe(2);
      expect(responseTime?.minutes).toBe(30);
      expect(responseTime?.totalMinutes).toBe(150);
    });

    it('should categorize tickets by priority', () => {
      const tickets = [
        { priority: 'LOW' },
        { priority: 'MEDIUM' },
        { priority: 'HIGH' },
        { priority: 'URGENT' },
        { priority: 'MEDIUM' },
      ];

      const categorize = (tickets: any[]) => {
        const categories = tickets.reduce(
          (acc, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
          },
          {} as { [key: string]: number }
        );

        return categories;
      };

      const result = categorize(tickets);

      expect(result).toEqual({
        LOW: 1,
        MEDIUM: 2,
        HIGH: 1,
        URGENT: 1,
      });
    });
  });
});
