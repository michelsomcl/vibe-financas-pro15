
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PayableAccount } from "@/types";

interface PayableStatusBadgeProps {
  payable: PayableAccount;
}

export default function PayableStatusBadge({ payable }: PayableStatusBadgeProps) {
  if (payable.isPaid) {
    return <Badge variant="default" className="bg-green-500">Pago</Badge>;
  }
  
  const today = new Date();
  const dueDate = new Date(payable.dueDate);
  
  if (dueDate < today) {
    return <Badge variant="destructive">Vencido</Badge>;
  } else if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
    return <Badge variant="secondary" className="bg-yellow-500 text-white">Vence em breve</Badge>;
  } else {
    return <Badge variant="outline">Pendente</Badge>;
  }
}
