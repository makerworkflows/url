'use server';

import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLeadsAction() {
    try {
        const leads = await prisma.salesLead.findMany({
            orderBy: { score: 'desc' }
        });
        return leads;
    } catch (e) {
        console.error("Failed to fetch leads", e);
        return [];
    }
}

export async function closeDealAction(leadId: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Verify Lead
            const lead = await tx.salesLead.findUnique({ where: { id: leadId } });
            if (!lead) throw new Error("Lead not found");

            // 2. Update Lead Status
            const updatedLead = await tx.salesLead.update({
                where: { id: leadId },
                data: { status: 'Closed Won' }
            });

            // 3. Create Sales Order
            const order = await tx.salesOrder.create({
                data: {
                    orderNumber: `SO-${Date.now()}`,
                    customer: lead.company,
                    totalAmount: 50000, // Mock amount for now, could be dynamic
                    status: 'Confirmed',
                    items: {
                        create: {
                            // productId will be filled by connect
                            product: { connect: { sku: 'PRO-BAR-CHOCO' }}, // Linking to seeded product
                            quantity: 50000,
                            unitPrice: 1.00
                        }
                    }
                }
            });

            return { lead: updatedLead, order };
        });
        
        revalidatePath('/'); // Refresh UI if using server components
        return { success: true, data: result };

    } catch (e) {
        console.error("Failed to close deal", e);
        return { success: false, error: "Failed to close deal" };
    }
}

export async function chatWithAgentAction(query: string) {
    // Basic RAG-like pattern using DB
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('top leads')) {
        const topLeads = await prisma.salesLead.findMany({
            where: { status: { not: 'Closed Won' } },
            orderBy: { score: 'desc' },
            take: 3
        });
        const names = topLeads.map(l => `${l.name} (${l.score})`).join(', ');
        return `Based on scoring, your top open leads are: ${names}.`;
    }

    if (lowerQuery.includes('revenue') || lowerQuery.includes('forecast')) {
        const wonLeads = await prisma.salesLead.count({ where: { status: 'Closed Won' } });
        return `We have closed ${wonLeads} deals so far. Pipeline looks healthy.`;
    }

    return "I can help you analyze leads, draft emails, or forecast revenue. Try asking 'Who are my top leads?'";
}

// Keep the interfaces for Client use if needed, or rely on Prisma types
