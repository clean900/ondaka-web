import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BxaWWjLC.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Receipt, Info, Clock, CircleCheck } from "lucide-react";
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
function OrdensConfirmar({ feature, pacote, resumo, dados_bancarios }) {
  const form = useForm({
    tipo_item: resumo.tipo_item,
    feature_id: feature.id,
    pacote_id: (pacote == null ? void 0 : pacote.id) ?? null,
    meses: resumo.meses ?? null,
    notas_cliente: ""
  });
  const submit = (e) => {
    e.preventDefault();
    form.post(route("ordens.store"));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Confirmar compra — ${feature.nome}` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("funcionalidades.show", feature.slug),
            className: "inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-3",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Voltar à loja"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5 text-cyan-400" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-zinc-100", children: "Confirmar compra" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Reveja o resumo antes de confirmar" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-zinc-100", children: feature.nome }),
                feature.descricao_curta && /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 mt-1", children: feature.descricao_curta })
              ] }),
              resumo.primeira_compra && /* @__PURE__ */ jsx("span", { className: "text-xs font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400", children: "1ª compra" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-zinc-800", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mb-1", children: "Item" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-200", children: resumo.descricao })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4", children: "Valores" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-400", children: resumo.tipo_item === "pacote_consumivel" ? "Valor do pacote" : `Subscrição (${resumo.meses} ${resumo.meses === 1 ? "mês" : "meses"})` }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 font-medium", children: formatMoeda(resumo.valor_base) })
              ] }),
              resumo.valor_activacao > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-400", children: "Taxa de activação (uma única vez)" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 font-medium", children: formatMoeda(resumo.valor_activacao) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm pt-3 border-t border-zinc-800", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-400", children: "Subtotal" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 font-medium", children: formatMoeda(resumo.subtotal) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxs("dt", { className: "text-zinc-400", children: [
                  "IVA (",
                  resumo.taxa_iva,
                  "%)"
                ] }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 font-medium", children: formatMoeda(resumo.valor_iva) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-4 border-t border-zinc-800", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-300 font-semibold", children: "Total a pagar" }),
                /* @__PURE__ */ jsx("dd", { className: "text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent", children: formatMoeda(resumo.valor_total) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4", children: "Como pagar" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mb-4", children: [
              "Transfira o valor total para a conta abaixo e submeta o comprovativo na ordem. Tem",
              " ",
              /* @__PURE__ */ jsxs("strong", { className: "text-zinc-200", children: [
                resumo.prazo_pagamento_dias,
                " dias"
              ] }),
              " para completar o pagamento."
            ] }),
            /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-2 gap-4 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500 text-xs uppercase tracking-wide", children: "Beneficiário" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 mt-1", children: dados_bancarios.beneficiario })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500 text-xs uppercase tracking-wide", children: "NIF" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 mt-1", children: dados_bancarios.nif })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500 text-xs uppercase tracking-wide", children: "Banco" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 mt-1", children: dados_bancarios.banco })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500 text-xs uppercase tracking-wide", children: "IBAN" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200 mt-1 font-mono text-xs", children: dados_bancarios.iban })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-200", children: [
              /* @__PURE__ */ jsx(Info, { className: "h-3 w-3 inline mr-1" }),
              dados_bancarios.observacao
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sticky top-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-xs text-zinc-400", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 mt-0.5 text-amber-400 shrink-0" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Prazo de ",
                  resumo.prazo_pagamento_dias,
                  " dias para pagamento"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-xs text-zinc-400", children: [
                /* @__PURE__ */ jsx(CircleCheck, { className: "h-4 w-4 mt-0.5 text-emerald-400 shrink-0" }),
                /* @__PURE__ */ jsx("span", { children: "Activação automática após aprovação" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-xs text-zinc-400", children: [
                /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4 mt-0.5 text-purple-400 shrink-0" }),
                /* @__PURE__ */ jsx("span", { children: "Factura emitida após confirmação" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Notas (opcional)" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: form.data.notas_cliente,
                  onChange: (e) => form.setData("notas_cliente", e.target.value),
                  maxLength: 500,
                  rows: 3,
                  placeholder: "Observações internas...",
                  className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 px-3 py-2"
                }
              )
            ] }),
            form.errors.feature_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mb-3", children: form.errors.feature_id }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: form.processing,
                className: "w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium px-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition",
                children: form.processing ? "A criar ordem…" : "Confirmar e gerar ordem"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("funcionalidades.show", feature.slug),
                className: "block text-center mt-3 text-xs text-zinc-500 hover:text-zinc-300",
                children: "Cancelar"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-600 px-2", children: "Ao confirmar gera uma ordem com número único. Nenhum valor é debitado automaticamente. Será necessário submeter comprovativo de transferência." })
        ] })
      ] })
    ] })
  ] });
}
export {
  OrdensConfirmar as default
};
