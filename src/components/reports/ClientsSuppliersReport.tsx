
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ClientsSuppliersReport() {
  const { clientsSuppliers, transactions, payableAccounts, receivableAccounts } = useFinance();

  const clientsData = clientsSuppliers
    .filter(cs => cs.type === 'cliente')
    .map(client => {
      const clientTransactions = transactions.filter(t => t.clientSupplierId === client.id);
      const clientReceivables = receivableAccounts.filter(r => r.clientId === client.id);
      const totalReceived = clientTransactions.reduce((sum, t) => sum + t.value, 0);
      const totalPending = clientReceivables.filter(r => !r.isReceived).reduce((sum, r) => sum + r.value, 0);
      
      return {
        name: client.name,
        recebido: totalReceived,
        pendente: totalPending,
        transacoes: clientTransactions.length
      };
    });

  const suppliersData = clientsSuppliers
    .filter(cs => cs.type === 'fornecedor')
    .map(supplier => {
      const supplierTransactions = transactions.filter(t => t.clientSupplierId === supplier.id);
      const supplierPayables = payableAccounts.filter(p => p.supplierId === supplier.id);
      const totalPaid = supplierTransactions.reduce((sum, t) => sum + t.value, 0);
      const totalPending = supplierPayables.filter(p => !p.isPaid).reduce((sum, p) => sum + p.value, 0);
      
      return {
        name: supplier.name,
        pago: totalPaid,
        pendente: totalPending,
        transacoes: supplierTransactions.length
      };
    });

  const typeDistribution = [
    { name: 'Clientes', value: clientsSuppliers.filter(cs => cs.type === 'cliente').length },
    { name: 'Fornecedores', value: clientsSuppliers.filter(cs => cs.type === 'fornecedor').length }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Receitas por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientsData.slice(0, 10)}>
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

      <Card>
        <CardHeader>
          <CardTitle>Despesas por Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={suppliersData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="pago" fill="#FF8042" name="Pago" />
              <Bar dataKey="pendente" fill="#FFBB28" name="Pendente" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição Clientes vs Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
