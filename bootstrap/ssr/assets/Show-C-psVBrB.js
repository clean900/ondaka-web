import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head, Link, router } from "@inertiajs/react";
import { CircleX, Clock, CircleCheck, ArrowLeft, MessageSquare, TriangleAlert, RotateCw, Building, User, Receipt } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_CONFIG = {
  enviado: {
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/40",
    icon: CircleCheck
  },
  entregue: {
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/40",
    icon: CircleCheck
  },
  pendente: {
    color: "text-amber-400 bg-amber-500/10 border-amber-500/40",
    icon: Clock
  },
  falhado: {
    color: "text-red-400 bg-red-500/10 border-red-500/40",
    icon: CircleX
  },
  rejeitado: {
    color: "text-red-400 bg-red-500/10 border-red-500/40",
    icon: CircleX
  }
};
function AdminSmsShow({ log }) {
  const config = ESTADO_CONFIG[log.estado] ?? ESTADO_CONFIG.pendente;
  const Icon = config.icon;
  const podeReenviar = ["falhado", "rejeitado"].includes(log.estado);
  const reenviar = () => {
    if (confirm(
      "Reenviar SMS? Será enviado usando saldo da conta sistema (não consome crédito cliente)."
    )) {
      router.post(`/admin/sms/${log.id}/reenviar`);
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `SMS #${log.id} — ONDAKA` }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-5xl", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/sms",
          className: "inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-zinc-100", children: [
              "SMS #",
              log.id
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              new Date(log.created_at).toLocaleString("pt-PT"),
              log.trigger && /* @__PURE__ */ jsxs("span", { className: "ml-2 text-zinc-600", children: [
                "· trigger:",
                " ",
                /* @__PURE__ */ jsx("span", { className: "font-mono text-zinc-500", children: log.trigger })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "span",
          {
            className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${config.color}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
              log.estado_label
            ]
          }
        )
      ] }),
      log.erro_mensagem && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsx(TriangleAlert, { className: "h-5 w-5 text-red-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-red-400", children: "Erro no envio" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 mt-1", children: log.erro_mensagem }),
          log.saldo_devolvido && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-400/80 mt-2", children: "✓ Crédito devolvido ao cliente automaticamente" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Mensagem" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-zinc-500", children: [
                /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("span", { className: "text-zinc-400 font-mono", children: log.numero_mascarado }) }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  log.tamanho_chars,
                  " caracteres"
                ] }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  log.segmentos,
                  " segmento",
                  log.segmentos > 1 ? "s" : ""
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-200 whitespace-pre-wrap", children: log.mensagem })
            ] })
          ] }),
          log.resposta_bruta && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: [
              "Resposta do provider (",
              log.provider,
              ")"
            ] }),
            /* @__PURE__ */ jsx("pre", { className: "bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-400 overflow-x-auto", children: JSON.stringify(log.resposta_bruta, null, 2) })
          ] }),
          podeReenviar && /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/5 border border-amber-500/30 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-amber-400/80 mb-2", children: "Acções" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mb-3", children: "Este SMS falhou. Pode tentar reenviar (usa saldo da conta sistema, não consome do cliente)." }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: reenviar,
                className: "inline-flex items-center gap-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-4 py-2 text-sm",
                children: [
                  /* @__PURE__ */ jsx(RotateCw, { className: "h-4 w-4" }),
                  "Reenviar SMS"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Contexto" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Categoria" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: log.categoria_label })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Provider" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: log.provider })
              ] }),
              log.provider_id && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "ID provider" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 font-mono text-xs", children: log.provider_id })
              ] }),
              log.saldo_provider_apos !== null && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Saldo após" }),
                /* @__PURE__ */ jsxs("dd", { className: "text-zinc-200", children: [
                  log.saldo_provider_apos,
                  " SMS"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Tentativas" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: log.tentativas })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Créditos consumidos" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: log.creditos_consumidos_cliente })
              ] })
            ] })
          ] }),
          log.owner && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Cliente (saldo)" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(Building, { className: "h-4 w-4 text-zinc-500 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200", children: log.owner.nome }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
                  log.owner.type,
                  "#",
                  log.owner.id
                ] })
              ] })
            ] })
          ] }),
          log.user && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Utilizador" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-zinc-500 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200", children: log.user.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: log.user.email })
              ] })
            ] })
          ] }),
          log.ordem && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Ordem relacionada" }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: `/admin/ordens/${log.ordem.id}`,
                className: "flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300",
                children: [
                  /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4" }),
                  log.ordem.numero,
                  " →"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Timeline" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs text-zinc-500", children: "Criado" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: new Date(log.created_at).toLocaleString("pt-PT") })
              ] }),
              log.enviado_em && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs text-emerald-400/80", children: "Enviado" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: new Date(log.enviado_em).toLocaleString("pt-PT") })
              ] }),
              log.falhado_em && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs text-red-400/80", children: "Falhado" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: new Date(log.falhado_em).toLocaleString("pt-PT") })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  AdminSmsShow as default
};
