import { Position } from '../enums/position.enum';
import { calculateOverall } from './overall';

describe('calculateOverall', () => {
  it.each([
    [Position.MEI, [68, 65, 80, 78, 52, 60], 73],
    [Position.ATA, [78, 75, 73, 82, 48, 68], 76],
    [Position.LAT, [72, 70, 78, 76, 70, 66], 72],
    [Position.ZAG, [50, 90, 60, 40, 80, 75], 73],
    [Position.GOL, [55, 30, 65, 40, 72, 68], 68],
  ])('%s com atributos %j → %i', (position, values, expected) => {
    const [pace, shooting, passing, dribbling, defending, physical] = values;

    expect(
      calculateOverall(position, {
        pace,
        shooting,
        passing,
        dribbling,
        defending,
        physical,
      }),
    ).toBe(expected);
  });

  it('arredonda 72,45 para baixo', () => {
    expect(
      calculateOverall(Position.MEI, {
        pace: 68,
        shooting: 65,
        passing: 80,
        dribbling: 78,
        defending: 52,
        physical: 58,
      }),
    ).toBe(72);
  });
});
