# ONDAKA — Gestão de Condomínios Angola

Plataforma de gestão de condomínios para o mercado angolano, em conformidade com o Decreto Presidencial 141/15 de 29 de Junho de 2015.

**Empresa:** Soluções Simples, Lda
**Produto:** ONDAKA
**Domínio produção:** https://ondaka.ao

---

## Stack Técnica

### Web (este repositório)
- Laravel 12
- Inertia.js + React 18 + TypeScript
- Tailwind CSS v4
- MySQL (produção) / SQLite (dev local)
- Redis (opcional, cache/filas)

### Mobile (repositório separado — Fase 2)
- Flutter 3.x
- GetX (state management)
- Firebase FCM (push)
- Pusher (tempo real)

### Integrações
- **TelcoSMS Angola** — 2FA por SMS
- **ProxyPay** — RPS, DDS, Manual (pagamentos)
- **Pusher Channels** — chat e notificações em tempo real
- **Firebase** — push mobile (Fase 2)
- **ZKTeco** — biometria prestadores (Fase 2)
- **Hikvision ANPR** — matrículas (Fase 2)

---

## Instalação

Para instalar pela primeira vez, seguir o guia completo:

📖 **[INSTALACAO-CPANEL.md](INSTALACAO-CPANEL.md)**

---

## Desenvolvimento Local (macOS)

Requisitos: Laravel Herd instalado.

```bash
cd ~/Herd/ondaka
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite  # muda DB_CONNECTION=sqlite no .env
php artisan migrate --seed
npm run dev
```

Abre: https://ondaka.test

Credenciais demo:
- `admin@ondaka.ao` / `Ondaka@2026`

---

## Deploy para produção

No Mac:
```bash
npm run build
git add . && git commit -m "release X.Y.Z" && git push
```

No servidor (via SSH):
```bash
cd ~/ondaka && ./scripts/deploy.sh
```

---

## Estrutura de módulos (Domain-Driven)

```
app/
├── Domains/
│   ├── Auth/              # 2FA, autenticação
│   ├── Condominio/        # Condomínios, edifícios, fracções ✓
│   ├── Empresa/           # Multi-tenant (empresa gestora) ✓
│   ├── Integracao/        # TelcoSMS, ProxyPay, etc.
│   ├── Tenancy/           # Scopes e traits multi-tenant ✓
│   ├── Condomino/         # (Fase 1 — próximo)
│   ├── Facturacao/        # (Fase 1 — próximo)
│   ├── Pagamento/         # (Fase 1 — próximo)
│   ├── Comunicacao/       # (Fase 1 — próximo)
│   ├── Governanca/        # (Fase 1 — próximo)
│   ├── Documentos/        # (Fase 1 — próximo)
│   └── Seguranca/         # (Fase 1 — próximo)
```

---

## Papéis (Roles)

1. **super-admin** — Plataforma Soluções Simples
2. **admin-empresa** — Admin da empresa gestora
3. **gestor** — Operação diária
4. **administrador-condominio** — Eleito pela assembleia (DP 141/15)
5. **condomino** — Residente
6. **funcionario** — Porteiro/segurança
7. **prestador** — Acesso temporário via passe

---

## Conformidade Legal DP 141/15

- ✓ Fundo de reserva mínimo 10% (Art. 20)
- ✓ Limite quotas 6 UCF/m² (Art. 22)
- ✓ Audit trail completo
- ⏳ Actas como título executivo (Fase 1)
- ⏳ Assembleia virtual (Fase 2)

---

## Licença

Proprietário. © 2026 Soluções Simples, Lda.
Todos os direitos reservados.
