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
import { ReceivableAccount, ClientSupplier, Category } from "@/types";
import ReceivableStatusBadge from "./ReceivableStatusBadge";
import ReceivableActions from "./ReceivableActions";
import { ArrowUpDown, Trash2 } from "lucide-react";

interface ReceivablesListProps {
  receivableAccounts: ReceivableAccount[];
  clients: ClientSupplier[];
  revenueCategories: Category[];
  onMarkAsReceived: (receivable: ReceivableAccount) => void;
  onMarkAsNotReceived: (receivable: ReceivableAccount) => void;
  onEdit: (receivable: ReceivableAccount) => void;
  onDelete: (id: string) => void;
  onFilteredDataChange: (filteredData: ReceivableAccount[]) => void;
}

export default function ReceivablesList({
  receivableAccounts,
  clients,
  revenueCategories,
  onMarkAsReceived,
  onMarkAsNotReceived,
  onEdit,
  onDelete,
  onFilteredDataChange
}: ReceivablesListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'dueDate' | 'value' | 'client' | 'category'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    client: '',
    category: '',
    value: '',
    dueDate: '',
    status: '',
    type: ''
  });

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

  const formatDate = (date: Date | string) => {
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

  const getStatus = (receivable: ReceivableAccount) => {
    if (receivable.isReceived) return 'Recebido';
    const today = new Date();
    const dueDate = new Date(receivable.dueDate);
    if (dueDate < today) return 'Vencido';
    if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) return 'Vence em breve';
    return 'Pendente';
  };

  const filteredAndSortedReceivables = useMemo(() => {
    let filtered = receivableAccounts.filter(receivable => {
      const clientName = getClientName(receivable.clientId).toLowerCase();
      const categoryName = getCategoryName(receivable.categoryId).toLowerCase();
      const status = getStatus(receivable).toLowerCase();
      const type = receivable.installmentType;
      
      return (
        clientName.includes(filters.client.toLowerCase()) &&
        categoryName.includes(filters.category.toLowerCase()) &&
        formatCurrency(receivable.value).includes(filters.value) &&
        formatDate(receivable.dueDate).includes(filters.dueDate) &&
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
      } else if (sortField === 'category') {
        const aCategory = getCategoryName(a.categoryId);
        const bCategory = getCategoryName(b.categoryId);
        return sortDirection === 'asc' ? aCategory.localeCompare(bCategory) : bCategory.localeCompare(aCategory);
      } else if (sortField === 'client') {
        const aClient = getClientName(a.clientId);
        const bClient = getClientName(b.clientId);
        return sortDirection === 'asc' ? aClient.localeCompare(bClient) : bClient.localeCompare(aClient);
      }
      return 0;
    });

    return filtered;
  }, [receivableAccounts, filters, sortField, sortDirection, clients, revenueCategories]);

  // Notify parent component when filtered data changes
  useEffect(() => {
    onFilteredDataChange(filteredAndSortedReceivables);
  }, [filteredAndSortedReceivables, onFilteredDataChange]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedReceivables.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedReceivables.map(r => r.id));
    }
  };

  const handleSelectReceivable = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} contas a receber?`)) {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds([]);
    }
  };

  if (receivableAccounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma conta a receber cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <Input
          placeholder="Filtrar por cliente"
          value={filters.client}
          onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
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
                checked={selectedIds.length === filteredAndSortedReceivables.length && filteredAndSortedReceivables.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('client')} className="h-auto p-0 font-medium">
                Cliente
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
          {filteredAndSortedReceivables.map((receivable) => (
            <TableRow key={receivable.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedIds.includes(receivable.id)}
                  onCheckedChange={() => handleSelectReceivable(receivable.id)}
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
    </div>
  );
}
