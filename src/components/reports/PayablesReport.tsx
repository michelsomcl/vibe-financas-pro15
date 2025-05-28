
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMonths, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ['#FF8042', '#00C49F', '#FFBB28'];

export default function PayablesReport() {
  const { payableAccounts, categories, clientsSuppliers } = useFinance();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredPayables = useMemo(() => {
    let filtered = payableAccounts;

    if (startDate) {
      const start = startOfMonth(new Date(startDate));
      filtered = filtered.filter(payable => 
        isAfter(new Date(payable.dueDate), start) || 
        new Date(payable.dueDate).getTime() === start.getTime()
      );
    }

    if (endDate) {
      const end = endOfMonth(new Date(endDate));
      filtered = filtered.filter(payable => 
        isBefore(new Date(payable.dueDate), end) || 
        new Date(payable.dueDate).getTime() === end.getTime()
      );
    }

    return filtered;
  }, [payableAccounts, startDate, endDate]);

  const statusData = [
    {
      name: 'Pago',
      value: filteredPayables.filter(p => p.isPaid).reduce((sum, p) => sum + p.value, 0),
      count: filteredPayables.filter(p => p.isPaid).length
    },
    {
      name: 'Pendente',
      value: filteredPayables.filter(p => !p.isPaid && new Date(p.dueDate) >= new Date()).reduce((sum, p) => sum + p.value, 0),
      count: filteredPayables.filter(p => !p.isPaid && new Date(p.dueDate) >= new Date()).length
    },
    {
      name: 'Vencido',
      value: filteredPayables.filter(p => !p.isPaid && new Date(p.dueDate) < new Date()).reduce((sum, p) => sum + p.value, 0),
      count: filteredPayables.filter(p => !p.isPaid && new Date(p.dueDate) < new Date()).length
    }
  ];

  const categoryData = categories
    .filter(cat => cat.type === 'despesa')
    .map(category => {
      const categoryPayables = filteredPayables.filter(p => p.categoryId === category.id);
      return {
        name: category.name,
        total: categoryPayables.reduce((sum, p) => sum + p.value, 0),
        pago: categoryPayables.filter(p => p.isPaid).reduce((sum, p) => sum + p.value, 0),
        pendente: categoryPayables.filter(p => !p.isPaid).reduce((sum, p) => sum + p.value, 0)
      };
    })
    .filter(cat => cat.total > 0);

  const monthlyData = useMemo(() => {
    const months: { [key: string]: { total: number, pago: number, pendente: number } } = {};
    
    filteredPayables.forEach(payable => {
      const month = new Date(payable.dueDate).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: '2-digit' 
      });
      
      if (!months[month]) {
        months[month] = { total: 0, pago: 0, pendente: 0 };
      }
      
      months[month].total += payable.value;
      if (payable.isPaid) {
        months[month].pago += payable.value;
      } else {
        months[month].pendente += payable.value;
      }
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredPayables]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Data Inicial</Label>
          <Input
            id="start-date"
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">Data Final</Label>
          <Input
            id="end-date"
            type="month"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="pago" fill="#00C49F" name="Pago" />
                <Bar dataKey="pendente" fill="#FFBB28" name="Pendente" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="pago" fill="#00C49F" name="Pago" />
                <Bar dataKey="pendente" fill="#FF8042" name="Pendente" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
