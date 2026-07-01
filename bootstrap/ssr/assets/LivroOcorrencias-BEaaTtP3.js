import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, Link, router } from "@inertiajs/react";
import { ClipboardList, Clock, User, CheckCircle2, ArrowRightLeft, AlertTriangle } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const TIPO = {
  observacao: { label: "Observação", cls: "text-cyan-400 bg-cyan-500/10" },
  incidente: { label: "Incidente", cls: "text-amber-400 bg-amber-500/10" },
  alerta: { label: "Alerta", cls: "text-red-400 bg-red-500/10" }
};
function dt(iso) {
  const d = new Date(iso);
  return d.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function LivroOcorrencias({ ocorrencias, passagens }) {
  const resolver = (id) => router.post(`/visitantes/ocorrencias/${id}/resolver`, {}, { preserveScroll: true });
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Livro de ocorrências — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(ClipboardList, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Livro de ocorrências" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Registos da portaria e passagens de turno" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-zinc-400 mb-3", children: "Ocorrências" }),
          /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 divide-y divide-zinc-800 overflow-hidden", children: ocorrencias.length === 0 ? /* @__PURE__ */ jsx("p", { className: "p-8 text-center text-zinc-500 text-sm", children: "Sem ocorrências registadas." }) : ocorrencias.map((o) => {
            var _a;
            const t = TIPO[o.tipo] ?? TIPO.observacao;
            return /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded ${t.cls}`, children: t.label }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-600 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                  " ",
                  dt(o.created_at)
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-200 text-sm mt-2", children: o.descricao }),
              o.foto_path && /* @__PURE__ */ jsx("img", { src: `/ficheiros/${o.foto_path}`, alt: "", className: "mt-2 rounded-lg max-h-44 object-cover" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
                  " ",
                  ((_a = o.guarda) == null ? void 0 : _a.name) ?? "—"
                ] }),
                o.resolvida_em ? /* @__PURE__ */ jsxs("span", { className: "text-xs text-emerald-400 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                  " Resolvida"
                ] }) : /* @__PURE__ */ jsx("button", { onClick: () => resolver(o.id), className: "text-xs text-emerald-400 hover:text-emerald-300 font-medium", children: "Marcar resolvida" })
              ] })
            ] }, o.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-medium text-zinc-400 mb-3 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(ArrowRightLeft, { className: "h-4 w-4" }),
            " Passagens de turno"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: passagens.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-zinc-500 text-sm", children: "Sem passagens registadas." }) : passagens.map((p) => {
            var _a;
            return /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-zinc-200", children: ((_a = p.guarda) == null ? void 0 : _a.name) ?? "Guarda" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-600", children: dt(p.created_at) })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mt-1", children: p.resumo }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-cyan-400 mt-2 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3" }),
                " ",
                p.total_dentro,
                " dentro · ",
                p.ocorrencias_abertas,
                " ocorrências abertas"
              ] })
            ] }, p.id);
          }) }),
          /* @__PURE__ */ jsx(Link, { href: "/visitantes/dentro-agora", className: "mt-4 inline-block text-sm text-zinc-400 hover:text-cyan-400", children: "← Voltar a Dentro agora" })
        ] })
      ] })
    ] })
  ] });
}
export {
  LivroOcorrencias as default
};
