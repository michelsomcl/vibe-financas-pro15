
import { 
  Home, 
  CreditCard, 
  FolderOpen, 
  Users, 
  FileText, 
  FileCheck, 
  TrendingUp 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Contas",
    url: "/accounts",
    icon: CreditCard,
  },
  {
    title: "Categorias",
    url: "/categories",
    icon: FolderOpen,
  },
  {
    title: "Clientes/Fornecedores",
    url: "/clients-suppliers",
    icon: Users,
  },
  {
    title: "Contas a Pagar",
    url: "/payables",
    icon: FileText,
  },
  {
    title: "Contas a Receber",
    url: "/receivables",
    icon: FileCheck,
  },
  {
    title: "Lançamentos",
    url: "/transactions",
    icon: TrendingUp,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-primary">Vibe Finanças</h1>
            <p className="text-xs text-gray-500">Pro</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-tertiary font-medium">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`${
                      location.pathname === item.url 
                        ? 'bg-primary text-white hover:bg-primary hover:text-white' 
                        : 'text-tertiary hover:bg-gray-50'
                    }`}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
