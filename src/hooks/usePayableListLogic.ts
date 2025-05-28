
import { useState, useMemo, useEffect } from 'react';
import { PayableAccount, ClientSupplier, Category } from "@/types";
import { formatCurrency, formatDatePayables } from "@/utils/tableUtils";

interface UsePayableListLogicProps {
  payableAccounts: PayableAccount[];
  suppliers: ClientSupplier[];
  expenseCategories: Category[];
  onDelete: (id: string) => void;
  onFilteredDataChange: (filteredData: PayableAccount[]) => void;
}

export function usePayableListLogic({
  payableAccounts,
  suppliers,
  expenseCategories,
  onDelete,
  onFilteredDataChange
}: UsePayableListLogicProps) {
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
        formatDatePayables(new Date(payable.dueDate)).includes(filters.dueDate) &&
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    selectedIds,
    sortField,
    sortDirection,
    filters,
    filteredAndSortedPayables,
    handleSort,
    handleSelectAll,
    handleSelectPayable,
    handleDeleteSelected,
    handleFilterChange
  };
}
