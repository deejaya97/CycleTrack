import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { localStorage } from "./local-storage";
import { type PeriodEntry, type InsertPeriodEntry, type Symptom, type InsertSymptom } from "@shared/schema";

// Local storage query functions
export const localQueryFn: QueryFunction = async ({ queryKey }) => {
  const [endpoint, ...params] = queryKey as string[];
  
  try {
    switch (endpoint) {
      case "/api/periods":
        return await localStorage.getPeriodEntries();
        
      case "/api/symptoms":
        if (params.length >= 2) {
          // Date range query: /api/symptoms?startDate=X&endDate=Y
          return await localStorage.getSymptomsByDateRange(params[0], params[1]);
        }
        return await localStorage.getSymptoms();
        
      case "/api/analytics":
        return await calculateAnalytics();
        
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error('Local storage query error:', error);
    throw error;
  }
};

// Analytics calculation (moved from server to client)
async function calculateAnalytics() {
  const periods = await localStorage.getPeriodEntries();
  
  if (periods.length === 0) {
    return {
      averageCycleLength: 0,
      averagePeriodLength: 0,
      nextPeriodPrediction: null,
      currentCycleDay: 0,
      daysUntilNextPeriod: 0
    };
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

  return {
    averageCycleLength,
    averagePeriodLength,
    nextPeriodPrediction: nextPeriodDate.toISOString().split('T')[0],
    currentCycleDay: currentCycleDay > averageCycleLength ? averageCycleLength : currentCycleDay,
    daysUntilNextPeriod: daysUntilNextPeriod > 0 ? daysUntilNextPeriod : 0
  };
}

// Local storage mutation functions
export async function localMutation(method: string, endpoint: string, data?: any) {
  const [, , resource, id] = endpoint.split('/');
  
  try {
    switch (method) {
      case "POST":
        if (resource === "periods") {
          return await localStorage.createPeriodEntry(data as InsertPeriodEntry);
        } else if (resource === "symptoms") {
          return await localStorage.createSymptom(data as InsertSymptom);
        }
        break;
        
      case "PATCH":
        if (resource === "periods" && id) {
          return await localStorage.updatePeriodEntry(id, data);
        } else if (resource === "symptoms" && id) {
          return await localStorage.updateSymptom(id, data);
        }
        break;
        
      case "DELETE":
        if (resource === "periods" && id) {
          const success = await localStorage.deletePeriodEntry(id);
          if (!success) throw new Error("Period entry not found");
          return success;
        } else if (resource === "symptoms" && id) {
          const success = await localStorage.deleteSymptom(id);
          if (!success) throw new Error("Symptom entry not found");
          return success;
        }
        break;
        
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  } catch (error) {
    console.error('Local storage mutation error:', error);
    throw error;
  }
}

// For backwards compatibility - now routes to local storage
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  return await localMutation(method, url, data);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: localQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes - allow some staleness for local data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
