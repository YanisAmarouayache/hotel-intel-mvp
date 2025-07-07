import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('./ssl/server.key'),
  //   cert: fs.readFileSync('./ssl/server.cert'),
  // };

  // const app = await NestFactory.create(AppModule, {
  //   httpsOptions,
  // });
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://yanisamarouayache.github.io',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://88.160.195.103:3000',
      'http://88.160.195.103:18080',
      'https://88.160.195.103', // <-- pour le HTTPS !
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Hotel Intel Scraper API')
    .setDescription('API de scraping et monitoring hôtelier')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // await app.listen(16443); // HTTPS standard port
  await app.listen(3000);
}
bootstrap();
