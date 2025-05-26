import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/FinanceContext";
import { ReceivableAccount } from "@/types";

const formSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  accountId: z.string().optional(),
  value: z.string().min(1, 'Valor é obrigatório'),
  dueDate: z.date({
    required_error: "Data de vencimento é obrigatória",
  }),
  observations: z.string().optional(),
  installmentType: z.enum(['unico', 'parcelado', 'recorrente']),
  installments: z.string().optional(),
  recurrenceType: z.enum(['diario', 'semanal', 'quinzenal', 'mensal']).optional(),
  recurrenceCount: z.string().optional(),
});

interface ReceivableFormProps {
  receivable?: ReceivableAccount | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ReceivableForm({ receivable, onSubmit, onCancel }: ReceivableFormProps) {
  const { clientsSuppliers, categories, accounts, addReceivableAccount, updateReceivableAccount, addCategory, addClientSupplier } = useFinance();
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientObservations, setNewClientObservations] = useState('');

  const clients = clientsSuppliers.filter(cs => cs.type === 'cliente');
  const revenueCategories = categories.filter(cat => cat.type === 'receita');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: receivable?.clientId || '',
      categoryId: receivable?.categoryId || '',
      accountId: receivable?.accountId || '',
      value: receivable?.value.toString() || '',
      dueDate: receivable?.dueDate ? new Date(receivable.dueDate) : undefined,
      observations: receivable?.observations || '',
      installmentType: receivable?.installmentType || 'unico',
      installments: receivable?.installments?.toString() || '',
      recurrenceType: receivable?.recurrenceType || undefined,
      recurrenceCount: receivable?.recurrenceCount?.toString() || '',
    },
  });

  const installmentType = form.watch('installmentType');

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const receivableData = {
      clientId: values.clientId,
      categoryId: values.categoryId,
      accountId: values.accountId || undefined,
      value: parseFloat(values.value),
      dueDate: values.dueDate,
      observations: values.observations,
      installmentType: values.installmentType,
      installments: values.installmentType === 'parcelado' ? parseInt(values.installments || '1') : undefined,
      recurrenceType: values.installmentType === 'recorrente' ? values.recurrenceType : undefined,
      recurrenceCount: values.installmentType === 'recorrente' ? parseInt(values.recurrenceCount || '1') : undefined,
      isReceived: receivable?.isReceived || false,
      receivedDate: receivable?.receivedDate,
      parentId: receivable?.parentId,
    };

    if (receivable) {
      await updateReceivableAccount(receivable.id, receivableData);
    } else {
      await addReceivableAccount(receivableData);
    }
    
    onSubmit();
  };

  const handleNewCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory({
        name: newCategoryName.trim(),
        type: 'receita'
      });
      setNewCategoryName('');
      setShowNewCategoryForm(false);
    }
  };

  const handleNewClient = async () => {
    if (newClientName.trim()) {
      await addClientSupplier({
        name: newClientName.trim(),
        type: 'cliente',
        observations: newClientObservations.trim() || undefined
      });
      setNewClientName('');
      setNewClientObservations('');
      setShowNewClientForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowNewClientForm(!showNewClientForm)}
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta (Opcional)</FormLabel>
                <FormControl>
                  <Select value={field.value || ""} onValueChange={(value) => field.onChange(value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {account.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showNewClientForm && (
            <Card className="p-4 bg-gray-50">
              <div className="space-y-3">
                <Input
                  placeholder="Nome do novo cliente"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
                <Textarea
                  placeholder="Observações (opcional)"
                  value={newClientObservations}
                  onChange={(e) => setNewClientObservations(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={handleNewClient}>
                    Criar Cliente
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewClientForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {showNewCategoryForm && (
            <Card className="p-4 bg-gray-50">
              <div className="space-y-3">
                <Input
                  placeholder="Nome da nova categoria de receita"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
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
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Vencimento *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          
          <FormField
            control={form.control}
            name="installmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pagamento</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unico">Único</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                      <SelectItem value="recorrente">Recorrente</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {installmentType === 'parcelado' && (
            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="2"
                      placeholder="2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {installmentType === 'recorrente' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Recorrência</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a recorrência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diario">Diário</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="quinzenal">Quinzenal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrenceCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Repetições</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {receivable ? 'Atualizar' : 'Criar'} Conta a Receber
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
