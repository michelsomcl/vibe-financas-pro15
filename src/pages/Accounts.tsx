
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/contexts/FinanceContext";
import { Account } from "@/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Accounts() {
  const { accounts, setAccounts } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as 'banco' | 'dinheiro' | 'caixa' | 'cartao',
    initialBalance: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '' as 'banco' | 'dinheiro' | 'caixa' | 'cartao',
      initialBalance: 0,
    });
    setEditingAccount(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingAccount) {
        // Editar conta existente no Supabase
        const { error } = await supabase
          .from('accounts')
          .update({
            name: formData.name,
            type: formData.type,
            initial_balance: formData.initialBalance,
            current_balance: formData.initialBalance,
          })
          .eq('id', editingAccount.id);

        if (error) throw error;

        // Atualizar estado local
        setAccounts(prev => prev.map(account => 
          account.id === editingAccount.id 
            ? {
                ...account,
                name: formData.name,
                type: formData.type,
                initialBalance: formData.initialBalance,
                currentBalance: formData.initialBalance,
              }
            : account
        ));
        
        toast({
          title: "Sucesso",
          description: "Conta atualizada com sucesso!"
        });
      } else {
        // Criar nova conta no Supabase
        const { data, error } = await supabase
          .from('accounts')
          .insert({
            name: formData.name,
            type: formData.type,
            initial_balance: formData.initialBalance,
            current_balance: formData.initialBalance,
          })
          .select()
          .single();

        if (error) throw error;

        // Adicionar ao estado local
        const newAccount: Account = {
          id: data.id,
          name: data.name,
          type: data.type as 'banco' | 'dinheiro' | 'caixa' | 'cartao',
          initialBalance: Number(data.initial_balance),
          currentBalance: Number(data.current_balance),
          createdAt: new Date(data.created_at)
        };

        setAccounts(prev => [...prev, newAccount]);
        
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso!"
        });
      }
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a conta",
        variant: "destructive"
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      initialBalance: account.initialBalance,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        // Excluir do Supabase
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Atualizar estado local
        setAccounts(prev => prev.filter(account => account.id !== id));
        
        toast({
          title: "Sucesso",
          description: "Conta excluída com sucesso!"
        });
      } catch (error) {
        console.error("Erro ao excluir conta:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a conta",
          variant: "destructive"
        });
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTypeLabel = (type: string) => {
    const types = {
      banco: 'Conta Bancária',
      dinheiro: 'Dinheiro em Espécie',
      caixa: 'Caixa',
      cartao: 'Cartão'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tertiary">Contas Financeiras</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </DialogTitle>
              <DialogDescription>
                {editingAccount ? 'Modifique os dados da conta' : 'Preencha os dados para criar uma nova conta'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Conta *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Conta Corrente Banco X"
                />
              </div>

              <div>
                <Label>Tipo *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'banco' | 'dinheiro' | 'caixa' | 'cartao') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banco">Conta Bancária</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro em Espécie</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="balance">Saldo Inicial</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialBalance: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  {editingAccount ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-tertiary">
                  {account.name}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(account)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(account.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="text-sm font-medium">{getTypeLabel(account.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Saldo Inicial:</span>
                  <span className="text-sm font-medium">{formatCurrency(account.initialBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Saldo Atual:</span>
                  <span className={`text-sm font-bold ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(account.currentBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma conta cadastrada ainda.</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Nova Conta" para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
