
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

export default function ReceivablesReport() {
  const { receivableAccounts, categories, clientsSuppliers } = useFinance();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredReceivables = useMemo(() => {
    let filtered = receivableAccounts;

    if (startDate) {
      const start = startOfMonth(new Date(startDate));
      filtered = filtered.filter(receivable => 
        isAfter(new Date(receivable.dueDate), start) || 
        new Date(receivable.dueDate).getTime() === start.getTime()
      );
    }

    if (endDate) {
      const end = endOfMonth(new Date(endDate));
      filtered = filtered.filter(receivable => 
        isBefore(new Date(receivable.dueDate), end) || 
        new Date(receivable.dueDate).getTime() === end.getTime()
      );
    }

    return filtered;
  }, [receivableAccounts, startDate, endDate]);

  const statusData = [
    {
      name: 'Recebido',
      value: filteredReceivables.filter(r => r.isReceived).reduce((sum, r) => sum + r.value, 0),
      count: filteredReceivables.filter(r => r.isReceived).length
    },
    {
      name: 'Pendente',
      value: filteredReceivables.filter(r => !r.isReceived && new Date(r.dueDate) >= new Date()).reduce((sum, r) => sum + r.value, 0),
      count: filteredReceivables.filter(r => !r.isReceived && new Date(r.dueDate) >= new Date()).length
    },
    {
      name: 'Vencido',
      value: filteredReceivables.filter(r => !r.isReceived && new Date(r.dueDate) < new Date()).reduce((sum, r) => sum + r.value, 0),
      count: filteredReceivables.filter(r => !r.isReceived && new Date(r.dueDate) < new Date()).length
    }
  ];

  const categoryData = categories
    .filter(cat => cat.type === 'receita')
    .map(category => {
      const categoryReceivables = filteredReceivables.filter(r => r.categoryId === category.id);
      return {
        name: category.name,
        total: categoryReceivables.reduce((sum, r) => sum + r.value, 0),
        recebido: categoryReceivables.filter(r => r.isReceived).reduce((sum, r) => sum + r.value, 0),
        pendente: categoryReceivables.filter(r => !r.isReceived).reduce((sum, r) => sum + r.value, 0)
      };
    })
    .filter(cat => cat.total > 0);

  const monthlyData = useMemo(() => {
    const months: { [key: string]: { total: number, recebido: number, pendente: number } } = {};
    
    filteredReceivables.forEach(receivable => {
      const month = new Date(receivable.dueDate).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: '2-digit' 
      });
      
      if (!months[month]) {
        months[month] = { total: 0, recebido: 0, pendente: 0 };
      }
      
      months[month].total += receivable.value;
      if (receivable.isReceived) {
        months[month].recebido += receivable.value;
      } else {
        months[month].pendente += receivable.value;
      }
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredReceivables]);

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
            <CardTitle>Status dos Recebimentos</CardTitle>
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
            <CardTitle>Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="recebido" fill="#00C49F" name="Recebido" />
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
                <Bar dataKey="recebido" fill="#00C49F" name="Recebido" />
                <Bar dataKey="pendente" fill="#FFBB28" name="Pendente" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
