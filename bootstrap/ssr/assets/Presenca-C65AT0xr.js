import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head, router } from "@inertiajs/react";
import { Clock, Square, Play, Calendar, MapPin, History } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const formatarDuracao = (segundos) => {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor(segundos % 3600 / 60);
  const s = segundos % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
function Presenca({ em_curso, escalas_hoje, historico }) {
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [escalaSelecionada, setEscalaSelecionada] = useState(null);
  useEffect(() => {
    if (!em_curso) return;
    const inicio = new Date(em_curso.checkin_em).getTime();
    const tick = () => setTempoDecorrido(Math.floor((Date.now() - inicio) / 1e3));
    tick();
    const intervalo = setInterval(tick, 1e3);
    return () => clearInterval(intervalo);
  }, [em_curso]);
  const fazerCheckin = () => {
    setEnviando(true);
    router.post("/turnos/presenca/checkin", { escala_turno_id: escalaSelecionada }, {
      preserveScroll: true,
      onSuccess: () => toast.success("Check-in feito."),
      onError: (errs) => toast.error(Object.values(errs)[0]),
      onFinish: () => setEnviando(false)
    });
  };
  const fazerCheckout = () => {
    if (!confirm("Confirma o fim do turno?")) return;
    setEnviando(true);
    router.post("/turnos/presenca/checkout", {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Check-out feito."),
      onError: (errs) => toast.error(Object.values(errs)[0]),
      onFinish: () => setEnviando(false)
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Presença — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Presença" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Marque a sua entrada e saída do turno" })
        ] })
      ] }),
      em_curso ? /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-blue-500/10 border border-emerald-500/30 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-3 w-3 rounded-full bg-emerald-400 animate-pulse" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-emerald-300", children: "Ao serviço" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-5xl font-bold text-white font-mono tracking-tighter mb-2", children: formatarDuracao(tempoDecorrido) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400", children: [
          "Desde ",
          new Date(em_curso.checkin_em).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          em_curso.turno_nome && ` · ${em_curso.turno_nome}`,
          em_curso.condominio_nome && ` · ${em_curso.condominio_nome}`
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: fazerCheckout,
            disabled: enviando,
            className: "mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white py-4 text-base font-semibold shadow-lg disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(Square, { className: "h-5 w-5 fill-white" }),
              enviando ? "A finalizar..." : "Terminar turno"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 text-center", children: [
        /* @__PURE__ */ jsx(Clock, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm mb-5", children: "Não está ao serviço de momento." }),
        escalas_hoje.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 uppercase tracking-wide mb-2", children: "Associar a uma escala de hoje (opcional)" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 max-w-md mx-auto", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setEscalaSelecionada(null),
                className: `w-full text-left px-3 py-2 rounded-lg border text-sm transition ${escalaSelecionada === null ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"}`,
                children: "Sem escala específica"
              }
            ),
            escalas_hoje.map((e) => {
              var _a;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setEscalaSelecionada(e.id),
                  className: `w-full text-left px-3 py-2 rounded-lg border text-sm transition ${escalaSelecionada === e.id ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-medium", children: ((_a = e.turno) == null ? void 0 : _a.nome) ?? "Turno" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-xs", children: [
                        e.hora_inicio,
                        " – ",
                        e.hora_fim
                      ] })
                    ] }),
                    e.condominio_nome && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-0.5", children: e.condominio_nome })
                  ]
                },
                e.id
              );
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: fazerCheckin,
            disabled: enviando,
            className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-4 text-base font-semibold shadow-lg disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(Play, { className: "h-5 w-5 fill-white" }),
              enviando ? "A iniciar..." : "Iniciar turno"
            ]
          }
        )
      ] }),
      escalas_hoje.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-zinc-300 mb-3 inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-cyan-400" }),
          "Escalas de hoje"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: escalas_hoje.map((e) => {
          var _a, _b;
          return /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-zinc-900/50 border border-zinc-800 p-3 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full", style: { background: ((_a = e.turno) == null ? void 0 : _a.cor_hex) ?? "#06B6D4" } }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200", children: ((_b = e.turno) == null ? void 0 : _b.nome) ?? "Turno" }),
              e.condominio_nome && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "inline h-3 w-3 mr-1" }),
                e.condominio_nome
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 font-mono", children: [
              e.hora_inicio,
              " – ",
              e.hora_fim
            ] })
          ] }, e.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-zinc-300 mb-3 inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(History, { className: "h-4 w-4 text-zinc-400" }),
          "Histórico recente"
        ] }),
        historico.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 bg-zinc-900/30 rounded-xl border border-zinc-800", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: "Sem registos ainda." }) }) : /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase text-zinc-400", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2", children: "Data" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2", children: "Turno" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 hidden md:table-cell", children: "Local" }),
            /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-2", children: "Hora" }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-3 py-2", children: "Horas" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: historico.map((h) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-zinc-800/40 last:border-0", children: [
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-zinc-300", children: h.data_label }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-zinc-400 text-xs", children: h.turno_nome ?? "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-zinc-500 text-xs hidden md:table-cell", children: h.condominio_nome ?? "—" }),
            /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center text-zinc-400 text-xs font-mono", children: [
              h.hora_checkin,
              " – ",
              h.hora_checkout
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-right text-emerald-300 font-semibold", children: [
              h.horas_trabalhadas.toFixed(2),
              "h"
            ] })
          ] }, h.id)) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Presenca as default
};
