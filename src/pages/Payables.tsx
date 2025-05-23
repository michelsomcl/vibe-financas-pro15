
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PayableForm from "@/components/payables/PayableForm";
import { PayableAccount } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function Payables() {
  const { 
    payableAccounts, 
    categories, 
    clientsSuppliers, 
    loading, 
    updatePayableAccount, 
    deletePayableAccount,
    addTransaction,
    deleteTransaction,
    transactions
  } = useFinance();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<PayableAccount | null>(null);

  const suppliers = clientsSuppliers.filter(cs => cs.type === 'fornecedor');
  const expenseCategories = categories.filter(cat => cat.type === 'despesa');

  const handleEdit = (payable: PayableAccount) => {
    setEditingPayable(payable);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta a pagar?')) {
      try {
        // Check if this payable has an associated transaction (is paid)
        const payable = payableAccounts.find(p => p.id === id);
        
        if (payable?.isPaid) {
          // Find and delete the related transaction first
          const relatedTransaction = transactions.find(
            t => t.sourceType === 'payable' && t.sourceId === id
          );
          
          if (relatedTransaction) {
            await deleteTransaction(relatedTransaction.id);
          }
        }
        
        // Then delete the payable
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
    try {
      // First check if a transaction for this payable already exists
      const existingTransaction = transactions.find(
        t => t.sourceType === 'payable' && t.sourceId === payable.id
      );
      
      if (existingTransaction) {
        // If a transaction already exists, just update the payable status
        await updatePayableAccount(payable.id, {
          isPaid: true,
          paidDate: new Date()
        });
        
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como paga."
        });
        return; // Return early to prevent duplicate transaction creation
      }
      
      // 1. Atualiza a conta para paga
      const paidDate = new Date();
      await updatePayableAccount(payable.id, {
        isPaid: true,
        paidDate
      });
      
      // 2. Cria um lançamento correspondente a este pagamento
      await addTransaction({
        type: 'despesa',
        clientSupplierId: payable.supplierId,
        categoryId: payable.categoryId,
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

  const handleMarkAsUnpaid = async (payable: PayableAccount) => {
    try {
      // 1. Marca a conta como não paga
      await updatePayableAccount(payable.id, {
        isPaid: false,
        paidDate: undefined
      });
      
      // 2. Encontra e remove o lançamento correspondente
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          {payableAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma conta a pagar cadastrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payableAccounts.map((payable) => (
                  <TableRow key={payable.id}>
                    <TableCell className="font-medium">
                      {getSupplierName(payable.supplierId)}
                    </TableCell>
                    <TableCell>{getCategoryName(payable.categoryId)}</TableCell>
                    <TableCell>{formatCurrency(payable.value)}</TableCell>
                    <TableCell>
                      {format(new Date(payable.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
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
                            onClick={() => handleMarkAsPaid(payable)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsUnpaid(payable)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(payable)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(payable.id)}
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
          )}
        </CardContent>
      </Card>

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
