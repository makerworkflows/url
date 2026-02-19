'use server';

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBatchRecordAction(jobId: string) {
    try {
        // 1. Verify Job
        const job = await prisma.productionJob.findUnique({ 
            where: { id: jobId },
            include: { product: true }
        });
        
        if (!job) throw new Error("Job not found");

        // 2. Create Batch Record
        // In a real app, this would happen when job is released.
        // For demo, we create it as 'Completed' immediately in the simulation.
        
        const batch = await prisma.batchRecord.create({
            data: {
                jobId: job.id,
                batchNumber: `BAT-${Date.now()}`,
                status: 'Completed',
                startedAt: new Date(Date.now() - 3600000), // 1 hour ago
                completedAt: new Date(),
                yield: 100,
                steps: {
                    create: [
                        { sequence: 1, instruction: "Verify Line Clearance", type: "Check", completed: true, completedBy: "System", completedAt: new Date() },
                        { sequence: 2, instruction: `Scan Ingredient: ${job.product.name}`, type: "Scan", completed: true, completedBy: "System", completedAt: new Date() }
                    ]
                }
            }
        });

        // 3. Update Job Status
        await prisma.productionJob.update({
             where: { id: jobId },
             data: { status: 'Completed' }
        });

        revalidatePath('/');
        return batch;

    } catch (e) {
        console.error("Failed to create batch record", e);
        return null;
    }
}
