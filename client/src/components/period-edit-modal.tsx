import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { calculateCycleLength, validateCycleLength, validatePeriodLength } from "@/lib/cycle-calculations";
import type { PeriodEntry } from "@shared/schema";

interface PeriodEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: PeriodEntry | null;
}

export default function PeriodEditModal({ open, onOpenChange, period }: PeriodEditModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowIntensity, setFlowIntensity] = useState("medium");
  const [showValidation, setShowValidation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get existing periods for validation
  const { data: periods = [] } = useQuery<PeriodEntry[]>({ 
    queryKey: ["/api/periods"],
    enabled: open // Only fetch when modal is open
  });

  // Set form values when period changes
  useEffect(() => {
    if (period) {
      setStartDate(period.startDate);
      setEndDate(period.endDate || "");
      setFlowIntensity(period.flowIntensity);
    } else {
      setStartDate("");
      setEndDate("");
      setFlowIntensity("medium");
    }
    setShowValidation(false);
  }, [period]);

  const updatePeriodMutation = useMutation({
    mutationFn: async (data: { startDate: string; endDate?: string; flowIntensity: string }) => {
      if (!period) throw new Error("No period to update");
      return apiRequest("PATCH", `/api/periods/${period.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Period updated successfully",
        description: "Your period data has been updated.",
      });
      onOpenChange(false);
      setShowValidation(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update period. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePeriodMutation = useMutation({
    mutationFn: async () => {
      if (!period) throw new Error("No period to delete");
      return apiRequest("DELETE", `/api/periods/${period.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Period deleted successfully",
        description: "Your period entry has been removed.",
      });
      onOpenChange(false);
      setShowValidation(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete period. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateAndSubmit = () => {
    const validations: string[] = [];
    const recommendations: string[] = [];

    // Calculate period length if end date is provided
    if (endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const periodLength = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const periodValidation = validatePeriodLength(periodLength);
      validations.push(...periodValidation.warnings);
      recommendations.push(...periodValidation.recommendations);
    }

    // Calculate cycle length if we have other periods (excluding current one)
    const otherPeriods = periods.filter(p => p.id !== period?.id);
    if (otherPeriods.length > 0) {
      const sortedPeriods = [...otherPeriods].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      const lastPeriod = sortedPeriods[0];
      const currentStart = new Date(startDate);
      const lastStart = new Date(lastPeriod.startDate);
      const cycleLength = Math.round((currentStart.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (cycleLength > 0) {
        const cycleValidation = validateCycleLength(cycleLength);
        validations.push(...cycleValidation.warnings);
        recommendations.push(...cycleValidation.recommendations);
      }
    }

    // If there are validations, show them first
    if (validations.length > 0 && !showValidation) {
      setShowValidation(true);
      return;
    }

    // Proceed with submission
    updatePeriodMutation.mutate({
      startDate,
      endDate: endDate || undefined,
      flowIntensity,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date.",
        variant: "destructive",
      });
      return;
    }

    validateAndSubmit();
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this period entry? This action cannot be undone.")) {
      return;
    }
    deletePeriodMutation.mutate();
  };

  const flowOptions = [
    { value: "light", label: "Light", color: "bg-period-amber" },
    { value: "medium", label: "Medium", color: "bg-period-orange" },
    { value: "heavy", label: "Heavy", color: "bg-period-primary" },
  ];

  // Get current validation warnings
  const getCurrentValidations = () => {
    const validations: string[] = [];
    const recommendations: string[] = [];

    if (endDate && startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const periodLength = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const periodValidation = validatePeriodLength(periodLength);
      validations.push(...periodValidation.warnings);
      recommendations.push(...periodValidation.recommendations);
    }

    if (startDate) {
      const otherPeriods = periods.filter(p => p.id !== period?.id);
      if (otherPeriods.length > 0) {
        const sortedPeriods = [...otherPeriods].sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        const lastPeriod = sortedPeriods[0];
        const currentStart = new Date(startDate);
        const lastStart = new Date(lastPeriod.startDate);
        const cycleLength = Math.round((currentStart.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
        
        if (cycleLength > 0) {
          const cycleValidation = validateCycleLength(cycleLength);
          validations.push(...cycleValidation.warnings);
          recommendations.push(...cycleValidation.recommendations);
        }
      }
    }

    return { validations, recommendations };
  };

  const { validations, recommendations } = getCurrentValidations();

  if (!period) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Period
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onOpenChange(false);
                setShowValidation(false);
              }}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Update or delete your period entry.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 block">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2 block">
              End Date (Optional)
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
              min={startDate}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Flow Intensity
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {flowOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFlowIntensity(option.value)}
                  className={`p-2 border rounded-lg text-center transition-colors ${
                    flowIntensity === option.value
                      ? 'border-period-primary bg-period-light'
                      : 'border-gray-300 hover:bg-period-light hover:border-period-primary'
                  }`}
                >
                  <div className={`w-3 h-3 ${option.color} rounded-full mx-auto mb-1`}></div>
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Validation warnings */}
          {validations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center text-amber-800">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">Cycle Notice</span>
              </div>
              
              {validations.map((warning, index) => (
                <p key={index} className="text-sm text-amber-700">{warning}</p>
              ))}
              
              {recommendations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="text-xs font-medium text-amber-800 mb-1">Recommendations:</p>
                  {recommendations.map((rec, index) => (
                    <p key={index} className="text-xs text-amber-700">• {rec}</p>
                  ))}
                </div>
              )}
              
              {!showValidation && (
                <p className="text-xs text-amber-600 mt-2">
                  Continue to save anyway, or review your dates.
                </p>
              )}
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deletePeriodMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                setShowValidation(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-period-primary hover:bg-pink-600 text-white"
              disabled={updatePeriodMutation.isPending}
            >
              {updatePeriodMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}