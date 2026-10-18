import { Position } from '../enums/position.enum';

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

const WEIGHTS: Record<Position, PlayerAttributes> = {
  [Position.GOL]: {
    pace: 10,
    shooting: 0,
    passing: 20,
    dribbling: 0,
    defending: 40,
    physical: 30,
  },
  [Position.ZAG]: {
    pace: 10,
    shooting: 0,
    passing: 15,
    dribbling: 0,
    defending: 45,
    physical: 30,
  },
  [Position.LAT]: {
    pace: 25,
    shooting: 0,
    passing: 20,
    dribbling: 15,
    defending: 25,
    physical: 15,
  },
  [Position.MEI]: {
    pace: 10,
    shooting: 15,
    passing: 35,
    dribbling: 25,
    defending: 5,
    physical: 10,
  },
  [Position.ATA]: {
    pace: 20,
    shooting: 40,
    passing: 10,
    dribbling: 20,
    defending: 0,
    physical: 10,
  },
};

export function calculateOverall(
  position: Position,
  attributes: PlayerAttributes,
): number {
  const weights = WEIGHTS[position];
  const weightedSum = (
    Object.keys(weights) as (keyof PlayerAttributes)[]
  ).reduce(
    (sum, attribute) => sum + attributes[attribute] * weights[attribute],
    0,
  );

  return Math.floor((weightedSum + 50) / 100);
}
