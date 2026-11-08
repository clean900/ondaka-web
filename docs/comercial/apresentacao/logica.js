/* Apresentação ONDAKA — comportamento.
   Corre sobre motor.js. Tudo o que é interativo aqui existe para demonstrar,
   não para decorar.

   ⚠️ OS PREÇOS SÃO OS DO CÓDIGO, e estão anotados com a sua origem:
      database/seeders/EscaloesCoreSeeder.php          → os cinco escalões
      database/migrations/..._create_plataforma_config → período, trial e imposto
      app/Domains/Subscription/Services/PrecoSubscricaoService.php → a fórmula
   Mexer num valor aqui sem o mexer lá parte a coerência entre a montra e a
   factura, que foi exactamente o que aconteceu uma vez no ADSA. */
(function () {
  "use strict";
  var AP = window.AP, $ = AP.$, $$ = AP.$$, palco = AP.palco, MONO = AP.MONO;

  /* ═══════════════════════════════════════════════════════════════ preços */
  /* EscaloesCoreSeeder.php: slug, nome, min, max (null = sem limite), Kz/imóvel/mês */
  var ESCALOES = [
    ["starter",    "Starter",    1,   30,   1850],
    ["standard",   "Standard",   31,  80,   1500],
    ["plus",       "Plus",       81,  200,  1200],
    ["large",      "Large",      201, 500,  900],
    ["enterprise", "Enterprise", 501, null, 600]
  ];
  /* plataforma_config: desconto por período de pagamento */
  var PERIODO = { mensal: [1, 0], semestral: [6, 5], anual: [12, 15] };
  var IVA = 14;            // imposto_taxa_pct, imposto_aplicavel = 1
  var TRIAL = 14;          // trial_duracao_dias

  function escalaoDe(n) {
    for (var i = ESCALOES.length - 1; i >= 0; i--) {
      if (n >= ESCALOES[i][2]) return ESCALOES[i];
    }
    return ESCALOES[0];
  }
  function kz(v) { return AP.num.format(Math.round(v)) + " Kz"; }

  /* ═══════════════════════════════════════════════ mapa dos três lados */
  var NOS = [
    { id: "gestao", x: 280, y: 90, r: 50, rot: "Administração", sub: "consola",
      texto: "<h4>Administração</h4><p>Condomínios, edifícios, imóveis e contratos; emissão das Taxas de Condomínio; despesas, lançamentos e relatórios; equipa e permissões. Na web e no telemóvel.</p>" },
    { id: "condomino", x: 130, y: 270, r: 46, rot: "Condómino", sub: "aplicação",
      texto: "<h4>Condómino</h4><p>As suas taxas e o saldo da fracção, pagamento por Multicaixa, avisos, Pedidos com fotografia, reservas de espaços comuns, documentos, assembleias e SOS. Sem custo para ele.</p>" },
    { id: "portaria", x: 430, y: 270, r: 46, rot: "Portaria", sub: "posto",
      texto: "<h4>Portaria</h4><p>Visitantes dentro agora, pré-aprovações, passes, encomendas, livro de ocorrências, lista negra, turnos da equipa e controlo de acessos por ZKTeco.</p>" },
    { id: "dados", x: 280, y: 200, r: 30, rot: "Um só registo", sub: "",
      texto: "<h4>Um só registo</h4><p>Os três lados escrevem e leem o mesmo imóvel, a mesma taxa e o mesmo Pedido. Não há exportações entre sistemas, porque não há dois sistemas.</p>" }
  ];
  var LIGACOES = [["gestao", "dados"], ["condomino", "dados"], ["portaria", "dados"],
                  ["gestao", "condomino"], ["gestao", "portaria"]];

  (function mapa() {
    var gl = $("#ligacoes"), gn = $("#nos"), leg = $("#mapaLegenda");
    if (!gl || !gn) return;
    function porId(id) { return NOS.filter(function (n) { return n.id === id; })[0]; }
    LIGACOES.forEach(function (p) {
      var a = porId(p[0]), b = porId(p[1]);
      var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", a.x); l.setAttribute("y1", a.y);
      l.setAttribute("x2", b.x); l.setAttribute("y2", b.y);
      l.setAttribute("class", "lig");
      l.dataset.de = p[0]; l.dataset.para = p[1];
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
      t.setAttribute("x", n.x); t.setAttribute("y", n.y + (n.sub ? -2 : 4));
      t.setAttribute("class", "no__rot"); t.textContent = n.rot;
      g.appendChild(c); g.appendChild(t);
      if (n.sub) {
        var s = document.createElementNS("http://www.w3.org/2000/svg", "text");
        s.setAttribute("x", n.x); s.setAttribute("y", n.y + 14);
        s.setAttribute("class", "no__sub"); s.textContent = n.sub;
        g.appendChild(s);
      }
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

  /* botões que levam a uma secção */
  $$("[data-ir]").forEach(function (b) {
    b.addEventListener("click", function () {
      var alvo = $(b.dataset.ir);
      if (alvo) alvo.scrollIntoView({ behavior: AP.reduzido ? "auto" : "smooth", block: "start" });
    });
  });

  /* ═══════════════════════════════════════════════ loja de funcionalidades */
  /* FeaturesCatalogoSeeder.php + FeaturesLojaFinalSeeder.php — nome, categoria,
     preço e unidade. Os que o catálogo não precifica entram sem preço, e é isso
     que a etiqueta diz: «sob proposta», nunca um número inventado. */
  var LOJA = [
    ["comunicacao", "Serviço SMS ONDAKA", 5000, "mês", "Avisos, emissão de taxas e confirmações de pagamento por SMS."],
    ["comunicacao", "Pacote extra de SMS", 25, "SMS", "Mensagens acima do plafond incluído, compradas quando precisar."],
    ["comunicacao", "WhatsApp Business API", null, "mensagem", "O mesmo aviso pelo canal que o condómino já usa todos os dias."],
    ["comunicacao", "Assembleia virtual", 6000, "assembleia", "Convocatória, quórum e votação ponderada à distância."],
    ["comunicacao", "Email marketing e newsletters", 7000, "mês", "Comunicação periódica da administração aos condóminos."],
    ["comunicacao", "Notificações instantâneas", 4000, "mês", "Avisos em tempo real na aplicação, sem esperar pelo refrescar."],
    ["pagamentos", "Referências Multicaixa", 20000, "transacção", "Cada taxa com a sua referência; o pagamento fecha-a sozinho."],
    ["pagamentos", "Débito directo", null, "débito", "Cobrança automática na conta do condómino que autorizar."],
    ["pagamentos", "Multicaixa Express na aplicação", null, "transacção", "Pagamento dentro da aplicação, sem sair para outra."],
    ["pagamentos", "Pagar tudo de uma vez", 3000, "mês", "O condómino liquida todas as taxas em atraso numa só operação."],
    ["pagamentos", "Saldo da fracção", 4000, "mês", "Quem paga a mais fica com crédito — e vê-o no telemóvel."],
    ["pagamentos", "Cobrança judicial automática", 6000, "mês", "O processo de dívida persistente instruído pelo próprio sistema."],
    ["seguranca", "Controlo de acessos ZKTeco", 8000, "dispositivo", "O torniquete e a fechadura a falarem com o mesmo registo."],
    ["seguranca", "Passe de visitante com marca", 3000, "passe", "Passe impresso com a identidade do condomínio."],
    ["seguranca", "Lista negra de visitantes", 3000, "mês", "Quem não entra, e porquê, visível no posto da portaria."],
    ["seguranca", "Encomendas avançado", 4000, "mês", "Dimensões e fotografia da encomenda recebida."],
    ["gestao", "Gestão de documentos", 5000, "mês", "Regulamentos, contratos e actas num repositório com permissões."],
    ["gestao", "Manutenção preventiva", 2000, "mês", "Calendário por equipamento, com aviso antes de a avaria acontecer."],
    ["gestao", "Reservas de áreas comuns", 5000, "mês", "Salão, ginásio e churrasqueira com regras e confirmação."],
    ["gestao", "Checklist diária de inspecção", 4000, "mês", "A ronda do edifício registada ponto por ponto."],
    ["gestao", "Fornecedores certificados", 3000, "mês", "Prestadores validados, com histórico de intervenções."],
    ["gestao", "Chatbot de perguntas frequentes", 8000, "mês", "Responde ao condómino sem ocupar quem administra."],
    ["gestao", "Marketplace condominial", 4000, "mês", "Anúncios e serviços entre vizinhos, moderados pela administração."],
    ["gestao", "Importação massiva avançada", 3000, "mês", "Listas grandes de imóveis e condóminos carregadas de uma vez."],
    ["gestao", "Relatórios personalizados", 6000, "mês", "Os relatórios que a assembleia pede, no formato em que os pede."],
    ["gestao", "Deteção de anomalias", 8000, "mês", "Consumos e despesas fora do padrão, sinalizados sozinhos."],
    ["gestao", "Livro de reclamações electrónico", 5000, "mês", "Reclamação registada, encaminhada e com prazo à vista."],
    ["gestao", "Leitura de contadores por fotografia", null, "leitura", "Água e luz lidos pela câmara, sem transcrição à mão."],
    ["gestao", "Histórico de alterações", 2000, "mês", "Quem mudou o quê, e quando — o básico da auditoria."],
    ["gestao", "Registo de auditoria centralizado", 6000, "mês", "Todas as operações sensíveis num só registo pesquisável."],
    ["gestao", "RGPD e privacidade avançada", 7000, "mês", "Consentimentos, pedidos de acesso e retenção de dados."],
    ["personalizacao", "Marca própria", 10000, "mês", "O logótipo e as cores da empresa gestora na plataforma."],
    ["personalizacao", "Domínio personalizado", 5000, "mês", "A plataforma no endereço da própria empresa gestora."],
    ["personalizacao", "Painel de indicadores", 10000, "mês", "Cobrança, dívida e evolução por condomínio, num ecrã."],
    ["personalizacao", "API pública e webhooks", 7000, "mês", "Ligação ao que a empresa gestora já usa."]
  ];
  var CATS = [["todos", "Todas"], ["pagamentos", "Pagamentos"], ["comunicacao", "Comunicação"],
              ["gestao", "Gestão"], ["seguranca", "Segurança"], ["personalizacao", "Personalização"]];

  (function loja() {
    var chips = $("#lojaChips"), lista = $("#lojaLista"), nota = $("#lojaNota");
    if (!chips) return;
    function pintar(cat) {
      lista.innerHTML = "";
      var itens = LOJA.filter(function (i) { return cat === "todos" || i[0] === cat; });
      itens.forEach(function (i) {
        var b = document.createElement("button");
        b.className = "soc-item"; b.type = "button";
        b.innerHTML = '<span class="soc-item__i">+</span>' + i[1] +
          '<span class="soc-item__c">' + (i[2] === null ? "sob proposta" : kz(i[2]) + " / " + i[3]) + "</span>";
        b.addEventListener("click", function () {
          $$(".soc-item", lista).forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
          nota.innerHTML = "<h4>" + i[1] + "</h4><p>" + i[4] +
            '<br><span style="color:var(--faint);font-size:.8rem">' +
            (i[2] === null ? "Preço por confirmar com a KAYANTEC — o catálogo não o fixa." :
             kz(i[2]) + " por " + i[3] + ", sem impostos") + "</span></p>";
        });
        lista.appendChild(b);
      });
      var comPreco = itens.filter(function (i) { return i[2] !== null; }).length;
      nota.innerHTML = "<h4>" + itens.length + (itens.length === 1 ? " funcionalidade" : " funcionalidades") +
        "</h4><p>Toque numa para ver o que faz e quanto custa. " + comPreco +
        " têm preço em tabela; as restantes dependem do volume e orçamentam-se à parte.</p>";
    }
    CATS.forEach(function (c, i) {
      var b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " chip--on" : ""); b.type = "button";
      b.textContent = c[1] + (c[0] === "todos" ? " (" + LOJA.length + ")" :
        " (" + LOJA.filter(function (x) { return x[0] === c[0]; }).length + ")");
      b.addEventListener("click", function () {
        $$(".chip", chips).forEach(function (o) { o.classList.toggle("chip--on", o === b); });
        pintar(c[0]);
      });
      chips.appendChild(b);
    });
    pintar("todos");
  })();

  /* ═════════════════════════════════════════════════════════ calculadora */
  (function calculadora() {
    var campo = $("#qImoveis");
    if (!campo) return;
    var saida = $("#calcSaida"), notaEsc = $("#calcEscalao");

    function calcular() {
      var n = Math.max(1, Math.min(5000, Math.round(+campo.value || 1)));
      var per = ($$('input[name="per"]').filter(function (r) { return r.checked; })[0] || {}).value || "semestral";
      var esc = escalaoDe(n), base = esc[4];
      var meses = PERIODO[per][0], descPer = PERIODO[per][1];

      var semDesc = n * base * meses;
      var subtotal = semDesc * (1 - descPer / 100);
      var imposto = subtotal * (IVA / 100);
      var total = subtotal + imposto;
      var porImovelMes = subtotal / n / meses;

      notaEsc.innerHTML = "Com <b>" + AP.num.format(n) + (n === 1 ? " imóvel" : " imóveis") +
        "</b> o escalão é <b>" + esc[1] + "</b> — " + kz(base) + " por imóvel e por mês" +
        (esc[3] === null ? ", a partir de " + esc[2] + " imóveis (preço negociável acima deste escalão)"
                         : ", para " + esc[2] + " a " + esc[3] + " imóveis") + ".";

      saida.innerHTML = "";
      var g = document.createElement("div");
      g.className = "calc__grande";
      g.innerHTML = '<div class="calc__rot">A pagar ' +
        (per === "mensal" ? "por mês" : per === "semestral" ? "ao semestre" : "ao ano") +
        ', com IVA</div><div class="calc__total">' + kz(total) + "</div>" +
        '<div class="calc__porunidade">' + kz(porImovelMes) +
        " por imóvel e por mês · " + kz(total / n / meses) + " com imposto</div>";
      saida.appendChild(g);

      var det = document.createElement("div");
      det.className = "calc__det";
      var linhas = [
        [AP.num.format(n) + " × " + kz(base) + " × " + meses + (meses === 1 ? " mês" : " meses"), kz(semDesc)],
        ["Desconto de período — " + per + (descPer ? " (−" + descPer + "%)" : " (sem desconto)"),
         descPer ? "−" + kz(semDesc - subtotal) : "—"],
        ["Subtotal sem impostos", kz(subtotal)],
        ["IVA à taxa legal (" + IVA + "%)", kz(imposto)]
      ];
      if (per !== "anual") {
        var anualSub = n * base * 12 * (1 - PERIODO.anual[1] / 100);
        var equiv = subtotal / meses * 12;
        linhas.push(["No ciclo anual, os mesmos doze meses custariam",
                     kz(anualSub * (1 + IVA / 100)) + " — poupa " + kz((equiv - anualSub) * (1 + IVA / 100))]);
      }
      linhas.push(["A aplicação dos condóminos", "sem custo, incluída"]);
      linhas.push(["Funcionalidades da loja", "opcionais, nenhuma somada aqui"]);
      linhas.forEach(function (l) {
        var d = document.createElement("div");
        d.className = "calc__linha";
        d.innerHTML = "<span>" + l[0] + "</span><b>" + l[1] + "</b>";
        det.appendChild(d);
      });
      saida.appendChild(det);
    }

    $$(".nivel__b").forEach(function (b) {
      b.addEventListener("click", function () {
        campo.value = Math.max(1, Math.min(5000, (+campo.value || 0) + (+b.dataset.passo)));
        calcular();
      });
    });
    campo.addEventListener("input", calcular);
    campo.addEventListener("blur", function () {
      campo.value = Math.max(1, Math.min(5000, Math.round(+campo.value || 1))); calcular();
    });
    $$('input[name="per"]').forEach(function (r) { r.addEventListener("change", calcular); });
    calcular();
  })();

  /* ═════════════════════════════════════════════════════ cenas animadas */
  var C = (function () {
    var s = getComputedStyle(document.documentElement);
    function v(n, f) { return (s.getPropertyValue(n) || f).trim(); }
    return { teal: v("--teal", "#00D4FF"), sky: v("--sky", "#A855F7"),
             alert: v("--alert", "#EC4899"), warn: v("--warn", "#F0A030"),
             line: v("--line", "#23234D"), mute: v("--mute", "#8A8EBE"),
             raised: v("--raised", "#16163A") };
  })();
  function rgba(hex, a) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return "rgba(" + parseInt(h.slice(0, 2), 16) + "," + parseInt(h.slice(2, 4), 16) + "," +
      parseInt(h.slice(4, 6), 16) + "," + a + ")";
  }
  function rot(ctx, texto, x, y, cor, tam) {
    ctx.font = "600 " + (tam || 9) + "px " + MONO;
    ctx.fillStyle = cor; ctx.textAlign = "left";
    ctx.fillText(texto, x, y);
  }
  function caixa(ctx, x, y, l, a, r, preenche, traco) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, l, a, r); else ctx.rect(x, y, l, a);
    if (preenche) { ctx.fillStyle = preenche; ctx.fill(); }
    if (traco) { ctx.strokeStyle = traco; ctx.lineWidth = 1; ctx.stroke(); }
  }

  /* ── capa: a grade do edifício a acender imóvel a imóvel ───────────────── */
  palco($("#grade"), {
    iniciar: function (L, A) {
      var cel = 26, cols = Math.ceil(L / cel), lins = Math.ceil(A / cel), cs = [];
      for (var i = 0; i < cols * lins; i++) cs.push({ luz: Math.random() * .2, alvo: 0 });
      return { cel: cel, cols: cols, lins: lins, cs: cs, acc: 0 };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .09) { e.acc = 0; e.cs[Math.floor(Math.random() * e.cs.length)].alvo = 1; }
      for (var k = 0; k < e.cs.length; k++) {
        var c = e.cs[k];
        c.luz += (c.alvo - c.luz) * dt * 2.2;
        if (c.luz > .85) c.alvo = .08;
      }
      if (!ctx) return;
      for (var i = 0; i < e.cs.length; i++) {
        var x = (i % e.cols) * e.cel, y = Math.floor(i / e.cols) * e.cel;
        var l = e.cs[i].luz;
        caixa(ctx, x + 2, y + 2, e.cel - 5, e.cel - 5, 3, rgba(C.teal, l * .14), rgba(C.teal, l * .3));
      }
    }
  });

  /* ── 02 · o recibo que se perde entre mãos ─────────────────────────────── */
  palco($("#animCaos"), {
    iniciar: function (L, A) {
      return { ps: [], acc: 0, perdidos: 0, chegados: 0, maos: 5 };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      var yL = A * .62, px = L / (e.maos + 1);
      e.acc += dt;
      if (e.acc > .5 && e.ps.length < 16) {
        e.acc = 0;
        e.ps.push({ x: px * .5, mao: 0, p: 0, vivo: true, cai: 0, y: yL });
      }
      e.ps.forEach(function (p) {
        if (!p.vivo) { p.y += dt * 60; p.cai += dt; return; }
        p.p += dt * .6;
        if (p.p >= 1) {
          p.p = 0; p.mao++;
          /* numa gestão sem sistema, cada passagem de mão tem uma hipótese real de
             perder o comprovativo. 18% por mão, cinco mãos — é o que se vê. */
          if (Math.random() < .18) { p.vivo = false; e.perdidos++; }
          else if (p.mao >= e.maos) { p.vivo = false; p.ok = true; e.chegados++; }
        }
        p.x = px * (.5 + p.mao + p.p);
      });
      e.ps = e.ps.filter(function (p) { return p.cai < 3 && p.x < L + 40; });
      if (!ctx) return;
      ctx.strokeStyle = rgba(C.line, .9); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, yL + 9); ctx.lineTo(L, yL + 9); ctx.stroke();
      var nomes = ["condómino", "porteiro", "caderno", "administração", "assembleia"];
      for (var i = 0; i < e.maos; i++) {
        var x = px * (i + .5);
        caixa(ctx, x - 26, yL - 4, 52, 26, 5, rgba(C.raised, .9), rgba(C.line, 1));
        ctx.font = "600 8px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "center";
        ctx.fillText(nomes[i], x, yL + 12);
      }
      e.ps.forEach(function (p) {
        ctx.globalAlpha = p.vivo ? 1 : Math.max(0, 1 - p.cai / 1.6);
        var cor = p.ok ? C.teal : (p.vivo ? C.sky : C.alert);
        caixa(ctx, p.x - 7, p.y - 16, 14, 18, 2, rgba(cor, .9), rgba(cor, 1));
        ctx.globalAlpha = 1;
      });
      ctx.textAlign = "left";
      rot(ctx, "recibos entregues  " + e.chegados, 14, 14, rgba(C.teal, .95), 11);
      rot(ctx, "recibos perdidos  " + e.perdidos, 14, 29, rgba(C.alert, .95), 11);
      rot(ctx, "cada passagem de mão é uma hipótese de perder a prova", 14, A - 9, rgba(C.mute, .9));
    }
  });

  /* ── 03 · um lançamento, três lados a verem-no ao mesmo tempo ─────────── */
  palco($("#animLados"), {
    iniciar: function (L, A) { return { fs: [], acc: 0, n: 0 }; },
    pintar: function (ctx, L, A, e, dt, t) {
      var cx = L / 2, cy = A * .5;
      var alvos = [[L * .16, A * .22, "Administração"], [L * .16, A * .82, "Condómino"], [L * .84, A * .52, "Portaria"]];
      e.acc += dt;
      if (e.acc > .42) {
        e.acc = 0; e.n++;
        for (var i = 0; i < 3; i++) e.fs.push({ i: i, p: 0 });
      }
      e.fs.forEach(function (f) { f.p += dt * .9; });
      e.fs = e.fs.filter(function (f) { return f.p < 1.3; });
      if (!ctx) return;
      alvos.forEach(function (a) {
        ctx.strokeStyle = rgba(C.line, .8); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(a[0], a[1]); ctx.stroke();
        caixa(ctx, a[0] - 54, a[1] - 15, 108, 30, 6, rgba(C.raised, .95), rgba(C.line, 1));
        ctx.font = "600 9px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "center";
        ctx.fillText(a[2], a[0], a[1] + 4);
      });
      e.fs.forEach(function (f) {
        var a = alvos[f.i], k = Math.min(1, f.p);
        var x = cx + (a[0] - cx) * k, y = cy + (a[1] - cy) * k;
        var cor = [C.teal, C.sky, C.warn][f.i];
        ctx.globalAlpha = f.p > 1 ? Math.max(0, 1.3 - f.p) * 3 : 1;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(cor, .95); ctx.fill();
        ctx.globalAlpha = 1;
      });
      var pul = 20 + Math.sin(t * 2.6) * 2;
      ctx.beginPath(); ctx.arc(cx, cy, pul + 7, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(C.teal, .22); ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, pul, 0, Math.PI * 2);
      ctx.fillStyle = rgba(C.teal, .95); ctx.fill();
      ctx.font = "700 9px " + MONO; ctx.fillStyle = "#07070F"; ctx.textAlign = "center";
      ctx.fillText("DADOS", cx, cy + 3);
      ctx.textAlign = "left";
      rot(ctx, "lançamentos propagados  " + e.n * 3, 14, A - 9, rgba(C.teal, .9), 11);
    }
  });

  /* ── 04 · o ciclo de uma taxa, do cálculo ao recibo ───────────────────── */
  palco($("#animCobranca"), {
    iniciar: function (L, A) {
      return { fase: 0, acc: 0, pagas: 0, emitidas: 0, bolas: [] };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      var passos = ["calcular", "emitir", "SMS", "Multicaixa", "recibo"];
      var px = L / passos.length, y = A * .46;
      e.acc += dt;
      if (e.acc > .34) {
        e.acc = 0;
        e.bolas.push({ p: 0 }); e.emitidas++;
      }
      e.bolas.forEach(function (b) {
        b.p += dt * .34;
        if (b.p >= 1 && !b.fim) { b.fim = true; e.pagas++; }
      });
      e.bolas = e.bolas.filter(function (b) { return b.p < 1.18; });
      if (!ctx) return;
      ctx.strokeStyle = rgba(C.line, .9); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px * .5, y); ctx.lineTo(L - px * .5, y); ctx.stroke();
      passos.forEach(function (p, i) {
        var x = px * (i + .5);
        var activo = e.bolas.some(function (b) { return Math.abs(b.p * (passos.length - 1) - i) < .5; });
        ctx.beginPath(); ctx.arc(x, y, activo ? 9 : 6, 0, Math.PI * 2);
        ctx.fillStyle = activo ? rgba(C.teal, .95) : rgba(C.line, 1); ctx.fill();
        ctx.font = "600 9px " + MONO; ctx.fillStyle = activo ? C.teal : C.mute;
        ctx.textAlign = "center"; ctx.fillText(p, x, y + 26);
      });
      e.bolas.forEach(function (b) {
        var x = px * .5 + (L - px) * Math.min(1, b.p);
        ctx.globalAlpha = b.p > 1 ? Math.max(0, 1.18 - b.p) * 5.5 : 1;
        caixa(ctx, x - 9, y - 26, 18, 13, 2, rgba(C.sky, .9), rgba(C.sky, 1));
        ctx.globalAlpha = 1;
      });
      ctx.textAlign = "left";
      rot(ctx, "taxas emitidas  " + e.emitidas, 14, 14, rgba(C.sky, .95), 11);
      rot(ctx, "recibos fechados sem intervenção  " + e.pagas, 14, A - 9, rgba(C.teal, .95), 11);
    }
  });

  /* ── 05 · as contas do condomínio: entrou, saiu, saldo ────────────────── */
  palco($("#animContas"), {
    iniciar: function (L, A) {
      var ms = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"], d = [];
      for (var i = 0; i < ms.length; i++) {
        d.push({ m: ms[i], rec: 0, des: 0,
                 recAlvo: .55 + Math.random() * .4, desAlvo: .3 + Math.random() * .4 });
      }
      return { d: d, i: 0, acc: 0 };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .42 && e.i < e.d.length) { e.acc = 0; e.d[e.i].on = true; e.i++; }
      e.d.forEach(function (b) {
        if (!b.on) return;
        b.rec += (b.recAlvo - b.rec) * dt * 3.4;
        b.des += (b.desAlvo - b.des) * dt * 3.4;
      });
      if (!ctx) return;
      var pad = 34, base = A - 30, alt = base - 26, lg = (L - pad * 2) / e.d.length;
      ctx.strokeStyle = rgba(C.line, .85); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad - 8, base); ctx.lineTo(L - pad + 8, base); ctx.stroke();
      e.d.forEach(function (b, i) {
        var x = pad + lg * i, l = lg * .33;
        var hr = b.rec * alt, hd = b.des * alt;
        caixa(ctx, x + lg * .1, base - hr, l, hr, 2, rgba(C.teal, .78), null);
        caixa(ctx, x + lg * .1 + l + 3, base - hd, l, hd, 2, rgba(C.alert, .68), null);
        ctx.font = "600 9px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "center";
        ctx.fillText(b.m, x + lg * .42, base + 14);
        if (b.rec > .1) {
          var saldo = (b.rec - b.des) * alt;
          ctx.beginPath(); ctx.arc(x + lg * .42, base - saldo - 2, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = rgba(C.warn, .95); ctx.fill();
        }
      });
      ctx.textAlign = "left";
      rot(ctx, "■ entrou — taxas cobradas", 14, 14, rgba(C.teal, .95));
      rot(ctx, "■ saiu — despesas com documento anexo", 160, 14, rgba(C.alert, .95));
      rot(ctx, "● saldo do mês", 14, A - 9, rgba(C.warn, .95));
    }
  });

  /* ── 06 · um Pedido, do abrir ao fechar ───────────────────────────────── */
  palco($("#animPedidos"), {
    iniciar: function (L, A) { return { ps: [], acc: 0, fechados: 0 }; },
    pintar: function (ctx, L, A, e, dt, t) {
      var cols = ["aberto", "atribuído", "em curso", "fechado"];
      var cl = L / cols.length;
      e.acc += dt;
      if (e.acc > .62 && e.ps.length < 11) {
        e.acc = 0;
        e.ps.push({ c: 0, p: 0, y: 34 + Math.random() * (A - 80), vel: .5 + Math.random() * .5 });
      }
      e.ps.forEach(function (p) {
        p.p += dt * p.vel;
        if (p.p >= 1) {
          p.p = 0; p.c++;
          if (p.c >= cols.length - 1) { p.feito = true; if (!p.cont) { p.cont = 1; e.fechados++; } }
        }
      });
      e.ps = e.ps.filter(function (p) { return !p.feito || p.p < .6; });
      if (!ctx) return;
      cols.forEach(function (c, i) {
        var x = cl * i;
        caixa(ctx, x + 5, 24, cl - 10, A - 48, 6, rgba(C.raised, .4), rgba(C.line, .9));
        ctx.font = "600 9px " + MONO; ctx.textAlign = "center";
        ctx.fillStyle = i === cols.length - 1 ? C.teal : C.mute;
        ctx.fillText(c, x + cl / 2, 17);
      });
      e.ps.forEach(function (p) {
        var x = cl * (p.c + .5) + cl * p.p;
        var cor = p.c >= cols.length - 1 ? C.teal : (p.c === 0 ? C.alert : C.sky);
        caixa(ctx, x - 17, p.y - 7, 34, 14, 3, rgba(cor, .85), rgba(cor, 1));
      });
      ctx.textAlign = "left";
      rot(ctx, "Pedidos fechados  " + e.fechados, 14, A - 9, rgba(C.teal, .95), 11);
    }
  });

  /* ── 07 · votação ponderada pela quota proporcional ───────────────────── */
  palco($("#animAssembleia"), {
    iniciar: function (L, A) {
      var vs = [];
      for (var i = 0; i < 26; i++) {
        /* a quota proporcional varia com a área do imóvel — é essa a conta que
           uma votação por cabeças ignora e uma assembleia contesta */
        vs.push({ peso: .4 + Math.random() * 1.6, voto: null, ang: Math.random() * Math.PI * 2 });
      }
      return { vs: vs, i: 0, acc: 0, fav: 0, con: 0 };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .18 && e.i < e.vs.length) {
        e.acc = 0;
        var v = e.vs[e.i];
        v.voto = Math.random() < .68 ? 1 : 0;
        if (v.voto) e.fav += v.peso; else e.con += v.peso;
        e.i++;
      }
      if (!ctx) return;
      var cx = L * .26, cy = A * .52, R = Math.min(A * .34, 62);
      e.vs.forEach(function (v, i) {
        var a = (i / e.vs.length) * Math.PI * 2 - Math.PI / 2;
        var x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        var r = 2.4 + v.peso * 2.2;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = v.voto === null ? rgba(C.line, 1) :
          (v.voto ? rgba(C.teal, .9) : rgba(C.alert, .85));
        ctx.fill();
      });
      ctx.font = "600 9px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "center";
      ctx.fillText("26 imóveis", cx, cy + R + 20);
      ctx.fillText("o círculo é a quota", cx, cy + R + 33);

      var bx = L * .5, bl = L * .42, by = A * .4, ba = 22;
      var tot = e.fav + e.con || 1;
      ctx.textAlign = "left";
      rot(ctx, "A FAVOR", bx, by - 7, rgba(C.teal, .95));
      caixa(ctx, bx, by, bl, ba, 3, rgba(C.line, .55), null);
      caixa(ctx, bx, by, bl * (e.fav / tot), ba, 3, rgba(C.teal, .85), null);
      rot(ctx, (e.fav / tot * 100).toFixed(1) + "%", bx + bl + 8, by + 15, rgba(C.teal, .95), 11);

      rot(ctx, "CONTRA", bx, by + ba + 27, rgba(C.alert, .95));
      caixa(ctx, bx, by + ba + 34, bl, ba, 3, rgba(C.line, .55), null);
      caixa(ctx, bx, by + ba + 34, bl * (e.con / tot), ba, 3, rgba(C.alert, .8), null);
      rot(ctx, (e.con / tot * 100).toFixed(1) + "%", bx + bl + 8, by + ba + 49, rgba(C.alert, .95), 11);

      rot(ctx, "o voto pesa a quota proporcional, não uma cabeça por imóvel",
          14, A - 9, rgba(C.mute, .9));
    }
  });

  /* ── 08 · a portaria: entradas, saídas e quem está dentro ─────────────── */
  palco($("#animPortaria"), {
    iniciar: function (L, A) { return { vs: [], acc: 0, dentro: 0, hoje: 0 }; },
    pintar: function (ctx, L, A, e, dt, t) {
      var porta = L * .42, y0 = A * .3;
      e.acc += dt;
      if (e.acc > .45) {
        e.acc = 0;
        var pre = Math.random() < .55;
        e.vs.push({ x: -20, y: y0 + Math.random() * (A * .4), pre: pre, estado: "vem",
                    esp: 0, perm: 0, tempo: 0 });
      }
      e.vs.forEach(function (v) {
        v.tempo += dt;
        if (v.estado === "vem") {
          v.x += dt * 56;
          if (v.x >= porta - 14) {
            v.estado = "porta"; v.x = porta - 14;
            /* a pré-aprovação é o que faz a diferença no tempo de espera: o
               porteiro já tem a autorização do condómino antes de a visita chegar */
            v.esp = v.pre ? .4 : 1.9;
          }
        } else if (v.estado === "porta") {
          v.esp -= dt;
          if (v.esp <= 0) { v.estado = "dentro"; e.dentro++; e.hoje++; v.perm = 3 + Math.random() * 3; }
        } else if (v.estado === "dentro") {
          v.x += dt * 30; v.perm -= dt;
          if (v.perm <= 0) { v.estado = "sai"; e.dentro--; }
        } else { v.x += dt * 70; }
      });
      e.vs = e.vs.filter(function (v) { return v.x < L + 30; });
      if (!ctx) return;
      ctx.strokeStyle = rgba(C.teal, .5); ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(porta, 20); ctx.lineTo(porta, A - 22); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "600 9px " + MONO; ctx.fillStyle = C.mute; ctx.textAlign = "center";
      ctx.fillText("portaria", porta, 14);
      ctx.fillText("condomínio", (porta + L) / 2, 14);
      e.vs.forEach(function (v) {
        var cor = v.estado === "porta" ? (v.pre ? C.teal : C.warn)
                : v.estado === "dentro" ? C.sky : v.estado === "sai" ? C.mute : C.mute;
        ctx.beginPath(); ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(cor, .9); ctx.fill();
        if (v.estado === "porta") {
          ctx.font = "600 7px " + MONO; ctx.fillStyle = rgba(cor, .95); ctx.textAlign = "left";
          ctx.fillText(v.pre ? "pré-aprovado" : "a registar", v.x + 9, v.y + 3);
        }
      });
      ctx.textAlign = "left";
      rot(ctx, "dentro agora  " + e.dentro, 14, A - 24, rgba(C.sky, .95), 11);
      rot(ctx, "entradas registadas  " + e.hoje, 14, A - 9, rgba(C.teal, .95), 11);
    }
  });

  /* ── 10 · a escada dos escalões ───────────────────────────────────────── */
  palco($("#animEscada"), {
    iniciar: function (L, A) { return { k: 0, acc: 0, i: 0 }; },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .5 && e.i < ESCALOES.length) { e.acc = 0; e.i++; }
      e.k += (e.i - e.k) * dt * 3.2;
      if (!ctx) return;
      var pad = 30, base = A - 28, alt = base - 30, lg = (L - pad * 2) / ESCALOES.length;
      var max = ESCALOES[0][4];
      ESCALOES.forEach(function (es, i) {
        var vis = Math.max(0, Math.min(1, e.k - i));
        if (vis <= 0) return;
        var h = (es[4] / max) * alt * vis;
        var x = pad + lg * i;
        var cor = i === 0 ? C.alert : i === ESCALOES.length - 1 ? C.teal : C.sky;
        caixa(ctx, x + 6, base - h, lg - 12, h, 4, rgba(cor, .3), rgba(cor, .9));
        ctx.font = "700 11px " + MONO; ctx.fillStyle = rgba(cor, .95); ctx.textAlign = "center";
        if (vis > .7) ctx.fillText(AP.num.format(es[4]), x + lg / 2, base - h - 8);
        ctx.font = "600 8px " + MONO; ctx.fillStyle = C.mute;
        ctx.fillText(es[1], x + lg / 2, base + 13);
        ctx.fillText(es[3] === null ? es[2] + "+" : es[2] + "–" + es[3], x + lg / 2, base + 24);
      });
      ctx.textAlign = "left";
      rot(ctx, "Kz por imóvel e por mês · o escalão aplica-se sozinho", 14, 14, rgba(C.mute, .9));
    }
  });

  /* ── FECHO · os catorze dias da prova ─────────────────────────────────── */
  palco($("#animProva"), {
    iniciar: function (L, A) {
      return { dia: 0, acc: 0, marcos: [
        [1, "lista importada"], [2, "taxas emitidas"], [3, "SMS enviados"],
        [5, "primeiros pagamentos"], [8, "Pedidos a fechar"], [11, "contas publicadas"],
        [14, "relatório na mesa"]
      ] };
    },
    pintar: function (ctx, L, A, e, dt, t) {
      e.acc += dt;
      if (e.acc > .34) { e.acc = 0; e.dia = Math.min(TRIAL, e.dia + 1); }
      if (e.dia >= TRIAL && e.acc > .3) e.espera = (e.espera || 0) + dt;
      if (e.espera > 2.4) { e.dia = 0; e.espera = 0; }
      if (!ctx) return;
      var pad = 34, y = A * .54, lg = (L - pad * 2) / TRIAL;
      ctx.strokeStyle = rgba(C.line, .9); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(L - pad, y); ctx.stroke();
      ctx.strokeStyle = rgba(C.teal, .9); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + lg * e.dia, y); ctx.stroke();
      e.marcos.forEach(function (m) {
        var x = pad + lg * m[0], on = e.dia >= m[0];
        ctx.beginPath(); ctx.arc(x, y, on ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = on ? rgba(C.teal, .95) : rgba(C.line, 1); ctx.fill();
        if (on) {
          ctx.save(); ctx.translate(x, y - 14); ctx.rotate(-Math.PI / 4.2);
          ctx.font = "600 9px " + MONO; ctx.fillStyle = rgba(C.teal, .92); ctx.textAlign = "left";
          ctx.fillText(m[1], 0, 0); ctx.restore();
        }
      });
      ctx.font = "700 13px " + MONO; ctx.fillStyle = rgba(C.teal, .95); ctx.textAlign = "left";
      ctx.fillText("dia " + e.dia + " de " + TRIAL, 14, 20);
      rot(ctx, "sem factura, sem compromisso de continuidade — e os dados ficam vossos",
          14, A - 9, rgba(C.mute, .9));
    }
  });

  AP.contar();
  AP.arrancar();
})();
