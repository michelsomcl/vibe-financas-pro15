
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardsProps {
  totalPaidExpenses: number;
  unpaidExpenses: number;
  totalReceivedRevenues: number;
  unreceiveredRevenues: number;
  balancePaid: number;
  balanceUnpaid: number;
  overduePayables: number;
  overdueReceivables: number;
  formatCurrency: (value: number) => string;
}

export function DashboardCards({
  totalPaidExpenses,
  unpaidExpenses,
  totalReceivedRevenues,
  unreceiveredRevenues,
  balancePaid,
  balanceUnpaid,
  overduePayables,
  overdueReceivables,
  formatCurrency
}: DashboardCardsProps) {
  return (
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
  );
}
