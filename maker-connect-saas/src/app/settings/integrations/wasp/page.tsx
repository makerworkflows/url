import { WaspSettingsForm } from "@/features/integrations/components/wasp-settings-form";
import { getWaspConfigAction, IWaspConfig } from "@/features/integrations/actions";

export default async function WaspSettingsPage() {
    const config = await getWaspConfigAction();

    // If config is null, pass undefined to let the form use defaults
    const initialConfig: IWaspConfig | undefined = config ? {
        baseUrl: config.baseUrl,
        clientId: config.clientId, // This might be masked or partial
        clientSecret: '', // Always empty on load for security
        tenantId: config.tenantId,
        isActive: config.isActive
    } : undefined;

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 tracking-tight text-slate-900 dark:text-slate-100">Integration Settings</h1>
            <WaspSettingsForm initialConfig={initialConfig} />
        </div>
    );
}
