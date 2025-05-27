
import { useDashboardData } from "./useDashboardData";

export const useDashboardChartData = () => {
  const { currentMonthTransactions, categories } = useDashboardData();

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

  return {
    expensesByCategory,
    revenuesByCategory
  };
};
