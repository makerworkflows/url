
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
        <Card className="h-[400px] flex flex-col border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 pb-2">
            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
              Agile Regulatory Feed
              <Badge variant="outline" className="ml-auto bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                Live
              </Badge>
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
                Real-time FDA/ISO updates tailored to your products.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500 animate-pulse">Scanning regulatory sources...</p>
                ) : updates.length === 0 ? (
                  <p className="text-sm text-slate-500">No recent updates found.</p>
                ) : (
                  updates.map((item) => {
                    const isNew = (Date.now() - new Date(item.publishedDate).getTime()) < 1000 * 60 * 60 * 24; // 24h

                    return (
                      <div key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-3 last:pb-0 group">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {item.source}
                          </span>
                          {isNew && (
                            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50">
                              NEW
                            </span>
                          )}
                        </div>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 block hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline mb-1 transition-colors"
                        >
                          {item.title} <ExternalLink className="w-3 h-3 inline ml-0.5 text-slate-400 dark:text-slate-600 group-hover:text-indigo-500" />
                        </a>
                        <div className="mt-2 flex gap-2">
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                                {item.category}
                            </Badge>
                            <span className="text-[10px] text-slate-400 dark:text-slate-600 self-center">
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
