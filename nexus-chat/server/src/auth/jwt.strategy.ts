import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // מחלץ את הטוקן מה-Authorization Header בתור Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // המפתח הסודי שאימתנו איתו את החתימה
      secretOrKey: 'MY_SECRET_KEY',
    });
  }

  // הפונקציה הזו רצה אוטומטית ברגע שהטוקן נמצא תקין ומפוענח!
  async validate(payload: any) {
    // אין צורך לפנות ל-DB! המידע המפוענח כבר נמצא כאן בתוך ה-payload.
    // האובייקט שנחזיר כאן יושתל אוטומטית בתוך req.user ב-Controller
    return { userId: payload.sub, username: payload.username };
  }
}