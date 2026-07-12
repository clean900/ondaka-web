<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 — Página não encontrada | ONDAKA</title>
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
            min-height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            color: #fff;
            background: radial-gradient(at top, #1a0b2e 0%, #0a0a0a 55%);
        }
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card {
            background: rgba(20, 25, 60, 0.35);
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(140, 160, 240, 0.25); border-radius: 20px;
            padding: 44px 56px; max-width: 640px; width: 100%; text-align: center;
            box-shadow: 0 8px 60px rgba(80, 100, 240, 0.15);
        }
        .logo { font-size: 20px; font-weight: 800; letter-spacing: .14em; margin-bottom: 28px;
            background: linear-gradient(90deg, #00D4FF, #A855F7, #EC4899);
            -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .codigo { font-size: 120px; font-weight: 200; line-height: 1; letter-spacing: -4px;
            background: linear-gradient(135deg, #5DD4FF 0%, #B070FF 100%);
            -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .titulo { font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin: 8px 0 12px; }
        .descricao { font-size: 14px; color: rgba(255, 255, 255, 0.65); line-height: 1.5; margin-bottom: 28px; }
        .btn-voltar { display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px;
            background: transparent; border: 1px solid rgba(140, 160, 240, 0.45); border-radius: 8px;
            color: #5DD4FF; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1.5px;
            text-transform: uppercase; transition: all 0.3s; }
        .btn-voltar:hover { background: rgba(93, 212, 255, 0.1); border-color: rgba(93, 212, 255, 0.7); transform: translateY(-1px); }
        .btn-voltar svg { width: 18px; height: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">✨ ONDAKA</div>
            <div class="codigo">404</div>
            <div class="titulo">Página não encontrada</div>
            <div class="descricao">A página que procura não existe ou foi movida.</div>
            <a href="/" class="btn-voltar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-9 9 9M5 10v10h14V10" /></svg>
                Voltar ao Início
            </a>
        </div>
    </div>
</body>
</html>
