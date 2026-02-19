'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { saveWaspConfigAction, testWaspConnectionAction, IWaspConfig } from '../actions';

interface PROPS {
    initialConfig?: IWaspConfig;
}

export function WaspSettingsForm({ initialConfig }: PROPS) {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<IWaspConfig>(initialConfig || {
        baseUrl: 'https://api.waspbarcode.com/v1',
        clientId: '',
        clientSecret: '',
        tenantId: '',
        isActive: false
    });

    const handleChange = (field: keyof IWaspConfig, value: string | boolean) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await saveWaspConfigAction(config);
            if (result.success) {
                toast.success("Settings Saved", { description: "Wasp integration configuration updated." });
            } else {
                toast.error("Error", { description: result.error });
            }
        } catch (e) {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        toast.info("Testing connection...");
        try {
            const result = await testWaspConnectionAction();
            if (result.success) {
                toast.success("Connection Verified", { description: result.message });
            } else {
                toast.error("Connection Failed", { description: result.error });
            }
        } catch (e) {
            toast.error("System Error", { description: "Failed to invoke test action" });
        }
    };

    return (
        <Card className="max-w-2xl border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <img src="https://www.waspbarcode.com/assets/images/wasp-logo.png" alt="Wasp" className="h-6 w-auto" onError={(e) => e.currentTarget.style.display='none'} />
                    Wasp Barcode Integration
                </CardTitle>
                <CardDescription>
                    Configure API access for Inventory Control and Asset Management.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <Label htmlFor="active-mode" className="flex flex-col space-y-1">
                        <span>Enable Integration</span>
                        <span className="font-normal text-xs text-muted-foreground">Activate data sync with Wasp Cloud.</span>
                    </Label>
                    <Switch 
                        id="active-mode" 
                        checked={config.isActive}
                        onCheckedChange={(c) => handleChange('isActive', c)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>API Base URL</Label>
                    <Input 
                        value={config.baseUrl} 
                        onChange={(e) => handleChange('baseUrl', e.target.value)} 
                        placeholder="https://api.waspbarcode.com/v1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input 
                            value={config.clientId} 
                            onChange={(e) => handleChange('clientId', e.target.value)} 
                            type="text"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Client Secret</Label>
                        <Input 
                            value={config.clientSecret} 
                            onChange={(e) => handleChange('clientSecret', e.target.value)} 
                            type="password"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Tenant ID (Optional)</Label>
                    <Input 
                        value={config.tenantId} 
                        onChange={(e) => handleChange('tenantId', e.target.value)} 
                        placeholder="e.g. 123456"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/50 dark:bg-slate-900/20">
                <Button variant="outline" onClick={handleTest}>Test Connection</Button>
                <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Configuration
                </Button>
            </CardFooter>
        </Card>
    );
}
