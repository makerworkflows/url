
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
    <Card className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
        <Users className="w-32 h-32 text-indigo-500" />
      </div>
      
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="flex items-center gap-2">
            <Gavel className="text-indigo-600 dark:text-indigo-500 w-5 h-5" />
            <CardTitle className="text-slate-900 dark:text-slate-100">Board of Directors Audit</CardTitle>
        </div>
        <CardDescription className="text-slate-500 dark:text-slate-400">
            Multi-LLM Consensus Engine (Judge-Rapporteur Model)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {status === "Idle" && (
            <div className="text-center py-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Invoke the "Board" to run a parallel audit using Grok, Gemini 1.5, and Claude 3.5.
                </p>
                <Button onClick={startAudit} className="bg-indigo-600 hover:bg-indigo-700 w-full text-white shadow-md dark:shadow-[0_0_15px_rgba(79,70,229,0.3)] border border-indigo-200 dark:border-indigo-500/50">
                    <Users className="mr-2 h-4 w-4" />
                    Convene The Board
                </Button>
            </div>
        )}

        {status === "Analyzing" && (
            <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-500" />
                    <div className="space-y-1">
                        <p className="font-medium text-sm text-slate-800 dark:text-slate-200">Examiners Deliberating...</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">Grok, Gemini, and Claude are analyzing 142 data points.</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-center py-2">
                    <Badge variant="outline" className="animate-pulse border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">Grok: Analyzing...</Badge>
                    <Badge variant="outline" className="animate-pulse border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">Gemini: Reading...</Badge>
                    <Badge variant="outline" className="animate-pulse border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">Claude: Reasoning...</Badge>
                </div>
            </div>
        )}

        {status === "Consolidating" && (
            <div className="space-y-4 py-4">
                 <div className="flex items-center gap-3">
                    <BrainCircuit className="animate-pulse text-purple-600 dark:text-purple-500" />
                    <div className="space-y-1">
                        <p className="font-medium text-sm text-slate-800 dark:text-slate-200">Secretary Consolidation</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">Synthesizing matrices and calculating vector similarity...</p>
                    </div>
                </div>
            </div>
        )}

        {status === "Complete" && (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">Final Verdict</span>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white border-0">Consensus Reached</Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-indigo-200 dark:border-indigo-500/20 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">Agreement Score:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">94.2%</span>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="font-medium text-xs uppercase tracking-wider text-slate-500">Dissenting Opinions</p>
                        <div className="flex gap-2 items-start bg-white dark:bg-black/40 p-2 rounded text-xs border border-slate-200 dark:border-slate-800">
                             <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                             <p className="text-slate-700 dark:text-slate-300">Clause 9.2 Conflict: Claude 3.5 noted a potential gap in the "Supplier Audit" frequency that Grok missed.</p>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-8 text-xs mt-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white">
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
