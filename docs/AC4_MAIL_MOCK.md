# AC4 — E-mail de recuperação: mock ou SMTP

## Seleção pelo ambiente

| Variável | Configuração | Comportamento |
| --- | --- | --- |
| `MAIL_MOCK` | `true` | Cria e-mail simulado na coleção MongoDB `mock_emails`; não envia SMTP |
| `MAIL_MOCK` | `false` ou ausente | Envia e-mails reais com Nodemailer via SMTP, conforme `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` |
| `MOCK_INBOX_KEY` | Segredo aleatório com 32+ caracteres | Obrigatório quando `MAIL_MOCK=true`; autentica a leitura da caixa de testes |
| `FRONTEND_URL` | URL pública do frontend | Base do link de redefinição |

A alternância é **somente no servidor**, por variável do ambiente de execução. Nunca coloque `MOCK_INBOX_KEY` no Angular nem publique a chave no Git. Atualizar variáveis na Vercel requer novo deployment.

## Fluxo de recuperação

1. O usuário solicita `POST /api/auth/forgot-password` com e-mail.
2. O backend sempre retorna resposta genérica para não revelar se o e-mail existe.
3. Para usuário existente, o backend gera token aleatório e grava a expiração em `users.resetPasswordExpires`.
4. Se `MAIL_MOCK=true`, validade é de **2 minutos**, o e-mail mockado é salvo no MongoDB e nenhum SMTP é utilizado. A nova solicitação substitui a mensagem mockada anterior daquele usuário.
5. Se `MAIL_MOCK=false`, o comportamento SMTP existente é mantido, com **1 hora** de expiração.
6. O endpoint `POST /api/auth/reset-password` sempre valida a expiração gravada em `users`, independentemente de limpeza física do documento.
7. Após redefinir a senha, o token é invalidado no usuário e a mensagem simulada correspondente é excluída imediatamente.

A coleção `mock_emails` tem um índice TTL `{ expiresAt: 1 }`, com `expireAfterSeconds: 0`. O MongoDB elimina documentos expirados de forma automática **mas assíncrona**. As consultas da caixa de entrada também usam `expiresAt > now`, logo a mensagem deixa de ser acessível ao fim dos 120 segundos mesmo que o TTL ainda não tenha concluído a remoção física.

## Acessar a caixa de entrada simulada

A caixa está protegida por um segredo de servidor e **só responde quando o mock está ligado**.

```http
GET /api/dev/mock-emails
x-mock-inbox-key: <MOCK_INBOX_KEY>
```

Lista apenas as 50 mensagens não expiradas mais recentes (sem HTML ou token). Para visualizar uma mensagem específica:

```http
GET /api/dev/mock-emails/:id
x-mock-inbox-key: <MOCK_INBOX_KEY>
```

O detalhe contém o HTML e link de teste; utilize Postman/Insomnia sob controle do administrador. Não exponha a chave em JavaScript do navegador nem forneça esse acesso a usuários finais. Nunca utilize esse modo com dados reais ou contas públicas: quem possui a chave da caixa pode acessar qualquer link de recuperação ativo.

## Segurança

- Se `MAIL_MOCK=false` e faltar usuário ou senha SMTP, o envio falha; não existe fallback que exponha tokens em logs.
- Se `MAIL_MOCK=true` sem `MOCK_INBOX_KEY` forte, o backend falha ao inicializar.
- Mensagens simuladas não ficam acessíveis após expiração e são removidas após o uso do token.
- Nenhum token de recuperação é registrado em logs, inclusive em caso de falha de SMTP.
- Os templates são reaproveitados; o prazo informado no HTML acompanha o modo.
- A Vercel deve manter `MAIL_MOCK=false` em produção normal. Se habilitar para demonstração acadêmica, restringir acesso ao ambiente e às contas de teste.

## Testes sugeridos

- Modo mock: solicitar recuperação e verificar a mensagem com header administrativo.
- Acessar sem header, com header incorreto e após dois minutos: acesso negado.
- Redefinir antes de 120s: senha muda, token é invalidado e a mensagem desaparece.
- Redefinir depois de 120s: resposta de token inválido ou expirado.
- Modo SMTP: verificar que o transporte SMTP é usado e que o inbox está indisponível.
- Simular SMTP sem credenciais: deve falhar sem imprimir links de recuperação.
