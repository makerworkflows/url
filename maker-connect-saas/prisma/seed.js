"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // 1. Products & Inventory
    const whey = await prisma.product.upsert({
        where: { sku: 'ING-001' },
        update: {},
        create: {
            sku: 'ING-001',
            name: 'Whey Protein Isolate',
            description: 'High quality whey protein',
            price: 0,
            cost: 15.00,
            inventory: {
                create: {
                    location: 'MAIN',
                    quantityHand: 500,
                    reorderPoint: 100
                }
            }
        }
    });
    const cocoa = await prisma.product.upsert({
        where: { sku: 'ING-002' },
        update: {},
        create: {
            sku: 'ING-002',
            name: 'Cocoa Powder',
            description: 'Organic Cocoa',
            price: 0,
            cost: 5.00,
            inventory: {
                create: {
                    location: 'MAIN',
                    quantityHand: 200,
                    reorderPoint: 50
                }
            }
        }
    });
    const bar = await prisma.product.upsert({
        where: { sku: 'PRO-BAR-CHOCO' },
        update: {},
        create: {
            sku: 'PRO-BAR-CHOCO',
            name: 'Protein Bar - Chocolate',
            description: 'Delicious chocolate protein bar',
            price: 2.50,
            cost: 0.80,
            // Simple BOM link via JobMaterial would be dynamic, 
            // but here we just store the product definition.
        }
    });
    // 2. Sales Leads
    await prisma.salesLead.upsert({
        where: { id: 'LEAD-001' },
        update: {},
        create: {
            id: 'LEAD-001',
            name: 'Alice Johnson',
            company: 'BioLife Pharmaceuticals',
            source: 'Salesforce',
            status: 'Qualified',
            score: 85,
            lastContact: new Date('2024-03-10T10:00:00Z')
        }
    });
    await prisma.salesLead.upsert({
        where: { id: 'LEAD-002' },
        update: {},
        create: {
            id: 'LEAD-002',
            name: 'Bob Smith',
            company: 'NutraPure Inc.',
            source: 'HubSpot',
            status: 'New',
            score: 45,
            lastContact: new Date('2024-03-09T14:30:00Z')
        }
    });
    // 3. Suppliers & POs
    const supplier = await prisma.supplier.upsert({
        where: { id: 'SUP-001' },
        update: {},
        create: {
            id: 'SUP-001',
            name: 'Acme Ingredients',
            email: 'orders@acme.com',
        }
    });
    await prisma.purchaseOrder.upsert({
        where: { poNumber: 'PO-1001' },
        update: {},
        create: {
            poNumber: 'PO-1001',
            supplierId: supplier.id,
            status: 'Sent',
            totalAmount: 7500.00,
            items: {
                create: {
                    productId: whey.id,
                    quantity: 500,
                    unitCost: 15.00
                } // Simplified: In real app, relate to Product
            }
        }
    });
    console.log('Seeding finished.');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
