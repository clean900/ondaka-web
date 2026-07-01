import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Building2, Edit, Trash2, Layers, Hash, Home, Percent, Plus, ChevronRight } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Show({ edificio, estatisticas }) {
  const eliminar = () => {
    if (confirm(`Eliminar «${edificio.nome}»? Esta acção não pode ser desfeita.`)) {
      router.delete(`/edificios/${edificio.id}`);
    }
  };
  const fraccoesPorPiso = edificio.fraccoes.reduce((acc, f) => {
    acc[f.piso] = acc[f.piso] || [];
    acc[f.piso].push(f);
    return acc;
  }, {});
  const pisosOrdenados = Object.keys(fraccoesPorPiso).map(Number).sort((a, b) => b - a);
  const percentagemOcupacao = estatisticas.total_fraccoes > 0 ? Math.round(estatisticas.fraccoes_ocupadas / estatisticas.total_fraccoes * 100) : 0;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: edificio.nome }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/condominios/${edificio.condominio.id}`,
          className: "inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            edificio.condominio.nome
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
              style: {
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)",
                border: "0.5px solid rgba(168, 85, 247, 0.3)"
              },
              children: /* @__PURE__ */ jsx(Building2, { className: "w-7 h-7 text-[#A855F7]" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: edificio.nome }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-2 text-sm text-white/60", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10", children: edificio.codigo }),
              edificio.tem_elevador && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-md bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF]", children: "Com elevador" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Link, { href: `/edificios/${edificio.id}/edit`, className: "btn-secondary", children: [
            /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
            "Editar"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: eliminar, className: "btn-danger", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-8", children: [
      /* @__PURE__ */ jsx(StatBox, { label: "Pisos", valor: edificio.numero_pisos, icon: Layers, cor: "#A855F7" }),
      /* @__PURE__ */ jsx(StatBox, { label: "Fracções", valor: estatisticas.total_fraccoes, icon: Hash, cor: "#00D4FF" }),
      /* @__PURE__ */ jsx(
        StatBox,
        {
          label: "Área total",
          valor: `${Number(estatisticas.area_total_m2).toFixed(0)} m²`,
          icon: Home,
          cor: "#EC4899"
        }
      ),
      /* @__PURE__ */ jsx(
        StatBox,
        {
          label: "Ocupação",
          valor: `${percentagemOcupacao}%`,
          icon: Percent,
          cor: percentagemOcupacao >= 80 ? "#10B981" : "#F59E0B"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Fracções" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mt-0.5", children: "Organizadas por piso (mais alto primeiro)" })
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: `/edificios/${edificio.id}/fraccoes/create`, className: "btn-primary", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "Nova fracção"
      ] })
    ] }),
    pisosOrdenados.length === 0 ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: "text-center py-16 rounded-xl",
        style: {
          background: "rgba(255,255,255,0.02)",
          border: "0.5px dashed rgba(168, 85, 247, 0.2)"
        },
        children: [
          /* @__PURE__ */ jsx(Home, { className: "h-12 w-12 text-white/20 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/50 text-sm", children: "Nenhuma fracção registada." }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: `/edificios/${edificio.id}/fraccoes/create`,
              className: "inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] text-sm font-medium transition",
              children: [
                "Adicionar a primeira fracção",
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3" })
              ]
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: pisosOrdenados.map((piso) => /* @__PURE__ */ jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold",
              style: {
                background: "rgba(168, 85, 247, 0.1)",
                border: "0.5px solid rgba(168, 85, 247, 0.25)",
                color: "#A855F7"
              },
              children: piso === 0 ? "0" : piso
            }
          ),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-white text-sm", children: piso === 0 ? "Rés-do-chão" : piso > 0 ? `${piso}º Piso` : `Cave ${Math.abs(piso)}` })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-white/40", children: [
          fraccoesPorPiso[piso].length,
          " ",
          fraccoesPorPiso[piso].length === 1 ? "fracção" : "fracções"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2", children: fraccoesPorPiso[piso].map((f) => /* @__PURE__ */ jsx(FraccaoCell, { fraccao: f }, f.id)) })
    ] }, piso)) })
  ] });
}
function StatBox({
  label,
  valor,
  icon: Icon,
  cor
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl p-4 transition-all",
      style: {
        background: `linear-gradient(135deg, ${cor}15 0%, ${cor}05 100%)`,
        border: `0.5px solid ${cor}35`
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between mb-2", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-8 h-8 rounded-lg flex items-center justify-center",
            style: { background: `${cor}20`, border: `0.5px solid ${cor}40` },
            children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: cor } })
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-[1px] font-medium mb-0.5", children: label }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-white tracking-tight", children: valor })
      ]
    }
  );
}
function FraccaoCell({ fraccao }) {
  const estadoConfig = {
    ocupada: {
      bg: "rgba(16, 185, 129, 0.08)",
      border: "rgba(16, 185, 129, 0.3)",
      dot: "#10B981",
      text: "#6EE7B7",
      label: "Ocupada"
    },
    vaga: {
      bg: "rgba(255, 255, 255, 0.03)",
      border: "rgba(255, 255, 255, 0.1)",
      dot: "rgba(255, 255, 255, 0.4)",
      text: "rgba(255, 255, 255, 0.5)",
      label: "Vaga"
    },
    reservada: {
      bg: "rgba(245, 158, 11, 0.08)",
      border: "rgba(245, 158, 11, 0.3)",
      dot: "#F59E0B",
      text: "#FCD34D",
      label: "Reservada"
    }
  };
  const config = estadoConfig[fraccao.estado] ?? estadoConfig.vaga;
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/fraccoes/${fraccao.id}`,
      className: "group block p-3 rounded-lg transition-all hover:-translate-y-0.5",
      style: {
        background: config.bg,
        border: `0.5px solid ${config.border}`
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono font-semibold text-white text-sm", children: fraccao.identificador }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "w-1.5 h-1.5 rounded-full flex-shrink-0",
              style: { background: config.dot }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-white/50", children: [
          Number(fraccao.area_privativa_m2).toFixed(0),
          " m²"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] mt-1 font-medium", style: { color: config.text }, children: config.label })
      ]
    }
  );
}
export {
  Show as default
};
