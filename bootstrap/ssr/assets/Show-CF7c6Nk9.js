import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BevyWQSg.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Building2, Hash, Calendar, CheckCircle2, FileText, Receipt, User, AlertCircle, XCircle, X, Loader2 } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const formatarKz = (valor) => {
  const n = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " Kz";
};
const formatarData = (d) => new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];
const tipoLabel = {
  quota_base: "Taxa mensal",
  fundo_reserva: "Fundo reserva",
  despesa_extra: "Despesa extra",
  multa: "Multa",
  juros: "Juros",
  ajuste_credito: "Crédito",
  ajuste_debito: "Débito"
};
const tipoColor = {
  quota_base: "bg-cyan-500/10 text-cyan-400",
  fundo_reserva: "bg-purple-500/10 text-purple-400",
  despesa_extra: "bg-amber-500/10 text-amber-400",
  multa: "bg-red-500/10 text-red-400",
  juros: "bg-orange-500/10 text-orange-400"
};
const estadoQuotaColor = {
  aberta: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", label: "Aberta" },
  paga_parcial: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", label: "Paga parcial" },
  paga: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", label: "Paga" },
  cancelada: { bg: "bg-zinc-500/10 border-zinc-500/30", text: "text-zinc-400", label: "Cancelada" }
};
function QuotaShow({ quota, flash }) {
  var _a, _b;
  const [showCancelar, setShowCancelar] = useState(false);
  const podeCancelar = quota.estado !== "cancelada" && !quota.tem_pagamentos_imputados;
  const estado = estadoQuotaColor[quota.estado] || estadoQuotaColor.aberta;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Quota ${meses[quota.mes - 1]} ${quota.ano}` }),
    /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("quotas.index"),
          className: "inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }),
            " Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-white", children: [
            "Quota — ",
            meses[quota.mes - 1],
            " ",
            quota.ano
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mt-1 flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx(Building2, { size: 14 }),
            " ",
            (_a = quota.condominio) == null ? void 0 : _a.nome,
            /* @__PURE__ */ jsx("span", { className: "text-zinc-600", children: "·" }),
            /* @__PURE__ */ jsx(Hash, { size: 14 }),
            " Imóvel ",
            (_b = quota.fraccao) == null ? void 0 : _b.identificador,
            quota.data_vencimento && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-600", children: "·" }),
              /* @__PURE__ */ jsx(Calendar, { size: 14 }),
              " Vence ",
              formatarData(quota.data_vencimento)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-lg border ${estado.bg} ${estado.text} text-sm font-bold`, children: estado.label })
      ] }),
      (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex gap-3", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "text-emerald-400 flex-shrink-0", size: 18 }),
        /* @__PURE__ */ jsx("span", { className: "text-emerald-400 text-sm", children: flash.success })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(SummaryCard, { label: "Valor total", value: formatarKz(quota.valor_total), color: "zinc" }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "Valor pago", value: formatarKz(quota.valor_pago), color: "emerald" }),
        /* @__PURE__ */ jsx(
          SummaryCard,
          {
            label: "Em dívida",
            value: formatarKz(parseFloat(quota.valor_total) - parseFloat(quota.valor_pago)),
            color: parseFloat(quota.valor_total) - parseFloat(quota.valor_pago) > 0 ? "amber" : "emerald"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-zinc-800", children: /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { size: 16 }),
          " Lançamentos (",
          quota.lancamentos.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: quota.lancamentos.map((l) => /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
                /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded font-semibold ${tipoColor[l.tipo] || "bg-zinc-700 text-zinc-300"}`, children: tipoLabel[l.tipo] || l.tipo }),
                l.estado === "cancelado" && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400", children: "Cancelado" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: `text-sm ${l.estado === "cancelado" ? "line-through text-zinc-500" : "text-white"}`, children: l.descricao }),
              l.motivo_cancelamento && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-1", children: [
                "Motivo: ",
                l.motivo_cancelamento
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("div", { className: `text-sm font-bold ${l.estado === "cancelado" ? "line-through text-zinc-500" : "text-white"}`, children: formatarKz(l.valor) }),
              parseFloat(l.valor_pago) > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-emerald-400", children: [
                "Pago: ",
                formatarKz(l.valor_pago)
              ] })
            ] })
          ] }),
          l.imputacoes && l.imputacoes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 ml-2 pl-3 border-l-2 border-zinc-800 space-y-1", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500 mb-1", children: "Pagamentos aplicados:" }),
            l.imputacoes.map((i) => {
              var _a2, _b2, _c;
              return /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-400 flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx(Receipt, { size: 11, className: "text-emerald-400 flex-shrink-0" }),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/pagamentos/${(_a2 = i.pagamento) == null ? void 0 : _a2.id}`,
                    className: "text-cyan-400 hover:text-cyan-300 font-semibold",
                    children: (_b2 = i.pagamento) == null ? void 0 : _b2.referencia
                  }
                ),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsx("span", { className: "text-emerald-400", children: formatarKz(i.valor) }),
                ((_c = i.pagamento) == null ? void 0 : _c.condomino) && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { children: "·" }),
                  /* @__PURE__ */ jsx(User, { size: 10 }),
                  /* @__PURE__ */ jsx("span", { children: i.pagamento.condomino.nome_completo })
                ] })
              ] }, i.id);
            })
          ] })
        ] }, l.id)) })
      ] }),
      quota.estado !== "cancelada" && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-white mb-3", children: "Acções" }),
        quota.tem_pagamentos_imputados ? /* @__PURE__ */ jsxs("div", { className: "bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-3", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "text-blue-400 flex-shrink-0", size: 16 }),
          /* @__PURE__ */ jsxs("div", { className: "text-blue-300/90 text-sm", children: [
            /* @__PURE__ */ jsx("strong", { children: "Não é possível cancelar." }),
            " Esta quota tem pagamentos aplicados. Para cancelar, primeiro rejeita ou devolve os pagamentos relacionados."
          ] })
        ] }) : /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowCancelar(true),
            className: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(XCircle, { size: 16 }),
              " Cancelar quota"
            ]
          }
        )
      ] })
    ] }) }),
    showCancelar && podeCancelar && /* @__PURE__ */ jsx(ModalCancelar, { quotaId: quota.id, onClose: () => setShowCancelar(false) })
  ] });
}
function SummaryCard({ label, value, color }) {
  const colors = {
    zinc: "text-white",
    emerald: "text-emerald-400",
    amber: "text-amber-400"
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-400 font-semibold mb-1", children: label }),
    /* @__PURE__ */ jsx("div", { className: `text-lg font-bold ${colors[color]}`, children: value })
  ] });
}
function ModalCancelar({ quotaId, onClose }) {
  const form = useForm({ motivo: "" });
  const handleSubmit = (e) => {
    e.preventDefault();
    form.post(route("quotas.cancelar", quotaId), {
      preserveScroll: true,
      onSuccess: () => onClose()
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-white flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(XCircle, { size: 18, className: "text-red-400" }),
        " Cancelar Quota"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mb-4", children: [
      "Esta acção ",
      /* @__PURE__ */ jsx("strong", { children: "cancela a quota e todos os lançamentos" }),
      " associados. Não é reversível pela UI. O motivo fica registado no audit trail."
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Motivo (mínimo 5 caracteres)" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: form.data.motivo,
            onChange: (e) => form.setData("motivo", e.target.value),
            placeholder: "Ex: Erro de geração, fracção desocupada antes do mês...",
            rows: 3,
            className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
          }
        ),
        form.errors.motivo && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.motivo }),
        form.errors.cancelar && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.cancelar })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: form.processing || form.data.motivo.length < 5,
            className: "flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2",
            children: [
              form.processing ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(XCircle, { size: 16 }),
              form.processing ? "A cancelar..." : "Confirmar cancelamento"
            ]
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2.5 text-sm text-zinc-400 hover:text-white", children: "Cancelar" })
      ] })
    ] })
  ] }) });
}
export {
  QuotaShow as default
};
