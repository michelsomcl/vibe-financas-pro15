
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ['#800491', '#FF8042', '#FFBB28', '#8884d8', '#82ca9d', '#ffc658'];

interface DashboardChartsProps {
  expensesByCategory: Array<{ name: string; value: number }>;
  revenuesByCategory: Array<{ name: string; value: number }>;
  formatCurrency: (value: number) => string;
}

export function DashboardCharts({
  expensesByCategory,
  revenuesByCategory,
  formatCurrency
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-tertiary">
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nenhuma despesa encontrada no período
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-tertiary">
            Receitas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenuesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenuesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenuesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nenhuma receita encontrada no período
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
