/* Apresentação — ONDAKA — Programa de Afiliados. Corre sobre motor.js.

   ⚠️ A MECÂNICA E AS TAXAS SÃO AS DO CÓDIGO, não escolhas desta página:
      database/migrations/2026_09_02_100000_create_afiliados_tables.php
   Qualquer alteração ao programa muda primeiro lá, e só depois aqui. */
(function () {
  "use strict";
  var AP = window.AP, $ = AP.$, $$ = AP.$$, palco = AP.palco, MONO = AP.MONO;
  function kz(v) { return AP.num.format(Math.round(v)) + " Kz"; }

  var ESCALOES = [
    ["Bronze", 6, "a partir do 1.º cliente"],
    ["Prata", 8, "a partir de 5 clientes pagantes"],
    ["Ouro", 10, "a partir de 10 clientes pagantes"]
  ];
  var LIMIARES = [1, 5, 10];        /* o degrau de entrada de cada escalão */
  var POR_CLIENTES = true; /* senão, a escada sobe pela receita acumulada */
  var CARENCIA = 15, MINIMO = 10000, COOKIE = 90;

  function taxaPara(clientes, receita) {
    var base = POR_CLIENTES ? clientes : receita, t = ESCALOES[0][1];
    for (var i = 0; i < LIMIARES.length; i++) if (base >= LIMIARES[i]) t = ESCALOES[i][1];
    return t;
  }

  /* ═════════════════════════════════════════════ mapa do percurso */
  var NOS = [
    { id: "link", x: 90, y: 200, r: 40, rot: "Link", sub: "o seu código",
      texto: "<h4>O seu link</h4><p>Um endereço com o seu código. Partilha-o por mensagem, por email ou numa conversa — identifica-o em qualquer ponto de entrada da plataforma.</p>" },
    { id: "visita", x: 230, y: 110, r: 36, rot: "Visita", sub: COOKIE + " dias",
      texto: "<h4>A visita</h4><p>Quem abre o seu link fica associado a si durante " + COOKIE + " dias, mesmo que só decida mais tarde. A atribuição é do primeiro a registar e nunca é sobreposta.</p>" },
    { id: "cliente", x: 330, y: 280, r: 38, rot: "Cliente", sub: "atribuído",
      texto: "<h4>O cliente</h4><p>Quando se torna cliente, fica atribuído a si de forma vitalícia: conta para a sua comissão enquanto continuar a pagar.</p>" },
    { id: "pagamento", x: 450, y: 130, r: 36, rot: "Pagamento", sub: "só o cobrado",
      texto: "<h4>O pagamento</h4><p>A comissão calcula-se sobre o que foi efectivamente pago, e não sobre o que foi facturado. Uma factura por cobrar não gera nada.</p>" },
    { id: "comissao", x: 470, y: 300, r: 40, rot: "Comissão", sub: "sua",
      texto: "<h4>A comissão</h4><p>Nasce em carência de " + CARENCIA + " dias — a protecção contra estornos — e depois passa a disponível para levantamento, a partir de " + kz(MINIMO) + " acumulados.</p>" }
  ];
  var LIGACOES = [["link","visita"],["visita","cliente"],["cliente","pagamento"],
                  ["pagamento","comissao"],["link","cliente"]];

  (function mapa() {
    var gl = $("#ligacoes"), gn = $("#nos"), leg = $("#mapaLegenda");
    if (!gl || !gn) return;
    function porId(id) { return NOS.filter(function (n) { return n.id === id; })[0]; }
    LIGACOES.forEach(function (pr) {
      var a = porId(pr[0]), b = porId(pr[1]);
      var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", a.x); l.setAttribute("y1", a.y);
      l.setAttribute("x2", b.x); l.setAttribute("y2", b.y);
      l.setAttribute("class", "lig"); l.dataset.de = pr[0]; l.dataset.para = pr[1];
      gl.appendChild(l);
    });
    NOS.forEach(function (n) {
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "no"); g.dataset.id = n.id;
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
      g.setAttribute("aria-label", n.rot);
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", n.x); c.setAttribute("cy", n.y); c.setAttribute("r", n.r);
      c.setAttribute("class", "no__caixa");
      var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", n.x); t.setAttribute("y", n.y - 2);
      t.setAttribute("class", "no__rot"); t.textContent = n.rot;
      var s = document.createElementNS("http://www.w3.org/2000/svg", "text");
      s.setAttribute("x", n.x); s.setAttribute("y", n.y + 14);
      s.setAttribute("class", "no__sub"); s.textContent = n.sub;
      g.appendChild(c); g.appendChild(t); g.appendChild(s);
      function destacar() {
        $$(".no").forEach(function (o) { o.classList.toggle("is-on", o.dataset.id === n.id); });
        $$(".lig").forEach(function (l) {
          l.classList.toggle("is-on", l.dataset.de === n.id || l.dataset.para === n.id);
        });
        leg.innerHTML = n.texto;
      }
      g.addEventListener("click", destacar);
      g.addEventListener("focus", destacar);
      g.addEventListener("mouseenter", destacar);
      gn.appendChild(g);
    });
  })();

  $$("[data-ir]").forEach(function (b) {
    b.addEventListener("click", function () {
      var alvo = $(b.dataset.ir);
      if (alvo) alvo.scrollIntoView({ behavior: AP.reduzido ? "auto" : "smooth", block: "start" });
    });
  });

  /* ═══════════════════════════════════════════════ lista de escalões */
  (function escaloes() {
    var lista = $("#escLista");
    if (!lista) return;
    ESCALOES.forEach(function (e, i) {
      var d = document.createElement("div");
      d.className = "achado";
      var topo = i === ESCALOES.length - 1;
      d.innerHTML = '<span class="achado__sev" style="background:' +
        (topo ? "var(--teal)" : "var(--sky)") + '"></span>' +
        '<div><div class="achado__t" style="font-family:var(--display);font-weight:700;font-size:1.05rem">' +
        e[1] + '%</div><div class="achado__c">' + e[2] + '</div></div>' +
        '<span class="achado__b ' + (topo ? "b-baixa" : "b-info") + '">' +
        (topo ? "máximo" : "escalão " + (i + 1)) + "</span>";
      lista.appendChild(d);
    });
  })();

  /* ═══════════════════════════════════════════════════ calculadora */
  (function calc() {
    var cli = $("#qCli"), val = $("#qVal");
    if (!cli || !val) return;
    var saida = $("#calcSaida"), nota = $("#calcNota");

    function calcular() {
      var n = Math.max(0, Math.min(500, Math.round(+cli.value || 0)));
      var v = Math.max(0, Math.round(+val.value || 0));
      var receita = n * v;
      var taxa = taxaPara(n, receita);
      var com = receita * taxa / 100;

      nota.innerHTML = POR_CLIENTES
        ? "Com <b>" + n + (n === 1 ? " cliente" : " clientes") + " a pagar</b>, a taxa é de <b>" +
          taxa + "%</b>. " + (n < 5 ? "A partir de 5 clientes sobe para 8%." :
                              n < 10 ? "A partir de 10 clientes sobe para 10%." :
                                       "Está no escalão máximo.")
        : "Com <b>" + kz(receita) + "</b> de receita gerada, a taxa é de <b>" + taxa + "%</b>. " +
          (taxa < 10 ? "A escada sobe à medida que a receita acumulada cresce." :
                       "Está no escalão máximo.");

      saida.innerHTML = "";
      var g = document.createElement("div");
      g.className = "calc__grande";
      g.innerHTML = '<div class="calc__rot">A sua comissão, por período</div>' +
        '<div class="calc__total">' + kz(com) + "</div>" +
        '<div class="calc__porunidade">' + taxa + "% sobre " + kz(receita) +
        " · " + kz(com / Math.max(1, n)) + " por cliente</div>";
      saida.appendChild(g);

      var det = document.createElement("div");
      det.className = "calc__det";
      [[n + (n === 1 ? " cliente" : " clientes") + " × " + kz(v), kz(receita)],
       ["Escalão aplicado", taxa + "%"],
       ["Comissão do período", kz(com)],
       ["Se todos renovarem quatro vezes", kz(com * 4)],
       ["Base de cálculo", "sobre o valor da subscrição sem imposto"],
       ["Carência antes de ficar disponível", CARENCIA + " dias"],
       ["Mínimo para levantar", kz(MINIMO)]
      ].forEach(function (l) {
        var d = document.createElement("div");
        d.className = "calc__linha";
        d.innerHTML = "<span>" + l[0] + "</span><b>" + l[1] + "</b>";
        det.appendChild(d);
      });
      saida.appendChild(det);
    }

    $$(".nivel__b[data-alvo]").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = $("#" + b.dataset.alvo);
        c.value = Math.max(0, (+c.value || 0) + (+b.dataset.passo));
        calcular();
      });
    });
    [cli, val].forEach(function (c) {
      c.addEventListener("input", calcular); c.addEventListener("blur", calcular);
    });
    calcular();
  })();

  /* ═════════════════════════════════════════════════════ cenas animadas */
  var C = (function () {
    var s = getComputedStyle(document.documentElement);
    function v(n, f) { return (s.getPropertyValue(n) || f).trim(); }
    return { teal: v("--teal", "#17B3A3"), sky: v("--sky", "#4FA8E8"),
             alert: v("--alert", "#E0674C"), warn: v("--warn", "#D9A038"),
             line: v("--line", "#1D3350"), mute: v("--mute", "#8095AF"),
             raised: v("--raised", "#142842") };
  })();
  function rgba(hex, a) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return "rgba(" + parseInt(h.slice(0,2),16) + "," + parseInt(h.slice(2,4),16) + "," +
      parseInt(h.slice(4,6),16) + "," + a + ")";
  }
  function rot(ctx, t, x, y, cor, tam) {
    ctx.font = "600 " + (tam || 9) + "px " + MONO;
    ctx.fillStyle = cor; ctx.textAlign = "left"; ctx.fillText(t, x, y);
  }
  function caixa(ctx, x, y, l, a, r, pr, tr) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, l, a, r); else ctx.rect(x, y, l, a);
    if (pr) { ctx.fillStyle = pr; ctx.fill(); }
    if (tr) { ctx.strokeStyle = tr; ctx.lineWidth = 1; ctx.stroke(); }
  }

  /* ── capa: a rede de indicações a propagar-se ──────────────────────── */
  palco($("#grade"), {
    iniciar: function (L, A) {
      var ns = [];
      for (var i = 0; i < 46; i++)
        ns.push({ x: Math.random()*L, y: Math.random()*A,
                  vx: (Math.random()-.5)*8, vy: (Math.random()-.5)*8,
                  r: 1+Math.random()*1.8, on: Math.random() < .22 });
      return { ns: ns, acc: 0 };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .5) { e.acc = 0; e.ns[Math.floor(Math.random()*e.ns.length)].on = true; }
      e.ns.forEach(function (n) {
        n.x += n.vx*dt; n.y += n.vy*dt;
        if (n.x < 0 || n.x > L) n.vx *= -1;
        if (n.y < 0 || n.y > A) n.vy *= -1;
      });
      if (!ctx) return;
      for (var i = 0; i < e.ns.length; i++)
        for (var j = i+1; j < e.ns.length; j++) {
          var a = e.ns[i], b = e.ns[j], d = Math.hypot(a.x-b.x, a.y-b.y);
          if (d > 118) continue;
          ctx.strokeStyle = rgba((a.on && b.on) ? C.teal : C.line, (1-d/118)*.13);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      e.ns.forEach(function (n) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (n.on?1.4:0), 0, Math.PI*2);
        ctx.fillStyle = rgba(n.on ? C.teal : C.mute, n.on ? .62 : .22); ctx.fill();
      });
    }
  });

  /* ── 02 · o percurso, do clique à comissão ─────────────────────────── */
  palco($("#animPercurso"), {
    iniciar: function (L, A) { return { bs: [], acc: 0, pagas: 0, perdidas: 0 }; },
    pintar: function (ctx, L, A, e, dt, t) {
      var passos = ["link", "visita", "cliente", "pagamento", "comissão"];
      var px = L / passos.length, y = A * .46;
      e.acc += dt;
      if (e.acc > .42) {
        e.acc = 0;
        /* nem toda a visita se torna cliente — mostrar o contrário seria vender
           uma taxa de conversão que ninguém garante */
        e.bs.push({ p: 0, vivo: true, converte: Math.random() < .55 });
      }
      e.bs.forEach(function (b) {
        if (!b.vivo) { b.cai = (b.cai||0) + dt; return; }
        b.p += dt * .3;
        if (!b.converte && b.p > .42) { b.vivo = false; e.perdidas++; }
        if (b.p >= 1 && !b.f) { b.f = true; e.pagas++; }
      });
      e.bs = e.bs.filter(function (b) { return b.p < 1.16 && (b.cai||0) < 1.4; });
      if (!ctx) return;
      ctx.strokeStyle = rgba(C.line, .9); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px*.5, y); ctx.lineTo(L-px*.5, y); ctx.stroke();
      passos.forEach(function (s, i) {
        var x = px * (i + .5);
        var on = e.bs.some(function (b) { return b.vivo && Math.abs(b.p*(passos.length-1)-i) < .5; });
        ctx.beginPath(); ctx.arc(x, y, on ? 9 : 6, 0, Math.PI*2);
        ctx.fillStyle = on ? rgba(C.teal,.95) : rgba(C.line,1); ctx.fill();
        ctx.font = "600 9px " + MONO; ctx.fillStyle = on ? C.teal : C.mute;
        ctx.textAlign = "center"; ctx.fillText(s, x, y + 26);
      });
      e.bs.forEach(function (b) {
        var x = px*.5 + (L-px) * Math.min(1, b.p);
        var yy = y - 26 + (b.vivo ? 0 : (b.cai||0) * 50);
        ctx.globalAlpha = b.vivo ? (b.p > 1 ? Math.max(0,1.16-b.p)*6 : 1)
                                 : Math.max(0, 1 - (b.cai||0)/1.4);
        caixa(ctx, x-8, yy, 16, 12, 2, rgba(b.vivo ? C.sky : C.alert, .9), null);
        ctx.globalAlpha = 1;
      });
      ctx.textAlign = "left";
      rot(ctx, "comissões geradas  " + e.pagas, 14, 14, rgba(C.teal,.95), 11);
      rot(ctx, "visitas que não converteram  " + e.perdidas, 14, A-9, rgba(C.mute,.9));
    }
  });

  /* ── 03 · a escada dos escalões ────────────────────────────────────── */
  palco($("#animEscada"), {
    iniciar: function (L, A) { return { k: 0, i: 0, acc: 0 }; },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .55 && e.i < ESCALOES.length) { e.acc = 0; e.i++; }
      e.k += (e.i - e.k) * dt * 3;
      if (!ctx) return;
      var pad = 30, base = A - 30, alt = base - 34, lg = (L - pad*2) / ESCALOES.length;
      var max = ESCALOES[ESCALOES.length-1][1];
      ESCALOES.forEach(function (es, i) {
        var vis = Math.max(0, Math.min(1, e.k - i));
        if (vis <= 0) return;
        var h = (es[1] / max) * alt * vis, x = pad + lg*i;
        var topo = i === ESCALOES.length - 1;
        var cor = topo ? C.teal : C.sky;
        caixa(ctx, x+6, base-h, lg-12, h, 4, rgba(cor,.28), rgba(cor,.9));
        if (vis > .7) {
          ctx.font = "700 13px " + MONO; ctx.fillStyle = rgba(cor,.95); ctx.textAlign = "center";
          ctx.fillText(es[1] + "%", x + lg/2, base - h - 9);
        }
        ctx.font = "600 8px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "center";
        ctx.fillText(es[0], x + lg/2, base + 14);
      });
      ctx.textAlign = "left";
      rot(ctx, POR_CLIENTES ? "a escada sobe com o número de clientes a pagar"
                            : "a escada sobe com a receita que já gerou",
          14, 14, rgba(C.mute,.9));
    }
  });

  /* ── 04 · as origens de receita a convergirem ──────────────────────── */
  palco($("#animFontes"), {
    iniciar: function (L, A) {
      return { fs: [], acc: 0, total: 0, n: 3 };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      var cx = L * .78, cy = A * .5;
      e.acc += dt;
      if (e.acc > .3) {
        e.acc = 0;
        e.fs.push({ i: Math.floor(Math.random()*e.n), p: 0 });
      }
      e.fs.forEach(function (f) {
        f.p += dt * .75;
        if (f.p >= 1 && !f.f) { f.f = true; e.total++; }
      });
      e.fs = e.fs.filter(function (f) { return f.p < 1.2; });
      if (!ctx) return;
      var y0 = 26, dy = (A - 52) / Math.max(1, e.n - 1);
      for (var i = 0; i < e.n; i++) {
        var y = y0 + dy*i;
        ctx.strokeStyle = rgba(C.line,.8); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(46, y); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.beginPath(); ctx.arc(46, y, 4, 0, Math.PI*2);
        ctx.fillStyle = rgba(C.sky,.8); ctx.fill();
      }
      e.fs.forEach(function (f) {
        var y = y0 + dy*f.i, k = Math.min(1, f.p);
        var x = 46 + (cx-46)*k, yy = y + (cy-y)*k;
        ctx.globalAlpha = f.p > 1 ? Math.max(0,1.2-f.p)*5 : 1;
        ctx.beginPath(); ctx.arc(x, yy, 3.4, 0, Math.PI*2);
        ctx.fillStyle = rgba(C.teal,.95); ctx.fill();
        ctx.globalAlpha = 1;
      });
      var pul = 22 + Math.sin(t*2.4)*2;
      ctx.beginPath(); ctx.arc(cx, cy, pul+6, 0, Math.PI*2);
      ctx.strokeStyle = rgba(C.teal,.2); ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, pul, 0, Math.PI*2);
      ctx.fillStyle = rgba(C.teal,.95); ctx.fill();
      ctx.font = "700 9px " + MONO; ctx.fillStyle = "#06060F"; ctx.textAlign = "center";
      ctx.fillText("VOCÊ", cx, cy+3);
      ctx.textAlign = "left";
      rot(ctx, "pagamentos comissionados  " + e.total, 14, A-9, rgba(C.teal,.95), 11);
    }
  });

  /* ── 05 · a carência: pendente até disponível ──────────────────────── */
  palco($("#animCarencia"), {
    iniciar: function (L, A) { return { cs: [], acc: 0, disp: 0 }; },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .6 && e.cs.length < 9) { e.acc = 0; e.cs.push({ d: 0 }); }
      e.cs.forEach(function (c) {
        c.d += dt * (CARENCIA / 3.2);
        if (c.d >= CARENCIA && !c.f) { c.f = true; e.disp++; }
      });
      e.cs = e.cs.filter(function (c) { return c.d < CARENCIA * 1.5; });
      if (!ctx) return;
      var pad = 36, lg = L - pad*2, y = A*.44, ba = 16;
      caixa(ctx, pad, y, lg, ba, 3, rgba(C.line,.5), rgba(C.line,1));
      ctx.font = "600 9px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "left";
      ctx.fillText("comissão criada", pad, y - 9);
      ctx.textAlign = "right";
      ctx.fillStyle = rgba(C.teal,.95);
      ctx.fillText("disponível ao fim de " + CARENCIA + " dias", pad+lg, y - 9);
      e.cs.forEach(function (c, i) {
        var k = Math.min(1, c.d / CARENCIA);
        var x = pad + lg*k;
        ctx.beginPath(); ctx.arc(x, y + ba/2, 5, 0, Math.PI*2);
        ctx.fillStyle = rgba(k >= 1 ? C.teal : C.warn, .92); ctx.fill();
      });
      ctx.textAlign = "left";
      rot(ctx, "a carência existe para proteger de estornos e devoluções",
          pad, A-10, rgba(C.mute,.9));
      ctx.textAlign = "right";
      rot(ctx, "disponíveis  " + e.disp, pad+lg, A-10, rgba(C.teal,.95), 11);
      ctx.textAlign = "left";
    }
  });

  /* ── 06 · comissões por estado ─────────────────────────────────────── */
  palco($("#animPainel"), {
    iniciar: function (L, A) {
      return { est: [["em carência",0,"warn"],["disponível",0,"teal"],
                     ["em levantamento",0,"sky"],["paga",0,"teal"]], acc: 0 };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .36) {
        e.acc = 0;
        /* o fluxo real: nasce em carência e vai descendo pelos estados */
        if (e.est[3][1] > 14) e.est.forEach(function (x) { x[1] = 0; });
        else if (e.est[2][1] > 2) { e.est[2][1]--; e.est[3][1]++; }
        else if (e.est[1][1] > 3) { e.est[1][1]--; e.est[2][1]++; }
        else if (e.est[0][1] > 2) { e.est[0][1]--; e.est[1][1]++; }
        else e.est[0][1]++;
      }
      if (!ctx) return;
      var pad = 30, lg = (L - pad*2) / 4, base = A - 30, alt = base - 34;
      var max = Math.max(5, Math.max.apply(null, e.est.map(function (x) { return x[1]; })));
      e.est.forEach(function (x, i) {
        var h = (x[1] / max) * alt, px = pad + lg*i;
        var cor = x[2] === "warn" ? C.warn : x[2] === "sky" ? C.sky : C.teal;
        caixa(ctx, px+8, base-h, lg-16, h, 4, rgba(cor,.3), rgba(cor,.9));
        ctx.font = "700 12px " + MONO; ctx.fillStyle = rgba(cor,.95); ctx.textAlign = "center";
        if (h > 14) ctx.fillText(String(x[1]), px+lg/2, base-h-8);
        ctx.font = "600 8px " + MONO; ctx.fillStyle = C.mute;
        ctx.fillText(x[0], px+lg/2, base+14);
      });
      ctx.textAlign = "left";
      rot(ctx, "cada comissão tem estado, valor e origem — e vê-se uma a uma",
          14, 14, rgba(C.mute,.9));
    }
  });

  /* ── 07 · o saldo a acumular até ao mínimo ─────────────────────────── */
  palco($("#animSaldo"), {
    iniciar: function (L, A) { return { saldo: 0, acc: 0, levant: 0 }; },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .42) {
        e.acc = 0;
        e.saldo += MINIMO * (.12 + Math.random()*.2);
        if (e.saldo >= MINIMO) { e.levant++; e.saldo = 0; }
      }
      if (!ctx) return;
      var pad = 36, lg = L - pad*2, y = A*.42, ba = 26;
      caixa(ctx, pad, y, lg, ba, 4, rgba(C.line,.5), rgba(C.line,1));
      var k = Math.min(1, e.saldo / MINIMO);
      caixa(ctx, pad, y, lg*k, ba, 4, rgba(k >= .999 ? C.teal : C.sky, .8), null);
      ctx.font = "600 9px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "left";
      ctx.fillText("saldo disponível", pad, y - 9);
      ctx.textAlign = "right";
      ctx.fillStyle = rgba(C.teal,.95);
      ctx.fillText("mínimo " + kz(MINIMO), pad+lg, y - 9);
      ctx.textAlign = "left";
      ctx.font = "700 15px " + MONO; ctx.fillStyle = rgba(C.sky,.95);
      ctx.fillText(kz(e.saldo), pad, y + ba + 24);
      ctx.textAlign = "right";
      rot(ctx, "levantamentos feitos  " + e.levant, pad+lg, y + ba + 24, rgba(C.teal,.95), 11);
      ctx.textAlign = "left";
      rot(ctx, "pede-se quando quiser, a partir do mínimo acumulado",
          pad, A-10, rgba(C.mute,.9));
    }
  });

  /* ── FECHO · o rendimento a acumular com as renovações ─────────────── */
  palco($("#animCrescer"), {
    iniciar: function (L, A) {
      return { ms: [], i: 0, acc: 0, clientes: 0 };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .42) {
        e.acc = 0; e.i++;
        if (e.i % 2 === 1) e.clientes++;
        e.ms.push({ v: e.clientes, k: 0 });
        if (e.ms.length > 14) { e.ms.shift(); }
        if (e.i > 26) { e.i = 0; e.clientes = 0; e.ms = []; }
      }
      e.ms.forEach(function (m) { m.k = Math.min(1, m.k + dt*3); });
      if (!ctx) return;
      var pad = 32, base = A - 28, alt = base - 30, lg = (L - pad*2) / 14;
      var max = Math.max(3, e.clientes);
      var acum = 0;
      e.ms.forEach(function (m, i) {
        acum += m.v;
        var h = (m.v / max) * alt * m.k, x = pad + lg*i;
        caixa(ctx, x+3, base-h, lg-7, h, 2, rgba(C.teal,.34), rgba(C.teal,.85));
      });
      ctx.font = "600 9px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "left";
      ctx.fillText("cada barra é um período; a altura é o que esse período rendeu", pad, 16);
      ctx.font = "700 13px " + MONO; ctx.fillStyle = rgba(C.teal,.95);
      ctx.fillText(e.clientes + (e.clientes === 1 ? " cliente activo" : " clientes activos"),
                   pad, base + 20);
      ctx.textAlign = "right";
      rot(ctx, "o rendimento não é por venda — é por cliente que continua a pagar",
          L - pad, base + 20, rgba(C.mute,.9));
      ctx.textAlign = "left";
    }
  });

  AP.contar();
  AP.arrancar();
})();
