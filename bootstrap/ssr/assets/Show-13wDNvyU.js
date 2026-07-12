import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BX6gg7g7.js";
import { Head, Link, router } from "@inertiajs/react";
import { BarChart3, Globe, Palette, ShoppingBag, Bot, Scan, UserCheck, Fingerprint, Camera, Smartphone, RefreshCw, Receipt, Video, Phone, Send, MessageSquare, Settings, ArrowLeft, Clock, TriangleAlert, Info, CircleCheck, Zap } from "lucide-react";
import "react";
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
function formatData(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
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
function FuncionalidadesShow({ feature, subscription }) {
  const Icon = (feature.icone && ICON_MAP[feature.icone]) ?? Settings;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: feature.nome }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-6 pt-2", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/funcionalidades",
          className: "inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Voltar à loja"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 p-6 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Icon, { className: "w-7 h-7 text-[#00D4FF]" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-white/50", children: feature.categoria_label }),
            /* @__PURE__ */ jsx("span", { className: "text-white/30", children: "·" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-white/50", children: feature.comprador_label }),
            /* @__PURE__ */ jsx("span", { className: "text-white/30", children: "·" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-white/50", children: feature.modelo_cobranca_label })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white tracking-tight", children: feature.nome }),
          feature.descricao && /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mt-2 leading-relaxed", children: feature.descricao }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-4 flex-wrap", children: [
            feature.em_breve && /* @__PURE__ */ jsx(Badge, { cor: "gray", icon: Clock, children: "Em breve" }),
            feature.requer_hardware && /* @__PURE__ */ jsx(Badge, { cor: "amber", icon: TriangleAlert, children: "Requer hardware" }),
            feature.requer_aprovacao_manual && /* @__PURE__ */ jsx(Badge, { cor: "cyan", icon: Info, children: "Aprovação manual" })
          ] })
        ] })
      ] }),
      subscription && subscription.esta_activa && /* @__PURE__ */ jsx(ActiveSubscriptionInfo, { subscription, feature }),
      feature.em_breve && !subscription && /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl bg-white/[0.03] border border-white/10 text-center", children: [
        /* @__PURE__ */ jsx(Clock, { className: "w-10 h-10 text-white/40 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-medium text-white mb-2", children: "Em breve disponível" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Esta funcionalidade está em desenvolvimento final. Entraremos em contacto assim que estiver disponível." }),
        /* @__PURE__ */ jsx("button", { className: "mt-4 px-4 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#8FE7FF] text-sm hover:bg-[#00D4FF]/15 transition-colors", children: "Avise-me quando estiver disponível" })
      ] }),
      !feature.em_breve && feature.modelo_cobranca === "consumable" && feature.pacotes.length > 0 && /* @__PURE__ */ jsx(ConsumablePackages, { feature, subscription }),
      !feature.em_breve && feature.modelo_cobranca === "subscription" && !(subscription == null ? void 0 : subscription.esta_activa) && /* @__PURE__ */ jsx(SubscriptionPlan, { feature }),
      !feature.em_breve && feature.modelo_cobranca === "one_time" && !(subscription == null ? void 0 : subscription.esta_activa) && /* @__PURE__ */ jsx(OneTimePlan, { feature })
    ] })
  ] });
}
function Badge({ cor, icon: Icon, children }) {
  const corClasses = {
    gray: "bg-white/5 text-white/70 border-white/10",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    cyan: "bg-[#00D4FF]/10 text-[#8FE7FF] border-[#00D4FF]/30"
  };
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium ${corClasses[cor]}`,
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "w-3 h-3" }),
        children
      ]
    }
  );
}
function ActiveSubscriptionInfo({ subscription, feature }) {
  const percent = subscription.saldo_inicial > 0 ? Math.round(subscription.saldo_actual / subscription.saldo_inicial * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(CircleCheck, { className: "w-5 h-5 text-emerald-400" }),
      /* @__PURE__ */ jsx("h3", { className: "text-base font-medium text-emerald-100", children: "Funcionalidade activa" })
    ] }),
    feature.modelo_cobranca === "consumable" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60 uppercase tracking-wide", children: "Saldo" }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-white/60", children: [
          subscription.saldo_actual,
          " / ",
          subscription.saldo_inicial,
          " ",
          feature.unidade
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: `h-full rounded-full transition-all ${subscription.saldo_baixo ? "bg-amber-400" : "bg-emerald-400"}`,
          style: { width: `${percent}%` }
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mt-2 text-xs text-white/50", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          subscription.saldo_utilizado,
          " utilizados"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          percent,
          "% disponível"
        ] })
      ] })
    ] }),
    subscription.expira_em && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "text-white/60", children: "Expira em" }),
      /* @__PURE__ */ jsx("span", { className: "text-white", children: formatData(subscription.expira_em) })
    ] }),
    subscription.saldo_baixo && feature.modelo_cobranca === "consumable" && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 flex items-start gap-2", children: [
      /* @__PURE__ */ jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Saldo baixo." }),
        " Considere adquirir um novo pacote para continuar sem interrupções."
      ] })
    ] })
  ] });
}
function ConsumablePackages({ feature, subscription }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-base font-medium text-white mb-4", children: (subscription == null ? void 0 : subscription.esta_activa) ? "Adicionar mais saldo" : "Escolher pacote" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: feature.pacotes.map((pacote) => {
      var _a;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative p-5 rounded-xl border ${pacote.destaque ? "bg-[#00D4FF]/5 border-[#00D4FF]/40" : "bg-white/[0.03] border-white/10"}`,
          children: [
            pacote.destaque && /* @__PURE__ */ jsx("span", { className: "absolute -top-2 left-4 text-[10px] px-2 py-0.5 rounded bg-[#00D4FF] text-black font-semibold", children: "MAIS POPULAR" }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-white", children: pacote.nome }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 mb-1", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-semibold text-white", children: formatMoeda(pacote.preco) }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/60 mb-3", children: [
              pacote.quantidade.toLocaleString("pt-PT"),
              " ",
              feature.unidade
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-white/40 mb-4", children: [
              pacote.valor_unitario.toFixed(2),
              " Kz / ",
              ((_a = feature.unidade) == null ? void 0 : _a.replace(/s$/, "")) ?? "unidade"
            ] }),
            pacote.descricao && /* @__PURE__ */ jsx("div", { className: "text-xs text-emerald-300 mb-3", children: pacote.descricao }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: `w-full py-2 rounded-lg text-sm font-medium transition-colors ${pacote.destaque ? "bg-[#00D4FF] text-black hover:bg-[#8FE7FF]" : "bg-white/10 text-white hover:bg-white/15"}`,
                onClick: () => router.get(route("ordens.confirmar"), {
                  tipo_item: "pacote_consumivel",
                  feature_id: feature.id,
                  pacote_id: pacote.id
                }),
                children: "Comprar"
              }
            )
          ]
        },
        pacote.id
      );
    }) }),
    feature.preco_activacao > 0 && !(subscription == null ? void 0 : subscription.esta_activa) && /* @__PURE__ */ jsxs("div", { className: "mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white/70 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Info, { className: "w-4 h-4 text-white/50 flex-shrink-0" }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Primeira activação inclui taxa de",
        " ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: formatMoeda(feature.preco_activacao) }),
        " (pago uma única vez)."
      ] })
    ] })
  ] });
}
function SubscriptionPlan({ feature }) {
  return /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl bg-white/[0.03] border border-white/10", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-base font-medium text-white mb-1", children: "Subscrição mensal" }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60 mb-4", children: [
      "Pagamento recorrente a cada ",
      feature.duracao_dias,
      " dias. Pode cancelar a qualquer momento."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1 mb-6", children: [
      /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold text-white", children: formatMoeda(feature.preco_base ?? 0) }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-white/60", children: "/ mês" })
    ] }),
    feature.preco_activacao > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white/70 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Info, { className: "w-4 h-4 text-white/50 flex-shrink-0" }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Activação única:",
        " ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: formatMoeda(feature.preco_activacao) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "w-full py-3 rounded-lg bg-[#00D4FF] text-black font-medium hover:bg-[#8FE7FF] transition-colors flex items-center justify-center gap-2",
        onClick: () => router.get(route("ordens.confirmar"), {
          tipo_item: "feature",
          feature_id: feature.id,
          meses: 1
        }),
        children: [
          /* @__PURE__ */ jsx(Zap, { className: "w-4 h-4" }),
          "Activar subscrição"
        ]
      }
    )
  ] });
}
function OneTimePlan({ feature }) {
  const total = (feature.preco_base ?? 0) + feature.preco_activacao;
  return /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl bg-white/[0.03] border border-white/10", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-base font-medium text-white mb-1", children: "Pagamento único" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-4", children: "Pagamento único, uso permanente." }),
    /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-1 mb-6", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-semibold text-white", children: formatMoeda(total) }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "w-full py-3 rounded-lg bg-[#00D4FF] text-black font-medium hover:bg-[#8FE7FF] transition-colors",
        onClick: () => router.get(route("ordens.confirmar"), {
          tipo_item: "feature",
          feature_id: feature.id,
          meses: 1
        }),
        children: "Adquirir"
      }
    )
  ] });
}
export {
  FuncionalidadesShow as default
};
