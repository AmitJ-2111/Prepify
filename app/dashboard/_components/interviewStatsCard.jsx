'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the progress chart
const mockProgressData = [
  { date: 'Feb 1', score: 65 },
  { date: 'Feb 7', score: 68 },
  { date: 'Feb 14', score: 75 },
  { date: 'Feb 19', score: 78 },
  { date: 'Feb 22', score: 85 }
];

export function InterviewStatsCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Interview Performance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockProgressData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Score']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ 
                  fontSize: 12, 
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-between items-center text-sm text-muted-foreground">
          <div>Starting: 65%</div>
          <div>Current: 85%</div>
          <div className="text-green-600 font-medium">↑ 20%</div>
        </div>
      </CardContent>
    </Card>
  );
}