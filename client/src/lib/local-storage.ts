import { type PeriodEntry, type InsertPeriodEntry, type Symptom, type InsertSymptom } from "@shared/schema";

const STORAGE_KEYS = {
  PERIODS: 'luna_periods',
  SYMPTOMS: 'luna_symptoms',
  VERSION: 'luna_version'
} as const;

const CURRENT_VERSION = '1.0.0';

export class LocalStorage {
  constructor() {
    this.migrate();
  }

  private migrate() {
    const version = window.localStorage.getItem(STORAGE_KEYS.VERSION);
    if (version !== CURRENT_VERSION) {
      // Future migrations can be added here
      window.localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    }
  }

  private getItems<T>(key: string): T[] {
    try {
      const data = window.localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }

  private setItems<T>(key: string, items: T[]): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
      throw new Error('Failed to save data to local storage');
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Period entries methods
  async createPeriodEntry(entry: InsertPeriodEntry): Promise<PeriodEntry> {
    const periods = this.getItems<PeriodEntry>(STORAGE_KEYS.PERIODS);
    const newEntry: PeriodEntry = {
      ...entry,
      id: this.generateId(),
      createdAt: new Date(),
      endDate: entry.endDate || null
    };
    
    periods.push(newEntry);
    this.setItems(STORAGE_KEYS.PERIODS, periods);
    return newEntry;
  }

  async getPeriodEntries(): Promise<PeriodEntry[]> {
    const periods = this.getItems<PeriodEntry>(STORAGE_KEYS.PERIODS);
    return periods.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async updatePeriodEntry(id: string, updateData: Partial<InsertPeriodEntry>): Promise<PeriodEntry | undefined> {
    const periods = this.getItems<PeriodEntry>(STORAGE_KEYS.PERIODS);
    const index = periods.findIndex(p => p.id === id);
    
    if (index === -1) return undefined;
    
    const updated = { ...periods[index], ...updateData };
    periods[index] = updated;
    this.setItems(STORAGE_KEYS.PERIODS, periods);
    return updated;
  }

  async deletePeriodEntry(id: string): Promise<boolean> {
    const periods = this.getItems<PeriodEntry>(STORAGE_KEYS.PERIODS);
    const filtered = periods.filter(p => p.id !== id);
    
    if (filtered.length === periods.length) return false;
    
    this.setItems(STORAGE_KEYS.PERIODS, filtered);
    return true;
  }

  // Symptoms methods
  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const symptoms = this.getItems<Symptom>(STORAGE_KEYS.SYMPTOMS);
    const newSymptom: Symptom = {
      ...symptom,
      id: this.generateId(),
      createdAt: new Date(),
      mood: symptom.mood || null,
      energyLevel: symptom.energyLevel || null,
      cramps: symptom.cramps || null,
      headache: symptom.headache || null,
      bloating: symptom.bloating || null,
      notes: symptom.notes || null
    };
    
    symptoms.push(newSymptom);
    this.setItems(STORAGE_KEYS.SYMPTOMS, symptoms);
    return newSymptom;
  }

  async getSymptoms(): Promise<Symptom[]> {
    const symptoms = this.getItems<Symptom>(STORAGE_KEYS.SYMPTOMS);
    return symptoms.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getSymptomsByDateRange(startDate: string, endDate: string): Promise<Symptom[]> {
    const symptoms = this.getItems<Symptom>(STORAGE_KEYS.SYMPTOMS);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      return symptomDate >= start && symptomDate <= end;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async updateSymptom(id: string, updateData: Partial<InsertSymptom>): Promise<Symptom | undefined> {
    const symptoms = this.getItems<Symptom>(STORAGE_KEYS.SYMPTOMS);
    const index = symptoms.findIndex(s => s.id === id);
    
    if (index === -1) return undefined;
    
    const updated = { ...symptoms[index], ...updateData };
    symptoms[index] = updated;
    this.setItems(STORAGE_KEYS.SYMPTOMS, symptoms);
    return updated;
  }

  async deleteSymptom(id: string): Promise<boolean> {
    const symptoms = this.getItems<Symptom>(STORAGE_KEYS.SYMPTOMS);
    const filtered = symptoms.filter(s => s.id !== id);
    
    if (filtered.length === symptoms.length) return false;
    
    this.setItems(STORAGE_KEYS.SYMPTOMS, filtered);
    return true;
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    window.localStorage.removeItem(STORAGE_KEYS.PERIODS);
    window.localStorage.removeItem(STORAGE_KEYS.SYMPTOMS);
  }

  // Export and import functionality
  async exportData() {
    const periods = await this.getPeriodEntries();
    const symptoms = await this.getSymptoms();
    
    return {
      periods,
      symptoms,
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0"
    };
  }

  async importData(data: any): Promise<void> {
    if (data.periods && Array.isArray(data.periods)) {
      const existingPeriods = this.getItems<PeriodEntry>(STORAGE_KEYS.PERIODS);
      const mergedPeriods = [...existingPeriods, ...data.periods];
      this.setItems(STORAGE_KEYS.PERIODS, mergedPeriods);
    }
    
    if (data.symptoms && Array.isArray(data.symptoms)) {
      const existingSymptoms = this.getItems<Symptom>(STORAGE_KEYS.SYMPTOMS);
      const mergedSymptoms = [...existingSymptoms, ...data.symptoms];
      this.setItems(STORAGE_KEYS.SYMPTOMS, mergedSymptoms);
    }
  }
}

export const localStorage = new LocalStorage();