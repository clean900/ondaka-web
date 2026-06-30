import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout, a as formatKz } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Home, Edit, Trash2, Layers, Ruler, Percent, Bed, Bath, Car, Package, DollarSign, Shield, MessageSquare } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Show({ fraccao }) {
  var _a, _b;
  const eliminar = () => {
    if (confirm(`Eliminar fracção ${fraccao.identificador}?`)) {
      router.delete(`/fraccoes/${fraccao.id}`);
    }
  };
  const quotaTotal = Number(fraccao.quota_mensal_base) + Number(fraccao.quota_mensal_fundo_reserva);
  const estadoConfig = {
    ocupada: { bg: "bg-emerald-500/10 border-emerald-500/25", text: "text-emerald-400", dot: "#10B981" },
    vaga: { bg: "bg-white/5 border-white/10", text: "text-white/60", dot: "#64748B" },
    reservada: { bg: "bg-amber-500/10 border-amber-500/25", text: "text-amber-400", dot: "#F59E0B" }
  };
  const config = estadoConfig[fraccao.estado] ?? estadoConfig.vaga;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Fracção ${fraccao.identificador}` }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/edificios/${fraccao.edificio.id}`,
          className: "inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxs("span", { className: "truncate max-w-md", children: [
              fraccao.condominio.nome,
              " / ",
              fraccao.edificio.nome
            ] })
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
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
                border: "0.5px solid rgba(236, 72, 153, 0.3)"
              },
              children: /* @__PURE__ */ jsx(Home, { className: "w-7 h-7 text-[#EC4899]" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: [
              "Fracção ",
              /* @__PURE__ */ jsx("span", { className: "font-mono", children: fraccao.identificador })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-2 text-sm text-white/60", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10", children: fraccao.tipo.nome }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10", children: [
                fraccao.area_privativa_m2,
                " m²"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${config.bg} ${config.text}`, children: [
                /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full", style: { background: config.dot } }),
                fraccao.estado
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Link, { href: `/fraccoes/${fraccao.id}/edit`, className: "btn-secondary", children: [
            /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
            "Editar"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: eliminar, className: "btn-danger", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
          /* @__PURE__ */ jsx(Home, { className: "w-4 h-4 text-[#A855F7]" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Características" })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(InfoLine, { icon: Home, label: "Tipo", value: fraccao.tipo.nome }),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              icon: Layers,
              label: "Piso",
              value: fraccao.piso === 0 ? "Rés-do-chão" : `${fraccao.piso}º Piso`
            }
          ),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              icon: Ruler,
              label: "Área privativa",
              value: `${fraccao.area_privativa_m2} m²`
            }
          ),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              icon: Percent,
              label: "Permilagem",
              value: `${fraccao.permilagem} ‰`
            }
          ),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              icon: Bed,
              label: "Quartos",
              value: ((_a = fraccao.numero_quartos) == null ? void 0 : _a.toString()) ?? null
            }
          ),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              icon: Bath,
              label: "Casas de banho",
              value: ((_b = fraccao.numero_casas_banho) == null ? void 0 : _b.toString()) ?? null
            }
          ),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              icon: Car,
              label: "Garagem",
              value: fraccao.tem_lugar_garagem ? `${fraccao.numero_lugares_garagem} ${fraccao.numero_lugares_garagem === 1 ? "lugar" : "lugares"}` : "Não",
              destaque: fraccao.tem_lugar_garagem
            }
          ),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              icon: Package,
              label: "Arrecadação",
              value: fraccao.tem_arrecadacao ? "Sim" : "Não",
              destaque: fraccao.tem_arrecadacao
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4 text-[#00D4FF]" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Quotas mensais" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(
            QuotaLine,
            {
              icon: DollarSign,
              label: "Quota base",
              valor: Number(fraccao.quota_mensal_base)
            }
          ),
          /* @__PURE__ */ jsx(
            QuotaLine,
            {
              icon: Shield,
              label: "Fundo reserva (DP 141/15)",
              valor: Number(fraccao.quota_mensal_fundo_reserva)
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "mt-4 pt-4 border-t rounded-lg p-4",
            style: {
              borderColor: "rgba(168, 85, 247, 0.15)",
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.06) 0%, rgba(168, 85, 247, 0.04) 100%)",
              border: "0.5px solid rgba(0, 212, 255, 0.2)"
            },
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-[1.5px] font-medium", children: "Total mensal" }) }),
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold gradient-ondaka-text", children: formatKz(quotaTotal) })
            ] })
          }
        )
      ] })
    ] }),
    fraccao.observacoes && /* @__PURE__ */ jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-[#EC4899]" }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Observações" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/80 whitespace-pre-wrap leading-relaxed", children: fraccao.observacoes })
    ] })
  ] });
}
function InfoLine({
  icon: Icon,
  label,
  value,
  destaque
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 py-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-white/50 text-xs flex-shrink-0", children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-3 h-3" }),
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: `text-right text-sm ${value ? destaque ? "text-[#00D4FF] font-medium" : "text-white" : "text-white/30"}`, children: value || "—" })
  ] });
}
function QuotaLine({
  icon: Icon,
  label,
  valor
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 py-1.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-white/60 text-xs", children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-3 h-3" }),
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white", children: formatKz(valor) })
  ] });
}
export {
  Show as default
};
