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
