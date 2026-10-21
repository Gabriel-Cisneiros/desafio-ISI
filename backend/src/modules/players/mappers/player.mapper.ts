import { Condition } from '../../../common/enums/condition.enum';
import { Position } from '../../../common/enums/position.enum';
import { calculateMarketValue } from '../../../common/rules/market-value';
import { calculateOverall } from '../../../common/rules/overall';
import { PlayerResponse } from '../interfaces/player.interface';
import { PlayerRecord } from '../selects/players.select';

export function toPlayerResponse(player: PlayerRecord): PlayerResponse {
  const position = player.position as Position;
  const condition = player.condition as Condition;

  return {
    id: player.id,
    name: player.name,
    position,
    agility: player.agility,
    age: player.age,
    condition,
    base_value: player.baseValue.toNumber(),
    market_value: calculateMarketValue({
      baseValue: player.baseValue,
      condition,
      agility: player.agility,
      age: player.age,
    }).toNumber(),
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
    potential: player.potential,
    overall: calculateOverall(position, player),
    club_id: player.clubId,
  };
}
