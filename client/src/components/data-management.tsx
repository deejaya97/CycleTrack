import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { localStorage } from "@/lib/local-storage";
import { PeriodEntry, Symptom } from "@shared/schema";

export default function DataManagement() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: periods = [] } = useQuery<PeriodEntry[]>({
    queryKey: ["/api/periods"],
  });

  const { data: symptoms = [] } = useQuery<Symptom[]>({
    queryKey: ["/api/symptoms"],
  });

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

  const importData = async () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a JSON file to import.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = await importFile.text();
      const importedData = JSON.parse(fileContent);

      if (!importedData.periods || !importedData.symptoms) {
        throw new Error("Invalid file format");
      }

      await localStorage.importData(importedData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });

      toast({
        title: "Data imported successfully",
        description: `Imported ${importedData.periods.length} periods and ${importedData.symptoms.length} well-being entries.`,
      });

      setImportFile(null);
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import data. Please check the file format.",
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
    <div className="space-y-6">
      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Your Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-period-primary">{periods.length}</div>
              <div className="text-sm text-gray-600">Period Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-period-orange">{symptoms.length}</div>
              <div className="text-sm text-gray-600">Well-being Records</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Download your period tracking data as a JSON file. This includes all your period entries and well-being records.
          </p>
          <Button onClick={exportData} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Import period tracking data from a previously exported JSON file. This will add to your existing data.
          </p>
          <div>
            <Label htmlFor="import-file">Select JSON file</Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>
          <Button 
            onClick={importData} 
            disabled={!importFile}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </CardContent>
      </Card>

      {/* Clear Data */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Clear All Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Permanently delete all your period tracking data. This action cannot be undone.
          </p>
          <Button 
            onClick={clearAllData} 
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}