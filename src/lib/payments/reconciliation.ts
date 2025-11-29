import { prisma } from '@/lib/db';
import { PaymentServiceFactory } from '@/lib/payments';

interface ReconciliationResult {
  processed: number;
  updated: number;
  failed: number;
  errors: Array<{
    paymentId: string;
    error: string;
  }>;
}

export class PaymentReconciliationService {
  async reconcilePayments(
    hoursBack: number = 24,
    batchSize: number = 50
  ): Promise<ReconciliationResult> {
    const result: ReconciliationResult = {
      processed: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    try {
      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      // Find payments that need reconciliation
      const paymentsToReconcile = await prisma.payment?.findMany({
        where: {
          OR: [{ status: 'PENDING' }, { status: 'PROCESSING' }, { status: 'HELD' }],
          providerTransactionId: { not: null },
          updatedAt: { gte: cutoffTime },
        },
        take: batchSize,
        orderBy: { updatedAt: 'asc' },
      });

      if (!paymentsToReconcile || paymentsToReconcile.length === 0) {
        // No payments found for reconciliation
        return result;
      }

      // Starting reconciliation for payments

      for (const payment of paymentsToReconcile) {
        result.processed++;

        try {
          const paymentService = PaymentServiceFactory.getService(payment.provider as any);
          const statusResponse = await paymentService.getPaymentStatus(
            payment.providerTransactionId!
          );

          // Check if status has changed
          if (statusResponse.status !== payment.status) {
            const updateData: any = {
              status: statusResponse.status as any,
              processedAt: statusResponse.processedAt || new Date(),
            };

            if (statusResponse.failureReason) {
              updateData.failureReason = statusResponse.failureReason;
            }

            await prisma.payment?.update({
              where: { id: payment.id },
              data: updateData,
            });

            result.updated++;

            // Update related booking status if needed
            if (payment.intent === 'PAYMENT' && statusResponse.status === 'COMPLETED') {
              await this.updateBookingStatus(payment.bookingId, 'CONFIRMED');
            } else if (statusResponse.status === 'FAILED') {
              await this.updateBookingStatus(payment.bookingId, 'CANCELLED');
            }

            // Payment status updated
          }
        } catch (error) {
          result.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push({
            paymentId: payment.id,
            error: errorMessage,
          });

          console.error(`Failed to reconcile payment ${payment.id}:`, errorMessage);
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Reconciliation completed
      return result;
    } catch (error) {
      console.error('Reconciliation process failed:', error);
      throw error;
    }
  }

  private async updateBookingStatus(bookingId: string, status: string) {
    try {
      const updateData: any = {
        status: status as any,
      };

      if (status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      }

      if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }

      await prisma.booking?.update({
        where: { id: bookingId },
        data: updateData,
      });
    } catch (error) {
      console.error(`Failed to update booking ${bookingId} status:`, error);
    }
  }

  async reconcileStaleHolds(daysOld: number = 7): Promise<ReconciliationResult> {
    const result: ReconciliationResult = {
      processed: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    try {
      const cutoffTime = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      // Find old holds that should be released
      const staleHolds = await prisma.payment?.findMany({
        where: {
          status: 'HELD',
          intent: 'HOLD',
          createdAt: { lte: cutoffTime },
        },
      });

      if (!staleHolds || staleHolds.length === 0) {
        // No stale holds found
        return result;
      }

      // Found stale holds to release

      for (const hold of staleHolds) {
        result.processed++;

        try {
          const paymentService = PaymentServiceFactory.getService(hold.provider as any);
          const releaseResult = await paymentService.releaseFunds(hold.id);

          if (releaseResult.success) {
            await prisma.payment?.update({
              where: { id: hold.id },
              data: {
                status: 'RELEASED',
                processedAt: new Date(),
              },
            });

            result.updated++;
            // Released stale hold
          } else {
            result.failed++;
            result.errors.push({
              paymentId: hold.id,
              error: releaseResult.error || 'Release failed',
            });
          }
        } catch (error) {
          result.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push({
            paymentId: hold.id,
            error: errorMessage,
          });

          console.error(`Failed to release stale hold ${hold.id}:`, errorMessage);
        }
      }

      // Stale hold cleanup completed
      return result;
    } catch (error) {
      console.error('Stale hold cleanup failed:', error);
      throw error;
    }
  }

  async generateReconciliationReport(hoursBack: number = 24): Promise<{
    totalPayments: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
    heldPayments: number;
    totalAmount: number;
    providerBreakdown: Record<
      string,
      {
        count: number;
        amount: number;
        successRate: number;
      }
    >;
  }> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const payments =
      (await prisma.payment?.findMany({
        where: {
          createdAt: { gte: cutoffTime },
        },
      })) || [];

    const totalPayments = payments.length;
    const pendingPayments = payments.filter((p: any) => p.status === 'PENDING').length;
    const completedPayments = payments.filter((p: any) => p.status === 'COMPLETED').length;
    const failedPayments = payments.filter((p: any) => p.status === 'FAILED').length;
    const heldPayments = payments.filter((p: any) => p.status === 'HELD').length;
    const totalAmount = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    // Provider breakdown
    const providerBreakdown: Record<
      string,
      { count: number; amount: number; successRate: number }
    > = {};

    for (const payment of payments) {
      if (!providerBreakdown[payment.provider]) {
        providerBreakdown[payment.provider] = { count: 0, amount: 0, successRate: 0 };
      }

      providerBreakdown[payment.provider]!.count++;
      providerBreakdown[payment.provider]!.amount += payment.amount;
    }

    // Calculate success rates
    for (const provider in providerBreakdown) {
      const providerPayments = payments.filter((p: any) => p.provider === provider);
      const successfulPayments = providerPayments.filter(
        (p: any) => p.status === 'COMPLETED'
      ).length;
      providerBreakdown[provider]!.successRate =
        providerPayments.length > 0 ? (successfulPayments / providerPayments.length) * 100 : 0;
    }

    return {
      totalPayments,
      pendingPayments,
      completedPayments,
      failedPayments,
      heldPayments,
      totalAmount,
      providerBreakdown,
    };
  }
}

// Singleton instance
export const paymentReconciliation = new PaymentReconciliationService();
