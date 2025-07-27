import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BottomNavigation from "@/components/bottom-navigation";
import { Settings as SettingsIcon, Download, Trash2, Info, Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { localStorage } from "@/lib/local-storage";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const exportData = async () => {
    try {
      const data = await localStorage.exportData();
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `luna-period-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your period tracking data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearAllData = async () => {
    if (!confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      return;
    }

    try {
      await localStorage.clearAllData();
      
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });

      toast({
        title: "Data cleared successfully",
        description: "All your period tracking data has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <SettingsIcon className="w-6 h-6 text-period-primary" />
        </div>
      </header>

      {/* App Info */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Info className="w-5 h-5 text-period-blue mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">About Luna</h3>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>Luna is your personal menstrual cycle tracking companion, designed to help you understand and monitor your reproductive health.</p>
              <div className="flex justify-between items-center pt-2">
                <span>Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Privacy & Data */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-period-green mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Privacy & Data</h3>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600 space-y-2">
                <p>Your data is stored locally in your browser and never leaves your device.</p>
                <p>All information remains completely private and secure - no accounts or internet required.</p>
              </div>
              
              <Separator />
              
              <Button
                onClick={exportData}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              
              <Button
                onClick={clearAllData}
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Notifications */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-period-amber mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Notification features are coming soon! You'll be able to set reminders for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Period predictions</li>
                <li>Symptom tracking reminders</li>
                <li>Ovulation notifications</li>
                <li>Medication reminders</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Support */}
      <section className="px-6 py-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Support & Feedback</h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p>We're committed to helping you track your health effectively and privately.</p>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span>Need help?</span>
                  <span className="text-period-primary">Contact Support</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Found a bug?</span>
                  <span className="text-period-primary">Report Issue</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Feature request?</span>
                  <span className="text-period-primary">Send Feedback</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
