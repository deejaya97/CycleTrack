import { PeriodEntry } from "@shared/schema";

export interface CyclePhase {
  name: string;
  color: string;
  description: string;
}

export function getCurrentCyclePhase(currentDay: number, cycleLength: number = 28): CyclePhase {
  if (currentDay <= 5) {
    return {
      name: "Menstrual",
      color: "period-primary",
      description: "Period phase"
    };
  } else if (currentDay <= 9) {
    return {
      name: "Follicular",
      color: "period-green",
      description: "Post-menstrual phase"
    };
  } else if (currentDay >= 12 && currentDay <= 16) {
    return {
      name: "Ovulation",
      color: "period-blue",
      description: "Ovulation phase"
    };
  } else {
    return {
      name: "Luteal",
      color: "period-amber",
      description: "Pre-menstrual phase"
    };
  }
}

export function getFlowColor(intensity: string): string {
  switch (intensity) {
    case 'light':
      return 'period-amber';
    case 'medium':
      return 'period-orange';
    case 'heavy':
      return 'period-primary';
    default:
      return 'period-primary';
  }
}

export function getPredictedPeriodDates(
  lastPeriodStart: Date, 
  averageCycleLength: number,
  averagePeriodLength: number
): Date[] {
  const dates: Date[] = [];
  const nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + averageCycleLength);
  
  for (let i = 0; i < averagePeriodLength; i++) {
    const date = new Date(nextPeriodStart);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

export function getYearlyPredictions(
  periods: PeriodEntry[], 
  averageCycleLength: number, 
  averagePeriodLength: number
): Date[] {
  if (periods.length === 0) return [];
  
  // Get the most recent period
  const sortedPeriods = periods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const lastPeriod = sortedPeriods[0];
  const lastPeriodStart = new Date(lastPeriod.startDate);
  
  const predictions: Date[] = [];
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  let currentPrediction = new Date(lastPeriodStart);
  
  // Generate predictions for the next year
  while (currentPrediction <= oneYearFromNow) {
    currentPrediction.setDate(currentPrediction.getDate() + averageCycleLength);
    
    // Only include future predictions
    if (currentPrediction > today) {
      // Add all days of this predicted period
      for (let i = 0; i < averagePeriodLength; i++) {
        const predictionDate = new Date(currentPrediction);
        predictionDate.setDate(predictionDate.getDate() + i);
        if (predictionDate <= oneYearFromNow) {
          predictions.push(new Date(predictionDate));
        }
      }
    }
  }
  
  return predictions;
}

export function isPredictedPeriodDate(date: Date, predictions: Date[]): boolean {
  return predictions.some(pred => 
    pred.getDate() === date.getDate() && 
    pred.getMonth() === date.getMonth() && 
    pred.getFullYear() === date.getFullYear()
  );
}

export function isDateInPeriod(date: Date, periods: PeriodEntry[]): { inPeriod: boolean; intensity?: string } {
  for (const period of periods) {
    const startDate = new Date(period.startDate);
    const endDate = period.endDate ? new Date(period.endDate) : new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    if (date >= startDate && date <= endDate) {
      return { inPeriod: true, intensity: period.flowIntensity };
    }
  }
  
  return { inPeriod: false };
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Cycle validation constants
export const NORMAL_CYCLE_RANGE = { min: 21, max: 35 };
export const NORMAL_PERIOD_RANGE = { min: 2, max: 8 };

export interface CycleValidation {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
}

export function validateCycleLength(cycleLength: number): CycleValidation {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (cycleLength < NORMAL_CYCLE_RANGE.min) {
    warnings.push(`Your cycle is ${cycleLength} days, which is shorter than the typical 21-35 day range.`);
    recommendations.push("Consider tracking for a few more cycles to establish your pattern.");
    recommendations.push("If this pattern continues, discuss with your healthcare provider.");
  } else if (cycleLength > NORMAL_CYCLE_RANGE.max) {
    warnings.push(`Your cycle is ${cycleLength} days, which is longer than the typical 21-35 day range.`);
    recommendations.push("Longer cycles can be normal for some people, but tracking is helpful.");
    recommendations.push("If you have concerns, consider discussing with your healthcare provider.");
  }
  
  return {
    isValid: cycleLength >= NORMAL_CYCLE_RANGE.min && cycleLength <= NORMAL_CYCLE_RANGE.max,
    warnings,
    recommendations
  };
}

export function validatePeriodLength(periodLength: number): CycleValidation {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (periodLength < NORMAL_PERIOD_RANGE.min) {
    warnings.push(`Your period lasted ${periodLength} days, which is shorter than the typical 2-8 day range.`);
    recommendations.push("Very short periods can sometimes indicate hormonal changes.");
  } else if (periodLength > NORMAL_PERIOD_RANGE.max) {
    warnings.push(`Your period lasted ${periodLength} days, which is longer than the typical 2-8 day range.`);
    recommendations.push("Longer periods may warrant discussion with a healthcare provider.");
  }
  
  return {
    isValid: periodLength >= NORMAL_PERIOD_RANGE.min && periodLength <= NORMAL_PERIOD_RANGE.max,
    warnings,
    recommendations
  };
}

export function calculateCycleLength(periods: PeriodEntry[]): number[] {
  if (periods.length < 2) return [];
  
  const sortedPeriods = [...periods].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  const cycleLengths: number[] = [];
  
  for (let i = 1; i < sortedPeriods.length; i++) {
    const currentStart = new Date(sortedPeriods[i].startDate);
    const previousStart = new Date(sortedPeriods[i - 1].startDate);
    const daysDifference = Math.round((currentStart.getTime() - previousStart.getTime()) / (1000 * 60 * 60 * 24));
    cycleLengths.push(daysDifference);
  }
  
  return cycleLengths;
}
