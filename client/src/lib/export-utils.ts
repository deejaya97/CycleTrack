import { PeriodEntry, Symptom } from "@shared/schema";

export interface ExportData {
  periods: PeriodEntry[];
  symptoms: Symptom[];
  exportDate: string;
  appVersion: string;
}

export const exportDataAsJSON = (periods: PeriodEntry[], symptoms: Symptom[]) => {
  const exportData: ExportData = {
    periods,
    symptoms,
    exportDate: new Date().toISOString(),
    appVersion: "1.0.0"
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `luna-period-data-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const validateImportData = (data: any): data is ExportData => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.periods) &&
    Array.isArray(data.symptoms) &&
    typeof data.exportDate === 'string'
  );
};