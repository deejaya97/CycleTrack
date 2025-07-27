import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface PeriodLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PeriodLogModal({ open, onOpenChange }: PeriodLogModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowIntensity, setFlowIntensity] = useState("medium");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logPeriodMutation = useMutation({
    mutationFn: async (data: { startDate: string; endDate?: string; flowIntensity: string }) => {
      return apiRequest("POST", "/api/periods", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Period logged successfully",
        description: "Your period data has been saved.",
      });
      onOpenChange(false);
      setStartDate("");
      setEndDate("");
      setFlowIntensity("medium");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log period. Please try again.",
        variant: "destructive",
      });
    },
  });

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

    logPeriodMutation.mutate({
      startDate,
      endDate: endDate || undefined,
      flowIntensity,
    });
  };

  const flowOptions = [
    { value: "light", label: "Light", color: "bg-period-amber" },
    { value: "medium", label: "Medium", color: "bg-period-orange" },
    { value: "heavy", label: "Heavy", color: "bg-period-primary" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Log Period
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
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
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-period-primary hover:bg-pink-600 text-white"
              disabled={logPeriodMutation.isPending}
            >
              {logPeriodMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
