export interface IWaspItem {
  item_id: number;
  item_number: string; // SKU
  item_description: string;
  category: string;
  cost: number;
  price: number;
  base_unit: string;
  hsn_sac_code?: string;
  manufacturer?: string;
  vendor?: string;
  active: boolean;
}

export interface IWaspInventory {
  inventory_id: number;
  item_id: number;
  location_id: number;
  location_code: string;
  quantity: number;
  quantity_available: number;
  quantity_allocated: number;
  quantity_on_order: number;
}

export interface IWaspTransaction {
  transaction_id: number;
  transaction_type: 'Adjust' | 'Move' | 'Add' | 'Remove' | 'Receive' | 'Pick';
  transaction_date: string; // ISO Date
  item_id: number;
  quantity: number;
  site_id: number;
  location_id: number;
  user_id: number;
  reference_number?: string; // PO Number or Order ID
}

export interface IWaspAuthResponse {
  access_token: string;
  token_type: string; // 'Bearer'
  expires_in: number;
  scope: string;
}
