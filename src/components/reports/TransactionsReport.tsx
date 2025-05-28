
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ['#00C49F', '#FF8042', '#FFBB28', '#0088FE'];

export default function TransactionsReport() {
  const { transactions, categories, clientsSuppliers } = useFinance();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (startDate) {
      const start = startOfMonth(new Date(startDate));
      filtered = filtered.filter(transaction => 
        isAfter(new Date(transaction.paymentDate), start) || 
        new Date(transaction.paymentDate).getTime() === start.getTime()
      );
    }

    if (endDate) {
      const end = endOfMonth(new Date(endDate));
      filtered = filtered.filter(transaction => 
        isBefore(new Date(transaction.paymentDate), end) || 
        new Date(transaction.paymentDate).getTime() === end.getTime()
      );
    }

    return filtered;
  }, [transactions, startDate, endDate]);

  const typeData = [
    {
      name: 'Receitas',
      value: filteredTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0),
      count: filteredTransactions.filter(t => t.type === 'receita').length
    },
    {
      name: 'Despesas',
      value: filteredTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0),
      count: filteredTransactions.filter(t => t.type === 'despesa').length
    }
  ];

  const categoryData = categories.map(category => {
    const categoryTransactions = filteredTransactions.filter(t => t.categoryId === category.id);
    return {
      name: category.name,
      tipo: category.type,
      valor: categoryTransactions.reduce((sum, t) => sum + t.value, 0),
      quantidade: categoryTransactions.length
    };
  }).filter(cat => cat.valor > 0);

  const monthlyData = useMemo(() => {
    const months: { [key: string]: { receitas: number, despesas: number, saldo: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const month = new Date(transaction.paymentDate).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: '2-digit' 
      });
      
      if (!months[month]) {
        months[month] = { receitas: 0, despesas: 0, saldo: 0 };
      }
      
      if (transaction.type === 'receita') {
        months[month].receitas += transaction.value;
      } else {
        months[month].despesas += transaction.value;
      }
      
      months[month].saldo = months[month].receitas - months[month].despesas;
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  const totalReceitas = filteredTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
  const totalDespesas = filteredTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
  const saldoLiquido = totalReceitas - totalDespesas;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoLiquido)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="valor" fill="#8884d8" />
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
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="receitas" stroke="#00C49F" name="Receitas" />
                <Line type="monotone" dataKey="despesas" stroke="#FF8042" name="Despesas" />
                <Line type="monotone" dataKey="saldo" stroke="#0088FE" name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
