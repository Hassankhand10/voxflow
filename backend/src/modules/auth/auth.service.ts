import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const slug = dto.workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) + '-' + nanoid();

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        memberships: {
          create: {
            role: 'OWNER',
            workspace: {
              create: {
                name: dto.workspaceName,
                slug,
              },
            },
          },
        },
      },
      include: {
        memberships: { include: { workspace: true } },
      },
    });

    const workspace = user.memberships[0].workspace;
    return this.buildAuthResponse(user, workspace.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        memberships: { include: { workspace: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const workspaceId = user.memberships[0]?.workspaceId;
    if (!workspaceId) throw new UnauthorizedException('No workspace found');

    return this.buildAuthResponse(user, workspaceId);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: { include: { workspace: true } },
      },
    });
    if (!user) throw new UnauthorizedException();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      workspace: user.memberships[0]?.workspace,
      role: user.memberships[0]?.role,
    };
  }

  private buildAuthResponse(
    user: { id: string; name: string; email: string },
    workspaceId: string,
  ) {
    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      workspaceId,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId,
      },
    };
  }
}
