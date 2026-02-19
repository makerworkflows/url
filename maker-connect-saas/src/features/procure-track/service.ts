import { eventBus } from "../../services/event-bus";
import { createPOAction } from "./actions";

// Interfaces for Dashboard (Keep for compatibility if needed)
export interface IRequisition {
    id: string;
    requester: string;
    items: { name: string; quantity: number; unitPrice: number }[];
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'PO_GENERATED';
    dateNeeded: string;
}

export interface IPurchaseOrder {
  id: string;
  poNumber?: string; 
  vendor?: string;
  vendorId?: string; 
  items: { description: string; quantity: number }[];
  status: "Draft" | "Sent" | "Received";
  totalAmount: number;
}

export class ProcureTrackService {

  constructor() {
      // Auto-create PO on shortage
      eventBus.subscribe((event) => {
          if (event.type === 'INVENTORY_SHORTAGE') {
              this.generateAutoPO(event.payload.item, event.payload.quantity);
          }
      });
  }

  // Generate PO via Server Action
  public async generateAutoPO(item: string, quantity: number) {
    console.log(`[ProcureTrack] Auto-generating PO for ${item}`);
    try {
        const po = await createPOAction(item, quantity);
        
        if (po) {
            console.log(`[ProcureTrack] PO Created: ${po.poNumber}`);
            eventBus.publish({
                type: 'PO_CREATED',
                payload: { poId: po.id, vendor: po.vendor || "Unknown" }
            });
            return po;
        }
    } catch (e) {
        console.error("Error creating PO via action", e);
    }
    return null;
  }

  // Restored for UI compatibility (RequisitionList component)
  public async getRequisitions(): Promise<IRequisition[]> {
      return [
          {
            id: "REQ-001",
            requester: "Prod. Manager",
            items: [{ name: "Whey Protein", quantity: 500, unitPrice: 15 }],
            status: "PENDING_APPROVAL",
            dateNeeded: "2024-04-01"
         }
      ];
  }

  public async generatePO(reqId: string): Promise<IPurchaseOrder | null> {
      // Mock lookup
      const reqs = await this.getRequisitions();
      const req = reqs.find(r => r.id === reqId);
      if(!req) return null;

      // Use the new Server Action flow
      const po = await this.generateAutoPO(req.items[0].name, req.items[0].quantity);
      return po;
  }
}

export const procureTrackService = new ProcureTrackService();
export const procureService = procureTrackService; // Alias
