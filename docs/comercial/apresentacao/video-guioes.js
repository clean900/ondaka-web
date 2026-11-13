/* Coloca cada tutorial na sua secção.
   Os vídeos são os do `videos/tutoriais-ondaka`, capturados na conta de
   afiliado de demonstração. Cada um vem ANTES do tema a que pertence:
   vê-se o ecrã primeiro e as perguntas vêm a seguir. */
(function () {
  "use strict";
  if (!window.TUTORIAL) return;
  [
    ["#tut-visao-geral",    "visao-geral"],
    ["#tut-taxas",          "taxas"],
    ["#tut-pagamentos",     "pagamentos"],
    ["#tut-pedidos",        "pedidos"],
    ["#tut-avisos",         "avisos"],
    ["#tut-loja",           "loja"]
  ].forEach(function (p) { window.TUTORIAL.montar(p[0], p[1]); });
})();
