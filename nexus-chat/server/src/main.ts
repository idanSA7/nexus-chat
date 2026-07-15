import { NestFactory } from '@nestjs/core';
import { AppModule } from './users/users.module';
import { ValidationPipe } from '@nestjs/common'; // הוסף את השורה הזו למעלה


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(new ValidationPipe()); 
   app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
