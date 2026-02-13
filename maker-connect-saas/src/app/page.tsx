"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Network, 
  Settings, 
  ShieldCheck, 
  LogOut,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react"
import { ConnectionModal } from "@/components/connection-modal"
import { Toaster } from "sonner" // Ensure Toast notifications work

// Types
import { IConnection } from "@/integrations/core/types"

export default function Home() {
  const [connections, setConnections] = useState<IConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections')
      const data = await res.json()
      setConnections(data)
    } catch (err) {
      console.error("Failed to fetch connections", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const handleConnectClick = (provider: string) => {
    setSelectedProvider(provider)
    setIsModalOpen(true)
  }

  const handleConnectionSuccess = () => {
    fetchConnections() // Refresh list
  }

  // Helper to find connection status
  const getConnectionStatus = (provider: string) => {
    const conn = connections.find(c => c.provider === provider)
    return conn?.isActive ? 'connected' : 'disconnected'
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      <Toaster />
      <ConnectionModal 
        provider={selectedProvider} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleConnectionSuccess}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">Maker Connect</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Integration</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem href="#" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem href="#" icon={<Network size={20} />} label="Integrations" active />
          <NavItem href="#" icon={<ShieldCheck size={20} />} label="Audits & Compliance" />
          <NavItem href="#" icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white transition w-full">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">Integration Hub</h2>
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                JD
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Connect your ERP</h3>
            <p className="text-slate-500 mt-2">Select an ERP system to enable native, bi-directional auditing.</p>
          </div>

          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <IntegrationCard 
                name="FoodLogiQ" 
                providerKey="foodlogiq"
                description="Traceability and compliance management."
                status={getConnectionStatus('foodlogiq')}
                logo="FLQ"
                onConnect={() => handleConnectClick('foodlogiq')}
              />
               <IntegrationCard 
                name="IBM Food Trust" 
                providerKey="ibm_food_trust"
                description="Blockchain-based traceability."
                status={getConnectionStatus('ibm_food_trust')}
                logo="IBM"
                onConnect={() => handleConnectClick('ibm_food_trust')}
              />
               <IntegrationCard 
                name="Salesforce CPQ" 
                providerKey="salesforce"
                description="Configure, Price, Quote integration."
                status={getConnectionStatus('salesforce')}
                logo="SFDC"
                onConnect={() => handleConnectClick('salesforce')}
              />
               <IntegrationCard 
                name="SafetyCulture" 
                providerKey="safetyculture"
                description="Audits and inspections integration."
                status={getConnectionStatus('safetyculture')}
                logo="SC"
                onConnect={() => handleConnectClick('safetyculture')}
              />
               <IntegrationCard 
                name="TraceGains" 
                providerKey="tracegains"
                description="Supplier compliance and management."
                status={getConnectionStatus('tracegains')}
                 logo="TG"
                 onConnect={() => handleConnectClick('tracegains')}
              />
              
              {/* New Connection Placeholder */}
               <div className="group border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer min-h-[200px]">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-blue-100 group-hover:text-blue-500 transition">
                    <Plus size={24} />
                  </div>
                  <h4 className="font-semibold text-slate-600 group-hover:text-blue-700">Add Custom Connection</h4>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition",
        active 
          ? "bg-blue-600 text-white shadow-md" 
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

interface IntegrationCardProps {
  name: string
  providerKey: string
  description: string
  status: 'connected' | 'disconnected' | 'pending'
  logo: string
  onConnect: () => void
}

function IntegrationCard({ name, description, status, logo, onConnect }: IntegrationCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs tracking-tighter">
          {logo}
        </div>
        <StatusBadge status={status} />
      </div>
      
      <h4 className="text-lg font-bold text-slate-900 mb-2">{name}</h4>
      <p className="text-sm text-slate-500 mb-6 flex-1">{description}</p>
      
      <button 
        onClick={onConnect}
        className={cn(
          "w-full py-2 px-4 rounded-lg text-sm font-medium border transition",
          status === 'connected'
            ? "border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100"
            : "border-transparent bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        )}
      >
        {status === 'connected' ? 'Manage Connection' : 'Connect'}
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: 'connected' | 'disconnected' | 'pending' }) {
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700">
        <CheckCircle2 size={12} />
        Active
      </div>
    )
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700">
        <AlertCircle size={12} />
        Pending
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Not Linked
    </div>
  )
}
