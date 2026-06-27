# ONDAKA Web — Contexto específico (Laravel + Inertia)

> Lê primeiro o tronco comum em `~/.claude/CLAUDE.md` (comunicação, glossário PT-AO,
> regra de ouro do git, contas de produção). Este ficheiro cobre só o específico da web.

## Stack web
- Laravel 12 + Inertia + React + TypeScript + Tailwind v4. Repo `clean900/ondaka-web`.
- Dev (Mac): `/Users/brauliogoncalves/ondaka-web`, Laravel Herd.
- Produção: cPanel LiteSpeed (us168), PHP 8.4 em `/opt/cpanel/ea-php84/root/usr/bin/php`, `/home/ondaka/public_html`. Sem Node no servidor.

## Fluxo de deploy invariável
1. `[Mac]` editar código
2. `[Mac]` se mexeu em `.tsx`: `npm run build`
3. `[Mac]` `git add -A && git commit -m "..." && git push`
4. `[cPanel]` `cd /home/ondaka/public_html && git pull && php artisan optimize:clear`
- `public/build` e `bootstrap/ssr` estão no git (não ignorados) → o build chega a produção pelo git.
- Só PHP não precisa de build; `.tsx` precisa sempre de `npm run build` antes do push.
- Nunca editar ficheiros diretamente no servidor.

## Padrões técnicos aprendidos
- Features/add-ons: `subscription` = acesso; `consumable` = consumo por unidade (ex.: SMS). Features de acesso mal classificadas como consumable aparecem "trancadas" → corrigir `modelo_cobranca` para `subscription` no seeder E na BD.
- `owner_type` das subscrições usa a classe completa (`App\Domains\Empresa\Models\EmpresaGestora`), não strings curtas.
- `condominio_activo_id` pode ficar NULL para admins-empresa → bloqueia funcionalidades. Há fallback no login (`routes/auth.php`).
- `admin-empresa` é role de alto privilégio (~72 permissões, dono da conta) — deve ter acesso amplo. Verificar que não está excluído de rotas `role:...`.
- Inertia: páginas recebem dados via props do controller (não fetch). Dropdown/lista vazio → verificar se o controller passa a prop e se a query devolve dados.
- Feature gate deve resolver **empresa gestora**, não condomínio.
- Coluna é `ativo`, não `activo` (PT-PT vs PT-BR). Confirmar com `SHOW COLUMNS`.
- `Carbon::diffInMinutes()` pode ser negativo → `abs()`. `whereJsonContains` não fiável em MariaDB → `LIKE`. LiteSpeed bloqueia symlinks `/storage/` → `FicheirosController`. `bcmath` para dinheiro; valores monetários como strings em JSON.
- Tabelas: `condominios`, `categorias_pedido` (singular), `contratos_ocupacao` (condómino↔fracção), `quotas`, `pagamentos_condomino`, `fraccoes`, `sms_sender_configs`.

## Estado do Sender ID SMS (concluído 11 Jun)
- Ciclo completo funcional e validado em produção: gestor define nome → super-admin notificado (sino+email) → super-admin insere api_key cifrada (cast `encrypted`) e marca configurado → Resolver usa sender personalizado.
- **Pendente (v1.1):** centralizar a resolução do sender no `SmsService` (hoje só Pedidos e Avisos passam pelo `SmsSenderResolver`; restantes fluxos usam o provider global). Opção A escolhida (variante A1: passar condomínio via `$contexto`). Não tocar agora — congelado para depois do lançamento.
