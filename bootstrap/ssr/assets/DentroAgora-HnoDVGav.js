import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head, Link, router } from "@inertiajs/react";
import { DoorOpen, BarChart3, ClipboardList, Clock, Users, User, Home, Car, Key, Package } from "lucide-react";
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
function DentroAgora({ visitas, total, controloBensActivo, livroOcorrenciasActivo, dashboardPortariaActivo }) {
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
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          dashboardPortariaActivo && /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/visitantes/dashboard",
              className: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }),
                "Dashboard"
              ]
            }
          ),
          livroOcorrenciasActivo && /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/visitantes/livro-ocorrencias",
              className: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsx(ClipboardList, { className: "h-4 w-4" }),
                "Ocorrências"
              ]
            }
          ),
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
        return /* @__PURE__ */ jsxs("div", { className: "p-4 md:p-5 hover:bg-zinc-900/30 transition-colors", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1", children: [
              visita.foto_entrada_path ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: `/ficheiros/${visita.foto_entrada_path}`,
                  alt: "Visitante",
                  className: "h-10 w-10 rounded-lg object-cover flex-shrink-0"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-cyan-400" }) }),
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
                  ] }),
                  visita.matricula && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-zinc-300", children: [
                    /* @__PURE__ */ jsx(Car, { className: "h-3.5 w-3.5" }),
                    visita.matricula
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
          ] }),
          controloBensActivo && /* @__PURE__ */ jsx(ItensVisita, { visita })
        ] }, visita.id);
      }) }) })
    ] })
  ] });
}
const ESTADO_BADGE = {
  dentro: "text-cyan-400 bg-cyan-500/10",
  saiu: "text-emerald-400 bg-emerald-500/10",
  ficou: "text-amber-400 bg-amber-500/10",
  aguarda_autorizacao: "text-purple-400 bg-purple-500/10",
  retido: "text-red-400 bg-red-500/10"
};
const ESTADO_LABEL = {
  saiu: "Saiu",
  ficou: "Ficou",
  aguarda_autorizacao: "Aguarda autorização",
  retido: "Retido",
  dentro: "Dentro"
};
function ItensVisita({ visita }) {
  const itens = visita.itens ?? [];
  const base = `/visitantes/visitas/${visita.id}/itens`;
  const opts = { preserveScroll: true };
  const resolver = (itemId, resolucao) => {
    router.post(`${base}/${itemId}/resolver`, { resolucao }, opts);
  };
  return /* @__PURE__ */ jsxs("div", { className: "mt-3 ml-13 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-xs font-medium text-zinc-400", children: [
      /* @__PURE__ */ jsx(Package, { className: "h-3.5 w-3.5" }),
      "Itens à entrada ",
      itens.length > 0 && `(${itens.length})`
    ] }) }),
    itens.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-600", children: "Sem itens registados à entrada." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: itens.map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-2 text-sm", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-zinc-300 truncate", children: [
        item.quantidade > 1 ? `${item.quantidade}× ` : "",
        item.descricao,
        item.identificador && /* @__PURE__ */ jsxs("span", { className: "text-zinc-600", children: [
          " · ",
          item.identificador
        ] }),
        !item.registado_na_entrada && /* @__PURE__ */ jsx("span", { className: "ml-1.5 text-amber-400 text-xs", children: "⚠ não declarado" })
      ] }),
      item.estado === "dentro" ? /* @__PURE__ */ jsxs("span", { className: "flex gap-1 flex-shrink-0", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => resolver(item.id, "saiu"), className: "px-2 py-0.5 rounded text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20", children: "Saiu" }),
        /* @__PURE__ */ jsx("button", { onClick: () => resolver(item.id, "ficou"), className: "px-2 py-0.5 rounded text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20", children: "Ficou" })
      ] }) : /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${ESTADO_BADGE[item.estado] ?? ESTADO_BADGE.dentro}`, children: ESTADO_LABEL[item.estado] ?? item.estado })
    ] }, item.id)) })
  ] });
}
export {
  DentroAgora as default
};
