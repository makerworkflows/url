
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // Need to create this if missing
import { Gavel, Users, FileCheck, AlertTriangle, CheckCircle2, Loader2, BrainCircuit } from "lucide-react";
import { toast } from "sonner";

export function BoardAuditWidget() {
  const [status, setStatus] = useState<"Idle" | "Analyzing" | "Consolidating" | "Complete">("Idle");
  const [progress, setProgress] = useState(0);

  const startAudit = () => {
    setStatus("Analyzing");
    setProgress(0);
    toast.message("Board of Directors Convened", { description: "3 Examiners (Grok, Gemini, Claude) are reviewing the data." });

    // Simulate "Examiners"
    setTimeout(() => setProgress(33), 1500);
    setTimeout(() => {
        setStatus("Consolidating");
        setProgress(66);
    }, 3000);
    setTimeout(() => {
        setStatus("Complete");
        setProgress(100);
        toast.success("Board Consensus Reached", { description: "Verdict: 85% Agreement. Proceed with caution." });
    }, 5000);
  };

  return (
    <Card className="border-2 border-indigo-100 dark:border-indigo-900 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
        <Users className="w-32 h-32 text-indigo-500" />
      </div>
      
      <CardHeader>
        <div className="flex items-center gap-2">
            <Gavel className="text-indigo-600 w-5 h-5" />
            <CardTitle className="text-indigo-900 dark:text-indigo-100">Board of Directors Audit</CardTitle>
        </div>
        <CardDescription>
            Multi-LLM Consensus Engine (Judge-Rapporteur Model)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "Idle" && (
            <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                    Invoke the "Board" to run a parallel audit using Grok, Gemini 1.5, and Claude 3.5.
                </p>
                <Button onClick={startAudit} className="bg-indigo-600 hover:bg-indigo-700 w-full text-white">
                    <Users className="mr-2 h-4 w-4" />
                    Convene The Board
                </Button>
            </div>
        )}

        {status === "Analyzing" && (
            <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-500" />
                    <div className="space-y-1">
                        <p className="font-medium text-sm">Examiners Deliberating...</p>
                        <p className="text-xs text-muted-foreground">Grok, Gemini, and Claude are analyzing 142 data points.</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-center py-2">
                    <Badge variant="outline" className="animate-pulse">Grok: Analyzing...</Badge>
                    <Badge variant="outline" className="animate-pulse">Gemini: Reading...</Badge>
                    <Badge variant="outline" className="animate-pulse">Claude: Reasoning...</Badge>
                </div>
            </div>
        )}

        {status === "Consolidating" && (
            <div className="space-y-4 py-4">
                 <div className="flex items-center gap-3">
                    <BrainCircuit className="animate-pulse text-purple-500" />
                    <div className="space-y-1">
                        <p className="font-medium text-sm">Secretary Consolidation</p>
                        <p className="text-xs text-muted-foreground">Synthesizing matrices and calculating vector similarity...</p>
                    </div>
                </div>
            </div>
        )}

        {status === "Complete" && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-indigo-800 dark:text-indigo-200">Final Verdict</span>
                    <Badge className="bg-green-600">Consensus Reached</Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Agreement Score:</span>
                        <span className="font-mono font-bold">94.2%</span>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Dissenting Opinions</p>
                        <div className="flex gap-2 items-start bg-white dark:bg-black/20 p-2 rounded text-xs">
                             <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                             <p>Clause 9.2 Conflict: Claude 3.5 noted a potential gap in the "Supplier Audit" frequency that Grok missed.</p>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-8 text-xs mt-2">
                        <FileCheck className="mr-2 h-3 w-3" />
                        Download Evidence File (ISO 27001)
                    </Button>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
