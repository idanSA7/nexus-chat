import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. הפעלת ה-ValidationPipe לבדיקת תקינות הקלט (למשל אורך סיסמה)
  app.useGlobalPipes(new ValidationPipe());

  // 2. 🔐 פתיחת חסימת ה-CORS בצורה מאובטחת ומפורשת עבור אנגולר!
  app.enableCors({
    origin: 'http://localhost:4200', // הרשאת גישה רק לאנגולר שלך
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // מאפשר העברת עוגיות וטוקנים מאובטחים
  });

  await app.listen(3000);
  console.log('🚀 Server is running on http://localhost:3000');
}
bootstrap();