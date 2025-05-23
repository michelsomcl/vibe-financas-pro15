
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
              {format(new Date(receivable.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
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
