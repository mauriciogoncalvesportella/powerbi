import { Global, Module } from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import { AuthService } from './auth.service';
import {JwtStrategy} from './jwt.strategy';
import {UserAuthModule} from './user-auth/user-auth.module';
import {UserStatusModule} from './user-status/user-status.modules';
import {UserStatusService} from './user-status/user-status.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.SECRET,
        signOptions: {
          expiresIn: 0
        },
      })
    }),
    UserAuthModule,
    UserStatusModule
  ],
  exports: [JwtModule, UserAuthModule, UserStatusModule],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
