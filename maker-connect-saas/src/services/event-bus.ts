
import { Subject } from 'rxjs';

// Define Event Types
export type SystemEventType = 
  | { type: 'SALES_DEAL_WON'; payload: { dealId: string; product: string; quantity: number } }
  | { type: 'MRP_JOB_CREATED'; payload: { jobId: string; product: string } }
  | { type: 'INVENTORY_SHORTAGE'; payload: { item: string; quantity: number } }
  | { type: 'PO_CREATED'; payload: { poId: string; vendor: string } }
  | { type: 'PO_RECEIVED'; payload: { poId: string } }
  | { type: 'BATCH_COMPLETED'; payload: { batchId: string; yield: number } };

class SystemEventBus {
  private subject = new Subject<SystemEventType>();

  publish(event: SystemEventType) {
    console.log(`[EventBus] ${event.type}`, event.payload);
    this.subject.next(event);
  }

  subscribe(callback: (event: SystemEventType) => void) {
    return this.subject.subscribe(callback);
  }
}

export const eventBus = new SystemEventBus();
