'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useClubs } from '@/hooks/data/clubs';
import { useRefreshStore } from '@/stores/refresh-store';
import { getBreadcrumbs } from './navigation';

const CLUB_PATH = /^\/clubes\/(\d+)$/;
const HEADER_CLASS = 'flex h-14 shrink-0 items-center gap-3 border-b px-4';

export function AppHeaderFallback() {
  return <header className={HEADER_CLASS} />;
}

export function AppHeader() {
  const pathname = usePathname();
  const refresh = useRefreshStore((state) => state.refresh);
  const clubId = CLUB_PATH.exec(pathname)?.[1];
  const clubs = useClubs({}, clubId !== undefined);
  const clubName = clubs.data
    ? (clubs.data.find((club) => String(club.id) === clubId)?.name ??
      `Clube ${clubId}`)
    : undefined;
  const crumbs = getBreadcrumbs(pathname, clubName);

  return (
    <header className={HEADER_CLASS}>
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        className="data-vertical:h-4 data-vertical:self-center"
      />
      <nav aria-label="Você está em" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li
                key={`${crumb.label}-${index}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                {index > 0 && (
                  <ChevronRight
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
                )}
                {crumb.href && !last ? (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={
                      last
                        ? 'truncate text-foreground'
                        : 'text-muted-foreground'
                    }
                    aria-current={last ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={refresh}
        title="Recarregar dados"
      >
        <RefreshCw />
        <span className="sr-only">Recarregar dados</span>
      </Button>
    </header>
  );
}
