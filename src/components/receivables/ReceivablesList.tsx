
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReceivableAccount, ClientSupplier, Category } from "@/types";
import ReceivableStatusBadge from "./ReceivableStatusBadge";
import ReceivableActions from "./ReceivableActions";

interface ReceivablesListProps {
  receivableAccounts: ReceivableAccount[];
  clients: ClientSupplier[];
  revenueCategories: Category[];
  onMarkAsReceived: (receivable: ReceivableAccount) => void;
  onMarkAsNotReceived: (receivable: ReceivableAccount) => void;
  onEdit: (receivable: ReceivableAccount) => void;
  onDelete: (id: string) => void;
}

export default function ReceivablesList({
  receivableAccounts,
  clients,
  revenueCategories,
  onMarkAsReceived,
  onMarkAsNotReceived,
  onEdit,
  onDelete
}: ReceivablesListProps) {
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getCategoryName = (categoryId: string) => {
    const category = revenueCategories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Corrigido para mostrar a data exata que foi cadastrada
  // Sem ajustes de timezone ou conversões que podem alterar o dia
  const formatDate = (date: Date | string) => {
    // Certifica-se de que estamos trabalhando com uma string no formato ISO
    // e extrai apenas a parte da data (YYYY-MM-DD)
    let dateStr: string;
    if (date instanceof Date) {
      dateStr = date.toISOString().split('T')[0];
    } else {
      // Se já for uma string, garante que estamos pegando apenas a parte da data
      dateStr = typeof date === 'string' ? date.split('T')[0] : date;
    }
    
    // Converte a string de data para um objeto Date
    // Usando o construtor Date com ano, mês, dia para evitar problemas de timezone
    const parts = dateStr.split('-').map(Number);
    const year = parts[0];
    const month = parts[1] - 1; // Mês em JS é 0-indexed
    const day = parts[2];
    
    // Cria uma nova data usando os componentes individuais
    const dateObj = new Date(year, month, day);
    
    // Formata para exibição no formato brasileiro
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (receivableAccounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma conta a receber cadastrada</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receivableAccounts.map((receivable) => (
          <TableRow key={receivable.id}>
            <TableCell className="font-medium">
              {getClientName(receivable.clientId)}
            </TableCell>
            <TableCell>{getCategoryName(receivable.categoryId)}</TableCell>
            <TableCell>{formatCurrency(receivable.value)}</TableCell>
            <TableCell>
              {formatDate(receivable.dueDate)}
            </TableCell>
            <TableCell>
              <ReceivableStatusBadge receivable={receivable} />
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {receivable.installmentType === 'unico' && 'Único'}
                {receivable.installmentType === 'parcelado' && 'Parcelado'}
                {receivable.installmentType === 'recorrente' && 'Recorrente'}
              </Badge>
            </TableCell>
            <TableCell>
              <ReceivableActions
                receivable={receivable}
                onMarkAsReceived={onMarkAsReceived}
                onMarkAsNotReceived={onMarkAsNotReceived}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
