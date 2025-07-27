import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodEntry, Symptom } from "@shared/schema";
import { AlertTriangle, TrendingUp, Calendar, Activity, CheckCircle, Target } from "lucide-react";
import { calculateCycleLength, validateCycleLength, NORMAL_CYCLE_RANGE } from "@/lib/cycle-calculations";
import { format, differenceInDays, addDays } from "date-fns";

interface CycleInsightsProps {
  periods: PeriodEntry[];
  symptoms: Symptom[];
  analytics?: {
    averageCycleLength: number;
    averagePeriodLength: number;
    nextPeriodPrediction: string | null;
    currentCycleDay: number;
    daysUntilNextPeriod: number;
  };
}

export default function CycleInsights({ periods, symptoms, analytics }: CycleInsightsProps) {
  if (periods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Cycle Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Start logging periods to see personalized insights about your cycle patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getInsights = () => {
    const insights = [];

    // Cycle regularity insight
    if (periods.length >= 3) {
      const cycleLengths = [];
      for (let i = 0; i < periods.length - 1; i++) {
        const current = new Date(periods[i].startDate);
        const previous = new Date(periods[i + 1].startDate);
        const cycleLength = differenceInDays(current, previous);
        cycleLengths.push(cycleLength);
      }

      const avgCycle = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
      const isRegular = cycleLengths.every(length => Math.abs(length - avgCycle) <= 3);

      if (isRegular) {
        insights.push({
          type: "positive",
          icon: CheckCircle,
          title: "Regular Cycles",
          description: `Your cycles are consistent, averaging ${Math.round(avgCycle)} days.`,
        });
      } else {
        insights.push({
          type: "warning",
          icon: AlertTriangle,
          title: "Irregular Cycles",
          description: "Your cycle lengths vary. This is normal but track patterns.",
        });
      }
    }

    // Period length insight
    const periodLengths = periods
      .filter(p => p.endDate)
      .map(p => differenceInDays(new Date(p.endDate!), new Date(p.startDate)) + 1);

    if (periodLengths.length >= 2) {
      const avgPeriodLength = periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length;
      
      if (avgPeriodLength >= 3 && avgPeriodLength <= 7) {
        insights.push({
          type: "positive",
          icon: CheckCircle,
          title: "Normal Period Length",
          description: `Your periods typically last ${Math.round(avgPeriodLength)} days.`,
        });
      } else if (avgPeriodLength < 3) {
        insights.push({
          type: "info",
          icon: AlertTriangle,
          title: "Short Periods",
          description: "Your periods are shorter than typical. Consider tracking symptoms.",
        });
      } else {
        insights.push({
          type: "info",
          icon: AlertTriangle,
          title: "Long Periods",
          description: "Your periods are longer than typical. Consider tracking symptoms.",
        });
      }
    }

    // Symptom pattern insights
    if (symptoms.length >= 5) {
      const moodSymptoms = symptoms.filter(s => s.mood && s.mood !== "okay");
      const energySymptoms = symptoms.filter(s => s.energyLevel === "low");
      const crampsSymptoms = symptoms.filter(s => s.cramps && s.cramps !== "none");

      if (moodSymptoms.length > symptoms.length * 0.3) {
        insights.push({
          type: "info",
          icon: Activity,
          title: "Mood Patterns",
          description: "You often experience mood changes. Consider lifestyle factors.",
        });
      }

      if (energySymptoms.length > symptoms.length * 0.3) {
        insights.push({
          type: "info",
          icon: Activity,
          title: "Energy Patterns",
          description: "You frequently experience low energy. Consider iron levels.",
        });
      }

      if (crampsSymptoms.length > symptoms.length * 0.4) {
        insights.push({
          type: "info",
          icon: Activity,
          title: "Pain Patterns",
          description: "You often experience cramps. Heat and exercise may help.",
        });
      }
    }

    // Prediction accuracy insight
    if (analytics?.nextPeriodPrediction && periods.length >= 2) {
      insights.push({
        type: "info",
        icon: Target,
        title: "Predictions",
        description: `Next period predicted for ${format(new Date(analytics.nextPeriodPrediction), "MMM d")}.`,
      });
    }

    return insights;
  };

  const insights = getInsights();

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Cycle Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Keep tracking for a few more cycles to see personalized insights.
          </p>
        ) : (
          insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <p className="text-sm mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {periods.length >= 2 && (
          <div className="mt-6 p-4 bg-period-light rounded-lg">
            <h4 className="font-semibold text-sm text-period-primary mb-2">
              Tracking Progress
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Periods logged:</span>
                <span className="font-medium">{periods.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Symptoms tracked:</span>
                <span className="font-medium">{symptoms.length} days</span>
              </div>
              {analytics && (
                <div className="flex justify-between">
                  <span>Current cycle day:</span>
                  <span className="font-medium">{analytics.currentCycleDay}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}