import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPeriodEntrySchema, insertSymptomSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Period entries routes
  app.get("/api/periods", async (req, res) => {
    try {
      const periods = await storage.getPeriodEntries();
      res.json(periods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch period entries" });
    }
  });

  app.post("/api/periods", async (req, res) => {
    try {
      const validatedData = insertPeriodEntrySchema.parse(req.body);
      const period = await storage.createPeriodEntry(validatedData);
      res.status(201).json(period);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid period data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create period entry" });
      }
    }
  });

  app.patch("/api/periods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPeriodEntrySchema.partial().parse(req.body);
      const period = await storage.updatePeriodEntry(id, validatedData);
      
      if (!period) {
        res.status(404).json({ message: "Period entry not found" });
        return;
      }
      
      res.json(period);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid period data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update period entry" });
      }
    }
  });

  app.delete("/api/periods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePeriodEntry(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Period entry not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete period entry" });
    }
  });

  // Symptoms routes
  app.get("/api/symptoms", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (startDate && endDate) {
        const symptoms = await storage.getSymptomsByDateRange(
          startDate as string, 
          endDate as string
        );
        res.json(symptoms);
      } else {
        const symptoms = await storage.getSymptoms();
        res.json(symptoms);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  app.post("/api/symptoms", async (req, res) => {
    try {
      const validatedData = insertSymptomSchema.parse(req.body);
      const symptom = await storage.createSymptom(validatedData);
      res.status(201).json(symptom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid symptom data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create symptom entry" });
      }
    }
  });

  app.patch("/api/symptoms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSymptomSchema.partial().parse(req.body);
      const symptom = await storage.updateSymptom(id, validatedData);
      
      if (!symptom) {
        res.status(404).json({ message: "Symptom entry not found" });
        return;
      }
      
      res.json(symptom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid symptom data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update symptom entry" });
      }
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const periods = await storage.getPeriodEntries();
      
      if (periods.length === 0) {
        res.json({
          averageCycleLength: 0,
          averagePeriodLength: 0,
          nextPeriodPrediction: null,
          currentCycleDay: 0
        });
        return;
      }

      // Calculate cycle lengths
      const cycleLengths: number[] = [];
      for (let i = 1; i < periods.length; i++) {
        const current = new Date(periods[i-1].startDate);
        const previous = new Date(periods[i].startDate);
        const diffTime = Math.abs(current.getTime() - previous.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        cycleLengths.push(diffDays);
      }

      // Calculate period lengths
      const periodLengths = periods
        .filter(p => p.endDate)
        .map(p => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate!);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        });

      const averageCycleLength = cycleLengths.length > 0 
        ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
        : 28;

      const averagePeriodLength = periodLengths.length > 0
        ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
        : 5;

      // Predict next period
      const lastPeriod = periods[0];
      const lastPeriodStart = new Date(lastPeriod.startDate);
      const nextPeriodDate = new Date(lastPeriodStart);
      nextPeriodDate.setDate(nextPeriodDate.getDate() + averageCycleLength);

      // Calculate current cycle day
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastPeriodStart.getTime());
      const currentCycleDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Days until next period
      const daysUntilNextPeriod = Math.ceil(
        (nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      res.json({
        averageCycleLength,
        averagePeriodLength,
        nextPeriodPrediction: nextPeriodDate.toISOString().split('T')[0],
        currentCycleDay: currentCycleDay > averageCycleLength ? averageCycleLength : currentCycleDay,
        daysUntilNextPeriod: daysUntilNextPeriod > 0 ? daysUntilNextPeriod : 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
