
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ReceivableAccount } from "@/types";

interface ReceivableStatusBadgeProps {
  receivable: ReceivableAccount;
}

export default function ReceivableStatusBadge({ receivable }: ReceivableStatusBadgeProps) {
  if (receivable.isReceived) {
    return <Badge variant="default" className="bg-green-500">Recebido</Badge>;
  }
  
  const today = new Date();
  const dueDate = new Date(receivable.dueDate);
  
  if (dueDate < today) {
    return <Badge variant="destructive">⚠️ Vencido</Badge>;
  } else if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
    return <Badge variant="secondary" className="bg-yellow-500 text-white">Vence em breve</Badge>;
  } else {
    return <Badge variant="outline">Pendente</Badge>;
  }
}
