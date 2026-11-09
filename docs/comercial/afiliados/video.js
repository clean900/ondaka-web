/* Tutoriais em vídeo dentro da apresentação.
   =============================================================================
   Os vídeos NÃO são feitos aqui. São os tutoriais que o `videos/tutoriais-adsa`
   já produz — prints reais da conta de demonstração, câmara, realces, cursor e
   narração em pt-PT (edge-tts, Duarte), renderizados em MP4 pelo HyperFrames.
   Este ficheiro é só o leitor que os mostra: moldura, poster, legendas e
   controlo de velocidade.

   Porquê ligar ao MP4 no servidor em vez de o embutir: sete tutoriais são perto
   de noventa megabytes, e um HTML desse tamanho não chega a lado nenhum por
   email. O POSTER de cada um vai embutido, de modo que a apresentação aberta
   sem ligação mostra o primeiro ecrã do tutorial e diz onde o ver — nunca uma
   moldura preta.
   ========================================================================== */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var DADOS = window.__VIDEOS__ || { videos: [] };
  var porSlug = {};
  DADOS.videos.forEach(function (v) { porSlug[v.slug] = v; });

  /* as velocidades que um apresentador usa de facto: devagar para explicar por
     cima, depressa para passar à frente do que a sala já percebeu */
  var VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 2];

  function mmss(s) {
    s = Math.max(0, Math.round(s || 0));
    return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }

  function montar(raiz, v) {
    var id = "v-" + v.slug;
    raiz.classList.add("tut");
    raiz.innerHTML =
      '<div class="tut__topo">' +
        '<span class="tut__n">tutorial</span>' +
        '<span class="tut__nome">' + v.titulo + "</span>" +
        '<span class="tut__dur">' + mmss(v.duracao) + "</span>" +
      "</div>" +
      '<div class="tut__ecra">' +
        '<video id="' + id + '" class="tut__v" preload="none" playsinline' +
          (v.poster ? ' poster="' + v.poster + '"' : "") + ">" +
          '<source src="' + v.url + '" type="video/mp4">' +
        "</video>" +
        '<button class="tut__play" id="' + id + '-play" type="button" ' +
          'aria-label="Reproduzir o tutorial"><span></span></button>' +
        '<div class="tut__erro" id="' + id + '-erro" hidden>' +
          "<b>Esta cópia foi aberta sem ligação à Internet.</b>" +
          "<span>O tutorial está em <code>" + v.url.replace("https://", "") + "</code></span>" +
        "</div>" +
      "</div>" +
      '<div class="tut__cc" id="' + id + '-cc" aria-live="polite"></div>' +
      '<div class="tut__ctrl">' +
        '<button class="tut__b tut__b--pp" id="' + id + '-pp" type="button" aria-label="Reproduzir">▶</button>' +
        '<button class="tut__b" id="' + id + '-rec" type="button" aria-label="Recomeçar">↺</button>' +
        '<div class="tut__barra" id="' + id + '-barra" role="slider" tabindex="0" ' +
          'aria-label="Posição no vídeo"><div class="tut__barra__p" id="' + id + '-prog"></div></div>' +
        '<span class="tut__t" id="' + id + '-t">0:00</span>' +
        '<div class="tut__vels" role="group" aria-label="Velocidade de reprodução">' +
          VELOCIDADES.map(function (x) {
            return '<button class="tut__vel' + (x === 1 ? " is-on" : "") + '" type="button" ' +
              'data-v="' + x + '" aria-pressed="' + (x === 1) + '">' +
              String(x).replace(".", ",") + "×</button>";
          }).join("") +
        "</div>" +
        '<button class="tut__b tut__b--som" id="' + id + '-som" type="button" ' +
          'aria-pressed="true" aria-label="Desligar o som">🔊 som</button>' +
        '<button class="tut__b" id="' + id + '-cheio" type="button" aria-label="Ecrã inteiro">⛶</button>' +
      "</div>" +
      '<p class="tut__sub">' + v.subtitulo + "</p>";

    var vid = $("#" + id), pp = $("#" + id + "-pp"), play = $("#" + id + "-play");
    var rec = $("#" + id + "-rec"), barra = $("#" + id + "-barra");
    var prog = $("#" + id + "-prog"), tmp = $("#" + id + "-t");
    var som = $("#" + id + "-som"), cheio = $("#" + id + "-cheio");
    var cc = $("#" + id + "-cc"), erro = $("#" + id + "-erro");

    /* LEGENDAS. Vêm do texto que o motor de voz já tinha medido, e mostramo-las
       NÓS por baixo do vídeo, em corpo grande, em vez de deixar o navegador
       desenhá-las por cima: numa sala, a legenda sobreposta tapa exactamente a
       zona do ecrã de que se está a falar. E com o som desligado — que é como o
       apresentador fala por cima — são elas que seguram o fio. */
    var pistas = [];
    if (v.vtt) {
      try {
        var faixa = document.createElement("track");
        faixa.kind = "metadata";
        faixa.src = URL.createObjectURL(new Blob([v.vtt], { type: "text/vtt" }));
        faixa.default = true;
        vid.appendChild(faixa);
        faixa.addEventListener("load", function () {
          if (faixa.track) {
            faixa.track.mode = "hidden";
            pistas = Array.prototype.slice.call(faixa.track.cues || []);
          }
        });
      } catch (e) { }
    }
    function legenda(t) {
      if (!pistas.length) return;
      for (var i = 0; i < pistas.length; i++) {
        if (t >= pistas[i].startTime && t < pistas[i].endTime) {
          if (cc.textContent !== pistas[i].text) cc.textContent = pistas[i].text;
          return;
        }
      }
    }

    function tocar() {
      tentou = true;
      var p = vid.play();
      if (p && p.catch) p.catch(function () {
        /* o navegador recusou (política de reprodução) ou a origem não responde:
           só neste caso é que o aviso faz sentido */
        if (!vid.readyState) erro.hidden = false;
      });
    }
    pp.addEventListener("click", function () { vid.paused ? tocar() : vid.pause(); });
    play.addEventListener("click", tocar);
    rec.addEventListener("click", function () { vid.currentTime = 0; tocar(); });
    som.addEventListener("click", function () {
      vid.muted = !vid.muted;
      som.textContent = (vid.muted ? "🔇" : "🔊") + " som";
      som.setAttribute("aria-pressed", String(!vid.muted));
      som.setAttribute("aria-label", vid.muted ? "Ligar o som" : "Desligar o som");
    });
    cheio.addEventListener("click", function () {
      var alvo = vid.parentNode;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (alvo.requestFullscreen) alvo.requestFullscreen();
      else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen();
    });

    $$(".tut__vel", raiz).forEach(function (b) {
      b.addEventListener("click", function () {
        vid.playbackRate = parseFloat(b.dataset.v);
        $$(".tut__vel", raiz).forEach(function (o) {
          o.classList.toggle("is-on", o === b);
          o.setAttribute("aria-pressed", String(o === b));
        });
      });
    });

    vid.addEventListener("play", function () {
      pp.textContent = "⏸"; pp.setAttribute("aria-label", "Pausa");
      raiz.classList.add("is-on");
      /* um tutorial de cada vez: dois a falar ao mesmo tempo acaba com a reunião */
      $$("video.tut__v").forEach(function (o) { if (o !== vid) o.pause(); });
    });
    vid.addEventListener("pause", function () {
      pp.textContent = "▶"; pp.setAttribute("aria-label", "Reproduzir");
    });
    vid.addEventListener("ended", function () { raiz.classList.remove("is-on"); });
    vid.addEventListener("timeupdate", function () {
      var d = vid.duration || v.duracao || 1;
      prog.style.width = (vid.currentTime / d * 100).toFixed(2) + "%";
      tmp.textContent = mmss(vid.currentTime);
      legenda(vid.currentTime);
    });
    /* O aviso de «sem ligação» só aparece quando o vídeo falha MESMO, e
       desaparece a qualquer sinal de vida — um `error` disparado por um salto na
       barra deixava o aviso em cima de um vídeo que estava a correr bem. */
    /* O aviso de «sem ligação» só aparece depois de uma tentativa REAL de
       reprodução falhar. Com preload="none" — que é o que evita descarregar
       noventa megabytes ao abrir a página — nada é pedido ao servidor até
       alguém carregar em play, e o aviso aparecia por cima do poster de um
       vídeo que ainda nem tinha sido pedido. */
    var tentou = false;
    function semAviso() { erro.hidden = true; }
    ["loadedmetadata", "loadeddata", "canplay", "playing", "timeupdate"]
      .forEach(function (ev) { vid.addEventListener(ev, semAviso); });
    vid.addEventListener("error", function () {
      if (tentou && vid.readyState < 2 && !vid.currentTime) erro.hidden = false;
    });

    function irPara(ev) {
      var r = barra.getBoundingClientRect();
      var x = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) / r.width;
      vid.currentTime = Math.max(0, Math.min(1, x)) * (vid.duration || v.duracao || 0);
    }
    barra.addEventListener("click", irPara);
    barra.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") vid.currentTime += 5;
      if (e.key === "ArrowLeft") vid.currentTime -= 5;
    });

    /* pára quando sai de vista; NÃO arranca sozinho — quem manda no arranque é
       o apresentador, e não o scroll */
    if (typeof IntersectionObserver === "function") {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting && !vid.paused) vid.pause(); });
      }, { threshold: .25 }).observe(raiz);
    }
  }


  /* PODA. Um tutorial que ainda não foi produzido leva a SECÇÃO INTEIRA
     consigo, e a apresentação lê-se como se ele nunca tivesse sido previsto.
     Antes ficava no lugar um recado para o programador — numa apresentação que
     vai a um cliente, isso é pior do que não ter vídeo nenhum.

     Corre AQUI, ao ler o ficheiro, e não dentro de montar(): o motor monta a
     navegação a partir das secções que encontra, e se a poda viesse depois o
     índice lateral ficava a listar tutoriais que já não estão na página, com a
     numeração toda a seguir trocada. Por isso o video.js entra ANTES do motor. */
  (function podar() {
    $$('[id^="tut-"]').forEach(function (raiz) {
      var slug = raiz.id.replace(/^tut-/, "");
      if (porSlug[slug]) return;
      var sec = raiz.closest ? raiz.closest("section") : null;
      var fora = sec || raiz;
      if (fora.parentNode) fora.parentNode.removeChild(fora);
      if (window.console) {
        console.info("tutorial \u00ab" + slug + "\u00bb ainda n\u00e3o produzido \u2014 sec\u00e7\u00e3o retirada");
      }
    });
  })();

  window.TUTORIAL = {
    montar: function (seletor, slug) {
      var raiz = $(seletor);
      if (!raiz) return;
      var v = porSlug[slug];
      if (!v) return;        /* já foi podada à chegada — ver podar(), acima */
      montar(raiz, v);
    },
    lista: DADOS.videos
  };
})();
