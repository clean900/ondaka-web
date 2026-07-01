import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { CheckCircle2, Clock, XCircle, Building2, CreditCard, Receipt } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const fmt = (v) => new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtData = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleDateString("pt-PT");
};
function FacturaShow({ factura, empresa }) {
  const [gerarRefLoading, setGerarRefLoading] = useState(false);
  const [refGerada, setRefGerada] = useState(null);
  const gerarReferenciaPagamento = async () => {
    var _a;
    setGerarRefLoading(true);
    try {
      const csrf = ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "";
      const r = await fetch(`/subscricao/facturas/${factura.id}/gerar-referencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf
        },
        credentials: "same-origin"
      });
      const data = await r.json();
      if (r.ok && data.success) {
        setRefGerada(data.referencia || "OK");
        window.location.reload();
      } else {
        alert(data.message || "Erro ao gerar referência.");
      }
    } catch (err) {
      alert("Erro de ligação.");
    } finally {
      setGerarRefLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-zinc-100", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "mr-2 inline h-5 w-5" }),
        "Factura ",
        factura.numero
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: `Factura ${factura.numero}` }),
        /* @__PURE__ */ jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(
            Link,
            {
              href: "/subscricao/facturas",
              className: "text-sm text-zinc-400 hover:text-zinc-200",
              children: "← Voltar às facturas"
            }
          ) }),
          factura.estado === "paga" && /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-6 w-6 text-green-400" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-green-300", children: "Factura paga" }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm text-green-400/80", children: [
                "Pagamento recebido em ",
                fmtData(factura.data_pagamento || ""),
                "."
              ] })
            ] })
          ] }),
          factura.estado === "pendente" && /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-6 w-6 text-yellow-400" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-yellow-300", children: "Factura pendente" }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm text-yellow-400/80", children: [
                "Vencimento: ",
                fmtData(factura.data_vencimento)
              ] })
            ] })
          ] }),
          factura.estado === "anulada" && /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4", children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-6 w-6 text-red-400" }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", { className: "font-medium text-red-300", children: "Factura anulada" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Factura" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-2xl font-bold text-white", children: factura.numero })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Total a pagar" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-3xl font-bold text-cyan-400", children: [
                  fmt(factura.valor_total_kz),
                  " Kz"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-zinc-500", children: "Emissão" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-300", children: fmtData(factura.data_emissao) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-zinc-500", children: "Vencimento" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-300", children: fmtData(factura.data_vencimento) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-zinc-500", children: "Período cobrado" }),
                /* @__PURE__ */ jsxs("div", { className: "font-medium text-zinc-300", children: [
                  fmtData(factura.periodo_inicio),
                  " – ",
                  fmtData(factura.periodo_fim)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-zinc-500", children: "Imóveis facturados" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-300", children: factura.num_imoveis })
              ] })
            ] })
          ] }),
          empresa && /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
            /* @__PURE__ */ jsxs("h3", { className: "mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500", children: [
              /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }),
              "Cliente"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-white", children: empresa.nome }),
              empresa.nif && /* @__PURE__ */ jsxs("div", { className: "text-zinc-400", children: [
                "NIF: ",
                empresa.nif
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "mb-4 text-xs uppercase tracking-wider text-zinc-500", children: "Detalhe" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsx(
                Linha,
                {
                  label: `${factura.num_imoveis} imóveis × ${fmt(factura.preco_base_kz)} Kz`,
                  valor: fmt(factura.num_imoveis * factura.preco_base_kz)
                }
              ),
              factura.desconto_qtd_pct > 0 && /* @__PURE__ */ jsx(
                Linha,
                {
                  label: `Desconto qtd (${factura.desconto_qtd_pct}%)`,
                  valor: `-${fmt(factura.num_imoveis * factura.preco_base_kz * (factura.desconto_qtd_pct / 100))}`,
                  tipo: "desconto"
                }
              ),
              factura.desconto_periodo_pct > 0 && /* @__PURE__ */ jsx(
                Linha,
                {
                  label: `Desconto período (${factura.desconto_periodo_pct}%)`,
                  valor: `-—`,
                  tipo: "desconto"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "my-3 border-t border-zinc-800" }),
              /* @__PURE__ */ jsx(Linha, { label: "Subtotal", valor: fmt(factura.subtotal_kz), forte: true }),
              factura.imposto_taxa_pct > 0 && /* @__PURE__ */ jsx(
                Linha,
                {
                  label: `${factura.imposto_tipo} ${factura.imposto_taxa_pct}%`,
                  valor: `+${fmt(factura.imposto_valor_kz)}`
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "my-3 border-t-2 border-cyan-500/30" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-base font-semibold text-white", children: "TOTAL" }),
                /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-cyan-400", children: [
                  fmt(factura.valor_total_kz),
                  " Kz"
                ] })
              ] })
            ] })
          ] }),
          factura.estado === "pendente" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6", children: [
            /* @__PURE__ */ jsxs("h3", { className: "mb-3 flex items-center gap-2 text-base font-medium text-cyan-300", children: [
              /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5" }),
              "Pagar via Multicaixa Express"
            ] }),
            !factura.tem_referencia_pagamento && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-zinc-300", children: "Gere uma referência de pagamento ProxyPay para pagar via Multicaixa Express, ATM ou homebanking." }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: gerarReferenciaPagamento,
                  disabled: gerarRefLoading,
                  className: "flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
                    gerarRefLoading ? "A gerar referência..." : "Gerar referência de pagamento"
                  ]
                }
              )
            ] }),
            factura.tem_referencia_pagamento && factura.referencia_dados && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-cyan-500/40 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-cyan-300", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Referência ProxyPay gerada" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-cyan-400/70", children: "Entidade" }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-2xl font-bold text-white", children: factura.referencia_dados.entity_id })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-cyan-400/70", children: "Referência" }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-2xl font-bold text-white", children: factura.referencia_dados.reference_id })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4 border-t border-cyan-500/20 pt-3 text-xs text-zinc-400", children: [
                  "Válida até ",
                  fmtData(factura.referencia_dados.expira_em)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-sm", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-zinc-200", children: "Como pagar:" }),
                /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-1.5 text-zinc-400", children: [
                  /* @__PURE__ */ jsx("li", { children: "• Multicaixa Express: Pagamentos → Pagamento de serviços → Outros → Insira entidade e referência" }),
                  /* @__PURE__ */ jsx("li", { children: "• ATM: Insira o cartão → Pagamentos → Pagamento de serviços" }),
                  /* @__PURE__ */ jsx("li", { children: '• Homebanking: Procure "Pagamento de Serviços" no seu banco' })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-zinc-500", children: "Após o pagamento, a factura será marcada como paga automaticamente em alguns minutos." })
              ] })
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
function Linha({ label, valor, tipo, forte }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("span", { className: `${forte ? "text-zinc-200" : "text-zinc-400"}`, children: label }),
    /* @__PURE__ */ jsxs("span", { className: `${forte ? "font-semibold text-white" : tipo === "desconto" ? "text-cyan-400" : "text-zinc-300"}`, children: [
      valor,
      " Kz"
    ] })
  ] });
}
export {
  FacturaShow as default
};
