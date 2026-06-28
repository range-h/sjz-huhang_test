import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // 这一行非常重要
  });

  const port = process.env.PORT ?? 8080;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();