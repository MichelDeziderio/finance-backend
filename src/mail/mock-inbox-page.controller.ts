import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { MailService } from './mail.service';

const SESSION_LIFETIME_MS = 15 * 60 * 1000;
const COOKIE_NAME = 'finance_mock_inbox_session';

function escapeHtml(input: unknown): string {
  return String(input ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

@Controller('dev/mock-inbox')
export class MockInboxPageController {
  constructor(
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private cookieHeader(token: string): string {
    return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/api/dev/mock-inbox; HttpOnly; Secure; SameSite=Strict; Max-Age=900`;
  }

  private sign(timestamp: number): string {
    const secret = this.config.get<string>('MOCK_INBOX_KEY') || '';
    return createHmac('sha256', secret).update(`finance-inbox:${timestamp}`).digest('hex');
  }

  private validSession(request: Request): boolean {
    const rawCookies = request.headers.cookie || '';
    const token = rawCookies.split(';').map(item => item.trim()).find(item => item.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
    if (!token) return false;
    const match = /^([0-9]{13})\.([a-f0-9]{64})$/.exec(token);
    if (!match) return false;
    const created = Number(match[1]);
    if (!Number.isSafeInteger(created) || created > Date.now() || Date.now() - created > SESSION_LIFETIME_MS) return false;
    const given = Buffer.from(match[2], 'hex');
    const expected = Buffer.from(this.sign(created), 'hex');
    return given.length === expected.length && timingSafeEqual(given, expected);
  }

  private configure(response: Response): void {
    response.setHeader('Cache-Control', 'no-store, max-age=0');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; frame-src 'self'; form-action 'self'; base-uri 'none'");
  }

  private render(title: string, body: string): string {
    return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} | Finan$e</title>
<style>
:root{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172033;background:#f3f6fb}
*{box-sizing:border-box}body{margin:0;padding:38px 16px}.wrap{max-width:900px;margin:auto}
header{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;gap:12px;flex-wrap:wrap}
h1{margin:0;font-size:28px}h1 span{color:#16a34a}.sub{color:#64748b;font-size:14px;margin-top:6px}
.panel{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 6px 28px #25345a0a;padding:24px}
input{padding:13px;width:100%;border:1px solid #cbd5e1;border-radius:9px;font-size:16px;margin:12px 0}
button,.btn{border:0;background:#2563eb;color:#fff;border-radius:9px;padding:12px 18px;cursor:pointer;font-weight:650;text-decoration:none;display:inline-block}
a{color:#2563eb;text-decoration:none}.error{color:#b91c1c}.muted{color:#64748b}.row{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #edf2f7;padding:17px 0;gap:16px;flex-wrap:wrap}
.subject{font-weight:700}.meta{color:#64748b;font-size:13px;margin-top:5px;overflow-wrap:anywhere}.pill{background:#e7f9ef;color:#166534;padding:6px 10px;border-radius:30px;font-size:12px}
iframe{width:100%;height:520px;border:1px solid #e2e8f0;border-radius:12px;margin-top:18px;background:#fff}
</style></head><body><div class="wrap"><header><div><h1>Finan<span>$e</span> · Inbox Fake</h1>
<div class="sub">Caixa simulada para testes acadêmicos · mensagens expiram em 2 minutos</div></div></header>${body}</div></body></html>`;
  }

  private inactive(response: Response): boolean {
    if (this.mail.isMockEnabled()) return false;
    response.status(503).type('html').send(this.render('Indisponível', '<section class="panel">O inbox simulado está desativado. Configure MAIL_MOCK=true no ambiente de testes.</section>'));
    return true;
  }

  @Get()
  async index(@Req() request: Request, @Res() response: Response) {
    this.configure(response);
    if (this.inactive(response)) return;
    if (!this.validSession(request)) {
      return response.type('html').send(this.render('Acesso', `<section class="panel"><h2>Entrar na caixa de testes</h2>
<p class="muted">Informe a chave MOCK_INBOX_KEY configurada no backend. Ela não é enviada na URL.</p>
<form method="POST" action="/api/dev/mock-inbox/login"><label for="key">Chave de acesso</label>
<input id="key" name="key" type="password" required autocomplete="off" minlength="32">
<button type="submit">Entrar</button></form></section>`));
    }

    const emails = await this.mail.listMockEmails();
    const rows = emails.map(mail => `<div class="row"><div><div class="subject"><a href="/api/dev/mock-inbox/${encodeURIComponent(mail.id)}">${escapeHtml(mail.subject)}</a></div>
<div class="meta">Para: ${escapeHtml(mail.to)} · Criado: ${escapeHtml(new Date(mail.createdAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}))}</div>
<div class="meta">Expira: ${escapeHtml(new Date(mail.expiresAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}))}</div></div>
<span class="pill">Temporário</span></div>`).join('');
    return response.type('html').send(this.render('Mensagens', `<section class="panel"><div class="row"><h2>Mensagens recebidas (${emails.length})</h2>
<a href="/api/dev/mock-inbox">Atualizar</a></div>${rows || '<p class="muted">Nenhuma mensagem ativa. Solicite uma recuperação de senha para testar.</p>'}</section>`));
  }

  @Post('login')
  login(@Body('key') key: string, @Res() response: Response) {
    this.configure(response);
    if (this.inactive(response)) return;
    try {
      this.mail.assertMockInboxAccess(key);
    } catch {
      return response.status(403).type('html').send(this.render('Acesso negado', '<section class="panel"><p class="error">Chave inválida.</p><a href="/api/dev/mock-inbox">Tentar novamente</a></section>'));
    }
    const timestamp = Date.now();
    response.setHeader('Set-Cookie', this.cookieHeader(`${timestamp}.${this.sign(timestamp)}`));
    return response.redirect(303, '/api/dev/mock-inbox');
  }

  @Post('logout')
  logout(@Res() response: Response) {
    this.configure(response);
    response.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/api/dev/mock-inbox; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
    return response.redirect(303, '/api/dev/mock-inbox');
  }

  @Get(':id')
  async message(@Param('id') id: string, @Req() request: Request, @Res() response: Response) {
    this.configure(response);
    if (this.inactive(response)) return;
    if (!this.validSession(request)) return response.redirect(302, '/api/dev/mock-inbox');
    try {
      const mail = await this.mail.getMockEmail(id);
      return response.type('html').send(this.render('Mensagem', `<section class="panel"><a href="/api/dev/mock-inbox">← Voltar</a>
<h2>${escapeHtml(mail.subject)}</h2><p class="muted">Para: ${escapeHtml(mail.to)} · Expira: ${escapeHtml(new Date(mail.expiresAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}))}</p>
<iframe title="Pré-visualização do e-mail" sandbox="allow-popups allow-popups-to-escape-sandbox" srcdoc="${escapeHtml(mail.html)}"></iframe></section>`));
    } catch {
      return response.status(404).type('html').send(this.render('Mensagem expirada', '<section class="panel"><h2>Mensagem expirada ou inexistente.</h2><a href="/api/dev/mock-inbox">Voltar à caixa de entrada</a></section>'));
    }
  }
}
