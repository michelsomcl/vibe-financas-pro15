
import React from 'react';
import { ReceivableAccount, ClientSupplier, Category } from "@/types";
import { useReceivableListLogic } from "@/hooks/useReceivableListLogic";
import TableFilters from "@/components/common/TableFilters";
import BulkActions from "@/components/common/BulkActions";
import ReceivableTable from "./ReceivableTable";

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
  const {
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
  } = useReceivableListLogic({
    receivableAccounts,
    clients,
    revenueCategories,
    onDelete,
    onFilteredDataChange
  });

  const filterConfigs = [
    { key: 'client', placeholder: 'Filtrar por cliente', value: filters.client },
    { key: 'category', placeholder: 'Filtrar por categoria', value: filters.category },
    { key: 'value', placeholder: 'Filtrar por valor', value: filters.value },
    { key: 'dueDate', placeholder: 'Filtrar por vencimento', value: filters.dueDate },
    { key: 'status', placeholder: 'Filtrar por status', value: filters.status },
    { key: 'type', placeholder: 'Filtrar por tipo', value: filters.type }
  ];

  if (receivableAccounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma conta a receber cadastrada</p>
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

      <ReceivableTable
        receivables={filteredAndSortedReceivables}
        clients={clients}
        revenueCategories={revenueCategories}
        selectedIds={selectedIds}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onSelectAll={handleSelectAll}
        onSelectReceivable={handleSelectReceivable}
        onMarkAsReceived={onMarkAsReceived}
        onMarkAsNotReceived={onMarkAsNotReceived}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
