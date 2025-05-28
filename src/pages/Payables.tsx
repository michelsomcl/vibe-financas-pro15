
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import PayableForm from "@/components/payables/PayableForm";
import PayablesList from "@/components/payables/PayablesList";
import { PayableAccount } from "@/types";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SimpleDashboard } from "@/components/dashboard/SimpleDashboard";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Payables() {
  const { 
    payableAccounts, 
    categories, 
    clientsSuppliers, 
    accounts,
    loading, 
    updatePayableAccount, 
    deletePayableAccount,
    addTransaction,
    deleteTransaction,
    transactions
  } = useFinance();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<PayableAccount | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<PayableAccount | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [filteredPayables, setFilteredPayables] = useState(payableAccounts);

  const suppliers = clientsSuppliers.filter(cs => cs.type === 'fornecedor');
  const expenseCategories = categories.filter(cat => cat.type === 'despesa');

  // Calcular total de despesas com base nos payables filtrados
  const totalExpenses = useMemo(() => {
    return filteredPayables.reduce((sum, payable) => sum + payable.value, 0);
  }, [filteredPayables]);

  // Atualizar payables filtrados quando os dados mudarem
  React.useEffect(() => {
    setFilteredPayables(payableAccounts);
  }, [payableAccounts]);

  const handleEdit = (payable: PayableAccount) => {
    const payableWithFixedDate = {
      ...payable,
      dueDate: new Date(payable.dueDate.getTime() + payable.dueDate.getTimezoneOffset() * 60000)
    };
    setEditingPayable(payableWithFixedDate);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta a pagar?')) {
      try {
        const payable = payableAccounts.find(p => p.id === id);
        
        if (payable?.isPaid) {
          const relatedTransaction = transactions.find(
            t => t.sourceType === 'payable' && t.sourceId === id
          );
          
          if (relatedTransaction) {
            await deleteTransaction(relatedTransaction.id);
          }
        }
        
        await deletePayableAccount(id);
        
        toast({
          title: "Conta excluída",
          description: "A conta a pagar foi excluída com sucesso."
        });
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir a conta.",
          variant: "destructive"
        });
      }
    }
  };

  const handleMarkAsPaid = async (payable: PayableAccount) => {
    if (!payable.accountId) {
      setSelectedPayable(payable);
      setPaymentDialogOpen(true);
      return;
    }

    try {
      const existingTransaction = transactions.find(
        t => t.sourceType === 'payable' && t.sourceId === payable.id
      );
      
      if (existingTransaction) {
        await updatePayableAccount(payable.id, {
          isPaid: true,
          paidDate: new Date()
        });
        
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como paga."
        });
        return;
      }
      
      const paidDate = new Date();
      
      await updatePayableAccount(payable.id, {
        isPaid: true,
        paidDate,
        accountId: payable.accountId
      });
      
      await addTransaction({
        type: 'despesa',
        clientSupplierId: payable.supplierId,
        categoryId: payable.categoryId,
        accountId: payable.accountId,
        value: payable.value,
        paymentDate: paidDate,
        observations: payable.observations,
        sourceType: 'payable',
        sourceId: payable.id
      });
      
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado e adicionado aos lançamentos."
      });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayable || !selectedAccountId) {
      toast({
        title: "Erro",
        description: "Selecione uma conta para o pagamento.",
        variant: "destructive"
      });
      return;
    }

    try {
      const paidDate = new Date();
      
      await updatePayableAccount(selectedPayable.id, {
        isPaid: true,
        paidDate,
        accountId: selectedAccountId
      });
      
      await addTransaction({
        type: 'despesa',
        clientSupplierId: selectedPayable.supplierId,
        categoryId: selectedPayable.categoryId,
        accountId: selectedAccountId,
        value: selectedPayable.value,
        paymentDate: paidDate,
        observations: selectedPayable.observations,
        sourceType: 'payable',
        sourceId: selectedPayable.id
      });
      
      setPaymentDialogOpen(false);
      setSelectedPayable(null);
      setSelectedAccountId('');
      
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado e adicionado aos lançamentos."
      });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsUnpaid = async (payable: PayableAccount) => {
    try {
      await updatePayableAccount(payable.id, {
        isPaid: false,
        paidDate: undefined,
        accountId: undefined
      });
      
      const relatedTransaction = transactions.find(
        t => t.sourceType === 'payable' && t.sourceId === payable.id
      );
      
      if (relatedTransaction) {
        await deleteTransaction(relatedTransaction.id);
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como não paga e o lançamento foi removido."
        });
      } else {
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como não paga."
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingPayable(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-tertiary">Contas a Pagar</h1>
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
        <h1 className="text-3xl font-bold text-tertiary">Contas a Pagar</h1>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta a Pagar
        </Button>
      </div>

      <SimpleDashboard
        title="Total de Despesas"
        value={totalExpenses}
        formatCurrency={formatCurrency}
        color="red"
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          <PayablesList
            payableAccounts={payableAccounts}
            suppliers={suppliers}
            expenseCategories={expenseCategories}
            onMarkAsPaid={handleMarkAsPaid}
            onMarkAsUnpaid={handleMarkAsUnpaid}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onFilteredDataChange={setFilteredPayables}
          />
        </CardContent>
      </Card>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Conta para Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">Conta *</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - {account.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmPayment}>
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isFormOpen && (
        <PayableForm
          payable={editingPayable}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingPayable(null);
          }}
        />
      )}
    </div>
  );
}
