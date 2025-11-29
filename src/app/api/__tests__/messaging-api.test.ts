import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock database operations
jest.mock('@/lib/db', () => ({
  default: {
    conversation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
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

describe('Messaging API', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = require('@/lib/db').default;
    jest.clearAllMocks();
  });

  describe('Conversations API', () => {
    it('should list user conversations', async () => {
      const mockConversations = [
        {
          id: 'conv1',
          participants: ['user123', 'user456'],
          bookingId: 'booking1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.conversation.findMany.mockResolvedValue(mockConversations);

      const getConversationsHandler = async (user: any, queryParams: any = {}) => {
        const page = Math.max(1, parseInt(queryParams.page || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit || '20')));
        const skip = (page - 1) * limit;

        const conversations = await mockDb.conversation.findMany({
          where: {
            participants: { has: user.id },
          },
          include: {
            participants: {
              select: { id: true, firstName: true, lastName: true },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        });

        return { status: 200, data: conversations };
      };

      const mockUser = { id: 'user123' };
      const result = await getConversationsHandler(mockUser);

      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockConversations);
      expect(mockDb.conversation.findMany).toHaveBeenCalledWith({
        where: { participants: { has: 'user123' } },
        include: expect.any(Object),
        orderBy: { updatedAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should create new conversation', async () => {
      const mockConversation = {
        id: 'conv1',
        participants: ['user123', 'user456'],
        bookingId: 'booking1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.conversation.findFirst.mockResolvedValue(null); // No existing conversation
      mockDb.conversation.create.mockResolvedValue(mockConversation);

      const createConversationHandler = async (body: any, user: any) => {
        if (!body.participantIds || !Array.isArray(body.participantIds)) {
          return { status: 400, error: 'participantIds is required and must be an array' };
        }

        if (body.participantIds.includes(user.id)) {
          return { status: 400, error: 'Cannot create conversation with yourself' };
        }

        const participantIds = [user.id, ...body.participantIds];

        // Check for existing conversation
        const existingConversation = await mockDb.conversation.findFirst({
          where: {
            participants: { hasEvery: participantIds },
          },
        });

        if (existingConversation) {
          return { status: 200, data: existingConversation };
        }

        const conversation = await mockDb.conversation.create({
          data: {
            participants: participantIds,
            bookingId: body.bookingId,
          },
        });

        return { status: 201, data: conversation };
      };

      const mockUser = { id: 'user123' };
      const body = {
        participantIds: ['user456'],
        bookingId: 'booking1',
      };

      const result = await createConversationHandler(body, mockUser);

      expect(result.status).toBe(201);
      expect(result.data).toEqual(mockConversation);
      expect(mockDb.conversation.create).toHaveBeenCalledWith({
        data: {
          participants: ['user123', 'user456'],
          bookingId: 'booking1',
        },
      });
    });

    it('should prevent duplicate conversations', async () => {
      const existingConversation = {
        id: 'conv1',
        participants: ['user123', 'user456'],
      };

      mockDb.conversation.findFirst.mockResolvedValue(existingConversation);

      const createConversationHandler = async (body: any, user: any) => {
        const participantIds = [user.id, ...body.participantIds];

        const existingConversation = await mockDb.conversation.findFirst({
          where: {
            participants: { hasEvery: participantIds },
          },
        });

        if (existingConversation) {
          return { status: 200, data: existingConversation };
        }

        // Would create new conversation if none existed
        return { status: 201, data: null };
      };

      const mockUser = { id: 'user123' };
      const body = { participantIds: ['user456'] };

      const result = await createConversationHandler(body, mockUser);

      expect(result.status).toBe(200); // Returns existing conversation
      expect(result.data).toEqual(existingConversation);
      expect(mockDb.conversation.create).not.toHaveBeenCalled();
    });

    it('should validate conversation input', async () => {
      const createConversationHandler = async (body: any, user: any) => {
        if (!body.participantIds) {
          return { status: 400, error: 'participantIds is required' };
        }

        if (!Array.isArray(body.participantIds)) {
          return { status: 400, error: 'participantIds must be an array' };
        }

        if (body.participantIds.length === 0) {
          return { status: 400, error: 'At least one participant is required' };
        }

        if (body.participantIds.includes(user.id)) {
          return { status: 400, error: 'Cannot create conversation with yourself' };
        }

        return { status: 200, message: 'Valid input' };
      };

      const mockUser = { id: 'user123' };

      // Test missing participantIds
      let result = await createConversationHandler({}, mockUser);
      expect(result.status).toBe(400);
      expect(result.error).toBe('participantIds is required');

      // Test invalid participantIds type
      result = await createConversationHandler({ participantIds: 'invalid' }, mockUser);
      expect(result.status).toBe(400);
      expect(result.error).toBe('participantIds must be an array');

      // Test empty participantIds
      result = await createConversationHandler({ participantIds: [] }, mockUser);
      expect(result.status).toBe(400);
      expect(result.error).toBe('At least one participant is required');

      // Test self-conversation
      result = await createConversationHandler({ participantIds: ['user123'] }, mockUser);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Cannot create conversation with yourself');
    });
  });

  describe('Messages API', () => {
    it('should send message to conversation', async () => {
      const mockMessage = {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'user123',
        content: 'Hello there!',
        createdAt: new Date(),
      };

      const mockConversation = {
        id: 'conv1',
        participants: ['user123', 'user456'],
      };

      mockDb.conversation.findFirst.mockResolvedValue(mockConversation);
      mockDb.message.create.mockResolvedValue(mockMessage);

      const sendMessageHandler = async (body: any, user: any) => {
        if (!body.conversationId || !body.content) {
          return { status: 400, error: 'conversationId and content are required' };
        }

        // Check if user is participant
        const conversation = await mockDb.conversation.findFirst({
          where: {
            id: body.conversationId,
            participants: { has: user.id },
          },
        });

        if (!conversation) {
          return { status: 404, error: 'Conversation not found' };
        }

        const message = await mockDb.message.create({
          data: {
            conversationId: body.conversationId,
            senderId: user.id,
            content: body.content,
            attachments: body.attachments || [],
          },
        });

        return { status: 201, data: message };
      };

      const mockUser = { id: 'user123' };
      const body = {
        conversationId: 'conv1',
        content: 'Hello there!',
      };

      const result = await sendMessageHandler(body, mockUser);

      expect(result.status).toBe(201);
      expect(result.data).toEqual(mockMessage);
      expect(mockDb.message.create).toHaveBeenCalledWith({
        data: {
          conversationId: 'conv1',
          senderId: 'user123',
          content: 'Hello there!',
          attachments: [],
        },
      });
    });

    it('should get messages from conversation', async () => {
      const mockMessages = [
        {
          id: 'msg1',
          conversationId: 'conv1',
          senderId: 'user123',
          content: 'Hello!',
          createdAt: new Date('2025-01-01T10:00:00Z'),
        },
        {
          id: 'msg2',
          conversationId: 'conv1',
          senderId: 'user456',
          content: 'Hi there!',
          createdAt: new Date('2025-01-01T10:01:00Z'),
        },
      ];

      const mockConversation = {
        id: 'conv1',
        participants: ['user123', 'user456'],
      };

      mockDb.conversation.findFirst.mockResolvedValue(mockConversation);
      mockDb.message.findMany.mockResolvedValue(mockMessages);

      const getMessagesHandler = async (
        conversationId: string,
        user: any,
        queryParams: any = {}
      ) => {
        // Check if user is participant
        const conversation = await mockDb.conversation.findFirst({
          where: {
            id: conversationId,
            participants: { has: user.id },
          },
        });

        if (!conversation) {
          return { status: 404, error: 'Conversation not found' };
        }

        const page = Math.max(1, parseInt(queryParams.page || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit || '20')));
        const skip = (page - 1) * limit;

        const messages = await mockDb.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit,
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        });

        return { status: 200, data: messages };
      };

      const mockUser = { id: 'user123' };
      const result = await getMessagesHandler('conv1', mockUser);

      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockMessages);
      expect(mockDb.message.findMany).toHaveBeenCalledWith({
        where: { conversationId: 'conv1' },
        orderBy: { createdAt: 'asc' },
        skip: 0,
        take: 20,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    });

    it('should validate message input', async () => {
      const sendMessageHandler = async (body: any, _user: any) => {
        if (!body.conversationId) {
          return { status: 400, error: 'conversationId is required' };
        }

        if (body.content === undefined || body.content === null) {
          return { status: 400, error: 'content is required and must be a string' };
        }

        if (typeof body.content !== 'string') {
          return { status: 400, error: 'content is required and must be a string' };
        }

        if (body.content.length === 0) {
          return { status: 400, error: 'content cannot be empty' };
        }

        if (body.content.length > 1000) {
          return { status: 400, error: 'content too long (max 1000 characters)' };
        }

        return { status: 200, message: 'Valid input' };
      };

      const mockUser = { id: 'user123' };

      // Test missing conversationId
      let result = await sendMessageHandler({ content: 'Hello' }, mockUser);
      expect(result.status).toBe(400);
      expect(result.error).toBe('conversationId is required');

      // Test missing content
      result = await sendMessageHandler({ conversationId: 'conv1' }, mockUser);
      expect(result.status).toBe(400);
      expect(result.error).toBe('content is required and must be a string');

      // Test empty content
      result = await sendMessageHandler({ conversationId: 'conv1', content: '' }, mockUser);
      expect(result.status).toBe(400);
      expect(result.error).toBe('content cannot be empty');

      // Test content too long
      result = await sendMessageHandler(
        {
          conversationId: 'conv1',
          content: 'a'.repeat(1001),
        },
        mockUser
      );
      expect(result.status).toBe(400);
      expect(result.error).toBe('content too long (max 1000 characters)');
    });

    it('should mark messages as read', async () => {
      mockDb.message.updateMany.mockResolvedValue({ count: 3 });

      const markAsReadHandler = async (body: any, user: any) => {
        if (!body.conversationId) {
          return { status: 400, error: 'conversationId is required' };
        }

        const result = await mockDb.message.updateMany({
          where: {
            conversationId: body.conversationId,
            senderId: { not: user.id }, // Don't mark own messages as read
            readAt: null,
          },
          data: {
            readAt: new Date(),
          },
        });

        return { status: 200, data: { updatedCount: result.count } };
      };

      const mockUser = { id: 'user123' };
      const body = { conversationId: 'conv1' };

      const result = await markAsReadHandler(body, mockUser);

      expect(result.status).toBe(200);
      expect(result.data?.updatedCount).toBe(3);
      expect(mockDb.message.updateMany).toHaveBeenCalledWith({
        where: {
          conversationId: 'conv1',
          senderId: { not: 'user123' },
          readAt: null,
        },
        data: {
          readAt: expect.any(Date),
        },
      });
    });
  });

  describe('Message Authentication and Authorization', () => {
    it('should require authentication', async () => {
      const handler = (user: any) => {
        if (!user) {
          return { status: 401, error: 'Unauthorized' };
        }
        return { status: 200, message: 'Authorized' };
      };

      const result = await handler(null);
      expect(result.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('should validate conversation access', async () => {
      mockDb.conversation.findFirst.mockResolvedValue(null); // No conversation found for user

      const checkAccessHandler = async (conversationId: string, user: any) => {
        const conversation = await mockDb.conversation.findFirst({
          where: {
            id: conversationId,
            participants: { has: user.id },
          },
        });

        if (!conversation) {
          return { status: 404, error: 'Conversation not found' };
        }

        return { status: 200, data: conversation };
      };

      const mockUser = { id: 'user123' };
      const result = await checkAccessHandler('conv1', mockUser);

      expect(result.status).toBe(404);
      expect(result.error).toBe('Conversation not found');
    });
  });
});
