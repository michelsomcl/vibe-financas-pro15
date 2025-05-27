
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/contexts/FinanceContext";
import { ReceivableAccount } from "@/types";
import { format, addDays, addWeeks, addMonths } from "date-fns";

interface ReceivableFormProps {
  receivable?: ReceivableAccount | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ReceivableForm({ receivable, onSubmit, onCancel }: ReceivableFormProps) {
  const { 
    categories, 
    clientsSuppliers, 
    accounts,
    addReceivableAccount, 
    updateReceivableAccount, 
    addCategory, 
    addClientSupplier 
  } = useFinance();
  
  const [formData, setFormData] = useState({
    clientId: '',
    categoryId: '',
    accountId: '',
    value: '',
    dueDate: '',
    observations: '',
    installmentType: 'unico' as 'unico' | 'parcelado' | 'recorrente',
    installments: '',
    recurrenceType: '' as 'diario' | 'semanal' | 'quinzenal' | 'mensal' | '',
    recurrenceCount: '',
    isReceived: false,
    receivedDate: ''
  });

  const [newClientName, setNewClientName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const clients = clientsSuppliers.filter(cs => cs.type === 'cliente');
  const revenueCategories = categories.filter(cat => cat.type === 'receita');

  useEffect(() => {
    if (receivable) {
      setFormData({
        clientId: receivable.clientId,
        categoryId: receivable.categoryId,
        accountId: receivable.accountId || '',
        value: receivable.value.toString(),
        dueDate: format(new Date(receivable.dueDate), 'yyyy-MM-dd'),
        observations: receivable.observations || '',
        installmentType: receivable.installmentType,
        installments: receivable.installments?.toString() || '',
        recurrenceType: receivable.recurrenceType || '',
        recurrenceCount: receivable.recurrenceCount?.toString() || '',
        isReceived: receivable.isReceived,
        receivedDate: receivable.receivedDate ? format(new Date(receivable.receivedDate), 'yyyy-MM-dd') : ''
      });
    }
  }, [receivable]);

  const calculateNextDate = (baseDate: Date, type: 'diario' | 'semanal' | 'quinzenal' | 'mensal', increment: number) => {
    switch (type) {
      case 'diario':
        return addDays(baseDate, increment);
      case 'semanal':
        return addWeeks(baseDate, increment);
      case 'quinzenal':
        return addWeeks(baseDate, increment * 2);
      case 'mensal':
        return addMonths(baseDate, increment);
      default:
        return addMonths(baseDate, increment);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.categoryId || !formData.accountId || !formData.value || !formData.dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const receivableData = {
      clientId: formData.clientId,
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      value: parseFloat(formData.value),
      dueDate: new Date(formData.dueDate),
      observations: formData.observations || undefined,
      installmentType: formData.installmentType,
      installments: formData.installments ? parseInt(formData.installments) : undefined,
      recurrenceType: formData.recurrenceType || undefined,
      recurrenceCount: formData.recurrenceCount ? parseInt(formData.recurrenceCount) : undefined,
      isReceived: formData.isReceived,
      receivedDate: formData.receivedDate ? new Date(formData.receivedDate) : undefined,
      parentId: undefined
    };

    try {
      if (receivable) {
        await updateReceivableAccount(receivable.id, receivableData);
      } else {
        // Criar o lançamento principal
        console.log('Criando conta a receber principal:', receivableData);
        await addReceivableAccount(receivableData);
        
        // Criar lançamentos automáticos para parcelado ou recorrente
        if (formData.installmentType === 'parcelado' && formData.installments) {
          const installmentCount = parseInt(formData.installments);
          const baseDate = new Date(formData.dueDate);
          
          console.log(`Criando ${installmentCount - 1} parcelas adicionais`);
          
          for (let i = 1; i < installmentCount; i++) {
            const nextDate = addMonths(baseDate, i);
            const installmentData = {
              ...receivableData,
              dueDate: nextDate,
              observations: `${receivableData.observations || ''} - Parcela ${i + 1}/${installmentCount}`.trim()
            };
            
            console.log(`Criando parcela ${i + 1}:`, installmentData);
            await addReceivableAccount(installmentData);
          }
        } else if (formData.installmentType === 'recorrente' && formData.recurrenceType && formData.recurrenceCount) {
          const recurrenceCount = parseInt(formData.recurrenceCount);
          const baseDate = new Date(formData.dueDate);
          
          console.log(`Criando ${recurrenceCount - 1} recorrências adicionais`);
          
          for (let i = 1; i < recurrenceCount; i++) {
            const nextDate = calculateNextDate(baseDate, formData.recurrenceType as 'diario' | 'semanal' | 'quinzenal' | 'mensal', i);
            const recurrenceData = {
              ...receivableData,
              dueDate: nextDate,
              observations: `${receivableData.observations || ''} - Recorrência ${i + 1}/${recurrenceCount}`.trim()
            };
            
            console.log(`Criando recorrência ${i + 1}:`, recurrenceData);
            await addReceivableAccount(recurrenceData);
          }
        }
      }
      onSubmit();
    } catch (error) {
      console.error('Erro ao salvar conta a receber:', error);
    }
  };

  const handleAddClient = async () => {
    if (newClientName.trim()) {
      await addClientSupplier({
        name: newClientName.trim(),
        type: 'cliente'
      });
      setNewClientName('');
      setShowNewClient(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory({
        name: newCategoryName.trim(),
        type: 'receita'
      });
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <div className="flex gap-2">
              <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={() => setShowNewClient(!showNewClient)}>
                +
              </Button>
            </div>
            {showNewClient && (
              <div className="flex gap-2">
                <Input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nome do novo cliente"
                />
                <Button type="button" onClick={handleAddClient} size="sm">
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
                  {revenueCategories.map((category) => (
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
            <Label htmlFor="account">Conta *</Label>
            <Select value={formData.accountId} onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}>
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
            <Label htmlFor="installmentType">Tipo de Recebimento</Label>
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

        {receivable && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isReceived"
                checked={formData.isReceived}
                onChange={(e) => setFormData(prev => ({ ...prev, isReceived: e.target.checked }))} 
              />
              <Label htmlFor="isReceived">Conta recebida</Label>
            </div>

            {formData.isReceived && (
              <div className="space-y-2">
                <Label htmlFor="receivedDate">Data do Recebimento</Label>
                <Input
                  id="receivedDate"
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))} 
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
            {receivable ? 'Atualizar' : 'Criar'} Conta a Receber
          </Button>
        </div>
      </form>
    </div>
  );
}
