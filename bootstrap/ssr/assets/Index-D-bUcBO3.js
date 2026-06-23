import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BevyWQSg.js";
import { Head, Link, router } from "@inertiajs/react";
import { Users, Plus, AlertCircle, XCircle, CheckCircle2, Video, Clock, Calendar } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_CONFIG = {
  agendada: { color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", icon: Clock },
  em_curso: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: Video },
  concluida: { color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: CheckCircle2 },
  cancelada: { color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle },
  sem_quorum: { color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: AlertCircle }
};
function AssembleiasIndex({ assembleias, condominios, filtros }) {
  const aplicar = (campo, valor) => {
    router.get("/assembleias", { ...filtros, [campo]: valor || void 0 }, { preserveState: true, preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Assembleias — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Assembleias" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Convocação, realização e actas" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/assembleias/nova",
            className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Nova assembleia"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filtros.estado,
            onChange: (e) => aplicar("estado", e.target.value),
            className: "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos estados" }),
              /* @__PURE__ */ jsx("option", { value: "agendada", children: "Agendadas" }),
              /* @__PURE__ */ jsx("option", { value: "em_curso", children: "Em curso" }),
              /* @__PURE__ */ jsx("option", { value: "concluida", children: "Concluídas" }),
              /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Canceladas" }),
              /* @__PURE__ */ jsx("option", { value: "sem_quorum", children: "Sem quórum" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filtros.condominio_id ?? "",
            onChange: (e) => aplicar("condominio_id", e.target.value),
            className: "bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos condomínios" }),
              condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: assembleias.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-400", children: "Nenhuma assembleia registada" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-600 mt-1", children: 'Clique em "Nova assembleia" para começar' })
      ] }) : /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-zinc-800 bg-zinc-950/50", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Número" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Título" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Condomínio" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Data" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Presenças" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold", children: "Estado" }),
          /* @__PURE__ */ jsx("th", {})
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: assembleias.data.map((a) => {
          var _a;
          const cfg = ESTADO_CONFIG[a.estado] ?? ESTADO_CONFIG.agendada;
          const Icon = cfg.icon;
          const data = new Date(a.data_agendada);
          return /* @__PURE__ */ jsxs("tr", { className: "border-b border-zinc-800/50 hover:bg-zinc-900/40 transition", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-mono text-zinc-300", children: a.numero }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm text-zinc-200", children: [
              /* @__PURE__ */ jsx("div", { children: a.titulo }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500 mt-0.5", children: [
                a.tipo_label,
                " · ",
                a.modo
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-zinc-400", children: ((_a = a.condominio) == null ? void 0 : _a.nome) ?? "—" }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm text-zinc-400 whitespace-nowrap", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 text-zinc-600" }),
                data.toLocaleDateString("pt-PT")
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500 mt-0.5", children: data.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm text-zinc-400", children: [
              a.presentes,
              " / ",
              a.total_participantes
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${cfg.color}`, children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
              a.estado_label
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(Link, { href: `/assembleias/${a.id}`, className: "text-xs text-cyan-400 hover:text-cyan-300", children: "Abrir →" }) })
          ] }, a.id);
        }) })
      ] }) })
    ] })
  ] });
}
export {
  AssembleiasIndex as default
};
