'use client';

import { Formik } from 'formik';
import { Lock, User } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useApiAction } from '@/hooks/use-api-action';
import { playersService } from '@/lib/api/services/players';
import type { Player, UpdatePlayerBody } from '@/lib/api/types/player';
import { formatMoney } from '@/lib/format';
import { FormDialogBody } from './form-dialog-body';
import { PositionField, TextField } from './player-fields';
import {
  type PlayerFormValues,
  editPlayerSchema,
  editValues,
  toUpdateBody,
} from './player-schema';

interface EditPlayerDialogProps {
  player: Player | undefined;
  onClose: () => void;
}

export function EditPlayerDialog({ player, onClose }: EditPlayerDialogProps) {
  const update = useApiAction(
    (id: number, body: UpdatePlayerBody) => playersService.update(id, body),
    {
      errorTitle: 'Não foi possível salvar as alterações',
      success: (saved) => ({
        title: 'Jogador atualizado',
        description: `As alterações de ${saved.name} foram salvas.`,
      }),
      onSuccess: onClose,
    },
  );

  return (
    <Dialog
      open={player !== undefined}
      onOpenChange={(open) => !open && !update.pending && onClose()}
    >
      <DialogContent
        showCloseButton={!update.pending}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-140"
      >
        {player && (
          <Formik<PlayerFormValues>
            initialValues={editValues(player)}
            validationSchema={editPlayerSchema(player.age)}
            onSubmit={async (values) => {
              await update.run(player.id, toUpdateBody(values));
            }}
          >
            <FormDialogBody
              title="Editar jogador"
              description="Edite nome, posição, idade e agilidade. Os demais dados não mudam."
              submitLabel="Salvar alterações"
              pending={update.pending}
              onCancel={onClose}
            >
              <TextField
                name="name"
                label="Nome"
                icon={User}
                maxLength={100}
                helper="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
              />
              <PositionField locked={player.club_id !== null} />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="age"
                  label="Idade"
                  numeric
                  helper={`De 16 a 45, sem diminuir (atual: ${player.age}).`}
                />
                <TextField
                  name="agility"
                  label="Agilidade"
                  numeric
                  helper="De 1 a 100 (até 85 com 35 anos ou mais)."
                />
              </div>
              <p className="flex items-center gap-2 rounded-lg border border-dashed bg-muted-subtle px-3 py-2.5 text-xs text-muted-foreground">
                <Lock className="size-3.5 shrink-0" />
                Não mudam depois do cadastro: valor base (
                {formatMoney(player.base_value)}), indicadores e potencial.
              </p>
            </FormDialogBody>
          </Formik>
        )}
      </DialogContent>
    </Dialog>
  );
}
