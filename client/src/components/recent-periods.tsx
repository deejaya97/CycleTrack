import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit3, Circle } from "lucide-react";
import PeriodEditModal from "./period-edit-modal";
import type { PeriodEntry } from "@shared/schema";

export default function RecentPeriods() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: periods = [], isLoading } = useQuery<PeriodEntry[]>({
    queryKey: ["/api/periods"],
  });

  const handleEditPeriod = (period: PeriodEntry) => {
    setSelectedPeriod(period);
    setShowEditModal(true);
  };

  const getFlowColor = (intensity: string) => {
    switch (intensity) {
      case 'light':
        return 'text-period-amber';
      case 'medium':
        return 'text-period-orange';
      case 'heavy':
        return 'text-period-primary';
      default:
        return 'text-period-primary';
    }
  };

  const getFlowIcon = (intensity: string) => {
    switch (intensity) {
      case 'light':
        return 'text-period-amber bg-period-amber/20';
      case 'medium':
        return 'text-period-orange bg-period-orange/20';
      case 'heavy':
        return 'text-period-primary bg-period-primary/20';
      default:
        return 'text-period-primary bg-period-primary/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDuration = (startDate: string, endDate?: string | null) => {
    if (!endDate) return 'Ongoing';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-period-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Periods</h3>
          </div>
          <div className="text-center text-gray-500 py-4">Loading periods...</div>
        </CardContent>
      </Card>
    );
  }

  const recentPeriods = periods.slice(0, 5); // Show last 5 periods

  return (
    <>
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-period-primary mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Recent Periods</h3>
            </div>
            {periods.length > 5 && (
              <span className="text-xs text-gray-500">Showing 5 of {periods.length}</span>
            )}
          </div>

          {recentPeriods.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm">No periods logged yet</p>
              <p className="text-xs text-gray-400 mt-1">Start tracking by logging your first period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPeriods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getFlowIcon(period.flowIntensity).split(' ')[1]}`}>
                      <Circle className={`w-3 h-3 ${getFlowColor(period.flowIntensity)}`} fill="currentColor" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(period.startDate)}
                        {period.endDate && ` - ${formatDate(period.endDate)}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {calculateDuration(period.startDate, period.endDate)} • {period.flowIntensity} flow
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPeriod(period)}
                    className="text-gray-600 hover:text-period-primary"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PeriodEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        period={selectedPeriod}
      />
    </>
  );
}