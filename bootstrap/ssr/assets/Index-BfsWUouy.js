import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BX6gg7g7.js";
import { useForm, Head, router } from "@inertiajs/react";
import { Building2, CheckCircle2, XCircle, ArrowRight, KeyRound, Link2, Users, FileText, RefreshCw } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Index({ configurado, ligado, identidade, ondaka, url }) {
  const form = useForm({ token: "", url: "" });
  const guardar = (e) => {
    e.preventDefault();
    form.post("/admin/welwitschia/chave", { preserveScroll: true, onSuccess: () => form.reset("token") });
  };
  const sincronizar = () => {
    router.post("/admin/welwitschia/sincronizar", {}, { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Integração Welwitschia" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-11 h-11 rounded-xl flex items-center justify-center", style: { background: "rgba(16,185,129,0.12)", border: "0.5px solid rgba(16,185,129,0.3)" }, children: /* @__PURE__ */ jsx(Building2, { className: "w-5 h-5 text-emerald-400" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white tracking-tight", children: "Integração Welwitschia" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Envia clientes e faturas do ONDAKA para o ERP central (certificado AGT)." })
      ] }),
      ligado ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5" }),
        " Ligado",
        (identidade == null ? void 0 : identidade.filial) ? ` · filial ${identidade.filial}` : ""
      ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 border border-white/10", children: [
        /* @__PURE__ */ jsx(XCircle, { className: "w-3.5 h-3.5" }),
        " ",
        configurado ? "Sem ligação" : "Não configurado"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card mb-4 flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/70 leading-relaxed", children: [
        "Direção única: ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: "ONDAKA → Welwitschia" }),
        ". Cada empresa gestora vira um ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: "cliente" }),
        " e cada fatura da plataforma vira uma ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: "venda" }),
        " na Welwitschia, que emite a faturação certificada pela AGT. O ONDAKA ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: "não recebe" }),
        " dados da Welwitschia."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(KeyRound, { className: "w-4 h-4 text-white/60" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wider", children: "Chave de integração" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mb-4", children: "Cole a chave gerada na Welwitschia (Definições → Integrações). A integração arranca automaticamente." }),
        /* @__PURE__ */ jsxs("form", { onSubmit: guardar, className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "Chave (token)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: form.data.token,
                onChange: (e) => form.setData("token", e.target.value),
                placeholder: "wel_...",
                className: "input font-mono text-sm"
              }
            ),
            form.errors.token && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.token })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "URL da API (opcional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: form.data.url,
                onChange: (e) => form.setData("url", e.target.value),
                placeholder: url,
                className: "input text-sm"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: form.processing || !form.data.token.trim(),
              className: "inline-flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed",
              style: { background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)" },
              children: [
                /* @__PURE__ */ jsx(Link2, { className: "w-4 h-4" }),
                " ",
                form.processing ? "A ligar..." : "Guardar e ligar"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wider mb-4", children: "O que o ONDAKA envia" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-4", style: { background: "rgba(0,212,255,0.08)", border: "0.5px solid rgba(0,212,255,0.25)" }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-[#00D4FF]" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-white/50", children: "Clientes" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-white", children: ondaka.clientes }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/40", children: "empresas gestoras" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl p-4", style: { background: "rgba(168,85,247,0.08)", border: "0.5px solid rgba(168,85,247,0.25)" }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-[#A855F7]" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-white/50", children: "Faturas" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-white", children: ondaka.facturas }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/40", children: "faturas da plataforma" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mb-3", children: "Novos registos e faturas são enviados automaticamente. Use o botão para reenviar tudo (backfill)." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: sincronizar,
            disabled: !ligado,
            className: "inline-flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed bg-white/10 hover:bg-white/15",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
              " Sincronizar tudo agora"
            ]
          }
        ),
        !ligado && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-white/40 mt-2", children: "Configure a chave para activar." })
      ] })
    ] })
  ] });
}
export {
  Index as default
};
