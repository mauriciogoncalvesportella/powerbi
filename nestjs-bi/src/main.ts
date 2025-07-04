import {ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DBExceptionFilter} from './shared/dbexception.filter';
import {json, urlencoded} from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // criação de instância do Nest em AppModule

  if (!process.env.PROD) {
    app.enableCors({ credentials: true })
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalFilters(new DBExceptionFilter())
  app.use(json({ limit: '8mb' }));
  app.use(urlencoded({ extended: true, limit: '8mb' }));
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: 'http://localhost:8080'
  })
  await app.listen(3000); // escuta na porta 3000
}
bootstrap();
