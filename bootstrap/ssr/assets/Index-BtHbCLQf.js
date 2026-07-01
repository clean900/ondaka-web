import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head, Link, router } from "@inertiajs/react";
import { Megaphone, Plus, Filter, Archive, CheckCircle2, Clock, FileText, Search } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_CONFIG = {
  rascunho: { label: "Rascunho", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: FileText },
  agendado: { label: "Agendado", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Clock },
  publicado: { label: "Publicado", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  arquivado: { label: "Arquivado", color: "text-zinc-500 bg-zinc-700/20 border-zinc-700/30", icon: Archive }
};
const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", color: "text-zinc-400" },
  media: { label: "Média", color: "text-blue-400" },
  alta: { label: "Alta", color: "text-amber-400" },
  urgente: { label: "Urgente", color: "text-red-400" }
};
const CATEGORIA_LABEL = {
  geral: "Geral",
  manutencao: "Manutenção",
  reuniao: "Reunião",
  urgente: "Urgente",
  evento: "Evento",
  aviso_legal: "Aviso legal",
  outro: "Outro"
};
function AvisosIndex({ avisos, condominios, filtros }) {
  const [form, setForm] = useState(filtros);
  const aplicarFiltros = () => {
    const params = {};
    if (form.estado) params.estado = form.estado;
    if (form.categoria) params.categoria = form.categoria;
    if (form.condominio_id) params.condominio_id = form.condominio_id;
    if (form.q) params.q = form.q;
    router.get("/avisos", params, { preserveState: true, preserveScroll: true });
  };
  const limparFiltros = () => {
    setForm({});
    router.get("/avisos", {}, { preserveState: true, preserveScroll: true });
  };
  const formatarData = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const ano = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Avisos — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Megaphone, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Avisos" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              (avisos == null ? void 0 : avisos.total) ?? 0,
              " aviso",
              ((avisos == null ? void 0 : avisos.total) ?? 0) !== 1 ? "s" : "",
              " no total"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/avisos/criar",
            className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Novo aviso"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 text-zinc-400 text-sm", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
          "Filtros"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Estado" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.estado || "",
                onChange: (e) => setForm({ ...form, estado: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
                  Object.entries(ESTADO_CONFIG).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v.label }, k))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Categoria" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.categoria || "",
                onChange: (e) => setForm({ ...form, categoria: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todas" }),
                  Object.entries(CATEGORIA_LABEL).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v }, k))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Condomínio" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.condominio_id || "",
                onChange: (e) => setForm({ ...form, condominio_id: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
                  condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Pesquisar" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: form.q || "",
                    onChange: (e) => setForm({ ...form, q: e.target.value }),
                    onKeyDown: (e) => e.key === "Enter" && aplicarFiltros(),
                    placeholder: "Título ou descrição...",
                    className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: aplicarFiltros,
                  className: "bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium",
                  children: "Filtrar"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: limparFiltros,
                  className: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm",
                  children: "Limpar"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: avisos.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(Megaphone, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-400 font-medium", children: "Nenhum aviso" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-600 mt-1", children: "Crie o primeiro aviso para comunicar com os condóminos." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: avisos.data.map((a) => {
        const estadoCfg = ESTADO_CONFIG[a.estado] ?? ESTADO_CONFIG.rascunho;
        const EstadoIcon = estadoCfg.icon;
        const prioCfg = PRIORIDADE_CONFIG[a.prioridade] ?? PRIORIDADE_CONFIG.media;
        return /* @__PURE__ */ jsx(
          Link,
          {
            href: `/avisos/${a.id}`,
            className: "block p-4 md:p-5 hover:bg-zinc-900 transition-colors",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Megaphone, { className: "h-5 w-5 text-purple-400" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-zinc-100", children: a.titulo }),
                    /* @__PURE__ */ jsxs("span", { className: `text-xs font-semibold ${prioCfg.color}`, children: [
                      "• ",
                      prioCfg.label
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 mt-0.5 line-clamp-1", children: a.descricao }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-600", children: [
                    /* @__PURE__ */ jsx("span", { children: CATEGORIA_LABEL[a.categoria] ?? a.categoria }),
                    a.condominio && /* @__PURE__ */ jsxs("span", { children: [
                      "· ",
                      a.condominio.nome
                    ] }),
                    a.autor && /* @__PURE__ */ jsxs("span", { children: [
                      "· ",
                      a.autor.name
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "· ",
                      a.estado === "publicado" ? formatarData(a.publicado_em) : formatarData(a.created_at)
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoCfg.color} flex-shrink-0`, children: [
                /* @__PURE__ */ jsx(EstadoIcon, { className: "h-3.5 w-3.5" }),
                estadoCfg.label
              ] })
            ] })
          },
          a.id
        );
      }) }) }),
      avisos.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-1 mt-4", children: avisos.links.map((link, i) => /* @__PURE__ */ jsx(
        "button",
        {
          disabled: !link.url,
          onClick: () => link.url && router.get(link.url, {}, { preserveScroll: true }),
          className: `px-3 py-1.5 rounded-lg text-sm ${link.active ? "bg-cyan-500 text-white" : link.url ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-900 text-zinc-600 cursor-not-allowed"}`,
          dangerouslySetInnerHTML: { __html: link.label }
        },
        i
      )) })
    ] })
  ] });
}
export {
  AvisosIndex as default
};
