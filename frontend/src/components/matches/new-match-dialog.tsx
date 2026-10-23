'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, useField } from 'formik';
import { CircleAlert, Info, Shield, Swords } from 'lucide-react';
import { object, string } from 'yup';
import { FormDialogBody } from '@/components/shared/form-dialog-body';
import { FormField, fieldDescribedBy } from '@/components/shared/form-field';
import { useShownError } from '@/components/shared/formik-text-field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApiAction } from '@/hooks/use-api-action';
import { matchesService } from '@/lib/api/services/matches';
import type { Club } from '@/lib/api/types/club';

const ERROR_TITLE = 'Não foi possível jogar a partida';

interface NewMatchValues {
  home: string;
  away: string;
}

const EMPTY_VALUES: NewMatchValues = { home: '', away: '' };

const schema = object({
  home: string().required('Escolha o mandante.'),
  away: string()
    .required('Escolha o visitante.')
    .test(
      'different',
      'Escolha um clube diferente do mandante.',
      (value, context) => value !== context.parent.home,
    ),
});

interface NewMatchDialogProps {
  open: boolean;
  clubs: Club[];
  onOpenChange: (open: boolean) => void;
}

export function NewMatchDialog({
  open,
  clubs,
  onOpenChange,
}: NewMatchDialogProps) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string>();
  const play = useApiAction(matchesService.create, {
    errorTitle: ERROR_TITLE,
    onError: setApiError,
    success: (match) => ({
      title: 'Partida jogada',
      description: `${match.home.club_name} ${match.home.goals} × ${match.away.goals} ${match.away.club_name}. Placar e duelos devolvidos pela API.`,
    }),
    onSuccess: (match) => router.push(`/partidas/${match.id}`),
  });

  function close() {
    setApiError(undefined);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !play.pending && close()}
    >
      <DialogContent showCloseButton={!play.pending} className="sm:max-w-130">
        <Formik<NewMatchValues>
          initialValues={EMPTY_VALUES}
          validationSchema={schema}
          onSubmit={async (values) => {
            setApiError(undefined);
            await play.run({
              home_club_id: Number(values.home),
              away_club_id: Number(values.away),
            });
          }}
        >
          {({ values }) => {
            const clubName = (id: string) =>
              clubs.find((club) => String(club.id) === id)?.name;
            const homeName = clubName(values.home);
            const awayName = clubName(values.away);
            const invalidField =
              apiError && homeName && apiError.includes(homeName)
                ? 'home'
                : apiError && awayName && apiError.includes(awayName)
                  ? 'away'
                  : undefined;
            return (
              <FormDialogBody
                title="Nova partida"
                description="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
                submitLabel="Jogar partida"
                submitIcon={Swords}
                pending={play.pending}
                onCancel={close}
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
                <ClubSelect
                  name="home"
                  label="Mandante"
                  helper="Faz os 3 primeiros ataques."
                  clubs={clubs}
                  invalid={invalidField === 'home'}
                />
                <ClubSelect
                  name="away"
                  label="Visitante"
                  helper="Precisa ser um clube diferente do mandante."
                  clubs={clubs}
                  invalid={invalidField === 'away'}
                />
                <div className="flex flex-col gap-2 rounded-lg border bg-muted-subtle px-4 py-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Info className="size-4" />
                    Como sai o placar
                  </span>
                  <p>
                    Cada time faz 3 ataques. Pela ordem do elenco, os jogadores
                    de linha vão do 1º (o mais recuado) ao 4º (o mais avançado):
                    o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta
                    o 2º do adversário. O atacante usa finalização (ATA), passe
                    (MEI) ou drible (ZAG e LAT), e quem defende usa defesa. É
                    gol só quando o ataque é maior; mal condicionado joga com
                    15% a menos.
                  </p>
                  <p>
                    Os dois clubes precisam ter os 5 titulares escalados. A
                    partida não mexe no caixa.
                  </p>
                </div>
              </FormDialogBody>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

function ClubSelect({
  name,
  label,
  helper,
  clubs,
  invalid,
}: {
  name: keyof NewMatchValues;
  label: string;
  helper: string;
  clubs: Club[];
  invalid: boolean;
}) {
  const [field, , helpers] = useField<string>(name);
  const error = useShownError(name);
  const id = `match-${name}`;

  return (
    <FormField id={id} label={label} error={error} helper={helper}>
      <Select value={field.value} onValueChange={helpers.setValue}>
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={Boolean(error) || invalid}
          aria-describedby={fieldDescribedBy(id, { error, helper })}
        >
          <Shield className="text-muted-foreground" />
          <SelectValue placeholder="Escolha o clube" />
        </SelectTrigger>
        <SelectContent>
          {clubs.map((club) => (
            <SelectItem key={club.id} value={String(club.id)}>
              {club.name} ({club.acronym})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
