
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { format, startOfMonth, endOfMonth, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#800491', '#FF8042', '#FFBB28', '#8884d8', '#82ca9d', '#ffc658'];

export default function Dashboard() {
  const { payableAccounts, receivableAccounts, transactions, categories } = useFinance();
  
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Filtrar dados do mês atual - considerando data de pagamento para contas pagas
  const currentMonthPayables = payableAccounts.filter(p => {
    if (p.isPaid && p.paidDate) {
      // Se está pago, considera a data de pagamento
      const paidDate = new Date(p.paidDate);
      return paidDate >= monthStart && paidDate <= monthEnd;
    } else {
      // Se não está pago, considera a data de vencimento
      const dueDate = new Date(p.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    }
  });

  const currentMonthReceivables = receivableAccounts.filter(r => {
    if (r.isReceived && r.receivedDate) {
      // Se foi recebido, considera a data de recebimento
      const receivedDate = new Date(r.receivedDate);
      return receivedDate >= monthStart && receivedDate <= monthEnd;
    } else {
      // Se não foi recebido, considera a data de vencimento
      const dueDate = new Date(r.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    }
  });

  const currentMonthTransactions = transactions.filter(t => {
    const paymentDate = new Date(t.paymentDate);
    return paymentDate >= monthStart && paymentDate <= monthEnd;
  });

  // Calcular totais das contas pagas no mês atual (usando data de pagamento)
  const paidExpenses = payableAccounts
    .filter(p => p.isPaid && p.paidDate)
    .filter(p => {
      const paidDate = new Date(p.paidDate);
      return paidDate >= monthStart && paidDate <= monthEnd;
    })
    .reduce((sum, p) => sum + p.value, 0);

  const receivedRevenues = receivableAccounts
    .filter(r => r.isReceived && r.receivedDate)
    .filter(r => {
      const receivedDate = new Date(r.receivedDate);
      return receivedDate >= monthStart && receivedDate <= monthEnd;
    })
    .reduce((sum, r) => sum + r.value, 0);

  // Calcular totais das contas não pagas com vencimento no mês atual
  const unpaidExpenses = payableAccounts
    .filter(p => !p.isPaid)
    .filter(p => {
      const dueDate = new Date(p.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    })
    .reduce((sum, p) => sum + p.value, 0);

  const unreceiveredRevenues = receivableAccounts
    .filter(r => !r.isReceived)
    .filter(r => {
      const dueDate = new Date(r.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    })
    .reduce((sum, r) => sum + r.value, 0);

  // Calcular apenas lançamentos manuais (não vindos de contas a pagar/receber)
  const manualExpenses = currentMonthTransactions
    .filter(t => t.type === 'despesa' && t.sourceType === 'manual')
    .reduce((sum, t) => sum + t.value, 0);

  const manualRevenues = currentMonthTransactions
    .filter(t => t.type === 'receita' && t.sourceType === 'manual')
    .reduce((sum, t) => sum + t.value, 0);

  // Totais finais (sem duplicação)
  const totalPaidExpenses = paidExpenses + manualExpenses;
  const totalReceivedRevenues = receivedRevenues + manualRevenues;

  const balancePaid = totalReceivedRevenues - totalPaidExpenses;
  const balanceUnpaid = unreceiveredRevenues - unpaidExpenses;

  // Contas vencidas
  const overduePayables = payableAccounts.filter(p => !p.isPaid && isAfter(new Date(), new Date(p.dueDate))).reduce((sum, p) => sum + p.value, 0);
  const overdueReceivables = receivableAccounts.filter(r => !r.isReceived && isAfter(new Date(), new Date(r.dueDate))).reduce((sum, r) => sum + r.value, 0);

  // Dados para gráficos (usar todos os lançamentos do mês para análise por categoria)
  const expensesByCategory = categories
    .filter(c => c.type === 'despesa')
    .map(cat => {
      const total = currentMonthTransactions
        .filter(t => t.type === 'despesa' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.value, 0);
      return { name: cat.name, value: total };
    })
    .filter(item => item.value > 0);

  const revenuesByCategory = categories
    .filter(c => c.type === 'receita')
    .map(cat => {
      const total = currentMonthTransactions
        .filter(t => t.type === 'receita' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.value, 0);
      return { name: cat.name, value: total };
    })
    .filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tertiary">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Despesas Pagas (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalPaidExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Despesas a Pagar (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(unpaidExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receitas Recebidas (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReceivedRevenues)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receitas a Receber (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(unreceiveredRevenues)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo Realizado (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balancePaid >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balancePaid)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo a Realizar (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balanceUnpaid >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balanceUnpaid)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Despesas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(overduePayables)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receitas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(overdueReceivables)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
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
    </div>
  );
}
