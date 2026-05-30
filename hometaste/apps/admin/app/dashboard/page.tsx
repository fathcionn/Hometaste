import { DashboardCharts } from "./Charts";

export default function DashboardPage() {
  return <><h1>Dashboard</h1><section className="grid">{["Users", "Cooks", "Orders", "Revenue"].map((label, index) => <div className="card" key={label}><p className="muted">{label}</p><h2>{index === 3 ? "$12.4k" : 1200 + index * 340}</h2></div>)}</section><DashboardCharts /></>;
}
