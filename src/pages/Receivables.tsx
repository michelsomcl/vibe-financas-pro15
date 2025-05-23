
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import ReceivableForm from "@/components/receivables/ReceivableForm";
import ReceivablesList from "@/components/receivables/ReceivablesList";
import { ReceivableAccount } from "@/types";
import { useReceivableActions } from "@/hooks/useReceivableActions";

export default function Receivables() {
  const { 
    receivableAccounts, 
    categories, 
    clientsSuppliers, 
    loading
  } = useFinance();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<ReceivableAccount | null>(null);
  
  const { handleMarkAsReceived, handleMarkAsNotReceived, handleDelete } = useReceivableActions();

  const clients = clientsSuppliers.filter(cs => cs.type === 'cliente');
  const revenueCategories = categories.filter(cat => cat.type === 'receita');

  const handleEdit = (receivable: ReceivableAccount) => {
    setEditingReceivable(receivable);
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingReceivable(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-tertiary">Contas a Receber</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-tertiary">Contas a Receber</h1>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta a Receber
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Receber</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceivablesList
            receivableAccounts={receivableAccounts}
            clients={clients}
            revenueCategories={revenueCategories}
            onMarkAsReceived={handleMarkAsReceived}
            onMarkAsNotReceived={handleMarkAsNotReceived}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <ReceivableForm
          receivable={editingReceivable}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingReceivable(null);
          }}
        />
      )}
    </div>
  );
}
