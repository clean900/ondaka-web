import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Clock, CheckCircle2, CreditCard, Copy, Info, AlertCircle, Banknote, FileText, Download, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatKz(valor) {
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor) + " Kz";
}
function formatData(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatDataHora(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function EstadoBadge({ estado, estado_label }) {
  const styles = {
    em_revisao: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    aprovada: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    rejeitada: "bg-red-500/10 text-red-400 border-red-500/30",
    cancelada: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
    expirada: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
  };
  const style = styles[estado] ?? styles.em_revisao;
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${style}`, children: estado_label });
}
function OrdemShow({ ordem, referencia_proxypay }) {
  const [gerando, setGerando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const copiar = (texto, label) => {
    navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado`);
  };
  const gerarReferencia = () => {
    if (gerando) return;
    setGerando(true);
    router.post(
      route("ordens.gerar-referencia", ordem.id),
      {},
      {
        preserveScroll: true,
        onFinish: () => setGerando(false)
      }
    );
  };
  const cancelarOrdem = () => {
    if (!confirm("Cancelar esta ordem? Não poderás reverter esta ação.")) return;
    setCancelando(true);
    router.post(
      route("ordens.cancelar", ordem.id),
      {},
      {
        preserveScroll: true,
        onFinish: () => setCancelando(false)
      }
    );
  };
  const podeGerarReferencia = !referencia_proxypay && !["aprovada", "rejeitada", "cancelada", "expirada"].includes(ordem.estado);
  const referenciaNumerica = (referencia_proxypay == null ? void 0 : referencia_proxypay.reference_id.toString()) ?? "";
  const entityNumerica = (referencia_proxypay == null ? void 0 : referencia_proxypay.entity_id.toString()) ?? "";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Ordem ${ordem.numero}` }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#0A0A1A] py-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("ordens.minhas"),
          className: "mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 transition",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "As minhas ordens"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Ordem de compra" }),
            /* @__PURE__ */ jsx("h1", { className: "mt-1 text-2xl font-medium text-white", children: ordem.numero }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-zinc-400", children: ordem.descricao_item })
          ] }),
          /* @__PURE__ */ jsx(EstadoBadge, { estado: ordem.estado, estado_label: ordem.estado_label })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-800/40 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Valor base" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-medium text-white", children: formatKz(ordem.valor_base) })
          ] }),
          ordem.valor_activacao > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-800/40 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Activação" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-medium text-white", children: formatKz(ordem.valor_activacao) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-800/40 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "IPS 6,5%" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-medium text-white", children: formatKz(ordem.valor_iva) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-800/40 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Total" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent", children: formatKz(ordem.valor_total) })
          ] })
        ] }),
        ordem.prazo_pagamento && !ordem.esta_totalmente_paga && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2 text-sm text-zinc-400", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
          "Prazo de pagamento: ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: formatData(ordem.prazo_pagamento) })
        ] }),
        ordem.aprovada_em && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2 text-sm text-emerald-400", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
          "Aprovada em ",
          formatDataHora(ordem.aprovada_em)
        ] }),
        ordem.rejeitada_em && ordem.motivo_rejeicao && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-red-400", children: "Ordem rejeitada" }),
          /* @__PURE__ */ jsx("div", { className: "mt-1", children: ordem.motivo_rejeicao })
        ] })
      ] }),
      podeGerarReferencia && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500", children: [
          /* @__PURE__ */ jsx(CreditCard, { className: "h-3.5 w-3.5" }),
          "Pagamento"
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "mt-1 text-lg font-medium text-white", children: "Pagar via Multicaixa · ProxyPay" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-zinc-400", children: "Gera uma referência única para pagares em qualquer ATM, Multicaixa Express ou homebanking. O pagamento é confirmado automaticamente em poucos minutos." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: gerarReferencia,
            disabled: gerando,
            className: "mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition",
            children: [
              /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
              gerando ? "A gerar…" : "Gerar referência de pagamento"
            ]
          }
        )
      ] }),
      referencia_proxypay && referencia_proxypay.status === "activa" && !referencia_proxypay.expirada && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 p-6 backdrop-blur", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-400", children: "Referência ProxyPay" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-1 text-lg font-medium text-white", children: "Pronta para pagar" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400", children: "Activa" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/60 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Entidade" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => copiar(entityNumerica, "Entidade"),
                  className: "text-zinc-500 hover:text-cyan-400 transition",
                  title: "Copiar entidade",
                  children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 font-mono text-2xl tracking-wider text-white", children: referencia_proxypay.entity_formatada })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/60 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Referência" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => copiar(referenciaNumerica, "Referência"),
                  className: "text-zinc-500 hover:text-cyan-400 transition",
                  title: "Copiar referência",
                  children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 font-mono text-2xl tracking-wider text-white", children: referencia_proxypay.reference_formatada })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-xl bg-zinc-900/60 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Montante" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-lg font-medium text-white", children: formatKz(referencia_proxypay.amount) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Válida até" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-white", children: formatData(referencia_proxypay.expira_em) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl bg-zinc-900/40 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm font-medium text-white", children: [
            /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-cyan-400" }),
            "Como pagar"
          ] }),
          /* @__PURE__ */ jsxs("ol", { className: "space-y-1.5 text-xs leading-relaxed text-zinc-400", children: [
            /* @__PURE__ */ jsx("li", { children: "1. Num ATM: Pagamentos → Outros serviços → Pagamentos por referência" }),
            /* @__PURE__ */ jsxs("li", { children: [
              "2. Insere a Entidade ",
              /* @__PURE__ */ jsx("span", { className: "rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-white", children: entityNumerica })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "3. Insere a Referência ",
              /* @__PURE__ */ jsx("span", { className: "rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-white", children: referenciaNumerica })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "4. Confirma o montante ",
              /* @__PURE__ */ jsx("span", { className: "rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-white", children: formatKz(referencia_proxypay.amount) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs text-zinc-500", children: "Também podes pagar via Multicaixa Express ou homebanking usando os mesmos dados." })
        ] })
      ] }),
      referencia_proxypay && referencia_proxypay.status === "paga" && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-400", children: "Referência ProxyPay" }),
            /* @__PURE__ */ jsxs("h2", { className: "mt-1 flex items-center gap-2 text-lg font-medium text-emerald-400", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }),
              "Pagamento confirmado"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400", children: "Paga" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/40 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Entidade" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-sm text-white", children: referencia_proxypay.entity_formatada })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/40 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Referência" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-sm text-white", children: referencia_proxypay.reference_formatada })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/40 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Paga em" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-white", children: formatDataHora(referencia_proxypay.pago_em) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/40 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Terminal" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-white", children: referencia_proxypay.terminal_type ?? "—" })
          ] })
        ] })
      ] }),
      referencia_proxypay && (referencia_proxypay.status === "expirada" || referencia_proxypay.expirada) && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl border border-zinc-700 bg-zinc-900/30 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-zinc-400", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Referência expirada" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-zinc-500", children: "A referência anterior expirou. Gera uma nova para pagar esta ordem." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: gerarReferencia,
            disabled: gerando,
            className: "mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 transition",
            children: [
              /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
              gerando ? "A gerar…" : "Gerar nova referência"
            ]
          }
        )
      ] }),
      ordem.pagamentos.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500", children: [
          /* @__PURE__ */ jsx(Banknote, { className: "h-3.5 w-3.5" }),
          "Histórico de pagamentos"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800/50", children: ordem.pagamentos.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white", children: p.referencia }),
            /* @__PURE__ */ jsxs("div", { className: "mt-0.5 text-xs text-zinc-500", children: [
              p.metodo_label,
              " · ",
              formatData(p.data_transacao ?? p.created_at)
            ] }),
            p.motivo_rejeicao && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-red-400", children: [
              "Rejeitado: ",
              p.motivo_rejeicao
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white", children: formatKz(p.valor) }),
            /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs text-zinc-400", children: p.estado_label })
          ] })
        ] }, p.id)) })
      ] }),
      ordem.factura && /* @__PURE__ */ jsx("div", { className: "mb-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6 backdrop-blur", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
            "Factura"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-medium text-white", children: ordem.factura.numero }),
          /* @__PURE__ */ jsxs("div", { className: "mt-0.5 text-xs text-zinc-500", children: [
            ordem.factura.tipo_documento_label,
            " · ",
            formatData(ordem.factura.data_emissao)
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: route("facturas.download-attachment", ordem.factura.id),
            className: "inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white hover:bg-zinc-800 transition",
            children: [
              /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
              "Descarregar"
            ]
          }
        )
      ] }) }),
      ordem.pode_cancelar && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: cancelarOrdem,
          disabled: cancelando,
          className: "inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition",
          children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
            cancelando ? "A cancelar…" : "Cancelar ordem"
          ]
        }
      ) })
    ] }) })
  ] });
}
export {
  OrdemShow as default
};
