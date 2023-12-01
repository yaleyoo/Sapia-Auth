import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(`==== connectin MongoDB @ host: ${process.env.DB_HOST} port: ${process.env.DB_PORT} ...`)
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
