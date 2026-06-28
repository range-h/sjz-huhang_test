import { Controller, Get, Header, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { WechatService } from './wechat.service';

@Controller('wechat')
export class WechatController {
  constructor(
    private readonly wechatService: WechatService,
  ) {}

  @Get()
  check(
    @Query('signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
  ) {
    const ok = this.wechatService.verify(
      signature,
      timestamp,
      nonce,
    );

    if (ok) {
      return echostr;
    }

    return 'verify failed';
  }

  @Header('Content-Type', 'text/xml')
  @Post()
  async receive(@Req() req: Request) {
    const xml = await this.readRawBody(req);
    return this.wechatService.handleMessage(xml);
  }

  private readRawBody(req: Request): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      req.on('error', reject);
    });
  }
}