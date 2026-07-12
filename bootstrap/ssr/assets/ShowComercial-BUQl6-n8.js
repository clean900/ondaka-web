import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-ChtKe8ca.js";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, Sparkles, CheckCircle, Gift, ArrowRight, Quote, History, Calendar, Video, Users, FileText, Tag, Upload, Scan, Camera, Search, MessageSquare, CreditCard, Store, ChartBar, Zap, Clock, Package, Smartphone, Send, Edit, Settings, Ban, TrendingDown, TrendingUp, ShieldCheck } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ICONES = {
  "shield-check": ShieldCheck,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "ban": Ban,
  "settings": Settings,
  "edit": Edit,
  "send": Send,
  "smartphone": Smartphone,
  "package": Package,
  "clock": Clock,
  "zap": Zap,
  "chart-bar": ChartBar,
  "store": Store,
  "credit-card": CreditCard,
  "check-circle": CheckCircle,
  "message-square": MessageSquare,
  "search": Search,
  "tag": Tag,
  "camera": Camera,
  "scan": Scan,
  "upload": Upload,
  "qrcode": Tag,
  "file-text": FileText,
  "users": Users,
  "video": Video,
  "calendar": Calendar,
  "history": History
};
function Icone({ nome, className = "w-5 h-5" }) {
  const C = ICONES[nome] || Sparkles;
  return /* @__PURE__ */ jsx(C, { className, "aria-hidden": "true" });
}
function formatarPreco(preco) {
  const n = typeof preco === "string" ? parseFloat(preco) : preco;
  if (isNaN(n) || n <= 0) return "Grátis";
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(n).replace("AOA", "Kz");
}
function ShowComercial({ feature, subscription }) {
  const { comercial } = feature;
  const [iniciandoTrial, setIniciandoTrial] = useState(false);
  const [solicitandoActivacao, setSolicitandoActivacao] = useState(false);
  const estaActiva = (subscription == null ? void 0 : subscription.esta_activa) === true;
  const iniciarTrial = () => {
    setIniciandoTrial(true);
    router.post(`/funcionalidades/${feature.slug}/trial`, {}, {
      preserveScroll: true,
      onFinish: () => setIniciandoTrial(false)
    });
  };
  const solicitarActivacao = () => {
    setSolicitandoActivacao(true);
    router.post(`/funcionalidades/${feature.slug}/activar`, {}, {
      preserveScroll: true,
      onFinish: () => setSolicitandoActivacao(false)
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: feature.nome }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto py-6 px-4", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/funcionalidades", className: "inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-4 transition-colors", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
        "Voltar à loja"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-6 mb-6 border border-zinc-700/50", style: { background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(168,85,247,0.08) 50%, rgba(236,72,153,0.05) 100%)" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded bg-purple-500/15 text-purple-300", children: feature.categoria_label }),
          estaActiva && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded bg-emerald-500/15 text-emerald-300", children: "Activa" }),
          !estaActiva && !feature.em_breve && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded bg-cyan-500/15 text-cyan-300", children: "Disponível" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl flex-shrink-0", style: { background: "linear-gradient(135deg, #06b6d4, #a855f7)" }, children: /* @__PURE__ */ jsx(Sparkles, { className: "w-7 h-7 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white mb-1", children: feature.nome }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 leading-relaxed mb-4", children: comercial.tagline }),
            estaActiva ? /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30", children: [
              /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-emerald-400" }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-emerald-300 font-medium", children: [
                "Funcionalidade activa",
                (subscription == null ? void 0 : subscription.expira_em) && ` — expira em ${new Date(subscription.expira_em).toLocaleDateString("pt-PT")}`
              ] })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxs("button", { onClick: iniciarTrial, disabled: iniciandoTrial, className: "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-wait transition-all", style: { background: "linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)" }, children: [
                /* @__PURE__ */ jsx(Gift, { className: "w-4 h-4" }),
                iniciandoTrial ? "A activar..." : "Experimentar 7 dias grátis"
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: solicitarActivacao, disabled: solicitandoActivacao, className: "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-wait", children: [
                "Activar subscrição · ",
                formatarPreco(feature.preco_base),
                "/mês"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-zinc-500 mt-2", children: "Sem cartão de crédito · Cancele a qualquer momento" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-2", children: "O problema" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 leading-relaxed", children: comercial.problema })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-2", children: "A solução" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 leading-relaxed", children: comercial.solucao })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-3", children: "O que está incluído" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: comercial.beneficios.map((b, i) => /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/40 border border-zinc-700/50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
            /* @__PURE__ */ jsx(Icone, { nome: b.icone, className: "w-4 h-4 text-cyan-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-white font-medium", children: b.titulo })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 leading-relaxed", children: b.descricao })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-8 bg-zinc-900/40 border border-zinc-700/50 rounded-xl p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-3", children: "Vê em acção" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 flex-wrap md:flex-nowrap", children: comercial.demo_passos.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "contents", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 rounded-lg py-5 px-3 flex flex-col items-center text-center gap-2", style: { background: `linear-gradient(135deg, rgba(${i === 0 ? "6,182,212" : i === 1 ? "168,85,247" : "236,72,153"},0.15), rgba(${i === 0 ? "168,85,247" : i === 1 ? "236,72,153" : "6,182,212"},0.15))` }, children: [
            /* @__PURE__ */ jsx(Icone, { nome: p.icone, className: "w-7 h-7 text-white/80" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-400 leading-tight", children: p.label_longo })
          ] }),
          i < comercial.demo_passos.length - 1 && /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 text-zinc-600 flex-shrink-0 hidden md:block" })
        ] }, i)) })
      ] }),
      comercial.testemunho && /* @__PURE__ */ jsx("div", { className: "mb-8 rounded-xl p-5 border border-purple-500/20", style: { background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(6,182,212,0.05))" }, children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3 items-start", children: [
        /* @__PURE__ */ jsx(Quote, { className: "w-6 h-6 text-purple-400 flex-shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-200 leading-relaxed italic mb-2", children: [
            '"',
            comercial.testemunho.texto,
            '"'
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
            "— ",
            comercial.testemunho.autor
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] tracking-[1.5px] uppercase text-zinc-500 font-semibold mb-3", children: "Perguntas frequentes" }),
        /* @__PURE__ */ jsx("div", { children: comercial.faq.map((item, i) => /* @__PURE__ */ jsxs("details", { className: "border-t border-zinc-700/50 py-3 group", children: [
          /* @__PURE__ */ jsxs("summary", { className: "cursor-pointer text-sm text-white font-medium flex items-center justify-between list-none", children: [
            item.pergunta,
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 text-zinc-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 leading-relaxed mt-2 pr-6", children: item.resposta })
        ] }, i)) })
      ] }),
      !estaActiva && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-6 text-center border border-purple-500/30", style: { background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(168,85,247,0.12), rgba(236,72,153,0.08))" }, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-white mb-1", children: "Pronto para experimentar?" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mb-4", children: "Active o trial de 7 dias agora. Sem cartão. Sem compromisso." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 justify-center", children: [
          /* @__PURE__ */ jsxs("button", { onClick: iniciarTrial, disabled: iniciandoTrial, className: "inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-wait transition-all", style: { background: "linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)" }, children: [
            /* @__PURE__ */ jsx(Gift, { className: "w-4 h-4" }),
            iniciandoTrial ? "A activar..." : "Experimentar 7 dias grátis"
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: solicitarActivacao, disabled: solicitandoActivacao, className: "inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-wait", children: [
            "Activar subscrição · ",
            formatarPreco(feature.preco_base),
            "/mês"
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ShowComercial as default
};
