
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { regulationFeed, IRegulatoryUpdate } from '@/services/regulation-feed/service';
import { BoardAuditWidget } from './board-audit-widget';

// Mock server action
async function fetchUpdates() {
  return await regulationFeed.getLatestUpdates();
}

export function CompliancePulse() {
  const [updates, setUpdates] = useState<IRegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUpdates();
        setUpdates(data);
      } catch (e) {
        console.error('Failed to load compliance pulse', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Regulatory Feed */}
        <Card className="h-[400px] flex flex-col border-orange-200">
          <CardHeader className="bg-orange-50 pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ShieldAlert className="w-5 h-5" />
              Agile Regulatory Feed
              <Badge variant="outline" className="ml-auto bg-white text-orange-600 border-orange-200">
                Live
              </Badge>
            </CardTitle>
            <CardDescription className="text-orange-700/80 text-xs">
                Real-time FDA/ISO updates tailored to your products.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-gray-500 animate-pulse">Scanning regulatory sources...</p>
                ) : updates.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent updates found.</p>
                ) : (
                  updates.map((item) => {
                    const isNew = (Date.now() - new Date(item.publishedDate).getTime()) < 1000 * 60 * 60 * 24; // 24h

                    return (
                      <div key={item.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {item.source}
                          </span>
                          {isNew && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                              NEW
                            </span>
                          )}
                        </div>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-900 block hover:text-blue-600 hover:underline mb-1"
                        >
                          {item.title} <ExternalLink className="w-3 h-3 inline ml-0.5 text-gray-400" />
                        </a>
                        <div className="mt-2 flex gap-2">
                            <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-gray-100 text-gray-600">
                                {item.category}
                            </Badge>
                            <span className="text-[10px] text-gray-400 self-center">
                                {new Date(item.publishedDate).toLocaleDateString()}
                            </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Board of Directors Widget */}
        <div className="space-y-6">
            <BoardAuditWidget />
        </div>
      </div>
    </div>
  );
}
