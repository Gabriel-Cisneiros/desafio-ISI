import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [MarketController, TransactionsController],
  providers: [MarketService, TransactionsService],
})
export class MarketModule {}
