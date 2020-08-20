require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './packages/gateway/gateway.module';
import { MongoDriver } from './lib/db-drivers/mongo-driver';
import { CarModule } from './packages/car/car.module';
import { CarViewModule } from './packages/car-view/car-view.module';
import { AnalyticsModule } from './packages/analytics/analytics.module';
MongoDriver.init(process.env.MONGO_URI);
const mod = process.env.MODULE;

const modulesDictionary = {
  CarModule,
  AnalyticsModule,
  CarViewModule,
  GatewayModule,
};

async function bootstrap() {
  if (!mod) {
    await NestFactory.create(CarModule);
    await NestFactory.create(AnalyticsModule);
    await NestFactory.create(CarViewModule);
    const app = await NestFactory.create(GatewayModule);
    app.enableCors({ origin: true });
    await app.listen(3200);
  } else {
    const app = await NestFactory.create(modulesDictionary[mod]);
    if (mod === 'GatewayModule') {
      app.enableCors({ origin: true });

      await app.listen(3200);
    }
  }
}
bootstrap();
