export enum IntegrationCategory {
  ERP = "ERP",
  CRM = "CRM",
  QMS = "QMS",
  LABEL = "LABEL",
  TRACEABILITY = "TRACEABILITY",
  CPQ = "CPQ",
  VALUATION = "VALUATION",
}

export interface IConnection {
  id: string;
  provider: string; // e.g., 'salesforce', 'netsuite'
  category: IntegrationCategory;
  settings: Record<string, any>;
  credentials: Record<string, any>; // Encrypted
  isActive: boolean;
}

export interface IUnifiedResource {
  id: string;
  remoteId: string;
  createdAt: Date;
  updatedAt: Date;
  rawData?: Record<string, any>;
}

// Example Unified Models (To be expanded)
export interface IUnifiedCustomer extends IUnifiedResource {
  name: string;
  email: string;
  phone?: string;
  addresses?: any[];
}

// ERP: Product / Item
export interface IUnifiedProduct extends IUnifiedResource {
  name: string;
  sku: string;
  description?: string;
  price: number;
  currency: string;
  isActive: boolean;
  inventoryCount?: number;
}

// ERP: Inventory Level
export interface IUnifiedInventory extends IUnifiedResource {
  productId: string; // SKU or Remote ID
  locationId: string;
  quantityAvailable: number;
  quantityOnOrder: number;
  reorderPoint?: number;
}

// ERP: Order
export interface IUnifiedOrder extends IUnifiedResource {
  customerRef: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdDate: Date;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

// QMS: Quality Event (Non-conformance, Deviation, Complaint)
export interface IUnifiedQualityEvent extends IUnifiedResource {
  title: string;
  type: 'NON_CONFORMANCE' | 'DEVIATION' | 'COMPLAINT' | 'AUDIT_FINDING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CAPA_CREATED' | 'CLOSED';
  description?: string;
  occurredDate: Date;
  createdDate: Date; // Explicitly adding as it's often distinct from system createdAt
  affectedProducts?: string[]; // IDs/SKUs
}

// QMS: CAPA (Corrective and Preventive Action)
export interface IUnifiedCAPA extends IUnifiedResource {
  title: string;
  sourceEventId?: string; // Link to Quality Event
  status: 'DRAFT' | 'PLANNING' | 'IMPLEMENTATION' | 'VERIFICATION' | 'CLOSED';
  rootCause?: string;
  actionPlan?: string;
  dueDate?: Date;
  createdDate: Date;
}

// Label Compliance: Artwork / Label Template
export interface IUnifiedLabel extends IUnifiedResource {
  name: string;
  version: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'OBSOLETE';
  thumbnailUrl?: string;
  printerType?: string; // e.g., 'ZEBRA', 'SATO'
  width?: number;
  height?: number;
  unit?: 'IN' | 'MM';
  createdDate: Date;
}

// Traceability: EPCIS-like event structure
export interface IUnifiedTraceEvent extends IUnifiedResource {
  eventType: 'OBJECT' | 'AGGREGATION' | 'TRANSACTION' | 'TRANSFORMATION' | 'INSPECTION';
  action: 'ADD' | 'OBSERVE' | 'DELETE';
  bizStep?: string; // e.g., 'shipping', 'receiving', 'commissioning'
  eventTime: Date;
  readPoint?: string; // Location ID / GLN
  bizLocation?: string; // Location ID / GLN
  inputs?: Array<{ productId: string; quantity: number }>;
  outputs?: Array<{ productId: string; quantity: number }>;
  createdDate: Date;
}
