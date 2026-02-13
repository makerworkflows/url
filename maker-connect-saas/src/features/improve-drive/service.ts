
import { eventBus } from "../../services/event-bus";

export interface ICAPA {
  id: string;
  title: string;
  source: "Audit" | "Customer Complaint" | "Deviation" | "Batch Review";
  status: "Open" | "Investigating" | "Implementing Fix" | "Closed";
  severity: "Low" | "Medium" | "High" | "Critical";
  rootCause?: string;
  relatedBatchId?: string;
}

const MOCK_CAPAS: ICAPA[] = [
  {
    id: "CAPA-2024-001",
    title: "Metal sliver found in raw material",
    source: "Deviation",
    status: "Investigating",
    severity: "High",
  },
  {
    id: "CAPA-2024-002",
    title: "Label misalignment on Line B",
    source: "Audit",
    status: "Open",
    severity: "Medium",
  },
];

export class ImproveDriveService {
  private capas: ICAPA[] = [...MOCK_CAPAS];

  constructor() {
      // Auto-trigger investigation on batch completion
      eventBus.subscribe((event) => {
          if (event.type === 'BATCH_COMPLETED') {
              // Simulate a random quality check logic for demo purposes
               if (Math.random() > 0.5) {
                   this.createDeviation(event.payload.batchId, "Yield Variance > 2%");
               }
          }
      });
  }

  public getCAPAs(): ICAPA[] {
    return this.capas;
  }

  public createDeviation(batchId: string, reason: string) {
       const newCAPA: ICAPA = {
          id: `CAPA-${Date.now()}`,
          title: `Auto-Deviation: ${reason}`,
          source: "Batch Review",
          status: "Open",
          severity: "Medium",
          relatedBatchId: batchId
      };
      this.capas.unshift(newCAPA); // Add to top
  }

  public runRootCauseAnalysis(capaId: string, method: "5-Whys" | "Fishbone"): string {
    // Mock AI Analysis
    return `AI Analysis (${method}): Potential root cause linked to supplier 'Acme Ingredients' batch variability. Recommended Action: Supplier Audit.`;
  }
}

export const improveDriveService = new ImproveDriveService();
