'use client';

import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { useApiAction } from '@/hooks/use-api-action';
import { playersService } from '@/lib/api/services/players';
import type { Player } from '@/lib/api/types/player';
import { PlayerSummary } from './player-summary';

interface DeletePlayerDialogProps {
  player: Player | undefined;
  onClose: () => void;
}

export function DeletePlayerDialog({
  player,
  onClose,
}: DeletePlayerDialogProps) {
  const remove = useApiAction(
    async (target: Player) => {
      await playersService.remove(target.id);
      return target;
    },
    {
      errorTitle: 'Não foi possível excluir o jogador',
      success: (removed) => ({
        title: 'Jogador excluído',
        description: `${removed.name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
      }),
      onSuccess: onClose,
    },
  );

  return (
    <ConfirmDialog
      open={player !== undefined}
      onOpenChange={(open) => !open && onClose()}
      title={`Excluir ${player?.name ?? 'jogador'}?`}
      description="O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas."
      confirmLabel="Excluir jogador"
      confirmIcon={Trash2}
      variant="destructive"
      pending={remove.pending}
      onConfirm={() => player && void remove.run(player)}
      className="sm:max-w-115"
    >
      {player && (
        <PlayerSummary
          player={player}
          aside={<Badge variant="secondary">Livre</Badge>}
        />
      )}
    </ConfirmDialog>
  );
}
