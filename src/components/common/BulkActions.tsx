
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onDeleteSelected: () => void;
}

export default function BulkActions({ selectedCount, onDeleteSelected }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
      <span className="text-sm">{selectedCount} itens selecionados</span>
      <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
        <Trash2 className="h-4 w-4 mr-1" />
        Excluir Selecionados
      </Button>
    </div>
  );
}
