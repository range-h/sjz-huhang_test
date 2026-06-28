import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // 这一行非常重要
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();