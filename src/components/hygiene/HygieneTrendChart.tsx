import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HygieneTrendPoint } from '../../types/hygiene';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

interface HygieneTrendChartProps {
  trends: HygieneTrendPoint[];
}

export const HygieneTrendChart: React.FC<HygieneTrendChartProps> = ({ trends }) => {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Hygiene Compliance Trend</CardTitle>
          <CardDescription>Aggregate hygiene score, temperature, and incident trends across monitored facilities</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                labelStyle={{ fontWeight: 600, color: '#1e293b' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                name="Hygiene Score"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#scoreGradient)"
              />
              <Area
                type="monotone"
                dataKey="temperature"
                name="Avg Temperature (°C)"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="url(#tempGradient)"
              />
              <Area
                type="monotone"
                dataKey="incidentCount"
                name="Incidents"
                stroke="#ef4444"
                strokeWidth={1.5}
                fill="none"
                strokeDasharray="4 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
