
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/contexts/FinanceContext";
import { PayableAccount } from "@/types";
import { format } from "date-fns";

interface PayableFormProps {
  payable?: PayableAccount | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function PayableForm({ payable, onSubmit, onCancel }: PayableFormProps) {
  const { 
    categories, 
    clientsSuppliers, 
    addPayableAccount, 
    updatePayableAccount, 
    addCategory, 
    addClientSupplier 
  } = useFinance();
  
  const [formData, setFormData] = useState({
    supplierId: '',
    categoryId: '',
    value: '',
    dueDate: '',
    observations: '',
    installmentType: 'unico' as 'unico' | 'parcelado' | 'recorrente',
    installments: '',
    recurrenceType: '' as 'diario' | 'semanal' | 'quinzenal' | 'mensal' | '',
    recurrenceCount: '',
    isPaid: false,
    paidDate: ''
  });

  const [newSupplierName, setNewSupplierName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const suppliers = clientsSuppliers.filter(cs => cs.type === 'fornecedor');
  const expenseCategories = categories.filter(cat => cat.type === 'despesa');

  useEffect(() => {
    if (payable) {
      setFormData({
        supplierId: payable.supplierId,
        categoryId: payable.categoryId,
        value: payable.value.toString(),
        dueDate: format(new Date(payable.dueDate), 'yyyy-MM-dd'),
        observations: payable.observations || '',
        installmentType: payable.installmentType,
        installments: payable.installments?.toString() || '',
        recurrenceType: payable.recurrenceType || '',
        recurrenceCount: payable.recurrenceCount?.toString() || '',
        isPaid: payable.isPaid,
        paidDate: payable.paidDate ? format(new Date(payable.paidDate), 'yyyy-MM-dd') : ''
      });
    }
  }, [payable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId || !formData.categoryId || !formData.value || !formData.dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const payableData = {
      supplierId: formData.supplierId,
      categoryId: formData.categoryId,
      value: parseFloat(formData.value),
      dueDate: new Date(formData.dueDate),
      observations: formData.observations || undefined,
      installmentType: formData.installmentType,
      installments: formData.installments ? parseInt(formData.installments) : undefined,
      recurrenceType: formData.recurrenceType || undefined,
      recurrenceCount: formData.recurrenceCount ? parseInt(formData.recurrenceCount) : undefined,
      isPaid: formData.isPaid,
      paidDate: formData.paidDate ? new Date(formData.paidDate) : undefined,
      parentId: undefined
    };

    try {
      if (payable) {
        await updatePayableAccount(payable.id, payableData);
      } else {
        await addPayableAccount(payableData);
      }
      onSubmit();
    } catch (error) {
      console.error('Erro ao salvar conta a pagar:', error);
    }
  };

  const handleAddSupplier = async () => {
    if (newSupplierName.trim()) {
      await addClientSupplier({
        name: newSupplierName.trim(),
        type: 'fornecedor'
      });
      setNewSupplierName('');
      setShowNewSupplier(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory({
        name: newCategoryName.trim(),
        type: 'despesa'
      });
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {payable ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor *</Label>
                <div className="flex gap-2">
                  <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setShowNewSupplier(!showNewSupplier)}>
                    +
                  </Button>
                </div>
                {showNewSupplier && (
                  <div className="flex gap-2">
                    <Input
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      placeholder="Nome do novo fornecedor"
                    />
                    <Button type="button" onClick={handleAddSupplier} size="sm">
                      Adicionar
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <div className="flex gap-2">
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setShowNewCategory(!showNewCategory)}>
                    +
                  </Button>
                </div>
                {showNewCategory && (
                  <div className="flex gap-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nome da nova categoria"
                    />
                    <Button type="button" onClick={handleAddCategory} size="sm">
                      Adicionar
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installmentType">Tipo de Pagamento</Label>
                <Select value={formData.installmentType} onValueChange={(value: 'unico' | 'parcelado' | 'recorrente') => setFormData(prev => ({ ...prev, installmentType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unico">Único</SelectItem>
                    <SelectItem value="parcelado">Parcelado</SelectItem>
                    <SelectItem value="recorrente">Recorrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.installmentType === 'parcelado' && (
                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    value={formData.installments}
                    onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))}
                    placeholder="Ex: 12"
                  />
                </div>
              )}

              {formData.installmentType === 'recorrente' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceType">Frequência</Label>
                    <Select value={formData.recurrenceType} onValueChange={(value: 'diario' | 'semanal' | 'quinzenal' | 'mensal') => setFormData(prev => ({ ...prev, recurrenceType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurrenceCount">Quantidade de Repetições</Label>
                    <Input
                      id="recurrenceCount"
                      type="number"
                      value={formData.recurrenceCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceCount: e.target.value }))}
                      placeholder="Ex: 12 (deixe vazio para infinito)"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            {payable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={formData.isPaid}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                  />
                  <Label htmlFor="isPaid">Conta paga</Label>
                </div>

                {formData.isPaid && (
                  <div className="space-y-2">
                    <Label htmlFor="paidDate">Data do Pagamento</Label>
                    <Input
                      id="paidDate"
                      type="date"
                      value={formData.paidDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, paidDate: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {payable ? 'Atualizar' : 'Criar'} Conta a Pagar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
