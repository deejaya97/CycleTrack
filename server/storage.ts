import { type PeriodEntry, type InsertPeriodEntry, type Symptom, type InsertSymptom } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Period entries
  createPeriodEntry(entry: InsertPeriodEntry): Promise<PeriodEntry>;
  getPeriodEntries(): Promise<PeriodEntry[]>;
  updatePeriodEntry(id: string, entry: Partial<InsertPeriodEntry>): Promise<PeriodEntry | undefined>;
  deletePeriodEntry(id: string): Promise<boolean>;

  // Symptoms
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  getSymptoms(): Promise<Symptom[]>;
  getSymptomsByDateRange(startDate: string, endDate: string): Promise<Symptom[]>;
  updateSymptom(id: string, symptom: Partial<InsertSymptom>): Promise<Symptom | undefined>;
}

export class MemStorage implements IStorage {
  private periodEntries: Map<string, PeriodEntry>;
  private symptoms: Map<string, Symptom>;

  constructor() {
    this.periodEntries = new Map();
    this.symptoms = new Map();
  }

  async createPeriodEntry(insertEntry: InsertPeriodEntry): Promise<PeriodEntry> {
    const id = randomUUID();
    const entry: PeriodEntry = { 
      ...insertEntry, 
      id,
      createdAt: new Date(),
      endDate: insertEntry.endDate || null
    };
    this.periodEntries.set(id, entry);
    return entry;
  }

  async getPeriodEntries(): Promise<PeriodEntry[]> {
    return Array.from(this.periodEntries.values()).sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async updatePeriodEntry(id: string, updateData: Partial<InsertPeriodEntry>): Promise<PeriodEntry | undefined> {
    const existing = this.periodEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.periodEntries.set(id, updated);
    return updated;
  }

  async deletePeriodEntry(id: string): Promise<boolean> {
    return this.periodEntries.delete(id);
  }

  async createSymptom(insertSymptom: InsertSymptom): Promise<Symptom> {
    const id = randomUUID();
    const symptom: Symptom = { 
      ...insertSymptom, 
      id,
      createdAt: new Date(),
      mood: insertSymptom.mood || null,
      energyLevel: insertSymptom.energyLevel || null,
      cramps: insertSymptom.cramps || null,
      headache: insertSymptom.headache || null,
      bloating: insertSymptom.bloating || null,
      notes: insertSymptom.notes || null
    };
    this.symptoms.set(id, symptom);
    return symptom;
  }

  async getSymptoms(): Promise<Symptom[]> {
    return Array.from(this.symptoms.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getSymptomsByDateRange(startDate: string, endDate: string): Promise<Symptom[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.symptoms.values()).filter(symptom => {
      const symptomDate = new Date(symptom.date);
      return symptomDate >= start && symptomDate <= end;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async updateSymptom(id: string, updateData: Partial<InsertSymptom>): Promise<Symptom | undefined> {
    const existing = this.symptoms.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.symptoms.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
