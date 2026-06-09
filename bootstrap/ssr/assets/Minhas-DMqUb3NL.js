import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, Link } from "@inertiajs/react";
import { Plus, TriangleAlert, Package, Settings, BarChart3, Globe, Palette, ShoppingBag, Bot, Scan, UserCheck, Fingerprint, Camera, Smartphone, RefreshCw, Receipt, Video, Phone, Send, MessageSquare, ChevronRight } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatData(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(iso));
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
function FuncionalidadesMinhas({ features = [], totais }) {
  const activas = features.filter((f) => f.esta_activa);
  const inactivas = features.filter((f) => !f.esta_activa);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "As minhas funcionalidades" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-6 pt-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white tracking-tight", children: "As minhas funcionalidades" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Add-ons activos, saldos, renovações e consumo." })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/funcionalidades",
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#8FE7FF] text-sm hover:bg-[#00D4FF]/15 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Explorar loja"
            ]
          }
        )
      ] }),
      totais.saldo_baixo > 0 && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(TriangleAlert, { className: "w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-amber-200 mb-0.5", children: [
            totais.saldo_baixo,
            " ",
            totais.saldo_baixo === 1 ? "funcionalidade" : "funcionalidades",
            " com saldo baixo"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70", children: "Recarregue antes que o saldo esgote para evitar interrupções." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Activas", valor: totais.activas, cor: "emerald" }),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Saldo baixo",
            valor: totais.saldo_baixo,
            cor: totais.saldo_baixo > 0 ? "amber" : "white/60"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Expiram em breve",
            valor: totais.expiram_breve,
            cor: totais.expiram_breve > 0 ? "cyan" : "white/60"
          }
        )
      ] }),
      activas.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xs font-medium text-white/50 uppercase tracking-wide mb-3", children: [
          "Activas (",
          activas.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: activas.map((f) => /* @__PURE__ */ jsx(FeatureCard, { f }, f.id)) })
      ] }),
      inactivas.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xs font-medium text-white/50 uppercase tracking-wide mb-3", children: [
          "Expiradas / esgotadas (",
          inactivas.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: inactivas.map((f) => /* @__PURE__ */ jsx(FeatureCard, { f, inactiva: true }, f.id)) })
      ] }),
      features.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-12 rounded-xl bg-white/[0.03] border border-white/10 text-center", children: [
        /* @__PURE__ */ jsx(Package, { className: "w-12 h-12 text-white/30 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-medium text-white mb-2", children: "Ainda sem funcionalidades" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-6 max-w-md mx-auto", children: "Explore a loja e active add-ons para expandir as capacidades do ONDAKA — SMS personalizados, pagamentos automáticos, assembleias virtuais e muito mais." }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/funcionalidades",
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] text-black font-medium text-sm hover:bg-[#8FE7FF] transition-colors",
            children: [
              /* @__PURE__ */ jsx(Settings, { className: "w-4 h-4" }),
              "Ver loja"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function StatCard({ label, valor, cor = "white" }) {
  const corClasses = {
    white: "text-white",
    emerald: "text-emerald-300",
    cyan: "text-[#00D4FF]",
    amber: "text-amber-300",
    "white/60": "text-white/60"
  };
  const corClass = corClasses[cor] ?? "text-white";
  return /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50 uppercase tracking-wide mb-2", children: label }),
    /* @__PURE__ */ jsx("div", { className: `text-2xl font-semibold ${corClass}`, children: valor })
  ] });
}
function FeatureCard({ f, inactiva = false }) {
  const Icon = (f.icone && ICON_MAP[f.icone]) ?? Settings;
  const estadoStyles = {
    activa: "bg-emerald-500/15 text-emerald-300",
    pendente: "bg-amber-500/15 text-amber-300",
    expirada: "bg-white/10 text-white/60",
    esgotada: "bg-red-500/15 text-red-300",
    cancelada: "bg-white/5 text-white/50",
    suspensa: "bg-white/5 text-white/50"
  };
  const estadoStyle = estadoStyles[f.estado] ?? "bg-white/10 text-white/70";
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/funcionalidades/${f.slug}`,
      className: `group block p-4 rounded-xl border transition-all ${inactiva ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] opacity-70" : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-[#00D4FF]" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-white truncate", children: f.nome }),
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-white/30 flex-shrink-0" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-white/50 mt-0.5", children: f.categoria_label })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-3 flex-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: `text-[10px] px-2 py-0.5 rounded font-medium ${estadoStyle}`, children: f.estado_label.toUpperCase() }),
          f.saldo_baixo && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium", children: "SALDO BAIXO" }),
          f.recarga_automatica && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/60 font-medium", children: "🔄 RECARGA AUTO" })
        ] }),
        f.modelo_cobranca === "consumable" && f.saldo_inicial > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-white/5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-1.5 text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "text-white/60", children: "Saldo" }),
            /* @__PURE__ */ jsxs("span", { className: "text-white", children: [
              f.saldo_actual.toLocaleString("pt-PT"),
              " / ",
              f.saldo_inicial.toLocaleString("pt-PT"),
              " ",
              f.unidade
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-all ${f.saldo_baixo ? "bg-amber-400" : "bg-emerald-400"}`,
              style: { width: `${100 - f.percentagem_usada}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mt-1.5 text-[10px] text-white/40", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              f.saldo_utilizado.toLocaleString("pt-PT"),
              " utilizados"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              100 - f.percentagem_usada,
              "% disponível"
            ] })
          ] })
        ] }),
        f.expira_em && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/60", children: "Expira em" }),
          /* @__PURE__ */ jsx("span", { className: "text-white", children: formatData(f.expira_em) })
        ] })
      ]
    }
  );
}
export {
  FuncionalidadesMinhas as default
};
