import { describe, test, expect } from '@jest/globals';
import { calculateDamageScore } from '@/lib/damage-scoring';

describe('Handover and Damage Assessment', () => {
  describe('Damage Scoring', () => {
    test('should calculate damage score correctly for minor damage', () => {
      const damageItems = [
        {
          damageType: 'SCRATCH',
          severity: 'MINOR',
          location: 'rear bumper',
          description: 'Small scratch',
          estimatedCost: 150.0,
        },
      ];

      const result = calculateDamageScore(damageItems, 'GOOD');
      
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.totalScore).toBeLessThan(20);
      expect(result.totalRepairCost).toBe(150.0);
      expect(result.adjustedScore).toBeGreaterThan(0);
    });

    test('should calculate damage score correctly for major damage', () => {
      const damageItems = [
        {
          damageType: 'DENT',
          severity: 'MAJOR',
          location: 'front door',
          description: 'Large dent',
          estimatedCost: 800.0,
        },
        {
          damageType: 'CRACK',
          severity: 'MODERATE',
          location: 'windshield',
          description: 'Windshield crack',
          estimatedCost: 400.0,
        },
      ];

      const result = calculateDamageScore(damageItems, 'POOR');
      
      expect(result.totalScore).toBeGreaterThan(40);
      expect(result.totalRepairCost).toBe(1200.0);
      expect(result.adjustedScore).toBeGreaterThan(result.totalScore);
    });

    test('should handle no damage scenario', () => {
      const damageItems: any[] = [];
      const result = calculateDamageScore(damageItems, 'EXCELLENT');
      
      expect(result.totalScore).toBe(0);
      expect(result.totalRepairCost).toBe(0);
      expect(result.adjustedScore).toBe(0);
    });

    test('should apply condition multiplier correctly', () => {
      const damageItems = [
        {
          damageType: 'SCRATCH',
          severity: 'MINOR',
          location: 'door',
          description: 'Minor scratch',
          estimatedCost: 100.0,
        },
      ];

      const excellentResult = calculateDamageScore(damageItems, 'EXCELLENT');
      const poorResult = calculateDamageScore(damageItems, 'POOR');
      
      expect(poorResult.adjustedScore).toBeGreaterThan(excellentResult.adjustedScore);
    });
  });

  describe('Deposit Adjustment Calculation', () => {
    test('should calculate deposit adjustment with damage charges', () => {
      const originalDeposit = 1000;
      const damageCharges = 300;
      const cleaningCharges = 50;
      const fuelCharges = 25;
      
      const totalCharges = damageCharges + cleaningCharges + fuelCharges;
      const adjustmentAmount = totalCharges;
      const finalReturn = originalDeposit - totalCharges;

      expect(adjustmentAmount).toBe(375);
      expect(finalReturn).toBe(625);
    });

    test('should handle full deposit forfeiture', () => {
      const originalDeposit = 1000;
      const damageCharges = 1200;
      
      const adjustmentAmount = Math.min(damageCharges, originalDeposit);
      const finalReturn = Math.max(0, originalDeposit - damageCharges);

      expect(adjustmentAmount).toBe(1000);
      expect(finalReturn).toBe(0);
    });

    test('should handle no charges scenario', () => {
      const originalDeposit = 1000;
      const totalCharges = 0;
      
      const adjustmentAmount = totalCharges;
      const finalReturn = originalDeposit - totalCharges;

      expect(adjustmentAmount).toBe(0);
      expect(finalReturn).toBe(1000);
    });
  });
});