
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date | string) => {
  let dateStr: string;
  if (date instanceof Date) {
    dateStr = date.toISOString().split('T')[0];
  } else {
    dateStr = typeof date === 'string' ? date.split('T')[0] : date;
  }
  
  const parts = dateStr.split('-').map(Number);
  const year = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];
  
  const dateObj = new Date(year, month, day);
  
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDatePayables = (date: Date) => {
  return format(new Date(date.getTime() + date.getTimezoneOffset() * 60000), 'dd/MM/yyyy', { locale: ptBR });
};
