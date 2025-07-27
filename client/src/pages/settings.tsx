import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BottomNavigation from "@/components/bottom-navigation";
import DataManagement from "@/components/data-management";
import { Settings as SettingsIcon, Info, Bell, Shield } from "lucide-react";

export default function Settings() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <SettingsIcon className="w-6 h-6 text-period-primary" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
        
        {/* App Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-period-primary" />
              <h3 className="text-lg font-semibold text-gray-900">About Luna</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Version 1.0.0</p>
              <p>Privacy-focused period tracking app that keeps all your data secure on your device.</p>
              <p>No data is sent to external servers - your information stays completely private.</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <DataManagement />

        {/* Privacy & Security */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-period-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All data stored locally on your device</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No data collection or tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Complete control over your information</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-period-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>Notification features coming soon:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Period predictions</li>
                <li>Symptom tracking reminders</li>
                <li>Ovulation notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>

      <BottomNavigation />
    </div>
  );
}
