import { Prisma } from '@prisma/client';
import { ContractStatus } from '../../../common/enums/contract-status.enum';
import { ACTIVE_PLAYER } from '../../players/utils/active-player';
import { playerSelect } from '../../players/selects/players.select';

export const clubSelect = {
  id: true,
  name: true,
  acronym: true,
  cash: true,
  players: { where: ACTIVE_PLAYER, select: playerSelect },
} satisfies Prisma.ClubSelect;

export type ClubRecord = Prisma.ClubGetPayload<{ select: typeof clubSelect }>;

export const clubDetailsSelect = {
  ...clubSelect,
  players: {
    where: ACTIVE_PLAYER,
    select: {
      ...playerSelect,
      contracts: {
        where: { status: ContractStatus.ATIVO },
        select: { purchaseValue: true, loyaltyUntil: true },
        take: 1,
      },
    },
  },
} satisfies Prisma.ClubSelect;

export type ClubDetailsRecord = Prisma.ClubGetPayload<{
  select: typeof clubDetailsSelect;
}>;
