import { BaseAdapter } from '../../core/adapter-base';
import { IUnifiedResource, IUnifiedProduct, IUnifiedInventory } from '../../core/types';
import { WaspClient } from './client';
import { IWaspItem, IWaspInventory } from './types';

import { decrypt } from '../../../lib/encryption';

export class WaspAdapter extends BaseAdapter {
  private client: WaspClient;

  constructor(connection: any) {
    super(connection);
    
    let apiToken = '';
    let baseUrl = 'https://api.waspbarcode.com';

    try {
        const settings = typeof this.connection.settings === 'string' 
            ? JSON.parse(this.connection.settings) 
            : this.connection.settings;
        
        if (settings?.baseUrl) baseUrl = settings.baseUrl;

        if (this.connection.credentials) {
            let credsStr = '';
            const rawCreds = this.connection.credentials as unknown;

            if (typeof rawCreds === 'string') {
                 try {
                    const decrypted = decrypt(rawCreds);
                    credsStr = decrypted;
                 } catch (e) {
                     // If decryption fails (e.g. plain text or bad key), fallback or log
                     console.error("Decryption failed", e);
                     // Fallback: check if it's already a JSON string? unusual but possible in dev
                     credsStr = rawCreds; 
                 }
            } else {
                // If it's already an object, assume it's the credentials object
                credsStr = JSON.stringify(this.connection.credentials);
            }

            try {
                const creds = JSON.parse(credsStr);
                apiToken = creds.apiToken;
            } catch (jsonErr) {
                 // ignore
            }
        }
    } catch (e) {
        console.error("Failed to parse connection settings/credentials", e);
    }

    // Initialize client. Use mock if no credentials provided or if specifically requested.
    if (!apiToken) {
        console.warn('WaspAdapter: Using Mock Client (No API Token found)');
        this.client = WaspClient.createMock();
    } else {
        this.client = new WaspClient(baseUrl, apiToken);
    }
  }

  async validateAuth(): Promise<boolean> {
    return this.client.validateConnection();
  }

  async refreshToken(): Promise<void> {
    // Wasp tokens are typically long-lived or managed via API keys, 
    // but if OAuth were used, refresh logic would go here.
    return;
  }

  async getResource(resourceType: string, id: string): Promise<IUnifiedResource | null> {
    if (resourceType === 'product' || resourceType === 'item') {
        try {
            const item = await this.client.getItem(id);
            return this.mapToUnifiedProduct(item);
        } catch (e) {
            console.error(`Error fetching Wasp item ${id}`, e);
            return null;
        }
    }
    return null;
  }

  async listResources(resourceType: string, params?: Record<string, any>): Promise<IUnifiedResource[]> {
    if (resourceType === 'product' || resourceType === 'item') {
        const items = await this.client.getItems(params?.limit, params?.page);
        return items.map(this.mapToUnifiedProduct);
    }
    
    if (resourceType === 'inventory') {
        const inventory = await this.client.getInventory();
        return inventory.map(this.mapToUnifiedInventory);
    }

    return [];
  }

  // Mappers specific to Wasp -> Unified Model

  private mapToUnifiedProduct(item: IWaspItem): IUnifiedProduct {
    return {
        id: item.item_id.toString(),
        remoteId: item.item_id.toString(),
        name: item.item_description,
        sku: item.item_number,
        description: item.item_description,
        price: item.price,
        currency: 'USD', // Defaulting for now
        isActive: item.active,
        createdAt: new Date(), // Wasp item might not have created_at in basic response
        updatedAt: new Date(),
        rawData: item as any
    };
  }

  private mapToUnifiedInventory(inv: IWaspInventory): IUnifiedInventory {
      return {
          id: inv.inventory_id.toString(),
          remoteId: inv.inventory_id.toString(),
          productId: inv.item_id.toString(),
          locationId: inv.location_code, // Using code as ID for readability in unified model
          quantityAvailable: inv.quantity_available,
          quantityOnOrder: inv.quantity_on_order,
          createdAt: new Date(),
          updatedAt: new Date(),
          rawData: inv as any
      };
  }
}
