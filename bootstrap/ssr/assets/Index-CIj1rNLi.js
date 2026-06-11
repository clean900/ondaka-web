import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BxaWWjLC.js";
import { Head, router, useForm } from "@inertiajs/react";
import { CheckCircle2, Wallet, X, Filter, Building2, ArrowRight, Send, AlertCircle, Loader2 } from "lucide-react";
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
const calcularSaldo = (c) => {
  const saldo = parseFloat(c.valor) - parseFloat(c.valor_usado);
  return saldo.toFixed(2);
};
const tipoLabel = {
  quota_base: "Taxa base",
  fundo_reserva: "Fundo reserva",
  despesa_extra: "Despesa extra",
  multa: "Multa",
  juros: "Juros",
  ajuste_credito: "Ajuste crédito",
  ajuste_debito: "Ajuste débito"
};
function CreditosIndex({ creditos, stats, condominios, lancamentosPorFraccao, filtros, flash }) {
  const [condominioFiltro, setCondominioFiltro] = useState(filtros.condominio_id || "");
  const [comSaldoFiltro, setComSaldoFiltro] = useState(filtros.com_saldo || "");
  const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);
  const handleFiltrar = (e) => {
    e.preventDefault();
    const params = {};
    if (condominioFiltro) params.condominio_id = condominioFiltro;
    if (comSaldoFiltro) params.com_saldo = comSaldoFiltro;
    router.get(route("creditos.index"), params, { preserveState: true });
  };
  const handleLimpar = () => {
    setCondominioFiltro("");
    setComSaldoFiltro("");
    router.get(route("creditos.index"));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Créditos" }),
    /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Créditos dos Imóveis" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mt-1", children: "Saldos a favor dos condóminos (devolução de pagamentos)" })
      ] }) }),
      (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex gap-3", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "text-emerald-400 flex-shrink-0", size: 18 }),
        /* @__PURE__ */ jsx("span", { className: "text-emerald-400 text-sm", children: flash.success })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { size: 18 }), label: "Total créditos", value: stats.total.toString(), color: "zinc" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(CheckCircle2, { size: 18 }), label: "Com saldo", value: stats.com_saldo.toString(), color: "emerald" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(X, { size: 18 }), label: "Esgotados", value: stats.esgotados.toString(), color: "zinc" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { size: 18 }), label: "Saldo disponível", value: formatarKz(stats.saldo_total_disponivel), color: "cyan" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleFiltrar, className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("select", { value: condominioFiltro, onChange: (e) => setCondominioFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
          condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: comSaldoFiltro, onChange: (e) => setComSaldoFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os créditos" }),
          /* @__PURE__ */ jsx("option", { value: "1", children: "Apenas com saldo" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 flex-1 justify-center", children: [
            /* @__PURE__ */ jsx(Filter, { size: 14 }),
            " Filtrar"
          ] }),
          (condominioFiltro || comSaldoFiltro) && /* @__PURE__ */ jsx("button", { type: "button", onClick: handleLimpar, className: "text-zinc-400 hover:text-white px-3 py-2 text-sm", children: /* @__PURE__ */ jsx(X, { size: 14 }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden", children: [
        creditos.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center text-zinc-500", children: [
          /* @__PURE__ */ jsx(Wallet, { size: 48, className: "mx-auto mb-4 opacity-30" }),
          /* @__PURE__ */ jsx("p", { children: "Sem créditos com estes filtros." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: creditos.data.map((c) => {
          var _a, _b;
          const saldo = calcularSaldo(c);
          const temSaldo = parseFloat(saldo) > 0;
          const lancamentosDisponiveis = lancamentosPorFraccao[c.fraccao_id] || [];
          return /* @__PURE__ */ jsx("div", { className: "block p-4 hover:bg-zinc-800/30 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1 flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
                  "Crédito #",
                  c.id
                ] }),
                temSaldo ? /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400", children: "Com saldo" }) : /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-400", children: "Esgotado" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-zinc-400 flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Building2, { size: 12 }),
                  (_a = c.condominio) == null ? void 0 : _a.nome,
                  " · Imóvel ",
                  (_b = c.fraccao) == null ? void 0 : _b.identificador
                ] }),
                c.condomino && /* @__PURE__ */ jsxs("span", { children: [
                  "· ",
                  c.condomino.nome_completo
                ] }),
                c.pagamento_origem && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(ArrowRight, { size: 12 }),
                  " Origem: ",
                  c.pagamento_origem.referencia
                ] })
              ] }),
              c.descricao && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1 truncate", children: c.descricao })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right flex-shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-white", children: formatarKz(saldo) }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-400", children: [
                "de ",
                formatarKz(c.valor)
              ] }),
              parseFloat(c.valor_usado) > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-amber-400", children: [
                "Usado: ",
                formatarKz(c.valor_usado)
              ] }),
              temSaldo && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setCreditoSeleccionado(c),
                  disabled: lancamentosDisponiveis.length === 0,
                  className: "mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5",
                  title: lancamentosDisponiveis.length === 0 ? "Sem lançamentos em aberto nesta fracção" : "Aplicar este crédito a um lançamento",
                  children: [
                    /* @__PURE__ */ jsx(Send, { size: 12 }),
                    " Usar crédito"
                  ]
                }
              )
            ] })
          ] }) }, c.id);
        }) }),
        creditos.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800 px-4 py-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500", children: [
            "Página ",
            creditos.current_page,
            " de ",
            creditos.last_page,
            " (",
            creditos.total,
            " créditos)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: creditos.links.map((link, i) => /* @__PURE__ */ jsx("button", { onClick: () => link.url && router.get(link.url), disabled: !link.url, className: `px-3 py-1 rounded text-xs ${link.active ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white disabled:opacity-30"}`, dangerouslySetInnerHTML: { __html: link.label } }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "text-blue-400 flex-shrink-0 mt-0.5", size: 16 }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-blue-300/90", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold mb-1", children: "Como funciona" }),
          /* @__PURE__ */ jsx("p", { children: 'Os créditos são gerados quando um pagamento confirmado é convertido em saldo. Para usar, clica em "Usar crédito" e escolhe um lançamento em aberto da mesma fracção.' })
        ] })
      ] })
    ] }) }),
    creditoSeleccionado && /* @__PURE__ */ jsx(
      ModalUsarCredito,
      {
        credito: creditoSeleccionado,
        saldo: calcularSaldo(creditoSeleccionado),
        lancamentos: lancamentosPorFraccao[creditoSeleccionado.fraccao_id] || [],
        onClose: () => setCreditoSeleccionado(null)
      }
    )
  ] });
}
function ModalUsarCredito({ credito, saldo, lancamentos, onClose }) {
  var _a, _b, _c, _d;
  const form = useForm({
    lancamento_id: ((_b = (_a = lancamentos[0]) == null ? void 0 : _a.id) == null ? void 0 : _b.toString()) || "",
    valor: ""
  });
  const lancamentoEscolhido = lancamentos.find((l) => l.id.toString() === form.data.lancamento_id);
  const maxValor = lancamentoEscolhido ? Math.min(parseFloat(saldo), parseFloat(lancamentoEscolhido.em_divida)).toFixed(2) : saldo;
  const handlePreencherMax = () => {
    form.setData("valor", maxValor);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    form.post(route("creditos.usar", credito.id), {
      onSuccess: () => onClose(),
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-lg w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-white", children: [
        "Usar crédito #",
        credito.id
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3 mb-4 text-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Saldo disponível:" }),
        /* @__PURE__ */ jsx("span", { className: "text-emerald-400 font-bold", children: formatarKz(saldo) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Imóvel:" }),
        /* @__PURE__ */ jsxs("span", { className: "text-white", children: [
          (_c = credito.condominio) == null ? void 0 : _c.nome,
          " · ",
          (_d = credito.fraccao) == null ? void 0 : _d.identificador
        ] })
      ] })
    ] }),
    form.errors.usar_credito && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 text-xs text-red-400", children: form.errors.usar_credito }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Aplicar a lançamento" }),
        /* @__PURE__ */ jsx("select", { value: form.data.lancamento_id, onChange: (e) => form.setData("lancamento_id", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: lancamentos.map((l) => /* @__PURE__ */ jsxs("option", { value: l.id, children: [
          "[",
          tipoLabel[l.tipo] || l.tipo,
          "] ",
          l.descricao,
          " — em dívida: ",
          formatarKz(l.em_divida)
        ] }, l.id)) }),
        form.errors.lancamento_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.lancamento_id })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: [
          "Valor a aplicar (Kz) — máx: ",
          formatarKz(maxValor)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0.01",
              max: maxValor,
              value: form.data.valor,
              onChange: (e) => form.setData("valor", e.target.value),
              placeholder: "0.00",
              className: "flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: handlePreencherMax, className: "px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-xs font-semibold", children: "Máx" })
        ] }),
        form.errors.valor && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.valor })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: form.processing, className: "flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2", children: [
          form.processing ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(Send, { size: 16 }),
          form.processing ? "A processar..." : "Confirmar utilização"
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2.5 text-sm text-zinc-400 hover:text-white", children: "Cancelar" })
      ] })
    ] })
  ] }) });
}
function StatCard({ icon, label, value, color }) {
  const colors = {
    zinc: "text-zinc-400 bg-zinc-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    amber: "text-amber-400 bg-amber-500/10"
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ jsx("div", { className: `p-1.5 rounded ${colors[color]}`, children: icon }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-400 font-semibold", children: label })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-white", children: value })
  ] });
}
export {
  CreditosIndex as default
};
