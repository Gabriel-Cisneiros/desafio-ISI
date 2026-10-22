'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik } from 'formik';
import { CircleAlert, Shield, Wallet } from 'lucide-react';
import { FormDialogBody } from '@/components/shared/form-dialog-body';
import { FormikTextField } from '@/components/shared/formik-text-field';
import { clubPath } from '@/components/layout/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useApiAction } from '@/hooks/use-api-action';
import { clubsService } from '@/lib/api/services/clubs';
import { formatMoney } from '@/lib/format';
import {
  type ClubFormValues,
  EMPTY_CLUB_VALUES,
  clubSchema,
  toClubBody,
} from './club-schema';

const ERROR_TITLE = 'Não foi possível criar o clube';
const INITIAL_CASH = 300;

function apiErrorField(message: string): keyof ClubFormValues | undefined {
  if (/sigla/i.test(message)) {
    return 'acronym';
  }
  return /nome/i.test(message) ? 'name' : undefined;
}

interface CreateClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClubDialog({
  open,
  onOpenChange,
}: CreateClubDialogProps) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string>();
  const create = useApiAction(clubsService.create, {
    errorTitle: ERROR_TITLE,
    onError: setApiError,
    success: (club) => ({
      title: 'Clube criado',
      description: `${club.name} (${club.acronym}) começa com ${formatMoney(club.cash)} em caixa.`,
    }),
    onSuccess: (club) => router.push(clubPath(club.id)),
  });
  const apiField = apiError && apiErrorField(apiError);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (create.pending) {
          return;
        }
        setApiError(undefined);
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!create.pending} className="sm:max-w-120">
        <Formik<ClubFormValues>
          initialValues={EMPTY_CLUB_VALUES}
          validationSchema={clubSchema}
          onSubmit={async (values) => {
            setApiError(undefined);
            await create.run(toClubBody(values));
          }}
        >
          <FormDialogBody
            title="Novo clube"
            description="Informe o nome e a sigla do clube."
            submitLabel="Criar clube"
            pending={create.pending}
            onCancel={() => {
              setApiError(undefined);
              onOpenChange(false);
            }}
            alert={
              apiError && (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertTitle>{ERROR_TITLE}</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )
            }
          >
            <FormikTextField
              id="club-name"
              name="name"
              label="Nome"
              icon={Shield}
              maxLength={60}
              invalid={apiField === 'name'}
              helper="De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
            />
            <FormikTextField
              id="club-acronym"
              name="acronym"
              label="Sigla"
              maxLength={3}
              invalid={apiField === 'acronym'}
              transform={(value) => value.toUpperCase()}
              helper="3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
            />
            <p className="flex items-center gap-2 rounded-lg border bg-muted-subtle px-3 py-2.5 text-muted-foreground">
              <Wallet className="size-4 shrink-0" />O clube começa com{' '}
              {formatMoney(INITIAL_CASH)} em caixa e sem jogadores.
            </p>
          </FormDialogBody>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
