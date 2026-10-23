import { cn } from 'cn';
import { FORMATIONS, type Formation } from '@/lib/api/types/enums';
import { FORMATION_DESCRIPTIONS, sectorRows } from './lineup-rules';

function FormationThumbnail({ formation }: { formation: Formation }) {
  return (
    <span
      aria-hidden
      className="flex h-10 w-8 shrink-0 flex-col justify-around rounded-sm bg-pitch py-1"
    >
      {sectorRows(formation).map(({ sector, indexes }) => (
        <span key={sector} className="flex justify-around px-1">
          {indexes.map((index) => (
            <span key={index} className="size-1.5 rounded-full bg-white" />
          ))}
        </span>
      ))}
    </span>
  );
}

interface FormationPickerProps {
  value: Formation;
  onChange: (formation: Formation) => void;
  disabled?: boolean;
}

export function FormationPicker({
  value,
  onChange,
  disabled = false,
}: FormationPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Formação"
      className="grid grid-cols-4 gap-3"
    >
      {FORMATIONS.map((formation) => {
        const selected = formation === value;
        return (
          <button
            key={formation}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(formation)}
            className={cn(
              'flex items-start gap-3 rounded-lg border bg-background p-3 text-left transition-colors outline-none hover:bg-muted-subtle focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none',
              selected &&
                'border-primary bg-primary-soft hover:bg-primary-soft',
            )}
          >
            <FormationThumbnail formation={formation} />
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 font-semibold">
                <span
                  aria-hidden
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full border border-input',
                    selected && 'border-primary',
                  )}
                >
                  {selected && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </span>
                <span
                  className={cn(selected && 'text-primary-soft-foreground')}
                >
                  {formation}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {FORMATION_DESCRIPTIONS[formation]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
