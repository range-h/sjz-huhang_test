import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { XMLParser } from 'fast-xml-parser';

export interface WechatMessage {
  fromUserName: string; // 用户 OpenID
  toUserName: string;   // 公众号原始 ID
  msgType: string;      // 消息类型：text / image / voice / event ...
  content: string;      // 消息内容（文本消息才有）
  event: string;        // 事件类型：subscribe / unsubscribe / CLICK ...
  msgId: string;        // 消息 ID
  createTime: string;   // 创建时间
}

@Injectable()
export class WechatService {
  private readonly token = process.env.WECHAT_TOKEN || 'delta-ai';

  verify(signature: string, timestamp: string, nonce: string) {
    const str = [this.token, timestamp, nonce]
      .sort()
      .join('');

    const sha1 = crypto
      .createHash('sha1')
      .update(str)
      .digest('hex');

    return sha1 === signature;
  }

  /**
   * 解析微信发来的 XML 消息
   */
  parseMessage(xml: string): WechatMessage {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });

    const parsed = parser.parse(xml);
    const msg = parsed.xml;

    const message: WechatMessage = {
      fromUserName: msg.FromUserName || '',
      toUserName: msg.ToUserName || '',
      msgType: msg.MsgType || '',
      content: msg.Content || '',
      event: msg.Event || '',
      msgId: msg.MsgId || '',
      createTime: msg.CreateTime || '',
    };

    // 打印到控制台
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📩 收到微信消息：');
    console.log(`   用户 OpenID：${message.fromUserName}`);
    console.log(`   消息类型：${message.msgType}`);
    if (message.msgType === 'event') {
      console.log(`   事件类型：${message.event}`);
    } else {
      console.log(`   消息内容：${message.content}`);
    }
    console.log(`   消息 ID：${message.msgId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return message;
  }

  /**
   * 处理消息 → 返回回复 XML（不需要回复时返回空字符串）
   */
  handleMessage(xml: string): string {
    const msg = this.parseMessage(xml);

    let reply = '';

    if (msg.msgType === 'event' && msg.event === 'subscribe') {
      reply = '欢迎关注三角洲护航 AI！🚀\n\n回复任意消息开始对话，敬请期待！';
    } else if (msg.msgType === 'text') {
      reply = '你好！敬请期待！';
    }

    if (!reply) {
      return '';
    }

    return this.buildReplyXml(msg, reply);
  }

  /**
   * 构建微信回复 XML
   * ToUserName 和 FromUserName 要反过来
   */
  private buildReplyXml(msg: WechatMessage, replyContent: string): string {
    const createTime = Math.floor(Date.now() / 1000);

    return [
      '<xml>',
      `<ToUserName><![CDATA[${msg.fromUserName}]]></ToUserName>`,
      `<FromUserName><![CDATA[${msg.toUserName}]]></FromUserName>`,
      `<CreateTime>${createTime}</CreateTime>`,
      `<MsgType><![CDATA[text]]></MsgType>`,
      `<Content><![CDATA[${replyContent}]]></Content>`,
      '</xml>',
    ].join('');
  }
}