import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, Siren, RefreshCw, CheckCircle2, XCircle, AlertOctagon, User, MapPin, Clock, MessageSquare, Camera } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function SosShow() {
  const { alerta } = usePage().props;
  const [showFotoUrl, setShowFotoUrl] = useState(null);
  const [notas, setNotas] = useState("");
  const [acaoEmCurso, setAcaoEmCurso] = useState(null);
  const submitAcao = (acao) => {
    if (acaoEmCurso) return;
    setAcaoEmCurso(acao);
    router.patch(`/sos/alertas/${alerta.id}/estado`, { acao, notas }, {
      preserveScroll: true,
      onFinish: () => setAcaoEmCurso(null)
    });
  };
  const gCfg = {
    critico: { cor: "red", label: "CRÍTICO", text: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/40" },
    alto: { cor: "orange", label: "ALTO", text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/40" },
    medio: { cor: "amber", label: "MÉDIO", text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/40" },
    baixo: { cor: "emerald", label: "BAIXO", text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/40" }
  }[alerta.gravidade];
  const eCfg = {
    aberto: { label: "A aguardar", cor: "bg-red-500/20 text-red-300" },
    atendido: { label: "Atendido", cor: "bg-amber-500/20 text-amber-300" },
    resolvido: { label: "Resolvido", cor: "bg-emerald-500/20 text-emerald-300" },
    falso_alarme: { label: "Falso alarme", cor: "bg-gray-500/20 text-gray-300" }
  }[alerta.estado];
  const fmt = (iso) => iso ? new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `SOS #${alerta.id}` }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs(Link, { href: "/sos/alertas", className: "inline-flex items-center gap-2 text-sm text-white/60 hover:text-white", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
          " Voltar à lista"
        ] }),
        /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded text-xs font-semibold ${eCfg.cor}`, children: eCfg.label })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `rounded-2xl border p-6 ${gCfg.bg} ${gCfg.border}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: `w-16 h-16 rounded-2xl flex items-center justify-center bg-${gCfg.cor}-500/20`, children: /* @__PURE__ */ jsx(Siren, { className: `w-8 h-8 ${gCfg.text}` }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 flex-wrap mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: `text-xs font-bold tracking-wider ${gCfg.text}`, children: gCfg.label }),
              /* @__PURE__ */ jsxs("span", { className: "text-white/40 text-sm", children: [
                "#",
                alerta.id
              ] })
            ] }),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: alerta.tipo_label }),
            /* @__PURE__ */ jsxs("p", { className: "text-white/60 text-sm mt-1", children: [
              alerta.condominio_nome,
              " ",
              alerta.localizacao && /* @__PURE__ */ jsxs(Fragment, { children: [
                "· ",
                alerta.localizacao
              ] })
            ] })
          ] })
        ] }),
        alerta.descricao && /* @__PURE__ */ jsxs("p", { className: "mt-4 text-white/80 text-sm italic", children: [
          '"',
          alerta.descricao,
          '"'
        ] })
      ] }),
      alerta.estado === "aberto" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white/80 uppercase tracking-wide", children: "Ações" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => submitAcao("atender"),
              disabled: !!acaoEmCurso,
              className: "px-4 py-2 rounded-lg bg-amber-500/90 hover:bg-amber-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
                " Marcar como atendido"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => submitAcao("resolver"),
              disabled: !!acaoEmCurso,
              className: "px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }),
                " Resolver"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => submitAcao("falso_alarme"),
              disabled: !!acaoEmCurso,
              className: "px-4 py-2 rounded-lg bg-gray-600/90 hover:bg-gray-600 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" }),
                " Falso alarme"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: notas,
            onChange: (e) => setNotas(e.target.value),
            placeholder: "Notas sobre a resolução (opcional)",
            rows: 2,
            className: "w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
          }
        )
      ] }),
      alerta.estado === "atendido" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white/80 uppercase tracking-wide", children: "Ações" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => submitAcao("resolver"),
              disabled: !!acaoEmCurso,
              className: "px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }),
                " Resolver"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => submitAcao("falso_alarme"),
              disabled: !!acaoEmCurso,
              className: "px-4 py-2 rounded-lg bg-gray-600/90 hover:bg-gray-600 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" }),
                " Falso alarme"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: notas,
            onChange: (e) => setNotas(e.target.value),
            placeholder: "Notas sobre a resolução (opcional)",
            rows: 2,
            className: "w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
          }
        )
      ] }),
      (alerta.estado === "resolvido" || alerta.estado === "falso_alarme") && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white/80 uppercase tracking-wide mb-3", children: "Reabrir alerta?" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => submitAcao("reabrir"),
            disabled: !!acaoEmCurso,
            className: "px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(AlertOctagon, { className: "w-4 h-4" }),
              " Reabrir"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(User, { className: "w-4 h-4" }), label: "Autor", valor: alerta.autor_nome ?? "—" }),
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }), label: "Localização", valor: alerta.localizacao ?? "—" }),
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }), label: "Criado em", valor: fmt(alerta.created_at) }),
        alerta.atendido_em && /* @__PURE__ */ jsx(
          InfoRow,
          {
            icon: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
            label: "Atendido em",
            valor: `${fmt(alerta.atendido_em)} ${alerta.atendido_por_nome ? `por ${alerta.atendido_por_nome}` : ""}`
          }
        ),
        alerta.resolvido_em && /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }), label: "Resolvido em", valor: fmt(alerta.resolvido_em) })
      ] }),
      alerta.resolucao_notas && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "w-3 h-3" }),
          " Notas de resolução"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-white/80 text-sm italic", children: [
          '"',
          alerta.resolucao_notas,
          '"'
        ] })
      ] }),
      alerta.fotos.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Camera, { className: "w-3 h-3" }),
          " Fotos anexadas (",
          alerta.fotos.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 md:grid-cols-4 gap-3", children: alerta.fotos.map((f) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowFotoUrl(f.url),
            className: "aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition",
            children: /* @__PURE__ */ jsx("img", { src: f.url, alt: `Foto #${f.id}`, className: "w-full h-full object-cover" })
          },
          f.id
        )) })
      ] })
    ] }),
    showFotoUrl && /* @__PURE__ */ jsx(
      "div",
      {
        onClick: () => setShowFotoUrl(null),
        className: "fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 cursor-pointer",
        children: /* @__PURE__ */ jsx("img", { src: showFotoUrl, alt: "Foto", className: "max-w-full max-h-full object-contain" })
      }
    )
  ] });
}
function InfoRow({ icon, label, valor }) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-white/10 bg-white/5 p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "text-white/40 mt-0.5", children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 uppercase tracking-wider mb-0.5", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/90 break-words", children: valor })
    ] })
  ] }) });
}
export {
  SosShow as default
};
