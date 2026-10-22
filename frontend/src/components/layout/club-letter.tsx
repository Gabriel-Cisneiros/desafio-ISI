import { cn } from 'cn';

export function clubLetter(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .charAt(0)
    .toUpperCase();
}

export function ClubLetter({
  name,
  active = false,
}: {
  name: string;
  active?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-sm border text-[0.6875rem] font-medium',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'bg-background text-foreground',
      )}
    >
      {clubLetter(name)}
    </span>
  );
}
