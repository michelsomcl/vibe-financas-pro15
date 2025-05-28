
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { ReceivableAccount, ClientSupplier, Category } from "@/types";
import { formatCurrency, formatDate } from "@/utils/tableUtils";
import ReceivableStatusBadge from "./ReceivableStatusBadge";
import ReceivableActions from "./ReceivableActions";

interface ReceivableTableProps {
  receivables: ReceivableAccount[];
  clients: ClientSupplier[];
  revenueCategories: Category[];
  selectedIds: string[];
  sortField: 'dueDate' | 'value' | 'client' | 'category';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'dueDate' | 'value' | 'client' | 'category') => void;
  onSelectAll: () => void;
  onSelectReceivable: (id: string) => void;
  onMarkAsReceived: (receivable: ReceivableAccount) => void;
  onMarkAsNotReceived: (receivable: ReceivableAccount) => void;
  onEdit: (receivable: ReceivableAccount) => void;
  onDelete: (id: string) => void;
}

export default function ReceivableTable({
  receivables,
  clients,
  revenueCategories,
  selectedIds,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectReceivable,
  onMarkAsReceived,
  onMarkAsNotReceived,
  onEdit,
  onDelete
}: ReceivableTableProps) {
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getCategoryName = (categoryId: string) => {
    const category = revenueCategories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox 
              checked={selectedIds.length === receivables.length && receivables.length > 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort('client')} className="h-auto p-0 font-medium">
              Cliente
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort('category')} className="h-auto p-0 font-medium">
              Categoria
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort('value')} className="h-auto p-0 font-medium">
              Valor
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort('dueDate')} className="h-auto p-0 font-medium">
              Vencimento
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receivables.map((receivable) => (
          <TableRow key={receivable.id}>
            <TableCell>
              <Checkbox 
                checked={selectedIds.includes(receivable.id)}
                onCheckedChange={() => onSelectReceivable(receivable.id)}
              />
            </TableCell>
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
