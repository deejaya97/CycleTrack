import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Smile, Frown, Meh, Battery, BatteryLow } from "lucide-react";

interface SymptomTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: string;
}

export default function SymptomTrackerModal({ open, onOpenChange, date }: SymptomTrackerModalProps) {
  const [mood, setMood] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<string>("");
  const [cramps, setCramps] = useState<string>("");
  const [headache, setHeadache] = useState<string>("");
  const [bloating, setBloating] = useState<string>("");
  const [notes, setNotes] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackSymptomMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/symptoms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      toast({
        title: "Well-being tracked successfully",
        description: "Your daily notes have been saved.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your notes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setMood("");
    setEnergyLevel("");
    setCramps("");
    setHeadache("");
    setBloating("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const symptomData = {
      date: date || new Date().toISOString().split('T')[0],
      mood: mood || null,
      energyLevel: energyLevel || null,
      cramps: cramps || null,
      headache: headache || null,
      bloating: bloating || null,
      notes: notes || null,
    };

    trackSymptomMutation.mutate(symptomData);
  };

  const moodOptions = [
    { value: "great", label: "Great", icon: Smile, color: "text-period-green" },
    { value: "good", label: "Good", icon: Smile, color: "text-period-blue" },
    { value: "okay", label: "Okay", icon: Meh, color: "text-period-amber" },
    { value: "bad", label: "Bad", icon: Frown, color: "text-period-orange" },
    { value: "terrible", label: "Terrible", icon: Frown, color: "text-period-primary" },
  ];

  const energyOptions = [
    { value: "high", label: "High", icon: Battery, color: "text-period-green" },
    { value: "medium", label: "Medium", icon: Battery, color: "text-period-blue" },
    { value: "low", label: "Low", icon: BatteryLow, color: "text-period-orange" },
  ];

  const intensityOptions = [
    { value: "none", label: "None", color: "text-period-green" },
    { value: "mild", label: "Mild", color: "text-period-amber" },
    { value: "moderate", label: "Moderate", color: "text-period-orange" },
    { value: "severe", label: "Severe", color: "text-period-primary" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Track Well-being
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Track your daily well-being including mood, energy levels, and how you're feeling.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Mood
            </Label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    className={`p-2 border rounded-lg text-center transition-colors ${
                      mood === option.value
                        ? 'border-period-primary bg-period-light'
                        : 'border-gray-300 hover:bg-period-light hover:border-period-primary'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mx-auto mb-1 ${option.color}`} />
                    <span className="text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Energy Level
            </Label>
            <div className="flex gap-2">
              {energyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEnergyLevel(option.value)}
                    className={`p-2 border rounded-lg text-center transition-colors flex-1 ${
                      energyLevel === option.value
                        ? 'border-period-primary bg-period-light'
                        : 'border-gray-300 hover:bg-period-light hover:border-period-primary'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mx-auto mb-1 ${option.color}`} />
                    <span className="text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Cramps
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {intensityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCramps(option.value)}
                  className={`p-2 border rounded-lg text-center transition-colors ${
                    cramps === option.value
                      ? 'border-period-primary bg-period-light'
                      : 'border-gray-300 hover:bg-period-light hover:border-period-primary'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${option.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Headache
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {intensityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHeadache(option.value)}
                  className={`p-2 border rounded-lg text-center transition-colors ${
                    headache === option.value
                      ? 'border-period-primary bg-period-light'
                      : 'border-gray-300 hover:bg-period-light hover:border-period-primary'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${option.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Bloating
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {intensityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBloating(option.value)}
                  className={`p-2 border rounded-lg text-center transition-colors ${
                    bloating === option.value
                      ? 'border-period-primary bg-period-light'
                      : 'border-gray-300 hover:bg-period-light hover:border-period-primary'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${option.color.replace('text-', 'bg-')}`}></div>
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about how you're feeling..."
              className="w-full"
              rows={3}
            />
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
              disabled={trackSymptomMutation.isPending}
            >
              {trackSymptomMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
