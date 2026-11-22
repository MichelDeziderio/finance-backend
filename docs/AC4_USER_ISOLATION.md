# AC4 — Isolamento de dados por usuário

## Regra de acesso

- O ID do usuário é extraído exclusivamente do JWT validado no backend (`request.user.id`).
- Cada carteira possui `userId`, correspondente ao campo `users.id`. Não se aceita `userId` no payload da carteira.
- Endpoints `/api/wallets` exigem token JWT e restringem consultas, alterações e exclusões ao usuário autenticado.
- Endpoints `/api/wallets/:walletId/categories`, `/movements` e `/dashboard` exigem JWT e verificam a propriedade da carteira **antes** de executar a operação.
- Carteiras inexistentes ou pertencentes a outro usuário retornam 404 para não revelar sua existência.
- Categorias e movimentações continuam vinculadas à carteira pelo campo `walletId`.

## Dados existentes no MongoDB

**Não executar migração automática de propriedade**. Carteiras anteriores à AC4 não têm `userId`; assim, serão invisíveis e inacessíveis aos endpoints autenticados até identificação manual do titular legítimo. Categorias e movimentações vinculadas não são apagadas nem transferidas.

Antes de preencher o campo em carteira antiga:

1. Fazer backup da coleção `wallets` e das coleções relacionadas.
2. Confirmar o titular por evidência confiável (não apenas e-mail, nome ou ordem de criação).
3. Vincular apenas carteiras confirmadas com `userId` igual a `users.id` do titular.
4. Verificar que o usuário correto as enxerga e outro usuário recebe 404.
5. Carteiras sem titular confirmado devem continuar sem `userId` até análise manual.

Exemplo **ilustrativo**, não executar sem validar os IDs:

```javascript
db.wallets.updateOne(
  { id: "ID_DA_CARTEIRA", userId: { $exists: false } },
  { $set: { userId: "ID_DO_USUARIO_CONFIRMADO" } },
);
```

## Testes de regressão

- Sem token: `GET /api/wallets` e os endpoints financeiros devem retornar 401.
- Usuário A cria carteira: `userId` deve ser o próprio `users.id`, ainda que o request tente enviar outro `userId`.
- Usuário B: `GET /api/wallets` não retorna a carteira de A.
- B com o ID de carteira de A: GET, POST, PATCH e DELETE de carteira, categorias, movimentações e dashboard devem negar acesso (404).
- A continua podendo criar, listar, editar e excluir seus próprios registros.
- Login, logout e troca de usuário no mesmo navegador devem limpar carteiras, categorias, movimentações e ID de carteira ativo.
- Carteiras legadas sem `userId` não devem aparecer a nenhuma conta.

## Segurança adicional (antes do lançamento)

O projeto atual possui um `JWT_SECRET` de fallback no código. Criar um segredo forte por ambiente no Vercel, remover o fallback em ambas as configurações (módulo JWT e Strategy) e invalidar os tokens antigos. Recomenda-se bloquear a publicação pública até concluir esta etapa.
