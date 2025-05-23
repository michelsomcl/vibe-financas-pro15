
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FinanceProvider } from "@/contexts/FinanceContext";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import ClientsSuppliers from "./pages/ClientsSuppliers";
import Payables from "./pages/Payables";
import Receivables from "./pages/Receivables";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FinanceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gray-50">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-6">
                  <SidebarTrigger className="mb-4" />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/clients-suppliers" element={<ClientsSuppliers />} />
                    <Route path="/payables" element={<Payables />} />
                    <Route path="/receivables" element={<Receivables />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </FinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
