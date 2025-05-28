
import React from 'react';
import { PayableAccount, ClientSupplier, Category } from "@/types";
import { usePayableListLogic } from "@/hooks/usePayableListLogic";
import TableFilters from "@/components/common/TableFilters";
import BulkActions from "@/components/common/BulkActions";
import PayableTable from "./PayableTable";

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
  const {
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
  } = usePayableListLogic({
    payableAccounts,
    suppliers,
    expenseCategories,
    onDelete,
    onFilteredDataChange
  });

  const filterConfigs = [
    { key: 'supplier', placeholder: 'Filtrar por fornecedor', value: filters.supplier },
    { key: 'category', placeholder: 'Filtrar por categoria', value: filters.category },
    { key: 'value', placeholder: 'Filtrar por valor', value: filters.value },
    { key: 'dueDate', placeholder: 'Filtrar por vencimento', value: filters.dueDate },
    { key: 'status', placeholder: 'Filtrar por status', value: filters.status },
    { key: 'type', placeholder: 'Filtrar por tipo', value: filters.type }
  ];

  if (payableAccounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma conta a pagar cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TableFilters
        filters={filters}
        filterConfigs={filterConfigs}
        onFilterChange={handleFilterChange}
      />

      <BulkActions
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteSelected}
      />

      <PayableTable
        payables={filteredAndSortedPayables}
        suppliers={suppliers}
        expenseCategories={expenseCategories}
        selectedIds={selectedIds}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onSelectAll={handleSelectAll}
        onSelectPayable={handleSelectPayable}
        onMarkAsPaid={onMarkAsPaid}
        onMarkAsUnpaid={onMarkAsUnpaid}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
