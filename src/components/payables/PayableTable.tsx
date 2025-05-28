
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
import { PayableAccount, ClientSupplier, Category } from "@/types";
import { formatCurrency, formatDatePayables } from "@/utils/tableUtils";
import PayableStatusBadge from "./PayableStatusBadge";
import PayableActions from "./PayableActions";

interface PayableTableProps {
  payables: PayableAccount[];
  suppliers: ClientSupplier[];
  expenseCategories: Category[];
  selectedIds: string[];
  sortField: 'dueDate' | 'value' | 'supplier' | 'category';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'dueDate' | 'value' | 'supplier' | 'category') => void;
  onSelectAll: () => void;
  onSelectPayable: (id: string) => void;
  onMarkAsPaid: (payable: PayableAccount) => void;
  onMarkAsUnpaid: (payable: PayableAccount) => void;
  onEdit: (payable: PayableAccount) => void;
  onDelete: (id: string) => void;
}

export default function PayableTable({
  payables,
  suppliers,
  expenseCategories,
  selectedIds,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectPayable,
  onMarkAsPaid,
  onMarkAsUnpaid,
  onEdit,
  onDelete
}: PayableTableProps) {
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Fornecedor não encontrado';
  };

  const getCategoryName = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox 
              checked={selectedIds.length === payables.length && payables.length > 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort('supplier')} className="h-auto p-0 font-medium">
              Fornecedor
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
        {payables.map((payable) => (
          <TableRow key={payable.id}>
            <TableCell>
              <Checkbox 
                checked={selectedIds.includes(payable.id)}
                onCheckedChange={() => onSelectPayable(payable.id)}
              />
            </TableCell>
            <TableCell className="font-medium">
              {getSupplierName(payable.supplierId)}
            </TableCell>
            <TableCell>{getCategoryName(payable.categoryId)}</TableCell>
            <TableCell>{formatCurrency(payable.value)}</TableCell>
            <TableCell>
              {formatDatePayables(new Date(payable.dueDate))}
            </TableCell>
            <TableCell><PayableStatusBadge payable={payable} /></TableCell>
            <TableCell>
              <Badge variant="outline">
                {payable.installmentType === 'unico' && 'Único'}
                {payable.installmentType === 'parcelado' && 'Parcelado'}
                {payable.installmentType === 'recorrente' && 'Recorrente'}
              </Badge>
            </TableCell>
            <TableCell>
              <PayableActions
                payable={payable}
                onMarkAsPaid={onMarkAsPaid}
                onMarkAsUnpaid={onMarkAsUnpaid}
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
