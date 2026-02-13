
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

// Services & Event Bus
import { eventBus, SystemEventType } from "@/services/event-bus";
import { salesAgent } from "@/features/sales-pro/agent/service";
import { mrpPlanner } from "@/features/mrp-planner/engine"; // Ensure singleton is active
import { procureTrackService } from "@/features/procure-track/service";
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

  const runSimulation = () => {
      toast.info("Starting End-to-End Simulation", { description: "Triggering Sales Win -> Production -> PO -> Ledger" });
      
      // 1. Sales Win
      setTimeout(() => {
          salesAgent.closeDeal("LEAD-001");
          toast.success("SalesPro: Deal Closed", { description: "Triggered MRP Demand" });
      }, 1000);

      // MRP Logic runs automatically on event

      // 2. Simulate Receiving PO (Manual step in real life, auto here)
      setTimeout(() => {
          // Find last PO
          const pos = procureTrackService.getPOs();
          if(pos.length > 0) {
              const po = pos[pos.length - 1];
              eventBus.publish({ type: 'PO_RECEIVED', payload: { poId: po.id } });
              ledgerService.recordTransaction("PurchaseOrders", { id: po.id, status: "Received" });
              toast.success("ProcureTrack: PO Received", { description: "Logged to Blockchain" });
          }
      }, 3000);

      // 3. Simulate Production Batch
      setTimeout(() => {
           // Find last job
           const jobs = mrpPlanner.getJobs();
           if(jobs.length > 0) {
               const job = jobs[jobs.length - 1];
               const batchId = `BR-${job.id}`;
               eventBus.publish({ type: 'BATCH_COMPLETED', payload: { batchId, yield: 98.5 } });
               ledgerService.recordTransaction("BatchRecords", { id: batchId, status: "Completed" });
               toast.success("MixMaster: Batch Completed", { description: "Triggered Quality Check" });
           }
      }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur-sm bg-white/80">
        <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Maker Connect <span className="text-slate-400 font-normal text-sm ml-2">Enterprise Edition</span>
            </h1>
        </div>
        <div className="flex items-center gap-4">
             <Button onClick={runSimulation} size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                <Play className="mr-2 h-4 w-4" /> Simulate E2E Flow
             </Button>
             <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                JD
             </div>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Top KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard title="Active Leads" value={stats.activeLeads} icon={Zap} color="text-yellow-600" bg="bg-yellow-50" />
            <KPICard title="Production Jobs" value={stats.productionJobs} icon={Factory} color="text-blue-600" bg="bg-blue-50" />
            <KPICard title="Open POs" value={stats.openPOs} icon={ShoppingCart} color="text-green-600" bg="bg-green-50" />
            <KPICard title="Quality Events" value={stats.qualityIncidents} icon={Activity} color="text-red-600" bg="bg-red-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Module Launchpad */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Value Chain Modules */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Network className="h-5 w-5 text-slate-400" /> Operational Modules
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <ModuleCard 
                            title="SalesPro 2.0" 
                            desc="CRM & AI Agent" 
                            href="/concepts" 
                            icon={Zap} 
                            color="text-yellow-500" 
                        />
                         <ModuleCard 
                            title="ProcureTrack" 
                            desc="Smart Purchasing" 
                            href="/concepts/procure-track" 
                            icon={ShoppingCart} 
                            color="text-green-500" 
                        />
                         <ModuleCard 
                            title="MRP Planner" 
                            desc="Material Planning" 
                            href="/concepts/mrp-planner" 
                            icon={Factory} 
                            color="text-blue-500" 
                        />
                         <ModuleCard 
                            title="ProdSched Pro" 
                            desc="Line Scheduling" 
                            href="/concepts/prod-sched" 
                            icon={LayoutDashboard} 
                            color="text-indigo-500" 
                        />
                         <ModuleCard 
                            title="MixMaster" 
                            desc="Batch Execution" 
                            href="/concepts/mix-master" 
                            icon={FlaskConical} 
                            color="text-purple-500" 
                        />
                         <ModuleCard 
                            title="TraceGuard" 
                            desc="Blockchain Ledger" 
                            href="/concepts" 
                            icon={ShieldCheck} 
                            color="text-emerald-500" 
                        />
                         <ModuleCard 
                            title="ImproveDrive" 
                            desc="Quality & CAPA" 
                            href="/concepts/improve-drive" 
                            icon={Activity} 
                            color="text-rose-500" 
                        />
                         <ModuleCard 
                            title="CompDoc Mgr" 
                            desc="Doc Control" 
                            href="/concepts/comp-doc" 
                            icon={GraduationCap} 
                            color="text-cyan-500" 
                        />
                         <ModuleCard 
                            title="InvoiceFlow" 
                            desc="AP Automation" 
                            href="/concepts/invoice-flow" 
                            icon={Receipt} 
                            color="text-slate-500" 
                        />
                         <ModuleCard 
                            title="R&D Hub" 
                            desc="Formulation AI" 
                            href="/concepts/rnd-hub" 
                            icon={FlaskConical} 
                            color="text-pink-500" 
                        />
                    </div>
                </section>
                
                {/* 2. Regulatory Pulse */}
                <CompliancePulse />

            </div>

            {/* Right Col: Live Feed */}
            <div className="lg:col-span-1">
                <Card className="h-full border-2 border-indigo-100 dark:border-indigo-900 bg-white/50 backdrop-blur">
                    <CardHeader className="bg-indigo-50/50 pb-3">
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            Live System Events
                        </CardTitle>
                        <CardDescription>Real-time ecosystem activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px] px-4 py-4">
                            <AnimatePresence initial={false}>
                                {events.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-8">No events yet. Start simulation.</p>
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
        <Card className="border-none shadow-sm hover:shadow-md transition">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={cn("p-2 rounded-lg", bg, color)}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    );
}

function ModuleCard({ title, desc, href, icon: Icon, color }: any) {
    return (
        <Link href={href}>
            <div className="group bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition cursor-pointer h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                    <div className={cn("p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition", color)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition" />
                </div>
                <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition">{title}</h4>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
        </Link>
    )
}

function EventItem({ event }: { event: SystemEventType }) {
    let icon = CheckCircle2;
    let color = "text-slate-500";
    let bg = "bg-slate-50";

    switch(event.type) {
        case 'SALES_DEAL_WON': icon = Zap; color = "text-yellow-600"; bg="bg-yellow-50"; break;
        case 'MRP_JOB_CREATED': icon = Factory; color = "text-blue-600"; bg="bg-blue-50"; break;
        case 'INVENTORY_SHORTAGE': icon = AlertCircle; color = "text-red-600"; bg="bg-red-50"; break;
        case 'PO_CREATED': icon = ShoppingCart; color = "text-green-600"; bg="bg-green-50"; break;
        case 'PO_RECEIVED': icon = Truck; color = "text-emerald-600"; bg="bg-emerald-50"; break;
        case 'BATCH_COMPLETED': icon = FlaskConical; color = "text-purple-600"; bg="bg-purple-50"; break;
    }

    const Icon = icon;

    return (
        <div className="flex gap-3 text-sm border-l-2 border-slate-100 pl-3 py-1">
            <div className={cn("mt-0.5 shrink-0", color)}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="font-medium text-slate-800">{event.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{JSON.stringify(event.payload)}</p>
            </div>
        </div>
    );
}
