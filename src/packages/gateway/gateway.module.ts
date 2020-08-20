import { Module } from '@nestjs/common';
import { MainController } from './controllers/main.controller';

import { AppCommandBus } from '../../lib/publishers/app-command-bus';
import { AppQueryBus } from '../../lib/publishers/app-query-bus';

import { HealtCheckController } from './controllers/healtcheck.controller';

import { rabbitPrefix } from '../../const';

@Module({
  imports: [],
  controllers: [
    MainController,
    HealtCheckController,
  ],
  providers: [AppCommandBus, AppQueryBus],
})
export class GatewayModule {
  constructor(
    private readonly command$: AppCommandBus,
    private readonly appQueryBus: AppQueryBus,
  ) {
    /** ------------ */
    this.command$.domainName = 'gateway';
    this.appQueryBus.domainName = 'gateway';
  }
}
