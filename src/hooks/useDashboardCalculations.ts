
import { useDashboardData } from "./useDashboardData";
import { isAfter } from "date-fns";

export const useDashboardCalculations = () => {
  const {
    currentMonthPayables,
    currentMonthReceivables,
    currentMonthTransactions,
    monthStart,
    monthEnd,
    payableAccounts,
    receivableAccounts
  } = useDashboardData();

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

  return {
    totalPaidExpenses,
    unpaidExpenses,
    totalReceivedRevenues,
    unreceiveredRevenues,
    balancePaid,
    balanceUnpaid,
    overduePayables,
    overdueReceivables
  };
};
