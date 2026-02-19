
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShieldCheck,
  Factory,
  Truck,
  ShoppingCart,
  Receipt,
  FlaskConical,
  GraduationCap,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Network
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";

// Services & Event Bus
import { eventBus, SystemEventType } from "@/services/event-bus";
// import { salesAgent } from "@/features/sales-pro/agent/service"; // Deprecated
import { closeDealAction } from "@/features/sales-pro/agent/actions";
import { getJobsAction } from "@/features/mrp-planner/actions";
import { getPOsAction } from "@/features/procure-track/actions";
import { createBatchRecordAction } from "@/features/mix-master/actions";
import { mrpPlanner } from "@/features/mrp-planner/engine"; // Ensure singleton is active
import { procureTrackService } from "@/features/procure-track/service"; // Ensure singleton is active
import { batchRecordService } from "@/features/mix-master/service";
import { improveDriveService } from "@/features/improve-drive/service";
import { ledgerService } from "@/services/ledger/service";

// Components
import { CompliancePulse } from "@/features/compliance/components/compliance-pulse";

export default function CommandCenter() {
  const [events, setEvents] = useState<SystemEventType[]>([]);
  const [stats, setStats] = useState({
      activeLeads: 12,
      productionJobs: 4,
      openPOs: 2,
      qualityIncidents: 0
  });

  useEffect(() => {
    // Subscribe to Event Bus
    const sub = eventBus.subscribe((event) => {
        setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50
        
        // Update simple stats based on events
        if (event.type === 'SALES_DEAL_WON') setStats(s => ({ ...s, activeLeads: s.activeLeads - 1, productionJobs: s.productionJobs + 1 }));
        if (event.type === 'PO_CREATED') setStats(s => ({ ...s, openPOs: s.openPOs + 1 }));
        if (event.type === 'BATCH_COMPLETED') setStats(s => ({ ...s, productionJobs: s.productionJobs - 1 }));
    });
    return () => sub.unsubscribe();
  }, []);

  const runSimulation = async () => {
      toast.info("Starting End-to-End Simulation", { description: "Triggering Sales Win -> Production -> PO -> Ledger" });
      
      // 1. Sales Win
      setTimeout(async () => {
          // salesAgent.closeDeal("LEAD-001"); 
          // Now calling Server Action to persist change
          const result = await closeDealAction("LEAD-001");
          
          if (result.success) {
            // Manually emit the event to the client-side event bus
            eventBus.publish({ 
               type: 'SALES_DEAL_WON', 
               payload: { 
                   dealId: "LEAD-001", 
                   product: 'Protein Bar - Chocolate', 
                   quantity: 50000 
               } 
            });
            toast.success("SalesPro: Deal Closed", { description: "Triggered MRP Demand (Persisted to DB)" });
          } else {
            toast.error("SalesPro: Failed to close deal", { description: "Check logs" });
          }
      }, 1000);

      // MRP Logic runs automatically on event

      // 2. Simulate Receiving PO (Manual step in real life, auto here)
      setTimeout(async () => {
          // Find last PO
          const pos = await getPOsAction();
          if(pos.length > 0) {
              const po = pos[pos.length - 1]; // Recent ? getPOsAction orders by date ASC. So last is newest.
              eventBus.publish({ type: 'PO_RECEIVED', payload: { poId: po.id } });
              ledgerService.recordTransaction("PurchaseOrders", { id: po.id, status: "Received" });
              toast.success("ProcureTrack: PO Received", { description: "Logged to Blockchain" });
          }
      }, 3000);

      // 3. Simulate Production Batch
      setTimeout(async () => {
           // Find last job
           const jobs = await getJobsAction();
           if(jobs.length > 0) {
               const job = jobs[0]; // Recent jobs are ordered desc, so top is newest/last created
               
               // Create Real Batch Record in DB
               const batch = await createBatchRecordAction(job.id);
               
               if (batch) {
                   eventBus.publish({ type: 'BATCH_COMPLETED', payload: { batchId: batch.id, yield: 98.5 } });
                   ledgerService.recordTransaction("BatchRecords", { id: batch.id, status: "Completed" });
                   toast.success("MixMaster: Batch Completed", { description: "Triggered Quality Check (Persisted)" });
               }
           }
      }, 6000);
  };

  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur-md bg-white/60 dark:bg-black/40">
        <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-500" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Maker Connect <span className="text-slate-500 font-normal text-sm ml-2">Enterprise Edition</span>
            </h1>
        </div>
        <div className="flex items-center gap-4">
             <Button onClick={runSimulation} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/50 shadow-md">
                <Play className="mr-2 h-4 w-4" /> Simulate E2E Flow
             </Button>
             <ModeToggle />
             <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                JD
             </div>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Top KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard title="Active Leads" value={stats.activeLeads} icon={Zap} color="text-yellow-600 dark:text-yellow-500" bg="bg-yellow-50 dark:bg-yellow-950/30" />
            <KPICard title="Production Jobs" value={stats.productionJobs} icon={Factory} color="text-blue-600 dark:text-blue-500" bg="bg-blue-50 dark:bg-blue-950/30" />
            <KPICard title="Open POs" value={stats.openPOs} icon={ShoppingCart} color="text-green-600 dark:text-green-500" bg="bg-green-50 dark:bg-green-950/30" />
            <KPICard title="Quality Events" value={stats.qualityIncidents} icon={Activity} color="text-red-600 dark:text-red-500" bg="bg-red-50 dark:bg-red-950/30" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Module Launchpad */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Value Chain Modules */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Network className="h-5 w-5 text-slate-500 dark:text-slate-400" /> Operational Modules
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <ModuleCard 
                            title="SalesPro 2.0" 
                            desc="CRM & AI Agent" 
                            href="/concepts" 
                            icon={Zap} 
                            color="text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900" 
                        />
                         <ModuleCard 
                            title="ProcureTrack" 
                            desc="Smart Purchasing" 
                            href="/concepts/procure-track" 
                            icon={ShoppingCart} 
                            color="text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-900" 
                        />
                         <ModuleCard 
                            title="MRP Planner" 
                            desc="Material Planning" 
                            href="/concepts/mrp-planner" 
                            icon={Factory} 
                            color="text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900" 
                        />
                         <ModuleCard 
                            title="ProdSched Pro" 
                            desc="Line Scheduling" 
                            href="/concepts/prod-sched" 
                            icon={LayoutDashboard} 
                            color="text-indigo-600 dark:text-indigo-500 bg-indigo-100 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900" 
                        />
                         <ModuleCard 
                            title="MixMaster" 
                            desc="Batch Execution" 
                            href="/concepts/mix-master" 
                            icon={FlaskConical} 
                            color="text-purple-600 dark:text-purple-500 bg-purple-100 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900" 
                        />
                         <ModuleCard 
                            title="TraceGuard" 
                            desc="Blockchain Ledger" 
                            href="/concepts" 
                            icon={ShieldCheck} 
                            color="text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900" 
                        />
                         <ModuleCard 
                            title="ImproveDrive" 
                            desc="Quality & CAPA" 
                            href="/concepts/improve-drive" 
                            icon={Activity} 
                            color="text-rose-600 dark:text-rose-500 bg-rose-100 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900" 
                        />
                         <ModuleCard 
                            title="CompDoc Mgr" 
                            desc="Doc Control" 
                            href="/concepts/comp-doc" 
                            icon={GraduationCap} 
                            color="text-cyan-600 dark:text-cyan-500 bg-cyan-100 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900" 
                        />
                         <ModuleCard 
                            title="InvoiceFlow" 
                            desc="AP Automation" 
                            href="/concepts/invoice-flow" 
                            icon={Receipt} 
                            color="text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
                        />
                         <ModuleCard 
                            title="R&D Hub" 
                            desc="Formulation AI" 
                            href="/concepts/rnd-hub" 
                            icon={FlaskConical} 
                            color="text-pink-600 dark:text-pink-500 bg-pink-100 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900" 
                        />
                    </div>
                </section>
                
                
                {/* 2. Regulatory Pulse */}
                <CompliancePulse />

            </div>

            {/* Right Col: Live Feed */}
            <div className="lg:col-span-1">
                <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur top-24 sticky shadow-sm">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-500" />
                            Live System Events
                        </CardTitle>
                        <CardDescription className="text-slate-500">Real-time ecosystem activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px] px-4 py-4">
                            <AnimatePresence initial={false}>
                                {events.length === 0 ? (
                                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">No events yet. Start simulation.</p>
                                ) : (
                                    events.map((evt, i) => (
                                        <motion.div
                                            key={`${evt.type}-${i}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-3 last:mb-0"
                                        >
                                            <EventItem event={evt} />
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function KPICard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:border-indigo-300 dark:hover:border-slate-700 transition shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                </div>
                <div className={cn("p-2 rounded-lg", bg, color.split(' ')[0])}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    );
}

function ModuleCard({ title, desc, href, icon: Icon, color }: any) {
    // extract just the color classes for icon container
    const colorClasses = color || ""; 
    
    return (
        <Link href={href}>
            <div className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                    <div className={cn("p-2 rounded-lg transition border", colorClasses)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition">{desc}</p>
            </div>
        </Link>
    )
}

function EventItem({ event }: { event: SystemEventType }) {
    let icon = CheckCircle2;
    let color = "text-slate-500";
    let bg = "bg-slate-100 dark:bg-slate-900";

    switch(event.type) {
        case 'SALES_DEAL_WON': icon = Zap; color = "text-yellow-600 dark:text-yellow-500"; bg="bg-yellow-100 dark:bg-yellow-950/30"; break;
        case 'MRP_JOB_CREATED': icon = Factory; color = "text-blue-600 dark:text-blue-500"; bg="bg-blue-100 dark:bg-blue-950/30"; break;
        case 'INVENTORY_SHORTAGE': icon = AlertCircle; color = "text-red-600 dark:text-red-500"; bg="bg-red-100 dark:bg-red-950/30"; break;
        case 'PO_CREATED': icon = ShoppingCart; color = "text-green-600 dark:text-green-500"; bg="bg-green-100 dark:bg-green-950/30"; break;
        case 'PO_RECEIVED': icon = Truck; color = "text-emerald-600 dark:text-emerald-500"; bg="bg-emerald-100 dark:bg-emerald-950/30"; break;
        case 'BATCH_COMPLETED': icon = FlaskConical; color = "text-purple-600 dark:text-purple-500"; bg="bg-purple-100 dark:bg-purple-950/30"; break;
    }

    const Icon = icon;

    return (
        <div className="flex gap-3 text-sm border-l-2 border-slate-200 dark:border-slate-800 pl-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition rounded-r-lg">
            <div className={cn("mt-0.5 shrink-0", color)}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">{event.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{JSON.stringify(event.payload)}</p>
            </div>
        </div>
    );
}
