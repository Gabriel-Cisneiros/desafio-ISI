import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';

@Module({
  controllers: [MatchesController, StandingsController],
  providers: [MatchesService, StandingsService],
})
export class MatchesModule {}
