import React, { useState, useMemo, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PayableAccount, ClientSupplier, Category } from "@/types";
import { ArrowUpDown, Trash2, Check, X, Edit } from "lucide-react";

interface PayablesListProps {
  payableAccounts: PayableAccount[];
  suppliers: ClientSupplier[];
  expenseCategories: Category[];
  onMarkAsPaid: (payable: PayableAccount) => void;
  onMarkAsUnpaid: (payable: PayableAccount) => void;
  onEdit: (payable: PayableAccount) => void;
  onDelete: (id: string) => void;
  onFilteredDataChange: (filteredData: PayableAccount[]) => void;
}

export default function PayablesList({
  payableAccounts,
  suppliers,
  expenseCategories,
  onMarkAsPaid,
  onMarkAsUnpaid,
  onEdit,
  onDelete,
  onFilteredDataChange
}: PayablesListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'dueDate' | 'value' | 'supplier' | 'category'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    supplier: '',
    category: '',
    value: '',
    dueDate: '',
    status: '',
    type: ''
  });

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Fornecedor não encontrado';
  };

  const getCategoryName = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date.getTime() + date.getTimezoneOffset() * 60000), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusBadge = (payable: PayableAccount) => {
    if (payable.isPaid) {
      return <Badge variant="default" className="bg-green-500">Pago</Badge>;
    }
    
    const today = new Date();
    const dueDate = new Date(payable.dueDate);
    
    if (dueDate < today) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return <Badge variant="secondary" className="bg-yellow-500 text-white">Vence em breve</Badge>;
    } else {
      return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getStatus = (payable: PayableAccount) => {
    if (payable.isPaid) return 'Pago';
    const today = new Date();
    const dueDate = new Date(payable.dueDate);
    if (dueDate < today) return 'Vencido';
    if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) return 'Vence em breve';
    return 'Pendente';
  };

  const filteredAndSortedPayables = useMemo(() => {
    let filtered = payableAccounts.filter(payable => {
      const supplierName = getSupplierName(payable.supplierId).toLowerCase();
      const categoryName = getCategoryName(payable.categoryId).toLowerCase();
      const status = getStatus(payable).toLowerCase();
      const type = payable.installmentType;
      
      return (
        supplierName.includes(filters.supplier.toLowerCase()) &&
        categoryName.includes(filters.category.toLowerCase()) &&
        formatCurrency(payable.value).includes(filters.value) &&
        formatDate(new Date(payable.dueDate)).includes(filters.dueDate) &&
        status.includes(filters.status.toLowerCase()) &&
        type.includes(filters.type.toLowerCase())
      );
    });

    // Ordenar por vencimento mais próximo primeiro por padrão
    filtered.sort((a, b) => {
      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      
      if (sortField === 'dueDate') {
        return sortDirection === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      } else if (sortField === 'value') {
        return sortDirection === 'asc' ? a.value - b.value : b.value - a.value;
      } else if (sortField === 'supplier') {
        const aSupplier = getSupplierName(a.supplierId);
        const bSupplier = getSupplierName(b.supplierId);
        return sortDirection === 'asc' ? aSupplier.localeCompare(bSupplier) : bSupplier.localeCompare(aSupplier);
      } else if (sortField === 'category') {
        const aCategory = getCategoryName(a.categoryId);
        const bCategory = getCategoryName(b.categoryId);
        return sortDirection === 'asc' ? aCategory.localeCompare(bCategory) : bCategory.localeCompare(aCategory);
      }
      return 0;
    });

    return filtered;
  }, [payableAccounts, filters, sortField, sortDirection, suppliers, expenseCategories]);

  // Notify parent component when filtered data changes
  useEffect(() => {
    onFilteredDataChange(filteredAndSortedPayables);
  }, [filteredAndSortedPayables, onFilteredDataChange]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedPayables.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedPayables.map(p => p.id));
    }
  };

  const handleSelectPayable = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} contas a pagar?`)) {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds([]);
    }
  };

  if (payableAccounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma conta a pagar cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <Input
          placeholder="Filtrar por fornecedor"
          value={filters.supplier}
          onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
        />
        <Input
          placeholder="Filtrar por categoria"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        />
        <Input
          placeholder="Filtrar por valor"
          value={filters.value}
          onChange={(e) => setFilters(prev => ({ ...prev, value: e.target.value }))}
        />
        <Input
          placeholder="Filtrar por vencimento"
          value={filters.dueDate}
          onChange={(e) => setFilters(prev => ({ ...prev, dueDate: e.target.value }))}
        />
        <Input
          placeholder="Filtrar por status"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        />
        <Input
          placeholder="Filtrar por tipo"
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
        />
      </div>

      {/* Ações de seleção múltipla */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
          <span className="text-sm">{selectedIds.length} itens selecionados</span>
          <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir Selecionados
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedIds.length === filteredAndSortedPayables.length && filteredAndSortedPayables.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('supplier')} className="h-auto p-0 font-medium">
                Fornecedor
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('category')} className="h-auto p-0 font-medium">
                Categoria
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('value')} className="h-auto p-0 font-medium">
                Valor
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('dueDate')} className="h-auto p-0 font-medium">
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
          {filteredAndSortedPayables.map((payable) => (
            <TableRow key={payable.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedIds.includes(payable.id)}
                  onCheckedChange={() => handleSelectPayable(payable.id)}
                />
              </TableCell>
              <TableCell className="font-medium">
                {getSupplierName(payable.supplierId)}
              </TableCell>
              <TableCell>{getCategoryName(payable.categoryId)}</TableCell>
              <TableCell>{formatCurrency(payable.value)}</TableCell>
              <TableCell>
                {formatDate(new Date(payable.dueDate))}
              </TableCell>
              <TableCell>{getStatusBadge(payable)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {payable.installmentType === 'unico' && 'Único'}
                  {payable.installmentType === 'parcelado' && 'Parcelado'}
                  {payable.installmentType === 'recorrente' && 'Recorrente'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {!payable.isPaid ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsPaid(payable)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsUnpaid(payable)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(payable)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(payable.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
