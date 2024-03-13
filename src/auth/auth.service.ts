import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly configService: ConfigService,
  ) {}
  async generateTokens(): Promise<string> {
    const accessToken = this.jwtService.sign({});
    return accessToken;
  }

  async checkAndVerification(authorizationHeader: string) {
    const token = authorizationHeader.split(' ')[1];
    const { jti } = await this.jwtService.verify(token);
    const existingJti = await this.authRepository.findOne({
      where: { jwtId: jti },
    });
    if (!existingJti) {
      const newAuthEntity = new AuthEntity();
      newAuthEntity.jwtId = jti;
      await this.authRepository.save(newAuthEntity);
    } else {
      throw new UnauthorizedException('The token expired.');
    }
  }
}