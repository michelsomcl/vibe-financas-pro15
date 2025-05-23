
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/contexts/FinanceContext";
import { ReceivableAccount } from "@/types";

export function useReceivableActions() {
  const { 
    updateReceivableAccount, 
    deleteReceivableAccount,
    addTransaction,
    deleteTransaction,
    transactions,
    receivableAccounts
  } = useFinance();
  const { toast } = useToast();

  const handleMarkAsReceived = async (receivable: ReceivableAccount) => {
    try {
      // First check if a transaction for this receivable already exists
      const existingTransaction = transactions.find(
        t => t.sourceType === 'receivable' && t.sourceId === receivable.id
      );
      
      if (existingTransaction) {
        // If a transaction already exists, just update the receivable status
        await updateReceivableAccount(receivable.id, {
          isReceived: true,
          receivedDate: new Date()
        });
        
        toast({
          title: "Status atualizado",
          description: "A conta foi marcada como recebida."
        });
        return; // Return early to prevent duplicate transaction creation
      }

      // Update the receivable to mark it as received FIRST
      const receivedDate = new Date();
      await updateReceivableAccount(receivable.id, {
        isReceived: true,
        receivedDate
      });
      
      // Create a corresponding transaction for this receipt ONLY if one doesn't exist
      // Use Math.round to ensure exact decimal precision
      const transactionValue = receivable.value;
      
      await addTransaction({
        type: 'receita',
        clientSupplierId: receivable.clientId,
        categoryId: receivable.categoryId,
        value: transactionValue, // Ensure we're using the exact value without rounding issues
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
      // Mark the account as not received
      await updateReceivableAccount(receivable.id, {
        isReceived: false,
        receivedDate: undefined
      });
      
      // Find and remove the corresponding transaction
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
        // Check if this receivable has an associated transaction (is received)
        const receivable = receivableAccounts.find(r => r.id === id);
        
        if (receivable?.isReceived) {
          // Find and delete the related transaction first
          const relatedTransaction = transactions.find(
            t => t.sourceType === 'receivable' && t.sourceId === id
          );
          
          if (relatedTransaction) {
            await deleteTransaction(relatedTransaction.id);
          }
        }
        
        // Then delete the receivable
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
