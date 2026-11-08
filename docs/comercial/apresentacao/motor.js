/* Motor comum das apresentações do ecossistema KAYANTEC.
   Sem dependências. O mesmo ficheiro serve a apresentação do ONDAKA e a do
   Welwitschia — é o motor que já corre na do ecossistema Academia Digital, com
   os ganchos de cada produto registados de fora em vez de escritos aqui.

   Expõe window.AP = { $, $$, num, reduzido, palco, MONO, gancho, contar } */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  /* SEPARADOR DE MILHAR À MANEIRA DE ANGOLA: ponto, e não o espaço fino que o
     Intl devolve hoje para pt-PT (CLDR moderno). «1 850» ao lado de «1.850» na
     factura é a mesma plataforma a escrever o número de duas maneiras.
     useGrouping "always" porque sem ele quatro dígitos não são agrupados —
     7040 em vez de 7.040 — e ao lado de 15.180 nota-se. */
  var num = (function () {
    var f;
    try { f = new Intl.NumberFormat("pt-PT", { useGrouping: "always" }); }
    catch (e) { f = new Intl.NumberFormat("pt-PT"); }
    return {
      format: function (v) {
        return f.format(v).replace(/[    ]/g, ".");
      }
    };
  })();
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MONO = '"IBM Plex Mono","SF Mono",Consolas,monospace';

  /* ───────────────────────────────────────────────────────────── navegação */
  var seccoes = $$(".sec");
  var lista = $("#navLista");
  seccoes.forEach(function (sec, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.className = "nav__link";
    b.type = "button";
    b.innerHTML = '<span class="nav__n">' + String(i + 1).padStart(2, "0") + "</span>" +
      "<span>" + sec.dataset.nome + "</span>";
    b.addEventListener("click", function () {
      sec.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
      lista.classList.remove("is-on");
      $("#navToggle").setAttribute("aria-expanded", "false");
    });
    li.appendChild(b);
    lista.appendChild(li);
  });
  var links = $$(".nav__link");

  $("#navToggle").addEventListener("click", function () {
    var on = lista.classList.toggle("is-on");
    this.setAttribute("aria-expanded", String(on));
  });

  /* GANCHOS. Cada produto regista o que quer que corra a cada passagem do ciclo
     de scroll — revelações, cenários, montagem de mockups. O motor não conhece
     nenhum deles pelo nome, ao contrário da primeira versão, onde estavam
     escritos à mão dentro de aoDeslocar() e por isso não se reaproveitavam. */
  var ganchos = [];
  function gancho(fn) { ganchos.push(fn); }

  /* Um único ciclo ligado ao scroll trata da navegação, da barra de progresso e
     dos ganchos. Não usamos IntersectionObserver para isto: em alguns ambientes
     de visualização ele não dispara, e as demonstrações — que são o essencial
     destas páginas — nunca chegariam a aparecer. */
  var pendente = false;
  function aoDeslocar() {
    if (pendente) return;
    pendente = true;
    /* setTimeout e não requestAnimationFrame: em separadores em segundo plano o
       rAF não corre, e a página ficaria por montar */
    setTimeout(function () {
      pendente = false;
      var h = document.documentElement;
      var topo = window.pageYOffset || h.scrollTop || document.body.scrollTop || 0;
      var altura = window.innerHeight || h.clientHeight;

      var max = Math.max(1, (h.scrollHeight || document.body.scrollHeight) - altura);
      var barra = $("#barra");
      if (barra) barra.style.width = Math.min(100, (topo / max) * 100).toFixed(1) + "%";

      var meio = topo + altura / 2;
      var atual = 0;
      seccoes.forEach(function (sec, i) { if (sec.offsetTop <= meio) atual = i; });
      links.forEach(function (l, j) { l.setAttribute("aria-current", String(j === atual)); });

      ganchos.forEach(function (fn) { try { fn(topo, altura); } catch (e) { } });
    });
  }
  window.addEventListener("scroll", aoDeslocar, { passive: true });
  window.addEventListener("resize", aoDeslocar);
  /* rede de segurança: há ambientes em que o deslocamento por código não emite
     evento de scroll. Sem isto, as revelações nunca apareceriam. */
  setInterval(aoDeslocar, 600);

  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea")) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "PageDown" && e.key !== "PageUp") return;
    var atual = seccoes.findIndex(function (s) { return s.getBoundingClientRect().top > -window.innerHeight / 2; });
    if (atual < 0) atual = seccoes.length - 1;
    var alvo = (e.key === "ArrowDown" || e.key === "PageDown") ? atual : Math.max(0, atual - 2);
    if (seccoes[alvo]) { e.preventDefault(); seccoes[alvo].scrollIntoView({ behavior: reduzido ? "auto" : "smooth" }); }
  });

  /* ─────────────────────────────────────── revelação e contadores em vista
     IntersectionObserver e NÃO amostragem do scroll: com o scroll a correr
     depressa — rodízio do rato, barra arrastada, teclas — as posições
     intermédias nunca chegam a ser medidas, e elementos inteiros ficavam por
     revelar num ecrã que o cliente dá por vazio. O observador não perde
     entradas. O ciclo do scroll fica como rede de segurança, para os ambientes
     onde o observador não existe ou não dispara.

     A unidade de revelação é a SECÇÃO, e não o elemento: observar elemento a
     elemento falhava com o scroll rápido e com os saltos do índice — o browser
     não desenha os fotogramas intermédios, e o que passou a voar ficava
     invisível. Uma secção ocupa o ecrã inteiro e é impossível não a ver; quando
     entra, revela-se tudo o que tem dentro, com os atrasos que o CSS já define
     em .rev-1/.rev-2/.rev-3. */
  function revelar(el) { el.classList.add("is-on"); }
  function acordarSeccao(sec) {
    if (sec.dataset.acordada) return;
    sec.dataset.acordada = "1";
    $$(".rev", sec).forEach(revelar);
    $$("[data-conta]", sec).forEach(animarContador);
  }
  if (typeof IntersectionObserver === "function") {
    var ioSec = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) acordarSeccao(e.target); });
    }, { rootMargin: "120px 0px 120px 0px", threshold: 0 });
    seccoes.forEach(function (s) { ioSec.observe(s); });
  }
  gancho(function (topo, altura) {              /* rede de segurança */
    seccoes.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top < altura && r.bottom > -altura) acordarSeccao(s);
    });
  });

  /* Contadores: data-conta="1850" sobe de 0 até ao valor quando entra em vista.
     data-sufixo e data-prefixo acompanham; data-dec dá as decimais. */
  function animarContador(el) {
      if (el.dataset.contado) return;
      el.dataset.contado = "1";
      var fim = parseFloat(el.dataset.conta) || 0;
      var dec = parseInt(el.dataset.dec || "0", 10);
      var pre = el.dataset.prefixo || "", suf = el.dataset.sufixo || "";
      var dur = reduzido ? 0 : 900;
      var t0 = null;
      function escrever(v) {
        el.textContent = pre + (dec ? v.toFixed(dec).replace(".", ",") : num.format(Math.round(v))) + suf;
      }
      if (!dur) { escrever(fim); return; }
      /* setTimeout e NÃO requestAnimationFrame: o rAF é suspenso em separadores
         em segundo plano e em painéis sem foco, e o contador ficava eternamente
         a zero — num ecrã onde o número É o argumento. Com o relógio normal, a
         animação corre sempre e termina sempre no valor certo. */
      t0 = Date.now();
      (function passo() {
        var k = Math.min(1, (Date.now() - t0) / dur);
        escrever(fim * (1 - Math.pow(1 - k, 3)));     /* travagem cúbica */
        if (k < 1) setTimeout(passo, 33);
      })();
  }
  /* contadores fora de qualquer secção (não há nenhum hoje, mas o corpo pode
     ganhar um bloco solto) continuam a ser apanhados pela rede do scroll */
  function contar() {
    $$("[data-conta]").forEach(function (el) {
      if (!el.closest(".sec")) animarContador(el);
    });
  }

  /* ═══════════════════════════════════════════ palcos animados das funções
     Um motor pequeno para as demonstrações. Cada cena recebe o contexto, o
     tamanho e o tempo, e desenha-se a si própria; o motor trata do canvas, da
     densidade do ecrã, do observador de visibilidade (não se gasta CPU com o
     que ninguém está a ver) e de «reduzir movimento», caso em que se pinta UM
     fotograma a meio da ação em vez de nada.
     Canvas e não CSS: são dezenas de objetos com física simples, e em CSS isso
     seriam dezenas de nós no DOM a serem animados pelo compositor. */
  function palco(cv, cena) {
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), L = 0, A = 0, dpr = 1, vivo = false, est = null;
    function medir() {
      var r = cv.getBoundingClientRect();
      if (!r.width) return;
      var nl = Math.round(r.width), na = Math.round(r.height);
      /* SÓ se reinicia quando o tamanho muda de facto. Antes, o observador de
         visibilidade chamava medir() a cada entrada em vista e isso esvaziava o
         que estava em voo — com o scroll a oscilar no limiar, nenhum pedido
         chegava ao fim e os contadores ficavam eternamente a zero. */
      if (nl === L && na === A && est) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      L = nl; A = na;
      cv.width = Math.round(L * dpr); cv.height = Math.round(A * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      est = cena.iniciar(L, A, est);
    }
    var t0 = (window.performance && performance.now) ? performance.now() : 0, tAnt = t0;
    function quadro(t) {
      var passo = Math.min(.05, (t - tAnt) / 1000); tAnt = t;
      ctx.clearRect(0, 0, L, A);
      cena.pintar(ctx, L, A, est, passo, (t - t0) / 1000);
      if (vivo && !reduzido) requestAnimationFrame(quadro);
    }
    function arrancar() {
      if (vivo) return;
      vivo = true;
      if (reduzido) {
        /* avança a simulação sem pintar, para o fotograma parado mostrar a cena
           a meio e não o instante zero, que é sempre um ecrã vazio */
        for (var k = 0; k < 160; k++) cena.pintar(null, L, A, est, 1 / 60, k / 60);
        ctx.clearRect(0, 0, L, A);
        cena.pintar(ctx, L, A, est, 0, 2.7);
      } else {
        tAnt = (window.performance && performance.now) ? performance.now() : 0;
        requestAnimationFrame(quadro);
      }
    }
    medir();
    window.addEventListener("resize", function () {
      var antes = L + "x" + A; medir();
      if (reduzido && vivo && antes !== L + "x" + A) { vivo = false; arrancar(); }
    });
    setTimeout(function () { medir(); arrancar(); }, 120);
    if (typeof IntersectionObserver === "function") {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { medir(); arrancar(); }
          else vivo = false;
        });
      }, { threshold: .12 }).observe(cv);
    }
    /* cinto de segurança: em separadores em segundo plano o observador pode não
       disparar, e a cena ficaria em branco quando se chega ao slide */
    setTimeout(function () { if (!vivo) { medir(); arrancar(); } }, 2200);
  }

  /* ───────────────────────────────────────── moldura ampliada (mockups) */
  var modal = $("#modal");
  if (modal) {
    $("#modalFechar").addEventListener("click", function () {
      modal.classList.remove("is-on");
      $("#modalCorpo").innerHTML = "";
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) $("#modalFechar").click();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-on")) $("#modalFechar").click();
    });
  }

  window.AP = {
    $: $, $$: $$, num: num, reduzido: reduzido, MONO: MONO,
    palco: palco, gancho: gancho, contar: contar,
    arrancar: function () { aoDeslocar(); window.addEventListener("load", aoDeslocar); }
  };
})();
