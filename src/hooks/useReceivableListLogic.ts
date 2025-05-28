
import { useState, useMemo, useEffect } from 'react';
import { ReceivableAccount, ClientSupplier, Category } from "@/types";
import { formatCurrency, formatDate } from "@/utils/tableUtils";

interface UseReceivableListLogicProps {
  receivableAccounts: ReceivableAccount[];
  clients: ClientSupplier[];
  revenueCategories: Category[];
  onDelete: (id: string) => void;
  onFilteredDataChange: (filteredData: ReceivableAccount[]) => void;
}

export function useReceivableListLogic({
  receivableAccounts,
  clients,
  revenueCategories,
  onDelete,
  onFilteredDataChange
}: UseReceivableListLogicProps) {
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    selectedIds,
    sortField,
    sortDirection,
    filters,
    filteredAndSortedReceivables,
    handleSort,
    handleSelectAll,
    handleSelectReceivable,
    handleDeleteSelected,
    handleFilterChange
  };
}
