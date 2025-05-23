
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/contexts/FinanceContext";
import { ClientSupplier } from "@/types";
import { Plus, Edit, Trash2, Users, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ClientsSuppliers() {
  const { clientsSuppliers, addClientSupplier, loading } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClientSupplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as 'cliente' | 'fornecedor',
    observations: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '' as 'cliente' | 'fornecedor',
      observations: '',
    });
    setEditingItem(null);
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

    if (editingItem) {
      // TODO: Implementar função de update no contexto
      toast({
        title: "Info",
        description: "Função de edição será implementada em breve",
      });
    } else {
      await addClientSupplier({
        name: formData.name,
        type: formData.type,
        observations: formData.observations,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (item: ClientSupplier) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      observations: item.observations || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      // TODO: Implementar função de delete no contexto
      toast({
        title: "Info",
        description: "Função de exclusão será implementada em breve",
      });
    }
  };

  const clients = clientsSuppliers.filter(item => item.type === 'cliente');
  const suppliers = clientsSuppliers.filter(item => item.type === 'fornecedor');

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-tertiary">Clientes & Fornecedores</h1>
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tertiary">Clientes & Fornecedores</h1>
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
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar' : 'Novo Cliente/Fornecedor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do cliente ou fornecedor"
                />
              </div>

              <div>
                <Label>Tipo *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'cliente' | 'fornecedor') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="fornecedor">Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Observações adicionais (opcional)"
                  rows={3}
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
                  {editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-blue-600 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Clientes
            <Badge variant="outline" className="ml-2">
              {clients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length > 0 ? (
            <div className="space-y-3">
              {clients.map(client => (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{client.name}</h3>
                    {client.observations && (
                      <p className="text-sm text-gray-600 mt-1">{client.observations}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(client)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(client.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum cliente cadastrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-orange-600 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Fornecedores
            <Badge variant="outline" className="ml-2">
              {suppliers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length > 0 ? (
            <div className="space-y-3">
              {suppliers.map(supplier => (
                <div 
                  key={supplier.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{supplier.name}</h3>
                    {supplier.observations && (
                      <p className="text-sm text-gray-600 mt-1">{supplier.observations}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(supplier)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(supplier.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum fornecedor cadastrado
            </p>
          )}
        </CardContent>
      </Card>

      {clientsSuppliers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum cliente ou fornecedor cadastrado ainda.</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Novo" para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
