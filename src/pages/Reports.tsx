
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountsReport from "@/components/reports/AccountsReport";
import CategoriesReport from "@/components/reports/CategoriesReport";
import ClientsSuppliersReport from "@/components/reports/ClientsSuppliersReport";
import PayablesReport from "@/components/reports/PayablesReport";
import ReceivablesReport from "@/components/reports/ReceivablesReport";
import TransactionsReport from "@/components/reports/TransactionsReport";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-tertiary">Relatórios</h1>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="clients-suppliers">Clientes/Fornecedores</TabsTrigger>
          <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
          <TabsTrigger value="transactions">Lançamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountsReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoriesReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients-suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Clientes/Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientsSuppliersReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <PayablesReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <ReceivablesReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsReport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
