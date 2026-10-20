import { ContractStatus } from '../../common/enums/contract-status.enum';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export interface TransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface ContractSummary {
  purchase_value: number;
  loyalty_until: string;
  status: ContractStatus;
}

export interface MarketOperationResponse extends TransactionResponse {
  contract: ContractSummary;
  club_cash: number;
}
