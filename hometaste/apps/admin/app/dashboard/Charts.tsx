"use client";

import type { ComponentType, ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = Array.from({ length: 30 }, (_, index) => ({ day: index + 1, orders: 20 + index * 2, revenue: 400 + index * 35 }));
type ChartComponent = ComponentType<Record<string, unknown> & { children?: ReactNode }>;
const SafeArea = Area as unknown as ChartComponent;
const SafeAreaChart = AreaChart as unknown as ChartComponent;
const SafeBar = Bar as unknown as ChartComponent;
const SafeBarChart = BarChart as unknown as ChartComponent;
const SafeCartesianGrid = CartesianGrid as unknown as ChartComponent;
const SafeResponsiveContainer = ResponsiveContainer as unknown as ChartComponent;
const SafeTooltip = Tooltip as unknown as ChartComponent;
const SafeXAxis = XAxis as unknown as ChartComponent;
const SafeYAxis = YAxis as unknown as ChartComponent;

export function DashboardCharts() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="card"><h2>Orders per day</h2><SafeResponsiveContainer height={240}><SafeAreaChart data={data}><SafeCartesianGrid stroke="#303037" /><SafeXAxis dataKey="day" stroke="#a9a29a" /><SafeYAxis stroke="#a9a29a" /><SafeTooltip /><SafeArea dataKey="orders" stroke="#f97316" fill="#f97316" fillOpacity={0.25} /></SafeAreaChart></SafeResponsiveContainer></div>
      <div className="card"><h2>Revenue per day</h2><SafeResponsiveContainer height={240}><SafeBarChart data={data}><SafeCartesianGrid stroke="#303037" /><SafeXAxis dataKey="day" stroke="#a9a29a" /><SafeYAxis stroke="#a9a29a" /><SafeTooltip /><SafeBar dataKey="revenue" fill="#ffb347" /></SafeBarChart></SafeResponsiveContainer></div>
    </div>
  );
}
