import {
  type Formation,
  POSITIONS,
  type Position,
} from '@/lib/api/types/enums';
import type { Player } from '@/lib/api/types/player';

export const LINEUP_SIZE = 5;
export const DEFAULT_FORMATION: Formation = '2-1-1';

type Sector = 'goalkeeper' | 'defense' | 'midfield' | 'attack';

const FORMATION_SECTORS: Record<
  Formation,
  Record<Exclude<Sector, 'goalkeeper'>, number>
> = {
  '3-1': { defense: 3, midfield: 0, attack: 1 },
  '2-2': { defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { defense: 1, midfield: 2, attack: 1 },
};

export const FORMATION_DESCRIPTIONS: Record<Formation, string> = {
  '3-1': 'Defesa 3, ataque 1',
  '2-2': 'Defesa 2, ataque 2',
  '2-1-1': 'Defesa 2, meio 1, ataque 1',
  '1-2-1': 'Defesa 1, meio 2, ataque 1',
};

const SECTOR_OF: Record<Position, Sector> = {
  GOL: 'goalkeeper',
  ZAG: 'defense',
  LAT: 'defense',
  MEI: 'midfield',
  ATA: 'attack',
};

const SECTOR_SLOTS: Record<Sector, { label: string; positions: Position[] }> = {
  goalkeeper: { label: 'Goleiro', positions: ['GOL'] },
  defense: { label: 'Defesa', positions: ['ZAG', 'LAT'] },
  midfield: { label: 'Meio', positions: ['MEI'] },
  attack: { label: 'Ataque', positions: ['ATA'] },
};

export interface LineupSlot {
  sector: Sector;
  label: string;
  positions: Position[];
}

export function formationSlots(formation: Formation): LineupSlot[] {
  const counts = FORMATION_SECTORS[formation];
  const sectors: Sector[] = [
    'goalkeeper',
    ...Array<Sector>(counts.defense).fill('defense'),
    ...Array<Sector>(counts.midfield).fill('midfield'),
    ...Array<Sector>(counts.attack).fill('attack'),
  ];
  return sectors.map((sector) => ({ sector, ...SECTOR_SLOTS[sector] }));
}

export function fillSlots(
  slots: LineupSlot[],
  players: Player[],
): (number | undefined)[] {
  const remaining = [...players];
  return slots.map((slot) => {
    const index = remaining.findIndex(
      (player) => SECTOR_OF[player.position] === slot.sector,
    );
    return index === -1 ? undefined : remaining.splice(index, 1)[0].id;
  });
}

export function sectorRows(
  formation: Formation,
): { sector: Sector; indexes: number[] }[] {
  const slots = formationSlots(formation);
  return (['attack', 'midfield', 'defense', 'goalkeeper'] as Sector[])
    .map((sector) => ({
      sector,
      indexes: slots.flatMap((slot, index) =>
        slot.sector === sector ? [index] : [],
      ),
    }))
    .filter(({ indexes }) => indexes.length > 0);
}

type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';

const ATTRIBUTE_LABELS: Record<DuelAttribute, string> = {
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
};

const ATTACK_ATTRIBUTE: Record<Position, DuelAttribute> = {
  GOL: 'defending',
  ZAG: 'dribbling',
  LAT: 'dribbling',
  MEI: 'passing',
  ATA: 'shooting',
};

const DEFENDERS = 3;
const FIRST_ATTACKER = 2;

export function orderTeam(players: Player[]): Player[] {
  return [...players].sort(
    (a, b) =>
      POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position) ||
      a.name.localeCompare(b.name, 'pt-BR') ||
      a.id - b.id,
  );
}

export function teamIndex(
  slotIds: (number | undefined)[],
  players: Player[],
  slotIndex: number,
): number {
  const team = slotIds.flatMap((id) =>
    players.filter((player) => player.id === id),
  );
  if (team.length < LINEUP_SIZE) {
    return slotIndex;
  }
  return orderTeam(team).findIndex(({ id }) => id === slotIds[slotIndex]);
}

export function usedAttributes(
  player: Player,
  index: number,
): { label: string; value: number }[] {
  const attributes = new Set<DuelAttribute>();
  if (index >= FIRST_ATTACKER) {
    attributes.add(ATTACK_ATTRIBUTE[player.position]);
  }
  if (index < DEFENDERS) {
    attributes.add('defending');
  }
  return [...attributes].map((attribute) => ({
    label: ATTRIBUTE_LABELS[attribute],
    value: player[attribute],
  }));
}

export function lastName(name: string): string {
  return name.trim().split(/\s+/).at(-1) ?? name;
}
