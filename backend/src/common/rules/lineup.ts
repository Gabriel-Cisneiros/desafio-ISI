import { Formation } from '../enums/formation.enum';
import { Position } from '../enums/position.enum';

export const LINEUP_SIZE = 5;

export interface FormationSectors {
  defense: number;
  midfield: number;
  attack: number;
}

export const FORMATION_SECTORS: Record<Formation, FormationSectors> = {
  [Formation.F3_1]: { defense: 3, midfield: 0, attack: 1 },
  [Formation.F2_2]: { defense: 2, midfield: 0, attack: 2 },
  [Formation.F2_1_1]: { defense: 2, midfield: 1, attack: 1 },
  [Formation.F1_2_1]: { defense: 1, midfield: 2, attack: 1 },
};

const SECTOR: Record<Position, keyof FormationSectors | 'goalkeeper'> = {
  [Position.GOL]: 'goalkeeper',
  [Position.ZAG]: 'defense',
  [Position.LAT]: 'defense',
  [Position.MEI]: 'midfield',
  [Position.ATA]: 'attack',
};

export function fitsFormation(
  positions: Position[],
  formation: Formation,
): boolean {
  const counts = { goalkeeper: 0, defense: 0, midfield: 0, attack: 0 };
  for (const position of positions) {
    counts[SECTOR[position]] += 1;
  }

  const expected = FORMATION_SECTORS[formation];
  return (
    counts.goalkeeper === 1 &&
    counts.defense === expected.defense &&
    counts.midfield === expected.midfield &&
    counts.attack === expected.attack
  );
}
