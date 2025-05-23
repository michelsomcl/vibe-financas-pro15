
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Edit, Trash2 } from "lucide-react";
import { ReceivableAccount } from "@/types";

interface ReceivableActionsProps {
  receivable: ReceivableAccount;
  onMarkAsReceived: (receivable: ReceivableAccount) => void;
  onMarkAsNotReceived: (receivable: ReceivableAccount) => void;
  onEdit: (receivable: ReceivableAccount) => void;
  onDelete: (id: string) => void;
}

export default function ReceivableActions({
  receivable,
  onMarkAsReceived,
  onMarkAsNotReceived,
  onEdit,
  onDelete
}: ReceivableActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {!receivable.isReceived ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkAsReceived(receivable)}
          className="text-green-600 hover:text-green-700"
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkAsNotReceived(receivable)}
          className="text-orange-600 hover:text-orange-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(receivable)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(receivable.id)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
