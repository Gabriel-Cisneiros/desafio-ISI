'use client';

import { useState } from 'react';
import { CircleAlert, Lock, TriangleAlert } from 'lucide-react';
import { cn } from 'cn';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ConditionBadge } from '@/components/shared/condition-badge';
import { PlayerSummary } from '@/components/shared/player-summary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useApiAction } from '@/hooks/use-api-action';
import { useApiQuery } from '@/hooks/use-api-query';
import { lineupsService } from '@/lib/api/services/lineups';
import { playersService } from '@/lib/api/services/players';
import type { Club } from '@/lib/api/types/club';
import { CONDITIONS, type Condition } from '@/lib/api/types/enums';
import type { Player } from '@/lib/api/types/player';
import { formatMoney } from '@/lib/format';
import { CONDITION_LABELS } from '@/lib/labels';

const DESCRIPTIONS: Record<Condition, string> = {
  APTO: 'Sem desconto por condição.',
  MAL_CONDICIONADO:
    'Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.',
  DOENTE: 'Desconto de 30%, com o mesmo ajuste de agilidade.',
};

const REQUIRED_MESSAGE = 'Escolha a nova condição.';

interface ChangeConditionDialogProps {
  player: Player | undefined;
  club: Club | undefined;
  onClose: () => void;
}

export function ChangeConditionDialog({
  player,
  club,
  onClose,
}: ChangeConditionDialogProps) {
  return (
    player && (
      <ConditionForm
        key={player.id}
        player={player}
        club={club}
        onClose={onClose}
      />
    )
  );
}

function ConditionForm({
  player,
  club,
  onClose,
}: ChangeConditionDialogProps & { player: Player }) {
  const [condition, setCondition] = useState<Condition>();
  const [error, setError] = useState<string>();
  const lineup = useApiQuery(
    ['lineup', player.club_id],
    () => lineupsService.get(player.club_id!),
    player.club_id !== null,
  );
  const starter =
    lineup.data?.players.some((item) => item.id === player.id) ?? false;
  const update = useApiAction(
    (next: Condition) => playersService.updateCondition(player.id, next),
    {
      errorTitle: 'Não foi possível alterar a condição',
      success: (saved) => ({
        title: 'Condição alterada',
        description: `${saved.name} agora está ${CONDITION_LABELS[saved.condition]}. Valor de mercado: ${formatMoney(saved.market_value)}.`,
      }),
      onSuccess: onClose,
    },
  );

  function choose(next: Condition) {
    setCondition(next);
    setError(undefined);
  }

  function save() {
    if (!condition) {
      setError(REQUIRED_MESSAGE);
      return;
    }
    void update.run(condition);
  }

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Alterar condição física"
      description="A condição muda o desconto do valor de mercado, recalculado ao salvar."
      confirmLabel="Salvar condição"
      pending={update.pending}
      onConfirm={save}
      className="sm:max-w-130"
    >
      <PlayerSummary
        player={player}
        aside={<ConditionBadge condition={player.condition} />}
      />
      <div
        role="radiogroup"
        aria-label="Nova condição"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'condition-error' : undefined}
        className="flex flex-col gap-2"
      >
        {CONDITIONS.map((value) => {
          const current = value === player.condition;
          const blocked = value === 'APTO' && player.condition === 'DOENTE';
          const selected = value === condition;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={current || blocked}
              onClick={() => choose(value)}
              className={cn(
                'flex items-start gap-3 rounded-lg border bg-background px-4 py-3 text-left transition-colors outline-none hover:bg-muted-subtle focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none',
                selected &&
                  'border-primary bg-primary-soft hover:bg-primary-soft',
                error && !current && !blocked && 'border-destructive',
                blocked && 'opacity-60',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-input',
                  selected && 'border-primary',
                )}
              >
                {selected && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </span>
              <span className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-medium">
                  {CONDITION_LABELS[value]}
                  {current && <Badge variant="secondary">Atual</Badge>}
                </span>
                <span className="text-xs text-muted-foreground">
                  {DESCRIPTIONS[value]}
                </span>
                {blocked && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3" />
                    De Doente não passa direto para Apto.
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p
          id="condition-error"
          className="-mt-3 flex items-start gap-1.5 text-xs text-destructive"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}
      {starter && condition === 'DOENTE' && (
        <Alert variant="warning">
          <TriangleAlert />
          <AlertTitle>{player.name} é titular</AlertTitle>
          <AlertDescription>
            Ao passar a Doente, ele sai da escalação, e o{' '}
            {club?.name ?? 'clube'} só volta a jogar partidas depois de escalar
            de novo os 5 titulares.
          </AlertDescription>
        </Alert>
      )}
    </ConfirmDialog>
  );
}
