import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { Head, router } from "@inertiajs/react";
import { Users, Clock, TriangleAlert, CircleCheck, TrendingUp, CircleX, Archive, ChevronRight } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatDataRelativa(iso) {
  if (!iso) return "—";
  const data = new Date(iso);
  const agora = /* @__PURE__ */ new Date();
  const dias = Math.round((data.getTime() - agora.getTime()) / 864e5);
  const dataFormatada = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short"
  }).format(data);
  if (dias < -1) return `${dataFormatada} (há ${Math.abs(dias)}d)`;
  if (dias === 0) return `${dataFormatada} (hoje)`;
  if (dias === 1) return `${dataFormatada} (amanhã)`;
  if (dias > 0) return `${dataFormatada} (em ${dias}d)`;
  return dataFormatada;
}
function EstadoBadge({ estado, label }) {
  const estilos = {
    trial: "bg-[#00D4FF]/15 text-[#8FE7FF]",
    grace: "bg-[#EC4899]/15 text-[#FDA4CF]",
    activa: "bg-emerald-500/15 text-emerald-300",
    em_atraso: "bg-amber-500/15 text-amber-300",
    suspensa: "bg-red-500/15 text-red-300",
    cancelada: "bg-white/10 text-white/70",
    arquivada: "bg-white/5 text-white/50"
  };
  const estilo = estilos[estado] ?? "bg-white/10 text-white/70";
  return /* @__PURE__ */ jsx("span", { className: `inline-block px-2 py-0.5 rounded text-[11px] font-medium ${estilo}`, children: label });
}
function AdminSubscricoesIndex({ subscricoes, filtro_estado, contadores }) {
  const aplicarFiltro = (estado) => {
    router.get("/admin/subscricoes", estado ? { estado } : {}, { preserveState: false });
  };
  const filtros = [
    { key: null, label: "Todas", valor: contadores.total, icon: Users, cor: "text-white" },
    { key: "trial", label: "Em trial", valor: contadores.trial, icon: Clock, cor: "text-[#8FE7FF]" },
    {
      key: "grace",
      label: "Em grace",
      valor: contadores.grace,
      icon: TriangleAlert,
      cor: "text-[#FDA4CF]"
    },
    {
      key: "activa",
      label: "Activas",
      valor: contadores.activa,
      icon: CircleCheck,
      cor: "text-emerald-300"
    },
    {
      key: "em_atraso",
      label: "Em atraso",
      valor: contadores.em_atraso,
      icon: TrendingUp,
      cor: "text-amber-300"
    },
    {
      key: "suspensa",
      label: "Suspensas",
      valor: contadores.suspensa,
      icon: CircleX,
      cor: "text-red-300"
    },
    {
      key: "cancelada",
      label: "Canceladas",
      valor: contadores.cancelada,
      icon: Archive,
      cor: "text-white/60"
    }
  ];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Subscrições" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white tracking-tight", children: "Subscrições" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Painel de administração — todas as empresas clientes" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3", children: filtros.map((f) => {
        const Icon = f.icon;
        const activo = filtro_estado === f.key || filtro_estado === null && f.key === null;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => aplicarFiltro(f.key),
            className: `p-4 rounded-xl border text-left transition-all ${activo ? "bg-white/10 border-white/20" : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 ${f.cor}` }) }),
              /* @__PURE__ */ jsx("div", { className: `text-2xl font-semibold ${f.cor}`, children: f.valor }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50 mt-0.5", children: f.label })
            ]
          },
          f.label
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-white/[0.02] border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-[11px] uppercase tracking-wide text-white/50", children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Empresa" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Estado" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Ciclo" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Data crítica" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium", children: "Preço" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-medium w-10" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            subscricoes.data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-4 py-8 text-center text-white/50", children: "Nenhuma subscrição encontrada." }) }),
            subscricoes.data.map((sub) => {
              const dataCritica = sub.estado === "trial" ? sub.trial_expira_em : sub.estado === "grace" ? sub.grace_expira_em : sub.periodo_actual_fim;
              return /* @__PURE__ */ jsxs(
                "tr",
                {
                  className: "border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer",
                  onClick: () => router.get(`/admin/subscricoes/${sub.id}`),
                  children: [
                    /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "font-medium text-white", children: sub.empresa.nome ?? "—" }),
                      sub.empresa.nif && /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-white/50 font-mono mt-0.5", children: [
                        "NIF ",
                        sub.empresa.nif
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(EstadoBadge, { estado: sub.estado, label: sub.estado_label }) }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-white/80", children: sub.ciclo_label }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-white/70", children: formatDataRelativa(dataCritica) }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: sub.preco_customizado_por_fraccao ? /* @__PURE__ */ jsx("span", { className: "text-[#8FE7FF]", children: "Customizado" }) : /* @__PURE__ */ jsx("span", { className: "text-white/60", children: "Tabela" }) }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-white/30" }) })
                  ]
                },
                sub.id
              );
            })
          ] })
        ] }) }),
        subscricoes.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-t border-white/10 flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-white/60", children: [
            subscricoes.from,
            "–",
            subscricoes.to,
            " de ",
            subscricoes.total
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: subscricoes.links.map((link, idx) => /* @__PURE__ */ jsx(
            "button",
            {
              disabled: !link.url,
              onClick: () => link.url && router.visit(link.url),
              className: `px-3 py-1 rounded text-xs ${link.active ? "bg-white/15 text-white" : link.url ? "text-white/70 hover:bg-white/10" : "text-white/30 cursor-not-allowed"}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            idx
          )) })
        ] })
      ] })
    ] })
  ] });
}
export {
  AdminSubscricoesIndex as default
};
