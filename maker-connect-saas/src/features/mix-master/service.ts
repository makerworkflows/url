
import { eventBus } from "../../services/event-bus";

export interface IBatchStep {
  id: string;
  instruction: string;
  type: "Check" | "Input" | "Scan" | "Signature";
  requiredValue?: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface IBatchRecord {
  id: string;
  productName: string;
  batchNumber: string;
  status: "Pending" | "In Progress" | "Completed" | "Review";
  steps: IBatchStep[];
}

const MOCK_BATCHES: IBatchRecord[] = [
  {
    id: "BR-2024-001",
    productName: "Protein Bar - Chocolate",
    batchNumber: "LOT-998877",
    status: "In Progress",
    steps: [
      { id: "S1", instruction: "Verify Line Clearance", type: "Check", completed: true, completedBy: "Op. Smith", completedAt: "2024-03-20T08:05:00" },
      { id: "S2", instruction: "Scan Ingredient: Whey Protein", type: "Scan", requiredValue: "ING-001", completed: false },
      { id: "S3", instruction: "Mix for 15 minutes at 50 RPM", type: "Input", completed: false },
      { id: "S4", instruction: "Quality Sign-off", type: "Signature", completed: false },
    ],
  },
];

export class BatchRecordService {
  private batches: IBatchRecord[] = [...MOCK_BATCHES];

  public getBatches(): IBatchRecord[] {
    return this.batches;
  }

  public getBatch(id: string): IBatchRecord | undefined {
    return this.batches.find((b) => b.id === id);
  }

  public completeStep(batchId: string, stepId: string, value: string, user: string) {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return;

    const step = batch.steps.find((s) => s.id === stepId);
    if (!step) return;

    // Simulate validation
    if (step.type === "Scan" && step.requiredValue && value !== step.requiredValue) {
      throw new Error(`Invalid Scan. Expected ${step.requiredValue}`);
    }

    step.completed = true;
    step.completedBy = user;
    step.completedAt = new Date().toISOString();

    // Check if batch is complete
    if (batch.steps.every(s => s.completed)) {
        batch.status = "Review";
        
        eventBus.publish({
            type: 'BATCH_COMPLETED',
            payload: { batchId: batch.id, yield: 100 } // Mock yield
        });
    }
  }
}

export const batchRecordService = new BatchRecordService();
