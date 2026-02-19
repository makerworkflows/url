'use server';

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

// Interface expected by Dashboard
export interface IPurchaseOrder {
  id: string;
  poNumber?: string;
  vendor?: string;
  vendorId?: string;
  items: { description: string; quantity: number }[];
  status: "Draft" | "Sent" | "Received";
  totalAmount: number;
}

export async function getPOsAction(): Promise<IPurchaseOrder[]> {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: { 
                supplier: true,
                items: { include: { product: true } }
            },
            orderBy: { orderDate: 'asc' }
        });

        return pos.map(p => ({
            id: p.id,
            poNumber: p.poNumber,
            vendor: p.supplier.name,
            vendorId: p.supplierId,
            items: p.items.map(i => ({
                description: i.product.name,
                quantity: i.quantity
            })),
            status: p.status as "Draft" | "Sent" | "Received",
            totalAmount: p.totalAmount
        }));
    } catch (e) {
        console.error("Failed to fetch POs", e);
        return [];
    }
}

export async function createPOAction(itemName: string, quantity: number) {
    try {
        // 1. Find Supplier (Mock logic: just pick the first one or 'SUP-001')
        const supplier = await prisma.supplier.findFirst();
        if (!supplier) throw new Error("No supplier found");

        // 2. Find Product
        const product = await prisma.product.findFirst({ where: { name: itemName } });
        if (!product) throw new Error(`Product ${itemName} not found`);

        const po = await prisma.purchaseOrder.create({
            data: {
                poNumber: `PO-${Date.now()}`,
                supplierId: supplier.id,
                status: 'Draft',
                totalAmount: quantity * (product.cost || 1), 
                items: {
                    create: {
                        productId: product.id,
                        quantity: quantity,
                        unitCost: product.cost || 1
                    }
                }
            },
            include: { supplier: true }
        });

        revalidatePath('/');
        
        // Map to interface
        return {
            id: po.id,
            poNumber: po.poNumber,
            vendor: po.supplier.name,
            vendorId: po.supplierId,
            status: po.status as "Draft" | "Sent" | "Received",
            totalAmount: po.totalAmount,
            items: [
                { description: product.name, quantity: quantity }
            ]
        };

    } catch (e) {
        console.error("Failed to create PO", e);
        return null;
    }
}
