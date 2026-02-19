"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaspClient = void 0;
class WaspClient {
    constructor(baseUrl, apiToken) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.apiToken = apiToken;
    }
    async request(endpoint, method = 'GET', body) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
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
            return await response.json();
        }
        catch (error) {
            console.error(`Request failed to ${url}`, error);
            throw error;
        }
    }
    /**
     * Validates the connection by attempting to fetch a simple resource or checking token validity.
     * Wasp doesn't have a dedicated 'ping' so we might just try to list 1 item.
     */
    async validateConnection() {
        try {
            // Trying to fetch 1 item to verify token
            await this.request('/items?limit=1');
            return true;
        }
        catch (e) {
            console.error('Wasp connection validation failed', e);
            return false;
        }
    }
    async getItems(limit = 100, page = 1) {
        // API structure might vary, assuming RESTful standard for now
        // e.g., /items?page=1&page_size=100
        return this.request(`/items?page=${page}&page_size=${limit}`);
    }
    async getItem(id) {
        return this.request(`/items/${id}`);
    }
    async getInventory() {
        return this.request('/inventory');
    }
    // Mock method for simulation since we don't have a live sandbox
    static createMock() {
        return new MockWaspClient("https://mock.wasp.com", "mock_token");
    }
}
exports.WaspClient = WaspClient;
// Mock Implementation for development/demo
class MockWaspClient extends WaspClient {
    async validateConnection() {
        return true;
    }
    async getItems(limit = 100, page = 1) {
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
    async getItem(id) {
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
    async getInventory() {
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
