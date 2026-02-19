import { IWaspItem, IWaspInventory, IWaspAuthResponse } from './types';

export class WaspClient {
  private baseUrl: string;
  private apiToken: string;

  constructor(baseUrl: string, apiToken: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.apiToken = apiToken;
  }

  private async request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Wasp API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Request failed to ${url}`, error);
      throw error;
    }
  }

  /**
   * Validates the connection by attempting to fetch a simple resource or checking token validity.
   * Wasp doesn't have a dedicated 'ping' so we might just try to list 1 item.
   */
  async validateConnection(): Promise<boolean> {
    try {
      // Trying to fetch 1 item to verify token
      await this.request('/items?page_size=1');
      return true;
    } catch (e) {
      console.error('Wasp connection validation failed', e);
      return false;
    }
  }

  async getItems(limit: number = 100, page: number = 1): Promise<IWaspItem[]> {
      // Wasp API typically uses page_size and page
      const response = await this.request<{ data: IWaspItem[] }>(`/items?page=${page}&page_size=${limit}`);
      // Depending on actual response structure. Assuming { data: [...] } for standard REST API.
      // If it returns array directly:
      if (Array.isArray(response)) return response;
      // If wrapped:
      return (response as any).data || [];
  }

  async getItem(id: string): Promise<IWaspItem> {
    return this.request<IWaspItem>(`/items/${id}`);
  }

  async getInventory(): Promise<IWaspInventory[]> {
    return this.request<IWaspInventory[]>('/inventory');
  }

  // Mock method for simulation since we don't have a live sandbox
  static createMock(): WaspClient {
    return new MockWaspClient("https://mock.wasp.com", "mock_token");
  }
}

// Mock Implementation for development/demo
class MockWaspClient extends WaspClient {
  async validateConnection(): Promise<boolean> {
    return true;
  }

  async getItems(limit: number = 100, page: number = 1): Promise<IWaspItem[]> {
    return [
      {
        item_id: 101,
        item_number: "WASP-001",
        item_description: "Barcode Scanner 2D",
        category: "Hardware",
        cost: 150.00,
        price: 299.99,
        base_unit: "Each",
        active: true
      },
      {
        item_id: 102,
        item_number: "WASP-002",
        item_description: "Label Printer Industrial",
        category: "Hardware",
        cost: 450.00,
        price: 899.99,
        base_unit: "Each",
        active: true
      }
    ];
  }

  async getItem(id: string): Promise<IWaspItem> {
    return {
        item_id: parseInt(id) || 101,
        item_number: "WASP-001",
        item_description: "Barcode Scanner 2D",
        category: "Hardware",
        cost: 150.00,
        price: 299.99,
        base_unit: "Each",
        active: true
      };
  }

  async getInventory(): Promise<IWaspInventory[]> {
    return [
      {
        inventory_id: 1,
        item_id: 101,
        location_id: 1,
        location_code: "WH-MAIN",
        quantity: 50,
        quantity_available: 45,
        quantity_allocated: 5,
        quantity_on_order: 10
      }
    ];
  }
}
