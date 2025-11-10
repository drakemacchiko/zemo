export interface DamageItemInput {
  damageType: string;
  severity: string;
  location: string;
  description: string;
  estimatedCost?: number;
}

export interface DamageAssessment {
  totalScore: number;
  totalRepairCost: number;
  adjustedScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function calculateDamageScore(
  damageItems: DamageItemInput[],
  overallCondition: string
): DamageAssessment {
  if (!damageItems || damageItems.length === 0) {
    return {
      totalScore: 0,
      totalRepairCost: 0,
      adjustedScore: 0,
      riskLevel: 'low'
    };
  }

  let totalScore = 0;
  let totalRepairCost = 0;

  for (const damage of damageItems) {
    let itemScore = 0;
    switch (damage.severity) {
      case 'MINOR':
        itemScore = 5;
        break;
      case 'MODERATE':
        itemScore = 15;
        break;
      case 'MAJOR':
        itemScore = 30;
        break;
      case 'SEVERE':
        itemScore = 50;
        break;
      default:
        itemScore = 5;
    }

    totalScore += itemScore;
    totalRepairCost += damage.estimatedCost || 100;
  }

  let conditionMultiplier = 1.0;
  switch (overallCondition) {
    case 'EXCELLENT':
      conditionMultiplier = 1.0;
      break;
    case 'GOOD':
      conditionMultiplier = 1.1;
      break;
    case 'FAIR':
      conditionMultiplier = 1.3;
      break;
    case 'POOR':
      conditionMultiplier = 1.6;
      break;
    case 'DAMAGED':
      conditionMultiplier = 2.0;
      break;
  }

  const adjustedScore = totalScore * conditionMultiplier;

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (adjustedScore > 100) {
    riskLevel = 'critical';
  } else if (adjustedScore > 50) {
    riskLevel = 'high';
  } else if (adjustedScore > 20) {
    riskLevel = 'medium';
  }

  return {
    totalScore,
    totalRepairCost,
    adjustedScore: Math.round(adjustedScore * 10) / 10,
    riskLevel
  };
}
