
import { eventBus } from "../../services/event-bus"; 
import { createJobAction } from "./actions";

// Interfaces
export interface IProductionJob {
  id: string;
  productName: string;
  batchSize: number;
  requiredDate: string;
  status: "Planned" | "Released";
}

// Deprecated interfaces kept for compatibility if needed by other components, but ideally should be removed
export interface IBOMItem {
  ingredientId: string;
  name: string;
  quantityPerUnit: number;
  unit: string;
  leadTimeDays: number;
}
export interface IInventoryItem {
  id: string;
  name: string;
  currentStock: number;
  reservedStock: number;
  unit: string;
  leadTimeDays: number;
}
export interface IMaterialNeed {
    ingredientId: string;
    required: number;
    onHand: number;
    shortage: number;
    status: 'OK' | 'SHORTAGE';
}

export class MRPPlannerEngine {

  constructor() {
      // Listen for Sales Wins (Client Side Event)
      eventBus.subscribe((event) => {
          if (event.type === 'SALES_DEAL_WON') {
              this.createJob(event.payload.product, event.payload.quantity);
          }
      });
  }

  public async createJob(productName: string, batchSize: number) {
      console.log(`[MRP] Creating job for ${productName}`);
      try {
          const result = await createJobAction(productName, batchSize);
          
          if (result && result.job) {
             console.log(`[MRP] Job Created: ${result.job.jobNumber}`);
             eventBus.publish({
                type: 'MRP_JOB_CREATED',
                payload: { jobId: result.job.id, product: productName } 
             });

             // Emit shortages if any
             if (result.shortages && result.shortages.length > 0) {
                 result.shortages.forEach(s => {
                     console.log(`[MRP] Shortage detected: ${s.item}`);
                     eventBus.publish({
                         type: 'INVENTORY_SHORTAGE',
                         payload: { item: s.item, quantity: s.quantity }
                     });
                 });
             }
          }
      } catch (e) {
          console.error("Error creating job via action", e);
      }
  }
}

export const mrpPlanner = new MRPPlannerEngine();
export const mrpEngine = mrpPlanner; // Alias

