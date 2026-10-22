import type { LucideIcon } from 'lucide-react';
import { ListOrdered, Shield, Swords, Users } from 'lucide-react';

export type NavCount = 'players' | 'clubs' | 'matches';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: NavCount;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Mercado',
    items: [
      { label: 'Jogadores', href: '/jogadores', icon: Users, count: 'players' },
      { label: 'Clubes', href: '/clubes', icon: Shield, count: 'clubs' },
    ],
  },
  {
    label: 'Liga',
    items: [
      { label: 'Partidas', href: '/partidas', icon: Swords, count: 'matches' },
      { label: 'Classificação', href: '/classificacao', icon: ListOrdered },
    ],
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function clubPath(id: number): string {
  return `/clubes/${id}`;
}

export interface Crumb {
  label: string;
  href?: string;
}

export function getBreadcrumbs(pathname: string, clubName?: string): Crumb[] {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.href) {
        return [{ label: group.label }, { label: item.label }];
      }
      if (pathname.startsWith(`${item.href}/`)) {
        return [
          { label: group.label },
          { label: item.label, href: item.href },
          ...(clubName ? [{ label: clubName }] : []),
        ];
      }
    }
  }
  return [];
}
