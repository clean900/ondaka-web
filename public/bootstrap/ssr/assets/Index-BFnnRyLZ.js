import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-TDdsYzgz.js";
import { Head, Link } from "@inertiajs/react";
import { CircleCheck, Palette, Settings, Camera, Receipt, MessageSquare, BarChart3, Globe, ShoppingBag, Bot, Scan, UserCheck, Fingerprint, Smartphone, RefreshCw, Video, Phone, Send } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatMoeda(valor) {
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor) + " Kz";
}
const ICON_MAP = {
  MessageSquare,
  Send,
  Phone,
  Video,
  Receipt,
  RefreshCw,
  Smartphone,
  Camera,
  Fingerprint,
  UserCheck,
  Scan,
  Bot,
  ShoppingBag,
  Palette,
  Globe,
  BarChart3
};
const CATEGORIA_ICONS = {
  comunicacao: MessageSquare,
  pagamentos: Receipt,
  seguranca: Camera,
  gestao: Settings,
  personalizacao: Palette
};
function FuncionalidadesIndex({ categorias, totais }) {
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const categoriasFiltradas = filtroCategoria ? categorias.filter((c) => c.slug === filtroCategoria) : categorias;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Loja de funcionalidades" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-8 pt-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white tracking-tight", children: "Loja de funcionalidades" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Expanda o ONDAKA com add-ons dedicados — pague só pelo que usa." })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/funcionalidades/minhas",
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors",
            children: [
              /* @__PURE__ */ jsx(CircleCheck, { className: "w-4 h-4" }),
              "As minhas funcionalidades",
              totais.activas_empresa > 0 && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-medium", children: totais.activas_empresa })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Total", valor: totais.total }),
        /* @__PURE__ */ jsx(StatCard, { label: "Disponíveis", valor: totais.disponivel, cor: "emerald" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Em breve", valor: totais.em_breve, cor: "white/60" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Suas activas", valor: totais.activas_empresa, cor: "cyan" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsx(
          FilterChip,
          {
            label: "Todas",
            activo: filtroCategoria === null,
            onClick: () => setFiltroCategoria(null)
          }
        ),
        categorias.map((c) => /* @__PURE__ */ jsx(
          FilterChip,
          {
            label: c.nome,
            count: c.features.length,
            activo: filtroCategoria === c.slug,
            onClick: () => setFiltroCategoria(c.slug)
          },
          c.slug
        ))
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-10", children: categoriasFiltradas.map((cat) => {
        const CatIcon = CATEGORIA_ICONS[cat.slug] ?? Settings;
        return /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx(CatIcon, { className: "w-4 h-4 text-white/50" }),
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-white/80 uppercase tracking-wide", children: cat.nome }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 h-px bg-white/10" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: cat.features.map((feat) => /* @__PURE__ */ jsx(FeatureCard, { feature: feat }, feat.slug)) })
        ] }, cat.slug);
      }) })
    ] })
  ] });
}
function StatCard({ label, valor, cor = "white" }) {
  const corClasses = {
    white: "text-white",
    emerald: "text-emerald-300",
    cyan: "text-[#00D4FF]",
    "white/60": "text-white/60"
  };
  const corClass = corClasses[cor] ?? "text-white";
  return /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50 uppercase tracking-wide mb-2", children: label }),
    /* @__PURE__ */ jsx("div", { className: `text-2xl font-semibold ${corClass}`, children: valor })
  ] });
}
function FilterChip({ label, count, activo, onClick }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${activo ? "bg-white/10 border border-white/20 text-white" : "bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.06]"}`,
      children: [
        label,
        count !== void 0 && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-medium", children: count })
      ]
    }
  );
}
function FeatureCard({ feature }) {
  const Icon = (feature.icone && ICON_MAP[feature.icone]) ?? Settings;
  const precoLabel = feature.modelo_cobranca === "consumable" ? "Pacotes a partir de 5.000 Kz" : feature.modelo_cobranca === "subscription" ? formatMoeda(feature.preco_base ?? 0) + " / mês" : feature.modelo_cobranca === "one_time" ? formatMoeda(feature.preco_base ?? 0) + " (único)" : "—";
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/funcionalidades/${feature.slug}`,
      className: "group block p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-[#00D4FF]" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1", children: [
            feature.em_breve && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60 font-medium", children: "EM BREVE" }),
            feature.activa_para_empresa && /* @__PURE__ */ jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-medium flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(CircleCheck, { className: "w-2.5 h-2.5" }),
              "ACTIVA"
            ] }),
            feature.requer_hardware && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium", children: "HARDWARE" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-medium text-white group-hover:text-[#8FE7FF] transition-colors", children: feature.nome }),
        feature.descricao && /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1.5 line-clamp-3 min-h-[3.75rem]", children: feature.descricao }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", { className: "text-white/40", children: feature.comprador_label }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "text-white/80 font-medium", children: precoLabel }),
            feature.preco_activacao > 0 && /* @__PURE__ */ jsxs("div", { className: "text-white/40 text-[10px] mt-0.5", children: [
              "+ ",
              formatMoeda(feature.preco_activacao),
              " activação"
            ] })
          ] })
        ] }),
        feature.activa_para_empresa && feature.saldo_actual !== null && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-white/5 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Saldo actual" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-[#00D4FF]", children: [
            feature.saldo_actual,
            " ",
            feature.unidade
          ] })
        ] })
      ]
    }
  );
}
export {
  FuncionalidadesIndex as default
};
