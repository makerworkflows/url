
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner" 

interface ConnectionModalProps {
  provider: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ConnectionModal({ provider, isOpen, onClose, onSuccess }: ConnectionModalProps) {
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [username, setUsername] = useState("") // Optional, depends on provider

  const handleConnect = async () => {
    if (!provider) return

    setLoading(true)
    try {
      const credentials = { 
        apiToken: apiKey, 
        apiKey: apiKey, // Some adapters use apiKey, some apiToken
        accessToken: apiKey, // For OAuth2 simulation
        username 
      }

      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, credentials }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Successfully connected to ${provider}`)
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || "Failed to connect")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect {provider}</DialogTitle>
          <DialogDescription>
            Enter your credentials to connect to {provider}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key / Token
            </Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              type="password"
            />
          </div>
          {/* Add more fields dynamically if needed based on provider type */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={loading || !apiKey}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
