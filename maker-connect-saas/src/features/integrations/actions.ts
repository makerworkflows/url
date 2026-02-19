'use server';

import { prisma } from "../../lib/prisma";
import { encrypt, decrypt } from "../../lib/encryption";
import { revalidatePath } from "next/cache";

export interface IWaspConfig {
    baseUrl: string;
    clientId: string;
    clientSecret: string;
    tenantId?: string;
    isActive: boolean;
}

export async function saveWaspConfigAction(config: IWaspConfig) {
    try {
        // Simple validation
        if (!config.baseUrl || !config.clientId) {
            return { success: false, error: "Missing required fields" };
        }

        // Encrypt secrets
        const credentials = JSON.stringify({
            clientId: config.clientId,
            clientSecret: config.clientSecret, // In real app, might want to only update if changed
            tenantId: config.tenantId
        });
        
        const encryptedCredentials = encrypt(credentials);

        const settings = JSON.stringify({
            baseUrl: config.baseUrl
        });

        // Upsert Connection
        // For pilot, we assume single user or system-wide (userId null)
        // Check schema to see if userId is required. Schema says `userId String?`.
        // We'll use a fixed provider name 'wasp_erp'.

        await prisma.connection.upsert({
            where: {
                provider_userId: {
                    provider: 'wasp_erp',
                    userId: 'system' // Using a placeholder for single-tenant pilot
                }
            },
            update: {
                settings,
                credentials: encryptedCredentials,
                isActive: config.isActive
            },
            create: {
                provider: 'wasp_erp',
                category: 'ERP',
                userId: 'system',
                settings,
                credentials: encryptedCredentials,
                isActive: config.isActive
            }
        });

        revalidatePath('/settings/integrations/wasp');
        return { success: true };

    } catch (e) {
        console.error("Failed to save Wasp config", e);
        return { success: false, error: "Failed to save configuration" };
    }
}

export async function getWaspConfigAction(): Promise<IWaspConfig | null> {
    try {
        const connection = await prisma.connection.findUnique({
             where: {
                provider_userId: {
                    provider: 'wasp_erp',
                    userId: 'system'
                }
            }
        });

        if (!connection) return null;

        const settings = JSON.parse(connection.settings);
        const credentials = JSON.parse(decrypt(connection.credentials));

        return {
            baseUrl: settings.baseUrl,
            clientId: credentials.clientId,
            clientSecret: '********', // Mask secret for UI
            tenantId: credentials.tenantId,
            isActive: connection.isActive
        };

    } catch (e) {
        console.error("Failed to get Wasp config", e);
        return null;
    }
}

import { WaspAdapter } from "../../integrations/erp/wasp/adapter";

export async function testWaspConnectionAction() {
    try {
        const connection = await prisma.connection.findUnique({
             where: {
                provider_userId: {
                    provider: 'wasp_erp',
                    userId: 'system'
                }
            }
        });

        if (!connection) {
            return { success: false, error: "Configuration not saved yet." };
        }

        // Initialize Adapter
        const adapter = new WaspAdapter(connection);
        
        // Validate Auth
        const isValid = await adapter.validateAuth();
        if (!isValid) {
             return { success: false, error: "Authentication failed. Check credentials." };
        }

        // Try to fetch one item to be sure
        const items = await adapter.listResources('item', { limit: 1 });
        
        return { 
            success: true, 
            message: `Connection successful! Found ${items.length} item(s).`,
            details: items.length > 0 ? items[0] : null 
        };

    } catch (e: any) {
        console.error("Test connection failed", e);
        return { success: false, error: e.message || "Unknown error during test" };
    }
}
