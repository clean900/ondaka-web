# Infra VPS — ONDAKA (Contabo 167.86.114.64, `/opt/stacks/`)

Espelho em git dos stacks do VPS que o **ONDAKA** precisa. Até 24 Ago 2026 este código
existia **apenas no servidor** — se o VPS se perdesse, perdia-se com ele.

> O VPS é partilhado com a Academia Digital e a Welwitschia. Mexer só nestes três stacks.

| Stack | Serve | Domínio |
|---|---|---|
| `signaling/` | WebSocket de sinalização das **chamadas WebRTC / SOS** | `signal.ondaka.ao` |
| `coturn/` | servidor TURN/STUN (NAT traversal das chamadas) | `:3478` (host) |
| `jitsi/` | videoconferência das **Assembleias** (upstream fixado) | ver `.env` |

**Sem estes três, o SOS e as chamadas de áudio da app deixam de funcionar.**

## Segredos
Nenhum segredo vai no git. Cada stack tem `.env.example` (ou `.conf.example`) com as
chaves e sem os valores. Os valores reais vivem em `/opt/stacks/<stack>/` no VPS e devem
estar no cofre de segredos fora da máquina.

- `signaling` → `.env` com `SIGNALING_SECRET`
- `coturn` → `turnserver.conf` (copiar de `turnserver.conf.example` e pôr o `static-auth-secret`)
- `jitsi` → `.env` (ver `jitsi/README.md`; JWT partilhado com o `ondaka-web`)

## Reconstruir do zero
```bash
docker network create web 2>/dev/null || true   # partilhada com o Traefik
cd /opt/stacks/signaling && cp .env.example .env && $EDITOR .env && docker compose up -d --build
cd /opt/stacks/coturn    && cp turnserver.conf.example turnserver.conf && $EDITOR turnserver.conf && docker compose up -d
# jitsi: ver jitsi/README.md
```
O Traefik (rede `web` + resolver `le`) tem de estar de pé antes — vive no repo da
Academia Digital, `infra/vps/traefik/`.
