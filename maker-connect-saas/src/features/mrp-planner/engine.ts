
import { eventBus } from "../../services/event-bus"; // Import Event Bus

export interface IBOMItem {
  ingredientId: string;
  name: string;
  quantityPerUnit: number; // e.g. grams
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

export interface IProductionJob {
  id: string;
  productName: string;
  batchSize: number;
  requiredDate: string;
  status: "Planned" | "Released";
}

// Interface expected by Dashboard
export interface IProductionOrder {
    orderId: string;
    productSku: string;
    quantityToProduce: number;
}

export interface IMaterialNeed {
    ingredientId: string;
    required: number;
    onHand: number;
    shortage: number;
    status: 'OK' | 'SHORTAGE';
}

// Mock Database
const INVENTORY: IInventoryItem[] = [
  { id: "ING-001", name: "Whey Protein Isolate", currentStock: 500, reservedStock: 0, unit: "kg", leadTimeDays: 14 },
  { id: "ING-002", name: "Cocoa Powder", currentStock: 200, reservedStock: 0, unit: "kg", leadTimeDays: 7 },
  { id: "i1", name: "Whey Protein", currentStock: 500, reservedStock: 0, unit: "kg", leadTimeDays: 14 }, // specific for dashboard demo
  { id: "i3", name: "Cocoa Powder", currentStock: 200, reservedStock: 0, unit: "kg", leadTimeDays: 7 }, // specific for dashboard demo
];

const BOMS: Record<string, IBOMItem[]> = {
  "Protein Bar - Chocolate": [
    { ingredientId: "ING-001", name: "Whey Protein Isolate", quantityPerUnit: 0.02, unit: "kg", leadTimeDays: 14 },
    { ingredientId: "ING-002", name: "Cocoa Powder", quantityPerUnit: 0.005, unit: "kg", leadTimeDays: 7 },
  ],
  "PRO-BAR-CHOCO": [ // Dashboard SKU
      { ingredientId: "i1", name: "Whey Protein", quantityPerUnit: 20, unit: "g", leadTimeDays: 14 },
      { ingredientId: "i3", name: "Cocoa Powder", quantityPerUnit: 5, unit: "g", leadTimeDays: 7 },
  ]
};

export class MRPPlannerEngine {
  private jobs: IProductionJob[] = [];
  private inventory: IInventoryItem[] = [...INVENTORY];

  constructor() {
      // Listen for Sales Wins
      eventBus.subscribe((event) => {
          if (event.type === 'SALES_DEAL_WON') {
              this.createJob(event.payload.product, event.payload.quantity);
          }
      });
  }

  public getJobs(): IProductionJob[] {
    return this.jobs;
  }
  
  public getInventory(): IInventoryItem[] {
    return this.inventory;
  }

  public createJob(productName: string, batchSize: number) {
      const job: IProductionJob = {
          id: `JOB-${Date.now().toString().slice(-4)}`,
          productName,
          batchSize,
          requiredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +14 days
          status: "Planned"
      };
      this.jobs.push(job);
      // Auto-calc not needed for demo push, but good for real logic
      
      eventBus.publish({
          type: 'MRP_JOB_CREATED',
          payload: { jobId: job.id, product: job.productName }
      });
  }

  // Adapted for Dashboard usage
  public calculateNeeds(orders: IProductionOrder[] | IProductionJob[]): IMaterialNeed[] {
    const totalNeeds: Record<string, number> = {};

    orders.forEach((job) => {
      // Handle both interfaces
      const sku = 'productSku' in job ? job.productSku : job.productName;
      const qty = 'quantityToProduce' in job ? job.quantityToProduce : job.batchSize;

      const bom = BOMS[sku];
      if (!bom) return;

      bom.forEach((ing) => {
        if (!totalNeeds[ing.ingredientId]) totalNeeds[ing.ingredientId] = 0;
        totalNeeds[ing.ingredientId] += ing.quantityPerUnit * qty;
      });
    });

    return Object.keys(totalNeeds).map((ingId) => {
      const item = this.inventory.find((i) => i.id === ingId);
      const required = totalNeeds[ingId];
      const onHand = item ? item.currentStock - item.reservedStock : 0;
      const shortage = onHand < required ? required - onHand : 0;
      
      if (shortage > 0) {
          eventBus.publish({
              type: 'INVENTORY_SHORTAGE',
              payload: { item: item?.name || ingId, quantity: shortage }
          });
      }

      return {
        ingredientId: ingId,
        required,
        onHand,
        shortage,
        status: shortage > 0 ? 'SHORTAGE' : 'OK'
      };
    });
  }
}

export const mrpPlanner = new MRPPlannerEngine();
export const mrpEngine = mrpPlanner; // Alias for Dashboard
