import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  id?: string;
  _id?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService) {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET não está definido');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload?.sub || !payload.email || !payload.role) {
            throw new UnauthorizedException('Token inválido');
        }

        const userId =
            payload.sub ??
            payload.id ??
            payload._id?.toString();

        const payloadResponse = {
            id: userId,
            email: payload.email,
            role: payload.role,
        };
        return payloadResponse;
    }
}