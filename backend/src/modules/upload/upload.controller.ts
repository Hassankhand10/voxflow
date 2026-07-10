import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import { customAlphabet } from 'nanoid';
import { Public } from '../../common/decorators';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

@Controller('media')
export class UploadController {
  constructor(private config: ConfigService) {}

  @Public()
  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads');
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.webm';
          cb(null, `${nanoid()}${ext}`);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  uploadMedia(@UploadedFile() file: Express.Multer.File) {
    const port = this.config.get<number>('API_PORT', 4000);
    const base =
      this.config.get<string>('API_PUBLIC_URL') ?? `http://localhost:${port}`;
    return {
      url: `${base}/uploads/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
