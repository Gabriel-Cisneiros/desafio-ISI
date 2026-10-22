'use client';

import { useFormikContext } from 'formik';
import { ChartBar } from 'lucide-react';
import {
  ATTRIBUTE_FIELDS,
  ATTRIBUTE_RANGE,
  type CreatePlayerFormValues,
  isInRange,
  parseInteger,
} from './player-schema';

const percent = (value: number) => `${(value / ATTRIBUTE_RANGE.max) * 100}%`;

function validValue(text: string): number | undefined {
  return isInRange(text, ATTRIBUTE_RANGE) ? parseInteger(text) : undefined;
}

export function AttributesPreview() {
  const { values, errors, submitCount } =
    useFormikContext<CreatePlayerFormValues>();
  const potential = validValue(values.potential);
  const hasShownError =
    submitCount > 0 &&
    [...ATTRIBUTE_FIELDS.map(({ key }) => key), 'potential' as const].some(
      (key) => errors[key],
    );

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted-subtle p-3">
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <ChartBar className="size-4" />
        Prévia dos atributos
      </span>
      {hasShownError ? (
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center text-xs text-muted-foreground">
          <ChartBar className="size-6 opacity-40" />
          Corrija os valores destacados para ver a prévia.
        </div>
      ) : (
        <>
          <dl className="flex flex-col gap-2">
            {ATTRIBUTE_FIELDS.map(({ key, label }) => {
              const value = validValue(values[key]);
              return (
                <div key={key} className="flex items-center gap-3 text-xs">
                  <dt className="w-18 text-muted-foreground">{label}</dt>
                  <dd className="relative h-1.5 flex-1 rounded-full bg-muted">
                    {potential !== undefined && (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 rounded-full bg-chart-2"
                        style={{ width: percent(potential) }}
                      />
                    )}
                    {value !== undefined && (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 rounded-full bg-chart-1"
                        style={{ width: percent(value) }}
                      />
                    )}
                  </dd>
                  <dd className="w-5 text-right font-medium">{value ?? '–'}</dd>
                </div>
              );
            })}
          </dl>
          <p className="text-xs text-muted-foreground">
            Faixa clara: até o potencial
            {potential !== undefined && ` (${potential})`}. A prévia só desenha
            os valores digitados; não calcula overall nem valor base.
          </p>
        </>
      )}
    </div>
  );
}
