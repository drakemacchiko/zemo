// Script to test payment scenarios in sandbox mode
// Usage: node scripts/run-payment-scenarios.js

const { PaymentServiceFactory, PaymentUtils, PaymentProvider } = require('../src/lib/payments');

async function testAirtelMoney() {
  console.log('\n=== Testing Airtel Money ===');
  
  const service = PaymentServiceFactory.getService(PaymentProvider.AIRTEL_MONEY);
  
  // Test payment
  console.log('Testing payment...');
  const paymentResult = await service.processPayment({
    amount: 100,
    currency: 'ZMW',
    customerId: 'test-user-1',
    description: 'Test payment'
  });
  console.log('Payment result:', paymentResult);
  
  // Test hold
  console.log('\nTesting hold...');
  const holdResult = await service.holdFunds({
    amount: 250,
    currency: 'ZMW',
    paymentMethodId: 'test-method-1',
    customerId: 'test-user-1',
    description: 'Test security deposit'
  });
  console.log('Hold result:', holdResult);
  
  if (holdResult.success) {
    // Test capture
    console.log('\nTesting capture...');
    const captureResult = await service.captureFunds(holdResult.holdId, 100);
    console.log('Capture result:', captureResult);
    
    // Test release
    console.log('\nTesting release...');
    const releaseResult = await service.releaseFunds(holdResult.holdId);
    console.log('Release result:', releaseResult);
  }
  
  // Test mobile payment
  console.log('\nTesting mobile payment...');
  const mobileResult = await service.initiateMobilePayment({
    phoneNumber: '+260977123456',
    amount: 50,
    currency: 'ZMW',
    description: 'Test mobile payment'
  });
  console.log('Mobile payment result:', mobileResult);
}

async function testMTNMoMo() {
  console.log('\n=== Testing MTN Mobile Money ===');
  
  const service = PaymentServiceFactory.getService(PaymentProvider.MTN_MOMO);
  
  // Test payment
  console.log('Testing payment...');
  const paymentResult = await service.processPayment({
    amount: 150,
    currency: 'ZMW',
    customerId: 'test-user-2',
    description: 'Test MTN payment'
  });
  console.log('Payment result:', paymentResult);
  
  // Test mobile payment with failure scenario (phone ending with 1111)
  console.log('\nTesting mobile payment (failure scenario)...');
  const mobileResult = await service.initiateMobilePayment({
    phoneNumber: '+260971111111',
    amount: 75,
    currency: 'ZMW',
    description: 'Test mobile payment failure'
  });
  console.log('Mobile payment result:', mobileResult);
}

async function testStripe() {
  console.log('\n=== Testing Stripe ===');
  
  const service = PaymentServiceFactory.getService(PaymentProvider.STRIPE);
  
  // Test card tokenization
  console.log('Testing card tokenization...');
  const tokenResult = await service.tokenizeCard({
    cardNumber: '4242424242424242',
    expiryMonth: 12,
    expiryYear: 2025,
    cvv: '123',
    cardholderName: 'John Doe',
    customerId: 'test-user-3'
  });
  console.log('Tokenization result:', tokenResult);
  
  if (tokenResult.success) {
    // Test payment with token
    console.log('\nTesting card payment...');
    const paymentResult = await service.processPayment({
      amount: 300,
      currency: 'ZMW',
      paymentMethodId: tokenResult.token,
      customerId: 'test-user-3',
      description: 'Test card payment'
    });
    console.log('Payment result:', paymentResult);
  }
}

async function testDPO() {
  console.log('\n=== Testing DPO ===');
  
  const service = PaymentServiceFactory.getService(PaymentProvider.DPO);
  
  // Test tokenization
  console.log('Testing card tokenization...');
  const tokenResult = await service.tokenizeCard({
    cardNumber: '5555555555554444',
    expiryMonth: 6,
    expiryYear: 2024,
    cvv: '456',
    cardholderName: 'Jane Smith'
  });
  console.log('Tokenization result:', tokenResult);
  
  // Test payment
  console.log('\nTesting payment...');
  const paymentResult = await service.processPayment({
    amount: 200,
    currency: 'ZMW',
    customerId: 'test-user-4',
    description: 'Test DPO payment'
  });
  console.log('Payment result:', paymentResult);
}

async function testPaymentUtils() {
  console.log('\n=== Testing Payment Utils ===');
  
  // Test phone number validation and normalization
  const testNumbers = [
    '0977123456',
    '+260977123456',
    '977123456',
    '123456789' // Invalid
  ];
  
  testNumbers.forEach(number => {
    const isValid = PaymentUtils.validatePhoneNumber(number);
    const normalized = isValid ? PaymentUtils.normalizePhoneNumber(number) : 'Invalid';
    console.log(`${number} -> Valid: ${isValid}, Normalized: ${normalized}`);
  });
  
  // Test amount formatting
  console.log('\nTesting amount formatting:');
  [50, 150.50, 1000, 1234.56].forEach(amount => {
    console.log(`${amount} -> ${PaymentUtils.formatAmount(amount)}`);
  });
  
  // Test service fees
  console.log('\nTesting service fee calculation:');
  Object.values(PaymentProvider).forEach(provider => {
    const fee = PaymentUtils.calculateServiceFee(1000, provider);
    console.log(`${provider}: ${fee} ZMW (${(fee/10).toFixed(1)}%)`);
  });
}

async function runAllTests() {
  console.log('🧪 Running Payment Service Tests in Sandbox Mode');
  console.log('================================================');
  
  try {
    await testPaymentUtils();
    await testAirtelMoney();
    await testMTNMoMo();
    await testStripe();
    await testDPO();
    
    console.log('\n✅ All payment service tests completed successfully!');
    console.log('\nNote: These are sandbox simulations. Results may vary in production.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testAirtelMoney,
  testMTNMoMo,
  testStripe,
  testDPO,
  testPaymentUtils,
  runAllTests
};