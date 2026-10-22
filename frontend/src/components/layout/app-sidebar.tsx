'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useClubs } from '@/hooks/data/clubs';
import { useMatches } from '@/hooks/data/league';
import { usePlayers } from '@/hooks/data/players';
import { ClubLetter } from './club-letter';
import { LeagueSummary } from './league-summary';
import {
  NAV_GROUPS,
  type NavCount,
  clubPath,
  isActivePath,
} from './navigation';

const PLAYERS_COUNT_QUERY = { limit: 1 };

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const players = usePlayers(PLAYERS_COUNT_QUERY);
  const clubs = useClubs();
  const matches = useMatches();

  const counts: Record<NavCount, number | undefined> = {
    players: players.data?.meta.total_items,
    clubs: clubs.data?.length,
    matches: matches.data?.length,
  };
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-15 flex-row items-center gap-2.5 px-4 group-data-[collapsible=icon]:px-2">
        <Image
          src="/logo.svg"
          alt=""
          width={32}
          height={32}
          className="shrink-0"
          priority
        />
        <div className="group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-semibold">Passe</p>
          <p className="text-xs text-muted-foreground">Gestão da liga</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map(({ label, href, icon: Icon, count }) => {
                const active = isActivePath(pathname, href);
                const value = count ? counts[count] : undefined;

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                    >
                      <Link
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeMobile}
                      >
                        <Icon aria-hidden />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {value !== undefined && (
                      <SidebarMenuBadge className="text-muted-foreground">
                        {value}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Clubes</SidebarGroupLabel>
          <SidebarGroupAction asChild title="Novo clube">
            <Link href="/clubes" onClick={closeMobile}>
              <Plus />
              <span className="sr-only">Novo clube</span>
            </Link>
          </SidebarGroupAction>
          <SidebarMenu>
            {clubs.data?.map((club) => {
              const href = clubPath(club.id);
              const active = isActivePath(pathname, href);

              return (
                <SidebarMenuItem key={club.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={club.name}
                  >
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      onClick={closeMobile}
                    >
                      <ClubLetter name={club.name} active={active} />
                      <span>{club.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <LeagueSummary
          clubs={counts.clubs}
          players={counts.players}
          lastMatch={matches.data ? (matches.data[0] ?? null) : undefined}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
