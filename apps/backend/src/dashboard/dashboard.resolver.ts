import { Resolver, Query } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service';
import { DashboardStat } from './dashboard.type';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => [DashboardStat])
  async dashboardStats() {
    return this.dashboardService.getStats();
  }
}