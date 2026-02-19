"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_1 = require("./adapter");
const types_1 = require("../../core/types");
async function verifyWaspIntegration() {
    console.log("Starting Wasp Barcode Integration Verification...");
    // 1. Setup Mock Connection
    const mockConnection = {
        id: 'wasp-mock-001',
        provider: 'wasp',
        category: types_1.IntegrationCategory.ERP,
        isActive: true,
        settings: {
            useMock: true,
            baseUrl: 'https://mock.wasp.com'
        },
        credentials: {
            apiToken: 'mock_token_123'
        }
    };
    console.log("Initializing Adapter...");
    const adapter = new adapter_1.WaspAdapter(mockConnection);
    // 2. Test Auth Validation
    console.log("\n--- Testing Authentication ---");
    const isAuthenticated = await adapter.validateAuth();
    console.log(`Auth Valid: ${isAuthenticated}`);
    if (!isAuthenticated) {
        console.error("Authentication failed!");
        process.exit(1);
    }
    // 3. Test List Products
    console.log("\n--- Testing List Products ---");
    const products = await adapter.listResources('product');
    console.log(`Fetched ${products.length} products associated with Wasp.`);
    products.forEach(p => {
        // @ts-ignore
        console.log(`- [${p.sku}] ${p.name} ($${p.price})`);
    });
    // 4. Test List Inventory
    console.log("\n--- Testing List Inventory ---");
    const inventory = await adapter.listResources('inventory');
    console.log(`Fetched ${inventory.length} inventory records.`);
    inventory.forEach(inv => {
        // @ts-ignore
        console.log(`- Product ID: ${inv.productId} @ ${inv.locationId}: ${inv.quantityAvailable} available`);
    });
    console.log("\nVerification Complete!");
}
verifyWaspIntegration().catch(console.error);
