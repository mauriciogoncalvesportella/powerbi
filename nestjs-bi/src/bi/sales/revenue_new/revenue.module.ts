import { Module } from '@nestjs/common'
import {GoalRepository} from '../goal.repository';
import {GoalService} from '../goal.service';
import {TeamModule} from '../team/team.module';
import {RevenueController} from './revenue.controller';
import {RevenueGenerator} from './revenue.generator';
import {RevenueGoals} from './revenue.goal';
import {RevenueQueries} from './revenue.queries';
import {RevenueRepository} from './revenue.repository';

@Module({
  imports: [TeamModule],
  providers: [RevenueGenerator, RevenueRepository, GoalRepository, RevenueQueries, RevenueGoals, GoalService],
  controllers: [RevenueController]
})
export class RevenueModule {  }
