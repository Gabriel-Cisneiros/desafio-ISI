import { Formation } from '../enums/formation.enum';
import { Position } from '../enums/position.enum';
import { fitsFormation } from './lineup';

const { GOL, ZAG, LAT, MEI, ATA } = Position;

describe('fitsFormation', () => {
  it.each([
    [Formation.F3_1, [GOL, ZAG, LAT, LAT, ATA]],
    [Formation.F2_2, [GOL, ZAG, LAT, ATA, ATA]],
    [Formation.F2_1_1, [GOL, ZAG, LAT, MEI, ATA]],
    [Formation.F1_2_1, [GOL, ZAG, MEI, MEI, ATA]],
    [Formation.F2_1_1, [ATA, MEI, ZAG, ZAG, GOL]],
    [Formation.F3_1, [LAT, LAT, LAT, GOL, ATA]],
  ])('aceita %s com %j', (formation, positions) => {
    expect(fitsFormation(positions, formation)).toBe(true);
  });

  it.each([
    ['sem goleiro', Formation.F2_1_1, [ZAG, ZAG, LAT, MEI, ATA]],
    ['com dois goleiros', Formation.F2_1_1, [GOL, GOL, LAT, MEI, ATA]],
    ['com setor trocado', Formation.F2_2, [GOL, ZAG, LAT, MEI, ATA]],
    ['com defesa a mais', Formation.F1_2_1, [GOL, ZAG, LAT, MEI, ATA]],
    ['com ataque a mais', Formation.F3_1, [GOL, ZAG, LAT, ATA, ATA]],
  ])('recusa %s', (_, formation, positions) => {
    expect(fitsFormation(positions, formation)).toBe(false);
  });
});
