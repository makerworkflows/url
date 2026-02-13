
import { eventBus } from "../../services/event-bus";

// Interfaces for Dashboard
export interface IRequisition {
    id: string;
    requester: string;
    items: { name: string; quantity: number; unitPrice: number }[];
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'PO_GENERATED';
    dateNeeded: string;
}

export interface IPurchaseOrder {
  id: string;
  poNumber?: string; // Dashboard expects poNumber
  vendor?: string;
  vendorId?: string; // Dashboard expects vendorId
  items: { description: string; quantity: number }[];
  status: "Draft" | "Sent" | "Received";
  totalAmount: number;
}

const MOCK_POS: IPurchaseOrder[] = [
  {
    id: "PO-1001",
    poNumber: "PO-1001",
    vendor: "Acme Ingredients",
    items: [{ description: "Whey Protein", quantity: 500 }],
    status: "Sent",
    totalAmount: 5000,
  },
];

const MOCK_REQUISITIONS: IRequisition[] = [
    {
        id: "REQ-001",
        requester: "Prod. Manager",
        items: [{ name: "Whey Protein", quantity: 500, unitPrice: 15 }],
        status: "PENDING_APPROVAL",
        dateNeeded: "2024-04-01"
    }
];

export class ProcureTrackService {
  private pos: IPurchaseOrder[] = [...MOCK_POS];
  private requisitions: IRequisition[] = [...MOCK_REQUISITIONS];

  constructor() {
      // Auto-create PO on shortage
      eventBus.subscribe((event) => {
          if (event.type === 'INVENTORY_SHORTAGE') {
              this.generateAutoPO(event.payload.item, event.payload.quantity);
          }
      });
  }

  public getPOs(): IPurchaseOrder[] {
    return this.pos;
  }
  
  public async getRequisitions(): Promise<IRequisition[]> {
      return this.requisitions;
  }

  public async generatePO(reqId: string): Promise<IPurchaseOrder | null> {
      const req = this.requisitions.find(r => r.id === reqId);
      if(!req) return null;

      req.status = 'PO_GENERATED';
      
      const po = this.generateAutoPO(req.items[0].name, req.items[0].quantity);
      return po;
  }

  public generateAutoPO(item: string, quantity: number): IPurchaseOrder {
    const newPO: IPurchaseOrder = {
      id: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      vendor: "Recommended Supplier (AI)",
      vendorId: "SUP-001",
      items: [{ description: item, quantity }],
      status: "Draft",
      totalAmount: quantity * 15, // Mock price
    };
    this.pos.push(newPO);
    
    eventBus.publish({
        type: 'PO_CREATED',
        payload: { poId: newPO.id, vendor: newPO.vendor || "Unknown" }
    });
    
    return newPO;
  }
}

export const procureTrackService = new ProcureTrackService();
export const procureService = procureTrackService; // Alias for Dashboard
