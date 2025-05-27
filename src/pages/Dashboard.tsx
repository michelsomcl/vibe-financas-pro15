
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardCalculations } from "@/hooks/useDashboardCalculations";
import { useDashboardChartData } from "@/hooks/useDashboardChartData";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Dashboard() {
  const { currentMonth } = useDashboardData();
  const calculations = useDashboardCalculations();
  const chartData = useDashboardChartData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tertiary">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      <DashboardCards
        {...calculations}
        formatCurrency={formatCurrency}
      />

      <DashboardCharts
        {...chartData}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
