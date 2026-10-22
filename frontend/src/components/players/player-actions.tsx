'use client';

import {
  Ellipsis,
  Eye,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Player } from '@/lib/api/types/player';

export interface PlayerActionHandlers {
  onDetails: (player: Player) => void;
  onEdit: (player: Player) => void;
  onChangeCondition: (player: Player) => void;
  onBuy: (player: Player) => void;
  onDelete: (player: Player) => void;
}

interface PlayerActionsProps extends PlayerActionHandlers {
  player: Player;
}

export function BuyButton({
  player,
  onBuy,
}: {
  player: Player;
  onBuy: (player: Player) => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={() => onBuy(player)}>
      <ShoppingCart data-icon="inline-start" />
      Comprar
    </Button>
  );
}

export function PlayerActions({
  player,
  onDetails,
  onEdit,
  onChangeCondition,
  onBuy,
  onDelete,
}: PlayerActionsProps) {
  const free = player.club_id === null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Ellipsis />
          <span className="sr-only">Ações de {player.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{player.name}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onDetails(player)}>
            <Eye />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onEdit(player)}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onChangeCondition(player)}>
            <HeartPulse />
            Alterar condição
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {free && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onBuy(player)}>
              <ShoppingCart />
              Comprar
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={!free}
          onSelect={() => onDelete(player)}
          className="flex-col items-start gap-1"
        >
          <span className="flex items-center gap-1.5">
            <Trash2 />
            Excluir
          </span>
          <span className="pl-5.5 text-xs text-muted-foreground">
            {free
              ? 'Disponível porque o jogador está livre.'
              : 'Venda o jogador antes de excluir.'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
