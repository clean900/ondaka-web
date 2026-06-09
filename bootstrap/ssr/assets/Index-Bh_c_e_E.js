import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, router } from "@inertiajs/react";
import { toast } from "sonner";
import { Store, Clock, CircleCheck, CircleX, Phone, MapPin, Star, Check, X, ToggleRight, ToggleLeft } from "lucide-react";
import "react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatData(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(iso));
}
function Index({ prestadores, estadoActual, contadores }) {
  const filtrar = (estado) => {
    router.get(route("admin.prestadores.index"), { estado }, {
      preserveScroll: true,
      preserveState: true
    });
  };
  const aprovar = (p) => {
    router.patch(route("admin.prestadores.aprovar", p.id), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success(`${p.nome} aprovado e subscricao activada.`)
    });
  };
  const rejeitar = (p) => {
    router.patch(route("admin.prestadores.rejeitar", p.id), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success(`${p.nome} rejeitado.`)
    });
  };
  const alternarSubscricao = (p) => {
    router.patch(route("admin.prestadores.subscricao", p.id), {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Subscricao actualizada.")
    });
  };
  const filtros = [
    { key: "pendente", label: "Pendentes", cor: "text-amber-400" },
    { key: "aprovado", label: "Aprovados", cor: "text-emerald-400" },
    { key: "rejeitado", label: "Rejeitados", cor: "text-white/50" },
    { key: "todos", label: "Todos", cor: "text-white/50" }
  ];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Marketplace - Prestadores Publicos" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-xl font-semibold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Store, { className: "w-5 h-5 text-cyan-400" }),
          "Marketplace - Prestadores publicos"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mt-1", children: "Gestao de inscricoes e subscricoes" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 mb-6", children: [
        /* @__PURE__ */ jsx(Cartao, { label: "Pendentes", valor: contadores.pendente, icone: /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }), cor: "text-amber-400" }),
        /* @__PURE__ */ jsx(Cartao, { label: "Aprovados", valor: contadores.aprovado, icone: /* @__PURE__ */ jsx(CircleCheck, { className: "w-4 h-4" }), cor: "text-emerald-400" }),
        /* @__PURE__ */ jsx(Cartao, { label: "Rejeitados", valor: contadores.rejeitado, icone: /* @__PURE__ */ jsx(CircleX, { className: "w-4 h-4" }), cor: "text-white/50" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-5", children: filtros.map((f) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => filtrar(f.key),
          className: `text-sm px-4 py-1.5 rounded-full transition ${estadoActual === f.key ? "bg-white text-[#0A0A1A] font-medium" : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"}`,
          children: f.label
        },
        f.key
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        prestadores.data.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-white/40", children: "Nenhum prestador neste estado." }),
        prestadores.data.map((p) => /* @__PURE__ */ jsxs("div", { className: "bg-white/[0.03] border border-white/10 rounded-xl p-4 sm:p-5", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row sm:justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-wrap gap-2 mb-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-base font-medium text-white", children: p.nome }),
              /* @__PURE__ */ jsx(EstadoBadge, { estado: p.estado_aprovacao }),
              p.estado_aprovacao === "aprovado" && p.subscricao_activa && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 bg-cyan-500/15 text-cyan-300 rounded-full", children: [
                "Subscricao activa - expira ",
                formatData(p.subscricao_expira_em)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/60 mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1", children: [
              p.telefone && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Phone, { className: "w-3.5 h-3.5" }),
                " ",
                p.telefone
              ] }),
              p.latitude && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5" }),
                " Com localizacao"
              ] }),
              !!p.total_avaliacoes && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 text-amber-400" }),
                p.media_estrelas,
                " (",
                p.total_avaliacoes,
                ")"
              ] })
            ] }),
            p.especialidades && /* @__PURE__ */ jsx("div", { className: "text-sm text-white/40", children: p.especialidades })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10", children: [
            p.estado_aprovacao === "pendente" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => aprovar(p),
                  className: "flex-1 min-w-[140px] py-2 text-sm bg-emerald-500/15 text-emerald-400 rounded-lg flex items-center justify-center gap-1.5 hover:bg-emerald-500/25 transition",
                  children: [
                    /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }),
                    " Aprovar + activar subscricao"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => rejeitar(p),
                  className: "flex-1 min-w-[140px] py-2 text-sm bg-red-500/15 text-red-400 rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-500/25 transition",
                  children: [
                    /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }),
                    " Rejeitar"
                  ]
                }
              )
            ] }),
            p.estado_aprovacao === "aprovado" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => alternarSubscricao(p),
                className: "px-4 py-2 text-sm bg-white/5 border border-white/15 rounded-lg flex items-center gap-1.5 text-white/70 hover:bg-white/10 transition",
                children: p.subscricao_activa ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(ToggleRight, { className: "w-4 h-4" }),
                  " Desactivar subscricao"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(ToggleLeft, { className: "w-4 h-4" }),
                  " Activar subscricao"
                ] })
              }
            ),
            p.estado_aprovacao === "rejeitado" && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => aprovar(p),
                className: "px-4 py-2 text-sm bg-emerald-500/15 text-emerald-400 rounded-lg flex items-center gap-1.5 hover:bg-emerald-500/25 transition",
                children: [
                  /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }),
                  " Reverter - aprovar"
                ]
              }
            )
          ] })
        ] }, p.id))
      ] }),
      prestadores.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-6 justify-center", children: prestadores.links.map((link, i) => /* @__PURE__ */ jsx(
        "button",
        {
          disabled: !link.url,
          onClick: () => link.url && router.visit(link.url, { preserveScroll: true }),
          className: `px-3 py-1.5 text-sm rounded-lg transition ${link.active ? "bg-white text-[#0A0A1A]" : link.url ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-white/5 text-white/20 cursor-not-allowed"}`,
          dangerouslySetInnerHTML: { __html: link.label }
        },
        i
      )) })
    ] })
  ] });
}
function Cartao({ label, valor, icone, cor }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white/[0.03] rounded-lg p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/50 flex items-center gap-1.5", children: [
      icone,
      " ",
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: `text-2xl font-semibold mt-1 ${cor}`, children: valor })
  ] });
}
function EstadoBadge({ estado }) {
  const map = {
    pendente: { txt: "Pendente", cls: "bg-amber-500/15 text-amber-400" },
    aprovado: { txt: "Aprovado", cls: "bg-emerald-500/15 text-emerald-400" },
    rejeitado: { txt: "Rejeitado", cls: "bg-white/10 text-white/50" }
  };
  const e = map[estado] ?? map.pendente;
  return /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${e.cls}`, children: e.txt });
}
export {
  Index as default
};
