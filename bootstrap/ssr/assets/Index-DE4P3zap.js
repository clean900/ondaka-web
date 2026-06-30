import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-X_1jlzlW.js";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Handshake, BookOpen, Check, MessageSquare, X, ChevronUp, ChevronDown, CheckCircle2, XCircle, Clock } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADOS = {
  aguarda_gestor: { label: "Aguarda resposta", cor: "text-amber-400 bg-amber-400/10" },
  aguarda_condomino: { label: "Com o condómino", cor: "text-purple-400 bg-purple-400/10" },
  aprovado: { label: "Aprovado", cor: "text-cyan-400 bg-cyan-400/10" },
  em_cumprimento: { label: "Em cumprimento", cor: "text-blue-400 bg-blue-400/10" },
  cumprido: { label: "Cumprido", cor: "text-emerald-400 bg-emerald-400/10" },
  recusado: { label: "Recusado", cor: "text-red-400 bg-red-400/10" },
  quebrado: { label: "Quebrado", cor: "text-red-400 bg-red-400/10" },
  sem_acordo: { label: "Sem acordo", cor: "text-zinc-400 bg-zinc-700" }
};
const FILTROS = ["aguarda_gestor", "aguarda_condomino", "aprovado", "em_cumprimento", "cumprido", "recusado", "todos"];
function AcordosIndex({ acordos, estadoFiltro }) {
  var _a;
  const [expandido, setExpandido] = useState(null);
  const [processando, setProcessando] = useState(null);
  const [modalAceitar, setModalAceitar] = useState(null);
  const [modalContrapor, setModalContrapor] = useState(null);
  const [modalRecusar, setModalRecusar] = useState(null);
  const [numContra, setNumContra] = useState(3);
  const [obsContra, setObsContra] = useState("");
  const [motivoRec, setMotivoRec] = useState("");
  const [modalGuia, setModalGuia] = useState(false);
  function mudarFiltro(estado) {
    router.get("/acordos", { estado }, { preserveScroll: true, preserveState: true });
  }
  function aceitar(id) {
    setModalAceitar(id);
  }
  function confirmarAceitar() {
    const id = modalAceitar;
    if (id === null) return;
    setModalAceitar(null);
    setProcessando(id);
    router.post(`/acordos/${id}/aprovar`, {}, {
      preserveScroll: true,
      onFinish: () => setProcessando(null)
    });
  }
  function contrapropor(id) {
    setNumContra(3);
    setObsContra("");
    setModalContrapor(id);
  }
  function confirmarContrapor() {
    const id = modalContrapor;
    if (id === null) return;
    setModalContrapor(null);
    setProcessando(id);
    router.post(`/acordos/${id}/contrapropor`, { num_prestacoes: numContra, observacoes: obsContra }, {
      preserveScroll: true,
      onFinish: () => setProcessando(null)
    });
  }
  function recusar(id) {
    setMotivoRec("");
    setModalRecusar(id);
  }
  function confirmarRecusar() {
    const id = modalRecusar;
    if (id === null) return;
    setModalRecusar(null);
    setProcessando(id);
    router.post(`/acordos/${id}/recusar`, { motivo: motivoRec }, {
      preserveScroll: true,
      onFinish: () => setProcessando(null)
    });
  }
  function fmt(v) {
    if (v === null) return "—";
    return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2 }).format(parseFloat(v)) + " Kz";
  }
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Acordos de pagamento" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500", children: /* @__PURE__ */ jsx(Handshake, { className: "w-6 h-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Acordos de pagamento" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: "Negociação de dívida dos condóminos." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalGuia(true),
            className: "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm",
            children: [
              /* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" }),
              " Guia"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-6 flex-wrap", children: FILTROS.map((f) => {
        var _a2;
        return /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => mudarFiltro(f),
            className: `px-3 py-1.5 rounded-lg text-sm ${estadoFiltro === f ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`,
            children: f === "todos" ? "Todos" : ((_a2 = ESTADOS[f]) == null ? void 0 : _a2.label) ?? f
          },
          f
        );
      }) }),
      acordos.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-zinc-500", children: [
        /* @__PURE__ */ jsx(Handshake, { className: "w-12 h-12 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxs("p", { children: [
          "Nenhum acordo ",
          estadoFiltro !== "todos" ? `(${((_a = ESTADOS[estadoFiltro]) == null ? void 0 : _a.label) ?? estadoFiltro})` : "",
          "."
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: acordos.map((a) => {
        const est = ESTADOS[a.estado] ?? { label: a.estado, cor: "text-zinc-400 bg-zinc-700" };
        const aberto = expandido === a.id;
        const podeAgir = a.estado === "aguarda_gestor";
        return /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-zinc-100", children: a.condomino_nome }),
                /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${est.cor}`, children: est.label })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400", children: [
                a.condominio_nome,
                " · dívida ",
                fmt(a.valor_total),
                a.valor_com_juro && parseFloat(a.valor_com_juro) > parseFloat(a.valor_total) ? ` · juro ${fmt((parseFloat(a.valor_com_juro) - parseFloat(a.valor_total)).toFixed(2))} · total ${fmt(a.valor_com_juro)}` : "",
                " · ",
                a.num_prestacoes,
                " prestações"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-0.5", children: [
                "Rondas: condómino ",
                a.rondas_condomino,
                "/3 · gestor ",
                a.rondas_gestor,
                "/3"
              ] })
            ] }),
            podeAgir && /* @__PURE__ */ jsxs("div", { className: "flex gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => aceitar(a.id),
                  disabled: processando === a.id,
                  className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-sm disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }),
                    " Aceitar"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => contrapropor(a.id),
                  disabled: processando === a.id,
                  className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 text-sm disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" }),
                    " Contrapropor"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => recusar(a.id),
                  disabled: processando === a.id,
                  className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }),
                    " Recusar"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setExpandido(aberto ? null : a.id),
                className: "text-zinc-500 hover:text-zinc-300 shrink-0",
                children: aberto ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-5 h-5" })
              }
            )
          ] }),
          aberto && /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800 px-4 py-3 bg-zinc-900/30 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-zinc-400 mb-2 uppercase", children: "Histórico da negociação" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: a.propostas.map((p, i) => /* @__PURE__ */ jsx("div", { className: `flex gap-3 text-sm ${p.autor === "gestor" ? "flex-row-reverse text-right" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: `px-3 py-2 rounded-lg max-w-md ${p.autor === "gestor" ? "bg-cyan-500/10" : "bg-zinc-800"}`, children: [
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mb-0.5", children: [
                  p.autor === "gestor" ? "Gestão" : "Condómino",
                  " · ronda ",
                  p.ronda,
                  " · ",
                  p.created_at
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-zinc-200", children: [
                  p.num_prestacoes,
                  " prestações · total ",
                  fmt(p.valor_com_juro),
                  parseFloat(p.valor_entrada ?? "0") > 0 ? ` · entrada ${fmt(p.valor_entrada)}` : ""
                ] }),
                p.observacoes && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 italic mt-1", children: [
                  '"',
                  p.observacoes,
                  '"'
                ] })
              ] }) }, i)) })
            ] }),
            a.prestacoes.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-zinc-400 mb-2 uppercase", children: "Prestações" }),
              /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-zinc-500 text-xs", children: [
                  /* @__PURE__ */ jsx("th", { className: "text-left py-1", children: "#" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left py-1", children: "Valor" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left py-1", children: "Vencimento" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left py-1", children: "Estado" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { children: a.prestacoes.map((p) => /* @__PURE__ */ jsxs("tr", { className: "text-zinc-300 border-t border-zinc-800/50", children: [
                  /* @__PURE__ */ jsx("td", { className: "py-1.5", children: p.numero }),
                  /* @__PURE__ */ jsx("td", { className: "py-1.5", children: fmt(p.valor) }),
                  /* @__PURE__ */ jsx("td", { className: "py-1.5", children: p.data_vencimento }),
                  /* @__PURE__ */ jsx("td", { className: "py-1.5", children: p.estado === "paga" ? /* @__PURE__ */ jsxs("span", { className: "text-emerald-400 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }),
                    " Paga"
                  ] }) : p.estado === "atrasada" ? /* @__PURE__ */ jsxs("span", { className: "text-red-400 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(XCircle, { className: "w-3 h-3" }),
                    " Atrasada"
                  ] }) : /* @__PURE__ */ jsxs("span", { className: "text-zinc-500 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
                    " Pendente"
                  ] }) })
                ] }, p.numero)) })
              ] })
            ] })
          ] })
        ] }, a.id);
      }) })
    ] }),
    modalAceitar !== null && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4", onClick: () => setModalAceitar(null), children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-zinc-100 mb-2", children: "Aceitar proposta" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mb-5", children: "Aceitar esta proposta como está? Serão criadas as prestações do acordo." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setModalAceitar(null), className: "px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { onClick: confirmarAceitar, className: "px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-semibold", children: "Aceitar" })
      ] })
    ] }) }),
    modalContrapor !== null && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4", onClick: () => setModalContrapor(null), children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-zinc-100 mb-3", children: "Contraproposta" }),
      /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Número de prestações" }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-4 flex-wrap", children: [2, 3, 4, 5, 6].map((n) => /* @__PURE__ */ jsx("button", { onClick: () => setNumContra(n), className: `w-10 h-10 rounded-lg text-sm font-bold ${numContra === n ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-300"}`, children: n }, n)) }),
      /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Observação (opcional)" }),
      /* @__PURE__ */ jsx("textarea", { value: obsContra, onChange: (e) => setObsContra(e.target.value), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 mb-5" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setModalContrapor(null), className: "px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { onClick: confirmarContrapor, className: "px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 text-sm font-semibold", children: "Enviar contraproposta" })
      ] })
    ] }) }),
    modalRecusar !== null && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4", onClick: () => setModalRecusar(null), children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-zinc-100 mb-3", children: "Recusar acordo" }),
      /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Motivo (opcional)" }),
      /* @__PURE__ */ jsx("textarea", { value: motivoRec, onChange: (e) => setMotivoRec(e.target.value), rows: 3, className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 mb-5" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setModalRecusar(null), className: "px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { onClick: confirmarRecusar, className: "px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm font-semibold", children: "Recusar" })
      ] })
    ] }) }),
    modalGuia && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4", onClick: () => setModalGuia(false), children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-zinc-100 mb-4", children: "Acordos de Pagamento — Guia" }),
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-cyan-400 mb-1", children: "O que é" }),
      /* @__PURE__ */ jsx("ul", { className: "text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1", children: /* @__PURE__ */ jsx("li", { children: "Plano para pagar a dívida existente (taxas, multas, despesas extra e juros em atraso). Pode ter entrada, prestações e juro." }) }),
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-cyan-400 mb-1", children: "Negociação" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "Condómino propõe → aceita / recusa / contrapõe (até 3 rondas de cada lado)." }),
        /* @__PURE__ */ jsx("li", { children: "Equilíbrio: plano exigente demais falha; folgado demais atrasa a recuperação." }),
        /* @__PURE__ */ jsx("li", { children: "Negociação esgotada → prevalece a última proposta da gestão." })
      ] }),
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-cyan-400 mb-1", children: "Configuração (por condomínio)" }),
      /* @__PURE__ */ jsx("ul", { className: "text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1", children: /* @__PURE__ */ jsx("li", { children: "Defina min/máx de prestações, % de entrada e % de juro." }) }),
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-cyan-400 mb-1", children: "Desbloqueio" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "Pagamento que põe o condómino em dia → acesso restabelecido automaticamente." }),
        /* @__PURE__ */ jsx("li", { children: "Cada prestação tem 10 dias de tolerância." })
      ] }),
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-amber-400 mb-1", children: "Incumprimento (explique sempre ao condómino)" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-sm text-zinc-300 mb-3 list-disc pl-5 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "Prestação com +10 dias de atraso → acordo quebrado (renegociar)." }),
        /* @__PURE__ */ jsx("li", { children: "Taxa do mês não paga em 10 dias → acesso limitado, mesmo com acordo em dia." })
      ] }),
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-cyan-400 mb-1", children: "Enquadramento" }),
      /* @__PURE__ */ jsx("ul", { className: "text-sm text-zinc-300 mb-4 list-disc pl-5 space-y-1", children: /* @__PURE__ */ jsx("li", { children: "Taxas regem-se pelo Dec. 141/15. Mantenha sempre disponível ao condómino o extrato, o pagamento e o contacto com a gestão." }) }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { onClick: () => setModalGuia(false), className: "px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 text-sm font-semibold", children: "Fechar" }) })
    ] }) })
  ] });
}
export {
  AcordosIndex as default
};
