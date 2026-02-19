"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaspAdapter = void 0;
const adapter_base_1 = require("../../core/adapter-base");
const client_1 = require("./client");
class WaspAdapter extends adapter_base_1.BaseAdapter {
    constructor(connection) {
        super(connection);
        // Initialize client. Use mock if no credentials provided or if specifically requested.
        if (this.connection.settings?.useMock || !this.connection.credentials?.apiToken) {
            console.warn('WaspAdapter: Using Mock Client');
            this.client = client_1.WaspClient.createMock();
        }
        else {
            this.client = new client_1.WaspClient(this.connection.settings?.baseUrl || 'https://api.waspbarcode.com', this.connection.credentials?.apiToken);
        }
    }
    async validateAuth() {
        return this.client.validateConnection();
    }
    async refreshToken() {
        // Wasp tokens are typically long-lived or managed via API keys, 
        // but if OAuth were used, refresh logic would go here.
        return;
    }
    async getResource(resourceType, id) {
        if (resourceType === 'product' || resourceType === 'item') {
            try {
                const item = await this.client.getItem(id);
                return this.mapToUnifiedProduct(item);
            }
            catch (e) {
                console.error(`Error fetching Wasp item ${id}`, e);
                return null;
            }
        }
        return null;
    }
    async listResources(resourceType, params) {
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
    mapToUnifiedProduct(item) {
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
            rawData: item
        };
    }
    mapToUnifiedInventory(inv) {
        return {
            id: inv.inventory_id.toString(),
            remoteId: inv.inventory_id.toString(),
            productId: inv.item_id.toString(),
            locationId: inv.location_code, // Using code as ID for readability in unified model
            quantityAvailable: inv.quantity_available,
            quantityOnOrder: inv.quantity_on_order,
            createdAt: new Date(),
            updatedAt: new Date(),
            rawData: inv
        };
    }
}
exports.WaspAdapter = WaspAdapter;
