import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/bottom-navigation";
import CycleInsights from "@/components/cycle-insights";
import { PeriodEntry, Symptom } from "@shared/schema";
import { TrendingUp, Calendar, Activity, Clock, AlertTriangle } from "lucide-react";
import { calculateCycleLength, validateCycleLength, NORMAL_CYCLE_RANGE } from "@/lib/cycle-calculations";

interface AnalyticsData {
  averageCycleLength: number;
  averagePeriodLength: number;
  nextPeriodPrediction: string | null;
  currentCycleDay: number;
  daysUntilNextPeriod: number;
}

export default function Stats() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const { data: periods = [] } = useQuery<PeriodEntry[]>({
    queryKey: ["/api/periods"],
  });

  const { data: symptoms = [] } = useQuery<Symptom[]>({
    queryKey: ["/api/symptoms"],
  });

  if (analyticsLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading statistics...</div>
        </div>
      </div>
    );
  }

  const getSymptomStats = () => {
    if (symptoms.length === 0) return null;

    const moodCounts = symptoms.reduce((acc: any, symptom) => {
      if (symptom.mood) {
        acc[symptom.mood] = (acc[symptom.mood] || 0) + 1;
      }
      return acc;
    }, {});

    const energyCounts = symptoms.reduce((acc: any, symptom) => {
      if (symptom.energyLevel) {
        acc[symptom.energyLevel] = (acc[symptom.energyLevel] || 0) + 1;
      }
      return acc;
    }, {});

    const crampsCounts = symptoms.reduce((acc: any, symptom) => {
      if (symptom.cramps) {
        acc[symptom.cramps] = (acc[symptom.cramps] || 0) + 1;
      }
      return acc;
    }, {});

    const getMostCommon = (counts: any) => {
      return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
    };

    return {
      mostCommonMood: Object.keys(moodCounts).length > 0 ? getMostCommon(moodCounts) : 'N/A',
      mostCommonEnergy: Object.keys(energyCounts).length > 0 ? getMostCommon(energyCounts) : 'N/A',
      mostCommonCramps: Object.keys(crampsCounts).length > 0 ? getMostCommon(crampsCounts) : 'N/A',
    };
  };

  const getCycleValidations = () => {
    if (periods.length < 2) return [];
    
    const cycleLengths = calculateCycleLength(periods);
    const validations = cycleLengths.map(length => validateCycleLength(length))
      .filter(validation => !validation.isValid);
    
    return validations;
  };

  const getCycleVariability = () => {
    if (periods.length < 3) return 0;

    const cycleLengths: number[] = [];
    for (let i = 1; i < periods.length; i++) {
      const current = new Date(periods[i-1].startDate);
      const previous = new Date(periods[i].startDate);
      const diffTime = Math.abs(current.getTime() - previous.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cycleLengths.push(diffDays);
    }

    const average = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((a, b) => a + Math.pow(b - average, 2), 0) / cycleLengths.length;
    return Math.round(Math.sqrt(variance));
  };

  const symptomStats = getSymptomStats();
  const cycleVariability = getCycleVariability();
  const cycleValidations = getCycleValidations();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
          <TrendingUp className="w-6 h-6 text-period-primary" />
        </div>
      </header>

      {/* Cycle Statistics */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-period-primary mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Cycle Overview</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-period-light/20 rounded-lg">
                <div className="text-2xl font-bold text-period-primary">
                  {analytics?.averageCycleLength || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Cycle Length</div>
              </div>
              <div className="text-center p-3 bg-period-orange/20 rounded-lg">
                <div className="text-2xl font-bold text-period-orange">
                  {analytics?.averagePeriodLength || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Period Length</div>
              </div>
              <div className="text-center p-3 bg-period-blue/20 rounded-lg">
                <div className="text-2xl font-bold text-period-blue">
                  {periods.length}
                </div>
                <div className="text-sm text-gray-600">Total Periods</div>
              </div>
              <div className="text-center p-3 bg-period-amber/20 rounded-lg">
                <div className="text-2xl font-bold text-period-amber">
                  {cycleVariability}
                </div>
                <div className="text-sm text-gray-600">Cycle Variability</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Current Cycle Info */}
      {analytics && (
        <section className="px-6 py-4">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-period-blue mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Current Cycle</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Current Day</span>
                  <span className="font-semibold text-period-primary">
                    Day {analytics.currentCycleDay}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Days Until Next Period</span>
                  <span className="font-semibold text-period-blue">
                    {analytics.daysUntilNextPeriod} days
                  </span>
                </div>
                {analytics.nextPeriodPrediction && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Predicted Start</span>
                    <span className="font-semibold text-period-purple">
                      {new Date(analytics.nextPeriodPrediction).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Cycle Validation Warnings */}
      {cycleValidations.length > 0 && (
        <section className="px-6 py-4">
          <Card className="shadow-sm border border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                <h3 className="text-lg font-semibold text-amber-800">Cycle Health Notice</h3>
              </div>
              
              <div className="space-y-3">
                {cycleValidations.map((validation, index) => (
                  <div key={index} className="space-y-2">
                    {validation.warnings.map((warning, wIndex) => (
                      <p key={wIndex} className="text-sm text-amber-700">{warning}</p>
                    ))}
                    {validation.recommendations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-amber-200">
                        <p className="text-xs font-medium text-amber-800 mb-1">Recommendations:</p>
                        {validation.recommendations.map((rec, rIndex) => (
                          <p key={rIndex} className="text-xs text-amber-700">• {rec}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-xs text-amber-600">
                    Normal cycle length is typically {NORMAL_CYCLE_RANGE.min}-{NORMAL_CYCLE_RANGE.max} days. 
                    Individual patterns can vary naturally.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Symptom Statistics */}
      {symptomStats && (
        <section className="px-6 py-4">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <Activity className="w-5 h-5 text-period-green mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Well-being Patterns</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Most Common Mood</span>
                  <span className="font-semibold text-period-green capitalize">
                    {symptomStats.mostCommonMood}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Most Common Energy</span>
                  <span className="font-semibold text-period-blue capitalize">
                    {symptomStats.mostCommonEnergy}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Most Common Cramps</span>
                  <span className="font-semibold text-period-orange capitalize">
                    {symptomStats.mostCommonCramps}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Well-being Entries</span>
                  <span className="font-semibold text-period-purple">
                    {symptoms.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Flow Intensity Stats */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Flow Intensity</h3>
            
            {periods.length > 0 ? (
              <div className="space-y-2">
                {['light', 'medium', 'heavy'].map((intensity) => {
                  const count = periods.filter(p => p.flowIntensity === intensity).length;
                  const percentage = periods.length > 0 ? Math.round((count / periods.length) * 100) : 0;
                  const colorClass = intensity === 'light' ? 'bg-period-amber' : 
                                   intensity === 'medium' ? 'bg-period-orange' : 'bg-period-primary';
                  
                  return (
                    <div key={intensity} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${colorClass} rounded-full mr-2`}></div>
                        <span className="text-gray-700 capitalize">{intensity}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${colorClass} h-2 rounded-full`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No period data available</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Cycle Insights */}
      <section className="px-6 py-4">
        <CycleInsights 
          periods={periods} 
          symptoms={symptoms} 
          analytics={analytics} 
        />
      </section>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
