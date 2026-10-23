'use client';

import { type MouseEvent, useState } from 'react';
import { Formik, useField } from 'formik';
import {
  CalendarDays,
  CircleAlert,
  Clock,
  Info,
  RefreshCw,
  Shield,
  ShoppingCart,
} from 'lucide-react';
import { FormDialogBody } from '@/components/shared/form-dialog-body';
import { FormField, fieldDescribedBy } from '@/components/shared/form-field';
import { useShownError } from '@/components/shared/formik-text-field';
import { PlayerSummary } from '@/components/shared/player-summary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApiAction } from '@/hooks/use-api-action';
import { isOfflineError } from '@/lib/api/errors';
import { marketService } from '@/lib/api/services/market';
import type { Club } from '@/lib/api/types/club';
import type { BuyPlayerBody, PurchaseResult } from '@/lib/api/types/market';
import type { Player } from '@/lib/api/types/player';
import { formatMoney } from '@/lib/format';
import {
  type BuyFormValues,
  EMPTY_BUY_VALUES,
  buySchema,
  toBuyBody,
} from './buy-schema';

interface BuyError {
  offline: boolean;
  message: string;
}

export interface Purchase {
  result: PurchaseResult;
  player: Player;
  club: Club;
}

interface BuyPlayerDialogProps {
  player: Player | undefined;
  clubs: Club[];
  onClose: () => void;
  onBought: (purchase: Purchase) => void;
}

export function BuyPlayerDialog({
  player,
  clubs,
  onClose,
  onBought,
}: BuyPlayerDialogProps) {
  const [error, setError] = useState<BuyError>();
  const buy = useApiAction(
    (target: Player, body: BuyPlayerBody) => marketService.buy(target.id, body),
    {
      errorTitle: 'Compra recusada',
      onError: (message, cause) =>
        setError({ offline: isOfflineError(cause), message }),
    },
  );

  function close() {
    setError(undefined);
    onClose();
  }

  return (
    <Dialog
      open={player !== undefined}
      onOpenChange={(open) => !open && !buy.pending && close()}
    >
      <DialogContent showCloseButton={!buy.pending} className="sm:max-w-140">
        {player && (
          <Formik<BuyFormValues>
            initialValues={EMPTY_BUY_VALUES}
            validationSchema={buySchema}
            onSubmit={async (values) => {
              setError(undefined);
              const body = toBuyBody(values);
              const result = await buy.run(player, body);
              const club = clubs.find(({ id }) => id === body.club_id);
              if (result && club) {
                setError(undefined);
                onBought({ result, player, club });
              }
            }}
          >
            <FormDialogBody
              title="Comprar jogador"
              description="Escolha o clube comprador e até quando vai a fidelidade do contrato."
              submitLabel={
                buy.pending
                  ? 'Comprando…'
                  : error?.offline
                    ? 'Tentar de novo'
                    : 'Confirmar compra'
              }
              submitIcon={error?.offline ? RefreshCw : ShoppingCart}
              pending={buy.pending}
              onCancel={close}
              alert={
                error && (
                  <Alert variant="destructive">
                    <CircleAlert />
                    <AlertTitle>
                      {error.offline ? 'Sem conexão' : 'Compra recusada'}
                    </AlertTitle>
                    <AlertDescription>
                      {error.offline
                        ? 'A compra não foi confirmada. Verifique a conexão e tente de novo.'
                        : error.message}
                    </AlertDescription>
                  </Alert>
                )
              }
            >
              <PlayerSummary
                player={player}
                aside={
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Valor de mercado
                    </span>
                    <span className="text-lg font-semibold">
                      {formatMoney(player.market_value)}
                    </span>
                  </span>
                }
              />
              <ClubField clubs={clubs} />
              <LoyaltyField />
              <p className="flex items-start gap-2 rounded-lg border bg-muted-subtle px-3 py-2.5 text-xs text-muted-foreground">
                <Info className="mt-px size-3.5 shrink-0" />A taxa é de 5% do
                valor de mercado, só quando ele passa de {formatMoney(30)}.
                Taxa, custo e novo caixa são calculados ao confirmar.
              </p>
              {buy.pending && (
                <p className="flex items-center gap-2 rounded-lg border bg-muted-subtle px-3 py-2 text-xs text-muted-foreground">
                  <Info className="size-3.5 shrink-0" />
                  Enviando a compra. Os botões ficam desabilitados até a
                  resposta.
                </p>
              )}
            </FormDialogBody>
          </Formik>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ClubField({ clubs }: { clubs: Club[] }) {
  const [field, , helpers] = useField<string>('clubId');
  const error = useShownError('clubId');
  const selected = clubs.find(({ id }) => String(id) === field.value);
  const helper = selected
    ? `Caixa atual: ${formatMoney(selected.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
    : 'O custo total (valor + taxa) pode ir até 50% do caixa do clube.';

  return (
    <FormField
      id="buy-club"
      label="Clube comprador"
      error={error}
      helper={helper}
    >
      <Select value={field.value} onValueChange={helpers.setValue}>
        <SelectTrigger
          id="buy-club"
          className="w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={fieldDescribedBy('buy-club', { error, helper })}
        >
          <Shield className="text-muted-foreground" />
          <SelectValue placeholder="Escolha o clube" />
        </SelectTrigger>
        <SelectContent>
          {clubs.map((club) => (
            <SelectItem key={club.id} value={String(club.id)}>
              {club.name} ({club.acronym}) · caixa {formatMoney(club.cash)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

const PICKER_INPUT = 'pl-9 [&::-webkit-calendar-picker-indicator]:hidden';

function openPicker(event: MouseEvent<HTMLInputElement>) {
  event.currentTarget.showPicker?.();
}

function LoyaltyField() {
  const [date] = useField<string>('date');
  const [time] = useField<string>('time');
  const dateError = useShownError('date');
  const timeError = useShownError('time');
  const error = dateError ?? timeError;
  const helper =
    'Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso (-03:00).';
  const describedBy = fieldDescribedBy('buy-date', { error, helper });

  return (
    <FormField
      id="buy-date"
      label="Fim da fidelidade"
      error={error}
      helper={helper}
    >
      <div className="grid grid-cols-[1fr_8rem] gap-2">
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="buy-date"
            type="date"
            {...date}
            onClick={openPicker}
            className={PICKER_INPUT}
            aria-invalid={Boolean(dateError)}
            aria-describedby={describedBy}
          />
        </div>
        <div className="relative">
          <Clock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="buy-time"
            type="time"
            aria-label="Hora do fim da fidelidade"
            {...time}
            onClick={openPicker}
            className={PICKER_INPUT}
            aria-invalid={Boolean(timeError)}
            aria-describedby={describedBy}
          />
        </div>
      </div>
    </FormField>
  );
}
