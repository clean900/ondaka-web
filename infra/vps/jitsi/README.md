# ondaka-jitsi — servidor de videoconferência das Assembleias

Não há código nosso aqui: é o **upstream** `jitsi/docker-jitsi-meet`, fixado numa versão.

## Reconstruir
```bash
cd /opt/stacks
git clone https://github.com/jitsi/docker-jitsi-meet.git ondaka-jitsi
cd ondaka-jitsi
git checkout stable-11031          # aa764157b47f56d6f6fe5acafccdfd2627c672a0
cp /caminho/para/.env .env         # a partir do cofre de segredos
./gen-passwords.sh                 # SÓ se os JICOFO/JVB/JIBRI passwords se perderam
mkdir -p ~/.jitsi-meet-cfg/{web,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb}
docker compose up -d
```

`cfg/` é gerado em runtime — não versionar.

## Dependência cruzada
`JWT_APP_ID` / `JWT_APP_SECRET` são partilhados com o `ondaka-web`
(`JitsiTokenService`). Se forem regenerados aqui, **têm de ser actualizados no `.env`
de produção do cPanel** ou as assembleias deixam de autenticar.
