import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import { UserAuth } from "./auth.interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor () {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.SECRET,
    })
  }

  validate (payload: UserAuth): UserAuth {
    return payload
  }
}
