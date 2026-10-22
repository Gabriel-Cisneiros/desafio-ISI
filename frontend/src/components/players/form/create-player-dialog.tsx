'use client';

import { Formik } from 'formik';
import { Info, User } from 'lucide-react';
import { FormDialogBody } from '@/components/shared/form-dialog-body';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useApiAction } from '@/hooks/use-api-action';
import { playersService } from '@/lib/api/services/players';
import type { Player } from '@/lib/api/types/player';
import { AttributesPreview } from './attributes-preview';
import { LockedField, PositionField, TextField } from './player-fields';
import {
  ATTRIBUTE_FIELDS,
  type CreatePlayerFormValues,
  EMPTY_CREATE_VALUES,
  createPlayerSchema,
  toCreateBody,
} from './player-schema';

interface CreatePlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (player: Player) => void;
}

export function CreatePlayerDialog({
  open,
  onOpenChange,
  onCreated,
}: CreatePlayerDialogProps) {
  const create = useApiAction(playersService.create, {
    errorTitle: 'Não foi possível cadastrar o jogador',
    onSuccess: onCreated,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !create.pending && onOpenChange(next)}
    >
      <DialogContent
        showCloseButton={!create.pending}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-213"
      >
        <Formik<CreatePlayerFormValues>
          initialValues={EMPTY_CREATE_VALUES}
          validationSchema={createPlayerSchema}
          onSubmit={async (values) => {
            await create.run(toCreateBody(values));
          }}
        >
          <FormDialogBody
            title="Novo jogador"
            description="Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar."
            submitLabel="Salvar jogador"
            pending={create.pending}
            onCancel={() => onOpenChange(false)}
            note={
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="size-3.5" />O jogador começa livre e Apto.
              </span>
            }
          >
            <TextField
              name="name"
              label="Nome"
              icon={User}
              maxLength={100}
              helper="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
            />
            <PositionField />
            <div className="grid grid-cols-3 gap-4">
              <TextField
                name="age"
                label="Idade"
                numeric
                helper="De 16 a 45 anos."
              />
              <TextField
                name="agility"
                label="Agilidade"
                numeric
                helper="De 1 a 100 (até 85 com 35 anos ou mais)."
              />
              <LockedField
                label="Valor base (moedas)"
                helper="Calculado no cadastro."
              />
            </div>

            <Separator />

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">Indicadores técnicos</h3>
                <p className="text-muted-foreground">
                  Seis atributos e o potencial, de 1 a 99. Não mudam depois do
                  cadastro; a soma dos seis atributos não pode passar de 480.
                </p>
              </div>
              <div className="grid grid-cols-[1fr_15rem] items-start gap-5">
                <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                  {ATTRIBUTE_FIELDS.map(({ key, label }) => (
                    <TextField key={key} name={key} label={label} numeric />
                  ))}
                  <TextField
                    name="potential"
                    label="Potencial"
                    numeric
                    helper="Maior ou igual ao maior atributo; igual a ele com mais de 33 anos"
                  />
                  <LockedField
                    label="Overall"
                    helper="Calculado automaticamente"
                  />
                </div>
                <AttributesPreview />
              </div>
            </section>
          </FormDialogBody>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
