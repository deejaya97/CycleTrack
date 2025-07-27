import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import PeriodLogModal from "@/components/period-log-modal";
import SymptomTrackerModal from "@/components/symptom-tracker-modal";
import { PeriodEntry, Symptom } from "@shared/schema";
import { isDateInPeriod, getFlowColor, formatDate, getPredictedPeriodDates } from "@/lib/cycle-calculations";

interface AnalyticsData {
  averageCycleLength: number;
  averagePeriodLength: number;
  nextPeriodPrediction: string | null;
  currentCycleDay: number;
  daysUntilNextPeriod: number;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);

  const { data: periods = [] } = useQuery<PeriodEntry[]>({
    queryKey: ["/api/periods"],
  });

  const { data: symptoms = [] } = useQuery<Symptom[]>({
    queryKey: ["/api/symptoms"],
  });

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getPredictedDates = () => {
    if (!analytics || periods.length === 0) return [];
    
    const lastPeriod = periods[0];
    const lastPeriodStart = new Date(lastPeriod.startDate);
    
    return getPredictedPeriodDates(
      lastPeriodStart,
      analytics.averageCycleLength,
      analytics.averagePeriodLength
    );
  };

  const getDateInfo = (date: Date) => {
    const dateStr = formatDate(date);
    const periodInfo = isDateInPeriod(date, periods);
    const hasSymptoms = symptoms.some(s => s.date === dateStr);
    const predictedDates = getPredictedDates();
    const isPredicted = predictedDates.some(pd => formatDate(pd) === dateStr);
    
    return {
      isPeriod: periodInfo.inPeriod,
      flowIntensity: periodInfo.intensity,
      hasSymptoms,
      isPredicted,
      isToday: formatDate(date) === formatDate(new Date())
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setShowSymptomModal(true);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <Button
            onClick={() => setShowPeriodModal(true)}
            className="bg-period-primary hover:bg-pink-600 text-white"
            size="sm"
          >
            Log Period
          </Button>
        </div>
      </header>

      {/* Calendar */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square"></div>;
                }

                const dateInfo = getDateInfo(date);
                let cellClass = "aspect-square flex items-center justify-center text-sm cursor-pointer rounded-lg transition-colors relative ";
                
                if (dateInfo.isToday) {
                  cellClass += "font-semibold text-white bg-period-primary ";
                } else if (dateInfo.isPeriod) {
                  const flowColor = getFlowColor(dateInfo.flowIntensity!);
                  cellClass += `text-gray-900 hover:bg-gray-50 bg-${flowColor.replace('period-', 'period-')}/20 `;
                } else if (dateInfo.isPredicted) {
                  cellClass += "text-gray-900 hover:bg-gray-50 bg-period-purple/20 ";
                } else {
                  cellClass += "text-gray-900 hover:bg-gray-50 ";
                }

                return (
                  <div
                    key={index}
                    className={cellClass}
                    onClick={() => handleDateClick(date)}
                  >
                    {date.getDate()}
                    {(dateInfo.isPeriod || dateInfo.hasSymptoms || dateInfo.isPredicted) && (
                      <div className="absolute bottom-1 flex space-x-1">
                        {dateInfo.isPeriod && (
                          <div className={`w-2 h-2 rounded-full bg-${getFlowColor(dateInfo.flowIntensity!)}`}></div>
                        )}
                        {dateInfo.hasSymptoms && !dateInfo.isPeriod && (
                          <div className="w-2 h-2 rounded-full bg-period-blue"></div>
                        )}
                        {dateInfo.isPredicted && !dateInfo.isPeriod && (
                          <div className="w-2 h-2 rounded-full bg-period-purple"></div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-period-primary rounded-full mr-2"></div>
                <span className="text-gray-600">Heavy Flow</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-period-orange rounded-full mr-2"></div>
                <span className="text-gray-600">Medium</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-period-amber rounded-full mr-2"></div>
                <span className="text-gray-600">Light</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-period-blue rounded-full mr-2"></div>
                <span className="text-gray-600">Symptoms</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-period-purple rounded-full mr-2"></div>
                <span className="text-gray-600">Predicted</span>
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
        date={selectedDate}
      />
    </div>
  );
}
