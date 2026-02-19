'use server';

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

// Interface matching the frontend expectation
interface IProductionJob {
  id: string;
  productName: string;
  batchSize: number;
  requiredDate: string;
  status: "Planned" | "Released";
}

export async function getJobsAction(): Promise<IProductionJob[]> {
    try {
        const jobs = await prisma.productionJob.findMany({
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });

        return jobs.map(j => ({
            id: j.id,
            productName: j.product.name,
            batchSize: j.quantity,
            requiredDate: j.dueDate?.toISOString() || new Date().toISOString(),
            status: j.status as "Planned" | "Released"
        }));
    } catch (e) {
        console.error("Failed to fetch jobs", e);
        return [];
    }
}

export async function createJobAction(productName: string, batchSize: number) {
    try {
        // 1. Find Product by Name (since event passes name)
        // In real app, pass ID. For now, fuzzy match or assume distinct names.
        const product = await prisma.product.findFirst({
            where: { name: productName }
        });

        if (!product) {
            console.error(`Product not found for job: ${productName}`);
            return null;
        }

        // 2. Create Job
        const job = await prisma.productionJob.create({
            data: {
                jobNumber: `JOB-${Date.now()}`,
                productId: product.id,
                quantity: batchSize,
                status: 'Planned',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // +14 days
            }
        });

        // 3. Simple Shortage Check (Demo Logic)
        // Check if we have enough ingredients. 
        // For demo, we'll just check "Whey Protein" and "Cocoa Powder" if they exist in DB.
        // Ideally, we'd look up BOM.
        
        const shortages: { item: string, quantity: number }[] = [];
        
        // Hardcoded BOM check for demo purposes, matching the seed data
        const ingredients = [
            { name: "Whey Protein Isolate", qtyPerUnit: 0.02 },
            { name: "Cocoa Powder", qtyPerUnit: 0.005 }
        ];

        for (const ing of ingredients) {
            const required = ing.qtyPerUnit * batchSize;
            
            // Find inventory
            const invItem = await prisma.inventoryItem.findFirst({
                where: { product: { name: ing.name } }
            });

            const onHand = invItem ? invItem.quantityHand - invItem.quantityReserved : 0;
            if (onHand < required) {
                shortages.push({ item: ing.name, quantity: required - onHand });
            }
        }

        revalidatePath('/');
        return { job, shortages };
    } catch (e) {
        console.error("Failed to create job", e);
        return null;
    }
}

export async function calculateNeedsAction(productSku: string, quantity: number) {
    try {
        // Map SKU to product name (Demo hack)
        const nameMap: Record<string, string> = {
            'PRO-BAR-CHOCO': 'Protein Bar - Chocolate'
        };
        const productName = nameMap[productSku] || productSku;

        // Hardcoded BOM for demo (matches createJobAction logic)
        const ingredients = [
            { name: "Whey Protein Isolate", qtyPerUnit: 0.02, id: 'i1' },
            { name: "Cocoa Powder", qtyPerUnit: 0.005, id: 'i3' }
        ];

        const needs = [];

        for (const ing of ingredients) {
             const required = ing.qtyPerUnit * quantity;
             
             // Find inventory
             const invItem = await prisma.inventoryItem.findFirst({
                 where: { product: { name: ing.name } }
             });
 
             const onHand = invItem ? invItem.quantityHand - invItem.quantityReserved : 0;
             const shortage = onHand < required ? required - onHand : 0;
 
             needs.push({
                 ingredientId: ing.id,
                 required,
                 onHand,
                 shortage,
                 status: shortage > 0 ? 'SHORTAGE' : 'OK'
             });
        }
        
        return needs;

    } catch (e) {
        console.error("Failed to calculate needs", e);
        return [];
    }
}
