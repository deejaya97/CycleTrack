import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Plus, Heart, Smile, Battery, Circle } from "lucide-react";
import PeriodLogModal from "@/components/period-log-modal";
import SymptomTrackerModal from "@/components/symptom-tracker-modal";
import RecentPeriods from "@/components/recent-periods";
import BottomNavigation from "@/components/bottom-navigation";
import { getCurrentCyclePhase } from "@/lib/cycle-calculations";

interface AnalyticsData {
  averageCycleLength: number;
  averagePeriodLength: number;
  nextPeriodPrediction: string | null;
  currentCycleDay: number;
  daysUntilNextPeriod: number;
}

export default function Home() {
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const { data: todaySymptoms } = useQuery({
    queryKey: ["/api/symptoms"],
    select: (data: any[]) => {
      const today = new Date().toISOString().split('T')[0];
      return data.find(symptom => symptom.date === today);
    }
  });

  if (analyticsLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const currentPhase = analytics ? getCurrentCyclePhase(analytics.currentCycleDay, analytics.averageCycleLength) : null;
  const cycleProgress = analytics ? (analytics.currentCycleDay / analytics.averageCycleLength) * 100 : 0;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Luna</h1>
            <p className="text-sm text-gray-500">Your personal cycle tracker</p>
          </div>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Cycle Overview */}
      <section className="px-6 py-4 bg-gradient-to-r from-period-light to-pink-100">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Cycle</h2>
          <div className="flex justify-center items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-period-primary">
                {analytics?.currentCycleDay || 0}
              </div>
              <div className="text-sm text-gray-600">of cycle</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-period-blue">
                {analytics?.daysUntilNextPeriod || 0}
              </div>
              <div className="text-sm text-gray-600">days until period</div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={cycleProgress} className="w-full h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {currentPhase?.description || "Calculating..."}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowPeriodModal(true)}
            className="bg-period-primary text-white p-4 h-auto font-medium shadow-sm hover:bg-pink-600 transition-colors"
          >
            <div className="flex flex-col items-center">
              <Plus className="w-5 h-5 mb-2" />
              <div>Log Period</div>
            </div>
          </Button>
          <Button
            onClick={() => setShowSymptomModal(true)}
            className="bg-period-blue text-white p-4 h-auto font-medium shadow-sm hover:bg-blue-600 transition-colors"
          >
            <div className="flex flex-col items-center">
              <Heart className="w-5 h-5 mb-2" />
              <div>Track Symptoms</div>
            </div>
          </Button>
        </div>
      </section>

      {/* Today's Symptoms */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Symptoms</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Mood</span>
                <div className="flex space-x-1 items-center">
                  <Smile className="w-4 h-4 text-period-green" />
                  <span className="text-sm text-gray-600">
                    {todaySymptoms?.mood ? 
                      todaySymptoms.mood.charAt(0).toUpperCase() + todaySymptoms.mood.slice(1) : 
                      "Not tracked"
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Energy Level</span>
                <div className="flex space-x-1 items-center">
                  <Battery className="w-4 h-4 text-period-blue" />
                  <span className="text-sm text-gray-600">
                    {todaySymptoms?.energyLevel ? 
                      todaySymptoms.energyLevel.charAt(0).toUpperCase() + todaySymptoms.energyLevel.slice(1) : 
                      "Not tracked"
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Cramps</span>
                <div className="flex space-x-1 items-center">
                  <Circle className="w-2 h-2 text-period-green" />
                  <span className="text-sm text-gray-600">
                    {todaySymptoms?.cramps ? 
                      todaySymptoms.cramps.charAt(0).toUpperCase() + todaySymptoms.cramps.slice(1) : 
                      "Not tracked"
                    }
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowSymptomModal(true)}
              variant="secondary"
              className="w-full mt-4"
            >
              Update Symptoms
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Recent Periods */}
      <section className="px-6 py-4">
        <RecentPeriods />
      </section>

      {/* Statistics */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Cycle Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-period-primary">
                  {analytics?.averageCycleLength || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Cycle Length</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-period-orange">
                  {analytics?.averagePeriodLength || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Period Length</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Modals */}
      <PeriodLogModal 
        open={showPeriodModal} 
        onOpenChange={setShowPeriodModal} 
      />
      <SymptomTrackerModal 
        open={showSymptomModal} 
        onOpenChange={setShowSymptomModal} 
      />
    </div>
  );
}
