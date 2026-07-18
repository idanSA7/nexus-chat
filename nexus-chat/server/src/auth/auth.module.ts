import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // // אין כאן יותר את UsersModule! שברנו את הלופ המעגלי לחלוטין!
    // PassportModule.register({ defaultStrategy: 'jwt' }), 
    
    // JwtModule.register({
    //   secret: 'MY_SECRET_KEY',
    //   signOptions: { expiresIn: '1h' },
    // }),
  ],
  providers: [],
  exports: [], 
})
export class AuthModule {}