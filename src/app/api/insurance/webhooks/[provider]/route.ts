import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Mock webhook handler for insurance provider status updates
export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider.toLowerCase();
    const body = await request.json();

        // Log the webhook for debugging
    // console.log(`Received webhook from insurance provider: ${provider}`, body);

    // Validate provider
    const validProviders = ['zemo_partner', 'madison_insurance', 'professional_insurance'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Handle different webhook types based on provider format
    switch (body.event_type || body.type) {
      case 'policy_activated':
      case 'policy.activated':
        await handlePolicyActivation(body);
        break;
        
      case 'policy_cancelled':
      case 'policy.cancelled':
        await handlePolicyCancellation(body);
        break;
        
      case 'claim_status_updated':
      case 'claim.status_updated':
        await handleClaimStatusUpdate(body);
        break;
        
      case 'claim_settled':
      case 'claim.settled':
        await handleClaimSettlement(body);
        break;
        
      default:
        // console.log(`Unknown webhook event type: ${body.event_type || body.type}`);
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('Error processing insurance webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle policy activation webhook
async function handlePolicyActivation(data: any) {
  const { policy_number, external_policy_id, activation_date } = data;
  
  try {
    // Find policy by number or external ID
    const policy = await prisma.insurancePolicy.findFirst({
      where: {
        OR: [
          { policyNumber: policy_number },
          { providerPolicyId: external_policy_id },
        ],
      },
    });

    if (!policy) {
      console.error('Policy not found for activation:', { policy_number, external_policy_id });
      return;
    }

    // Update policy status to active
    await prisma.insurancePolicy.update({
      where: { id: policy.id },
      data: {
        status: 'ACTIVE',
        activatedAt: activation_date ? new Date(activation_date) : new Date(),
        providerPolicyId: external_policy_id || policy.providerPolicyId,
      },
    });

    // console.log(`Policy ${policy.policyNumber} activated successfully`);
  } catch (error) {
    console.error('Error activating policy:', error);
  }
}

// Handle policy cancellation webhook
async function handlePolicyCancellation(data: any) {
  const { policy_number, external_policy_id, cancellation_date } = data;
  
  try {
    // Find policy by number or external ID
    const policy = await prisma.insurancePolicy.findFirst({
      where: {
        OR: [
          { policyNumber: policy_number },
          { providerPolicyId: external_policy_id },
        ],
      },
    });

    if (!policy) {
      console.error('Policy not found for cancellation:', { policy_number, external_policy_id });
      return;
    }

    // Update policy status to cancelled
    await prisma.insurancePolicy.update({
      where: { id: policy.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: cancellation_date ? new Date(cancellation_date) : new Date(),
      },
    });

    // console.log(`Policy ${policy.policyNumber} cancelled:`, reason);
  } catch (error) {
    console.error('Error cancelling policy:', error);
  }
}

// Handle claim status update webhook
async function handleClaimStatusUpdate(data: any) {
  const { claim_number, external_claim_id, status, notes, investigator_notes } = data;
  
  try {
    // Find claim by number or external ID
    const claim = await prisma.claim.findFirst({
      where: {
        OR: [
          { claimNumber: claim_number },
          { insurerClaimId: external_claim_id },
        ],
      },
    });

    if (!claim) {
      console.error('Claim not found for status update:', { claim_number, external_claim_id });
      return;
    }

    // Map provider status to our status
    const statusMapping: Record<string, string> = {
      'received': 'SUBMITTED',
      'reviewing': 'UNDER_REVIEW',
      'investigating': 'INVESTIGATING',
      'approved': 'APPROVED',
      'rejected': 'REJECTED',
      'settled': 'SETTLED',
      'closed': 'CLOSED',
    };

    const mappedStatus = statusMapping[status.toLowerCase()] || status.toUpperCase();

    // Update claim status
    await prisma.claim.update({
      where: { id: claim.id },
      data: {
        status: mappedStatus as any,
        reviewNotes: notes || investigator_notes,
        insurerClaimId: external_claim_id || claim.insurerClaimId,
        updatedAt: new Date(),
      },
    });

    // console.log(`Claim ${claim.claimNumber} status updated to: ${mappedStatus}`);
  } catch (error) {
    console.error('Error updating claim status:', error);
  }
}

// Handle claim settlement webhook
async function handleClaimSettlement(data: any) {
  const { 
    claim_number, 
    external_claim_id, 
    settlement_amount, 
    settlement_date,
    settlement_notes 
  } = data;
  
  try {
    // Find claim by number or external ID
    const claim = await prisma.claim.findFirst({
      where: {
        OR: [
          { claimNumber: claim_number },
          { insurerClaimId: external_claim_id },
        ],
      },
    });

    if (!claim) {
      console.error('Claim not found for settlement:', { claim_number, external_claim_id });
      return;
    }

    // Update claim with settlement information
    await prisma.claim.update({
      where: { id: claim.id },
      data: {
        status: 'SETTLED',
        settlementAmount: settlement_amount,
        settlementDate: settlement_date ? new Date(settlement_date) : new Date(),
        settlementNotes: settlement_notes,
        updatedAt: new Date(),
      },
    });

    // console.log(`Claim ${claim.claimNumber} settled for: ${settlement_amount}`);
  } catch (error) {
    console.error('Error settling claim:', error);
  }
}

// GET endpoint for webhook testing
export async function GET(
  _request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  
  return NextResponse.json({
    success: true,
    message: `Insurance webhook endpoint for ${provider} is active`,
    supportedEvents: [
      'policy_activated',
      'policy_cancelled', 
      'claim_status_updated',
      'claim_settled',
    ],
  });
}