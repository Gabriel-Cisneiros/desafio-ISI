import type { LucideIcon } from 'lucide-react';
import { ListOrdered, Shield, Swords, Users } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Mercado',
    items: [
      { label: 'Jogadores', href: '/jogadores', icon: Users },
      { label: 'Clubes', href: '/clubes', icon: Shield },
    ],
  },
  {
    label: 'Liga',
    items: [
      { label: 'Partidas', href: '/partidas', icon: Swords },
      { label: 'Classificação', href: '/classificacao', icon: ListOrdered },
    ],
  },
];
