
import { useFinance } from "@/contexts/FinanceContext";
import { startOfMonth, endOfMonth, isAfter } from "date-fns";

export const useDashboardData = () => {
  const { payableAccounts, receivableAccounts, transactions, categories } = useFinance();
  
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Filtrar dados do mês atual - considerando data de pagamento para contas pagas
  const currentMonthPayables = payableAccounts.filter(p => {
    if (p.isPaid && p.paidDate) {
      const paidDate = new Date(p.paidDate);
      return paidDate >= monthStart && paidDate <= monthEnd;
    } else {
      const dueDate = new Date(p.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    }
  });

  const currentMonthReceivables = receivableAccounts.filter(r => {
    if (r.isReceived && r.receivedDate) {
      const receivedDate = new Date(r.receivedDate);
      return receivedDate >= monthStart && receivedDate <= monthEnd;
    } else {
      const dueDate = new Date(r.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    }
  });

  const currentMonthTransactions = transactions.filter(t => {
    const paymentDate = new Date(t.paymentDate);
    return paymentDate >= monthStart && paymentDate <= monthEnd;
  });

  return {
    currentMonth,
    currentMonthPayables,
    currentMonthReceivables,
    currentMonthTransactions,
    monthStart,
    monthEnd,
    payableAccounts,
    receivableAccounts,
    categories
  };
};
