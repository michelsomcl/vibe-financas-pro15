
import { useFinance } from "@/contexts/FinanceContext";
import { ReceivableAccount } from "@/types";
import { toast } from "@/hooks/use-toast";

export function useReceivableActions() {
  const { 
    updateReceivableAccount, 
    deleteReceivableAccount,
    addTransaction,
    deleteTransaction,
    transactions
  } = useFinance();

  const handleMarkAsReceived = async (receivable: ReceivableAccount, accountId?: string) => {
    try {
      // Verificar se já existe uma transação para este recebimento
      const existingTransaction = transactions.find(
        t => t.sourceType === 'receivable' && t.sourceId === receivable.id
      );
      
      if (existingTransaction) {
        // Se já existe transação, apenas atualizar o status
        await updateReceivableAccount(receivable.id, {
          isReceived: true,
          receivedDate: new Date(),
          accountId: accountId || receivable.accountId
        });
        
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como recebida."
        });
        return;
      }
      
      const receivedDate = new Date();
      const finalAccountId = accountId || receivable.accountId;
      
      if (!finalAccountId) {
        toast({
          title: "Erro",
          description: "Uma conta deve ser selecionada para o recebimento.",
          variant: "destructive"
        });
        return;
      }
      
      // Primeiro marcar como recebido
      await updateReceivableAccount(receivable.id, {
        isReceived: true,
        receivedDate,
        accountId: finalAccountId
      });
      
      // Depois criar o lançamento
      await addTransaction({
        type: 'receita',
        clientSupplierId: receivable.clientId,
        categoryId: receivable.categoryId,
        accountId: finalAccountId,
        value: receivable.value,
        paymentDate: receivedDate,
        observations: receivable.observations,
        sourceType: 'receivable',
        sourceId: receivable.id
      });
      
      toast({
        title: "Recebimento registrado",
        description: "O recebimento foi registrado e adicionado aos lançamentos."
      });
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o recebimento.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsNotReceived = async (receivable: ReceivableAccount) => {
    try {
      // Primeiro marca a conta como não recebida
      await updateReceivableAccount(receivable.id, {
        isReceived: false,
        receivedDate: undefined,
        accountId: undefined
      });
      
      // Encontra e remove o lançamento correspondente
      const relatedTransaction = transactions.find(
        t => t.sourceType === 'receivable' && t.sourceId === receivable.id
      );
      
      if (relatedTransaction) {
        await deleteTransaction(relatedTransaction.id);
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como não recebida e o lançamento foi removido."
        });
      } else {
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como não recebida."
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do recebimento.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta a receber?')) {
      try {
        // Verificar se existe transação relacionada
        const relatedTransaction = transactions.find(
          t => t.sourceType === 'receivable' && t.sourceId === id
        );
        
        if (relatedTransaction) {
          await deleteTransaction(relatedTransaction.id);
        }
        
        await deleteReceivableAccount(id);
        
        toast({
          title: "Conta excluída",
          description: "A conta a receber foi excluída com sucesso."
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

  return {
    handleMarkAsReceived,
    handleMarkAsNotReceived,
    handleDelete
  };
}
