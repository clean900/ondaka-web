<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>403 — Acesso Negado | ONDAKA</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            color: #fff;
            overflow: hidden;
        }

        .bg-403 {
            position: fixed;
            inset: 0;
            background-image: url('/403_error_ondaka.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            z-index: 1;
        }

        .overlay {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, rgba(8, 12, 32, 0.4) 0%, rgba(20, 12, 50, 0.3) 100%);
            z-index: 2;
        }

        .container {
            position: relative;
            z-index: 3;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .card {
            background: rgba(20, 25, 60, 0.35);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(140, 160, 240, 0.25);
            border-radius: 20px;
            padding: 50px 60px;
            max-width: 720px;
            width: 100%;
            box-shadow: 0 8px 60px rgba(80, 100, 240, 0.15);
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 40px;
            align-items: center;
        }

        .codigo {
            font-size: 130px;
            font-weight: 200;
            line-height: 1;
            letter-spacing: -4px;
            background: linear-gradient(135deg, #5DD4FF 0%, #B070FF 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .info {
            border-left: 1px solid rgba(255, 255, 255, 0.2);
            padding-left: 30px;
        }

        .titulo {
            font-size: 18px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 12px;
            line-height: 1.3;
        }

        .descricao {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.65);
            line-height: 1.5;
            margin-bottom: 28px;
        }

        .btn-voltar {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 12px 24px;
            background: transparent;
            border: 1px solid rgba(140, 160, 240, 0.45);
            border-radius: 8px;
            color: #5DD4FF;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            transition: all 0.3s;
        }

        .btn-voltar:hover {
            background: rgba(93, 212, 255, 0.1);
            border-color: rgba(93, 212, 255, 0.7);
            transform: translateY(-1px);
        }

        .btn-voltar svg {
            width: 18px;
            height: 18px;
        }

        @media (max-width: 700px) {
            .card {
                grid-template-columns: 1fr;
                gap: 25px;
                padding: 35px;
            }
            .codigo { font-size: 90px; text-align: center; }
            .info { border-left: none; border-top: 1px solid rgba(255,255,255,0.2); padding-left: 0; padding-top: 25px; text-align: center; }
            .titulo { font-size: 15px; }
        }
    </style>
</head>
<body>
    <div class="bg-403"></div>
    <div class="overlay"></div>
    <div class="container">
        <div class="card">
            <div class="codigo">403</div>
            <div class="info">
                <div class="titulo">O utilizador não tem<br/>as permissões necessárias</div>
                <div class="descricao">Não tem autorização para aceder a este recurso.</div>
                <a href="/" class="btn-voltar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12l9-9 9 9M5 10v10h14V10" />
                    </svg>
                    Voltar ao Início
                </a>
            </div>
        </div>
    </div>
</body>
</html>
