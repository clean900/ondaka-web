import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { Head, Link } from "@inertiajs/react";
import { DoorOpen, Clock, Users, User, Home, Key } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const METODO_CONFIG = {
  qr: { label: "QR Code", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  otp: { label: "Código OTP", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  manual: { label: "Manual", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" }
};
function DentroAgora({ visitas, total }) {
  const formatarHora = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  };
  const formatarDuracao = (iso) => {
    const entrada = new Date(iso);
    const agora = /* @__PURE__ */ new Date();
    const minutos = Math.floor((agora.getTime() - entrada.getTime()) / 6e4);
    if (minutos < 60) return `há ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return resto === 0 ? `há ${horas}h` : `há ${horas}h ${resto}min`;
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Dentro agora — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(DoorOpen, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-zinc-100", children: [
              "Dentro agora ",
              total > 0 && /* @__PURE__ */ jsxs("span", { className: "text-zinc-500", children: [
                "(",
                total,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Visitantes actualmente no condomínio" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/visitantes/historico",
              className: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
                "Histórico"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/visitantes/pre-aprovacoes",
              className: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
                "Pré-aprovações"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: visitas.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-400 font-medium", children: "Nenhum visitante dentro" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-600 mt-1", children: "O condomínio está vazio de visitas agora." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: visitas.map((visita) => {
        var _a;
        const metodoConfig = METODO_CONFIG[visita.metodo_validacao];
        return /* @__PURE__ */ jsx("div", { className: "p-4 md:p-5 hover:bg-zinc-900/30 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-cyan-400" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-zinc-100 truncate", children: ((_a = visita.visitante) == null ? void 0 : _a.nome) ?? "Visitante" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1 text-sm text-zinc-500", children: [
                visita.fraccao && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Home, { className: "h-3.5 w-3.5" }),
                  "Fracção ",
                  visita.fraccao.identificador,
                  visita.fraccao.piso !== null && ` (Piso ${visita.fraccao.piso})`
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
                  formatarHora(visita.entrou_em),
                  " · ",
                  formatarDuracao(visita.entrou_em)
                ] })
              ] }),
              visita.observacoes && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-600 mt-1 italic", children: [
                '"',
                visita.observacoes,
                '"'
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2", children: [
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: `inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${metodoConfig.color}`,
                children: [
                  /* @__PURE__ */ jsx(Key, { className: "h-3 w-3" }),
                  metodoConfig.label
                ]
              }
            ),
            visita.guarda_entrada && /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-600", children: [
              "Autorizado por ",
              visita.guarda_entrada.name
            ] })
          ] })
        ] }) }, visita.id);
      }) }) })
    ] })
  ] });
}
export {
  DentroAgora as default
};
