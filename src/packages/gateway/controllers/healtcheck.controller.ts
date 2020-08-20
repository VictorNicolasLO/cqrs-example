import { Controller, Get } from '@nestjs/common';
import { get } from 'http';

@Controller('')
export class HealtCheckController {
  constructor() { }

  @Get()
  check() {
    return 'Welcome to app api';
  }

  @Get('/api')
  check2() {
    return 'welcome to app api';
  }
}
