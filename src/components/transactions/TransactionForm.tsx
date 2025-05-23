
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFinance } from "@/contexts/FinanceContext";
import { Transaction } from "@/types";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  type: z.enum(['receita', 'despesa']),
  clientSupplierId: z.string().min(1, 'Selecione um cliente ou fornecedor'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  value: z.string().min(1, 'Valor é obrigatório'),
  paymentDate: z.date({
    required_error: 'Data de pagamento é obrigatória',
  }),
  observations: z.string().optional(),
});

interface TransactionFormProps {
  transaction?: Transaction | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const { clientsSuppliers, categories, addTransaction, updateTransaction, addCategory, addClientSupplier } = useFinance();
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewClientSupplierForm, setShowNewClientSupplierForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newClientSupplierName, setNewClientSupplierName] = useState('');
  const [newClientSupplierType, setNewClientSupplierType] = useState<'cliente' | 'fornecedor'>('cliente');
  const [newClientSupplierObservations, setNewClientSupplierObservations] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transaction?.type || 'receita',
      clientSupplierId: transaction?.clientSupplierId || '',
      categoryId: transaction?.categoryId || '',
      value: transaction?.value.toString() || '',
      paymentDate: transaction?.paymentDate ? new Date(transaction.paymentDate) : new Date(),
      observations: transaction?.observations || '',
    },
  });

  const transactionType = form.watch('type');

  const filteredClientSuppliers = clientsSuppliers.filter(cs => {
    if (transactionType === 'receita') {
      return cs.type === 'cliente';
    } else {
      return cs.type === 'fornecedor';
    }
  });

  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const transactionData = {
      type: values.type,
      clientSupplierId: values.clientSupplierId,
      categoryId: values.categoryId,
      value: parseFloat(values.value),
      paymentDate: values.paymentDate,
      observations: values.observations,
      sourceType: 'manual' as const,
      sourceId: transaction?.sourceId,
    };

    if (transaction) {
      await updateTransaction(transaction.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }
    
    onSubmit();
  };

  const handleNewCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory({
        name: newCategoryName.trim(),
        type: transactionType
      });
      setNewCategoryName('');
      setShowNewCategoryForm(false);
    }
  };

  const handleNewClientSupplier = async () => {
    if (newClientSupplierName.trim()) {
      await addClientSupplier({
        name: newClientSupplierName.trim(),
        type: newClientSupplierType,
        observations: newClientSupplierObservations.trim() || undefined
      });
      setNewClientSupplierName('');
      setNewClientSupplierObservations('');
      setShowNewClientSupplierForm(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{transaction ? 'Editar' : 'Novo'} Lançamento</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientSupplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {transactionType === 'receita' ? 'Cliente' : 'Fornecedor'}
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecione um ${transactionType === 'receita' ? 'cliente' : 'fornecedor'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredClientSuppliers.map((cs) => (
                            <SelectItem key={cs.id} value={cs.id}>
                              {cs.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewClientSupplierType(transactionType === 'receita' ? 'cliente' : 'fornecedor');
                        setShowNewClientSupplierForm(!showNewClientSupplierForm);
                      }}
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showNewClientSupplierForm && (
              <Card className="p-4 bg-gray-50">
                <div className="space-y-3">
                  <Input
                    placeholder={`Nome do novo ${transactionType === 'receita' ? 'cliente' : 'fornecedor'}`}
                    value={newClientSupplierName}
                    onChange={(e) => setNewClientSupplierName(e.target.value)}
                  />
                  <Textarea
                    placeholder="Observações (opcional)"
                    value={newClientSupplierObservations}
                    onChange={(e) => setNewClientSupplierObservations(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleNewClientSupplier}>
                      Criar {transactionType === 'receita' ? 'Cliente' : 'Fornecedor'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewClientSupplierForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showNewCategoryForm && (
              <Card className="p-4 bg-gray-50">
                <div className="space-y-3">
                  <Input
                    placeholder={`Nome da nova categoria de ${transactionType}`}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleNewCategory}>
                      Criar Categoria
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCategoryForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Pagamento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações opcionais..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {transaction ? 'Atualizar' : 'Criar'} Lançamento
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
