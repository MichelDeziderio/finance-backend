import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.config.get<string>('MAIL_HOST', 'smtp.gmail.com');
    const port = Number(this.config.get<number>('MAIL_PORT', 587));
    const secure = this.config.get<string>('MAIL_SECURE') === 'true';
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');

    if (!user || !pass) {
      this.logger.warn(
        '⚠️ Variáveis MAIL_USER ou MAIL_PASS não configuradas no .env. E-mails serão simulados no log do console.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.logger.log(`📧 Transporter SMTP configurado para ${host}:${port} (${user})`);
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:4200').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/redefinir-senha?token=${token}`;
    const from = this.config.get<string>('MAIL_FROM', '"Finan$e" <suporte@finance.com>');

    const html = this.buildResetPasswordHtml(name, resetUrl);

    if (!this.transporter) {
      this.logger.log(`\n================ SIMULAÇÃO DE E-MAIL (SMTP NÃO CONFIGURADO) ================`);
      this.logger.log(`Para: ${to} (${name})`);
      this.logger.log(`Assunto: 🔐 Recuperação de Senha - Finan$e`);
      this.logger.log(`Link de Redefinição: ${resetUrl}`);
      this.logger.log(`============================================================================\n`);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: '🔐 Redefinição de Senha - Finan$e',
        html,
      });
      this.logger.log(`✅ E-mail de redefinição de senha enviado com sucesso para ${to} (ID: ${info.messageId})`);
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Erro ao enviar e-mail via SMTP do Gmail: ${error?.message || error}`, error?.stack);
      this.logger.log(`🔗 Link de recuperação (fallback): ${resetUrl}`);
      throw new Error(`Falha ao enviar e-mail de recuperação de senha: ${error?.message || error}`);
    }
  }

  async sendPasswordChangedConfirmation(to: string, name: string): Promise<boolean> {
    const from = this.config.get<string>('MAIL_FROM', '"Finan$e" <suporte@finance.com>');
    const html = this.buildPasswordChangedHtml(name);

    if (!this.transporter) {
      this.logger.log(`[E-mail simulado] Confirmação de troca de senha para: ${to}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: '✅ Sua senha do Finan$e foi alterada com sucesso',
        html,
      });
      return true;
    } catch (error) {
      this.logger.warn(`Não foi possível enviar e-mail de confirmação para ${to}`);
      return false;
    }
  }

  private buildResetPasswordHtml(name: string, resetUrl: string): string {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - Finan$e</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 15px;
    }
    .card {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%);
      padding: 32px 30px;
      text-align: center;
    }
    .brand-logo {
      display: inline-block;
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    .brand-logo span {
      color: #4ade80;
    }
    .header-badge {
      display: inline-block;
      margin-top: 10px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 36px 32px 28px 32px;
    }
    .icon-lock {
      text-align: center;
      margin-bottom: 20px;
    }
    .icon-circle {
      display: inline-block;
      width: 56px;
      height: 56px;
      line-height: 56px;
      border-radius: 50%;
      background-color: #eff6ff;
      border: 2px solid #bfdbfe;
      color: #2563eb;
      font-size: 26px;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px 0;
      text-align: center;
    }
    p {
      font-size: 14.5px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 16px 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn-reset {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.2px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.2s ease;
    }
    .security-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 24px 0;
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
    }
    .link-fallback {
      background-color: #f8fafc;
      border: 1px dashed #cbd5e1;
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      margin-top: 20px;
    }
    .link-fallback a {
      color: #2563eb;
      text-decoration: underline;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .footer p {
      font-size: 12px;
      color: #94a3b8;
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <!-- HEADER BANNER -->
      <div class="header-banner">
        <a href="#" class="brand-logo">Finan<span>$e</span></a>
        <div>
          <span class="header-badge">Segurança da Conta</span>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="content">
        <div class="icon-lock">
          <div class="icon-circle">🔐</div>
        </div>

        <h2>Recuperação de Senha</h2>

        <p>Olá, <strong>${name}</strong>!</p>
        <p>
          Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Finan$e</strong>.
          Para prosseguir e cadastrar uma nova senha, clique no botão abaixo:
        </p>

        <!-- CTA BUTTON -->
        <div class="btn-container">
          <a href="${resetUrl}" target="_blank" class="btn-reset">
            Redefinir Minha Senha
          </a>
        </div>

        <!-- ALERTA DE SEGURANÇA -->
        <div class="security-box">
          ⏱️ <strong>Atenção:</strong> Este link é válido por <strong>1 hora</strong>. Se você não solicitou a alteração, nenhuma ação é necessária — sua senha atual permanecerá segura.
        </div>

        <!-- FALLBACK -->
        <div class="link-fallback">
          Caso o botão acima não funcione, copie e cole o link a seguir no seu navegador:<br>
          <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p>Finan$e &bull; Gestão Financeira Pessoal Simplificada</p>
        <p>&copy; ${currentYear} Finan$e. Todos os direitos reservados.</p>
        <p style="font-size: 11px; margin-top: 8px;">Este é um e-mail automático do sistema. Por favor, não responda a esta mensagem.</p>
      </div>

    </div>
  </div>
</body>
</html>
    `;
  }

  private buildPasswordChangedHtml(name: string): string {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Senha Alterada com Sucesso - Finan$e</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 40px 15px; }
    .card { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header-banner { background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #065f46 100%); padding: 32px 30px; text-align: center; }
    .brand-logo { font-size: 26px; font-weight: 800; color: #ffffff; text-decoration: none; }
    .brand-logo span { color: #4ade80; }
    .content { padding: 36px 32px 28px 32px; text-align: center; }
    .icon-circle { display: inline-block; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; background-color: #ecfdf5; border: 2px solid #a7f3d0; font-size: 28px; margin-bottom: 16px; }
    h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
    p { font-size: 14.5px; line-height: 1.6; color: #475569; margin: 0 0 16px 0; text-align: left; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11.5px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header-banner">
        <a href="#" class="brand-logo">Finan<span>$e</span></a>
      </div>
      <div class="content">
        <div class="icon-circle">✅</div>
        <h2>Senha Alterada com Sucesso!</h2>
        <p>Olá, <strong>${name}</strong>!</p>
        <p>A senha da sua conta no <strong>Finan$e</strong> foi alterada recentemente com sucesso.</p>
        <p>Se foi você quem fez essa alteração, nenhuma ação é necessária. Se você não reconhece essa mudança, entre em contato imediatamente com o suporte ou solicite uma nova redefinição.</p>
      </div>
      <div class="footer">
        <p>&copy; ${currentYear} Finan$e. Todos os direitos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}
