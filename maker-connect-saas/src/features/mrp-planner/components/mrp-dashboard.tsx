
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Factory, RefreshCw } from 'lucide-react';
import { calculateNeedsAction } from '../actions';
import { IMaterialNeed } from '../engine';

export function MRPDashboard() {
  const [needs, setNeeds] = useState<IMaterialNeed[]>([]);
  const [qty, setQty] = useState(100);

  const calculate = async () => {
    // Simulating a production run for Chocolate Bar
    // Using Server Action for calculation
    const results = await calculateNeedsAction('PRO-BAR-CHOCO', qty);
    setNeeds(results as IMaterialNeed[]);
  };

  useEffect(() => {
    calculate();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Factory className="w-5 h-5 text-purple-600" />
             Production Simulator
           </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="space-y-2">
            <span className="text-sm font-medium">SKU: PRO-BAR-CHOCO</span>
            <Input 
                type="number" 
                value={qty} 
                onChange={(e) => setQty(parseInt(e.target.value) || 0)} 
                className="w-32 bg-white"
            />
          </div>
          <Button onClick={calculate} className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalculate Needs
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {needs.map((item) => (
          <Card key={item.ingredientId} className={item.status === 'SHORTAGE' ? 'border-red-300 bg-red-50' : 'border-green-200'}>
             <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <span className="font-mono text-sm uppercase text-slate-500">{item.ingredientId}</span>
                    <Badge variant={item.status === 'SHORTAGE' ? 'destructive' : 'default'} className={item.status === 'SHORTAGE' ? 'bg-red-600' : 'bg-green-600'}>
                        {item.status}
                    </Badge>
                </div>
                <CardTitle className="text-lg">
                    {item.ingredientId === 'i1' ? 'Whey Protein' : item.ingredientId === 'i3' ? 'Cocoa Powder' : 'Unknown Ingredient'}
                </CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Required:</span>
                        <span className="font-bold">{item.required} g</span>
                    </div>
                    <div className="flex justify-between">
                        <span>On Hand:</span>
                        <span>{item.onHand} g</span>
                    </div>
                    {item.shortage > 0 && (
                        <div className="flex justify-between text-red-600 font-bold border-t border-red-200 pt-1 mt-1">
                            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Shortage:</span>
                            <span>-{item.shortage} g</span>
                        </div>
                    )}
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
