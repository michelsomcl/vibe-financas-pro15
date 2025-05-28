
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Edit, Trash2 } from "lucide-react";
import { PayableAccount } from "@/types";

interface PayableActionsProps {
  payable: PayableAccount;
  onMarkAsPaid: (payable: PayableAccount) => void;
  onMarkAsUnpaid: (payable: PayableAccount) => void;
  onEdit: (payable: PayableAccount) => void;
  onDelete: (id: string) => void;
}

export default function PayableActions({
  payable,
  onMarkAsPaid,
  onMarkAsUnpaid,
  onEdit,
  onDelete
}: PayableActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {!payable.isPaid ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkAsPaid(payable)}
          className="text-green-600 hover:text-green-700"
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkAsUnpaid(payable)}
          className="text-orange-600 hover:text-orange-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(payable)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(payable.id)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
