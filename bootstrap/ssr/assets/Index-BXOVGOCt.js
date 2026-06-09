import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Sparkles, Building2, Calendar, Receipt, CreditCard, CheckCircle, Clock, AlertCircle, CalendarClock, RefreshCw, AlertTriangle, RotateCcw, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const fmt = (v) => new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
function Index({ subscricao, empresa, config, escaloes, motivos_cancelamento }) {
  const [numImoveis, setNumImoveis] = useState((subscricao == null ? void 0 : subscricao.num_imoveis) || 30);
  const [periodicidade, setPeriodicidade] = useState("mensal");
  const [calculo, setCalculo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [referencia, setReferencia] = useState(null);
  useEffect(() => {
    if (numImoveis < 1) return;
    const timer = setTimeout(async () => {
      var _a;
      setLoading(true);
      try {
        const csrf = ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "";
        const r = await fetch("/subscricao/calcular", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": csrf
          },
          credentials: "same-origin",
          body: JSON.stringify({ num_imoveis: numImoveis, periodicidade })
        });
        const data = await r.json();
        if (data.success) setCalculo(data.calculo);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [numImoveis, periodicidade]);
  const activarSubscricao = async () => {
    var _a;
    if (!confirm("Confirmar activação com " + numImoveis + " imóveis e período " + periodicidade + "?")) return;
    setLoading(true);
    try {
      const csrf = ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "";
      const r = await fetch("/subscricao/activar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf
        },
        credentials: "same-origin",
        body: JSON.stringify({ num_imoveis: numImoveis, periodicidade })
      });
      const data = await r.json();
      if (r.ok && data.success) {
        alert(data.message || "Sucesso!");
        window.location.reload();
      } else {
        alert(data.message || "Erro ao activar.");
      }
    } catch (err) {
      alert("Erro de ligação.");
    } finally {
      setLoading(false);
    }
  };
  const pagarSubscricao = async () => {
    var _a;
    if (!confirm("Gerar referencia de pagamento para regularizar a subscricao?")) return;
    setLoading(true);
    try {
      const csrf = ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "";
      const r = await fetch("/subscricao/pagar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf
        },
        credentials: "same-origin",
        body: JSON.stringify({})
      });
      const data = await r.json();
      if (r.ok && data.success) {
        setReferencia(data);
      } else {
        alert(data.message || "Erro ao gerar referencia.");
      }
    } catch (err) {
      alert("Erro de ligacao.");
    } finally {
      setLoading(false);
    }
  };
  const alterarImoveis = async () => {
    var _a;
    if (!subscricao) return;
    const diff = numImoveis - subscricao.num_imoveis;
    const aumento = diff > 0;
    const msg = aumento ? `Confirmar aumento para ${numImoveis} imóveis (+${diff})? Será cobrado um acréscimo proporcional na próxima factura.` : `Confirmar redução para ${numImoveis} imóveis (${diff})? Será gerado um crédito que será abatido na próxima factura.`;
    if (!confirm(msg)) return;
    setLoading(true);
    try {
      const csrf = ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "";
      const r = await fetch("/subscricao/alterar-imoveis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf
        },
        credentials: "same-origin",
        body: JSON.stringify({ num_imoveis: numImoveis })
      });
      const data = await r.json();
      if (r.ok && data.success) {
        alert(data.message || "Imóveis alterados.");
        window.location.reload();
      } else {
        alert(data.message || "Erro ao alterar imóveis.");
      }
    } catch (err) {
      alert("Erro de ligação.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-zinc-100", children: [
        /* @__PURE__ */ jsx(CreditCard, { className: "mr-2 inline h-5 w-5" }),
        "Subscrição"
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Subscrição" }),
        /* @__PURE__ */ jsxs("div", { className: "py-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8", children: [
            subscricao && /* @__PURE__ */ jsx(SubscricaoStatus, { subscricao, trialDias: config.trial_duracao_dias }),
            /* @__PURE__ */ jsxs("div", { className: "mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900", children: [
              /* @__PURE__ */ jsxs("div", { className: "border-b border-zinc-800 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6", children: [
                /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-xl font-semibold text-white", children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-cyan-400" }),
                  "Configurar Subscrição"
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-zinc-400", children: "Indique o nº de imóveis e escolha a periodicidade. Os descontos serão calculados automaticamente." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("label", { className: "mb-2 flex items-center gap-2 text-sm font-medium text-zinc-200", children: [
                    /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-cyan-400" }),
                    "1. Quantos imóveis vai gerir?"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      value: numImoveis,
                      onChange: (e) => setNumImoveis(parseInt(e.target.value) || 0),
                      min: 1,
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-lg text-white focus:border-cyan-500 focus:outline-none",
                      placeholder: "Ex: 50"
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-zinc-500", children: "Imóveis = total combinado de todos os condomínios que gere." })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("label", { className: "mb-2 flex items-center gap-2 text-sm font-medium text-zinc-200", children: [
                    /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-blue-400" }),
                    "2. Periodicidade do pagamento"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
                    /* @__PURE__ */ jsx(
                      PeriodoCard,
                      {
                        active: periodicidade === "mensal",
                        onClick: () => setPeriodicidade("mensal"),
                        nome: "Mensal",
                        meses: "1 mês",
                        desconto: config.desconto_periodo_mensal_pct
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      PeriodoCard,
                      {
                        active: periodicidade === "semestral",
                        onClick: () => setPeriodicidade("semestral"),
                        nome: "Semestral",
                        meses: "6 meses",
                        desconto: config.desconto_periodo_semestral_pct
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      PeriodoCard,
                      {
                        active: periodicidade === "anual",
                        onClick: () => setPeriodicidade("anual"),
                        nome: "Anual",
                        meses: "12 meses",
                        desconto: config.desconto_periodo_anual_pct
                      }
                    )
                  ] })
                ] }),
                calculo && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-5", children: [
                  /* @__PURE__ */ jsxs("h4", { className: "mb-3 flex items-center gap-2 text-sm font-medium text-cyan-400", children: [
                    /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4" }),
                    "Resumo do cálculo"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
                    /* @__PURE__ */ jsx(ResumoLinha, { label: `${calculo.num_imoveis} imóveis × ${fmt(calculo.preco_base_kz)} Kz × ${calculo.meses} ${calculo.meses === 1 ? "mês" : "meses"}`, valor: fmt(calculo.num_imoveis * calculo.preco_base_kz * calculo.meses) }),
                    calculo.desconto_qtd_pct > 0 && /* @__PURE__ */ jsx(
                      ResumoLinha,
                      {
                        label: `Desconto qtd (${calculo.escalao.nome} - ${calculo.desconto_qtd_pct}%)`,
                        valor: `-${fmt(calculo.num_imoveis * calculo.preco_base_kz * calculo.meses * (calculo.desconto_qtd_pct / 100))}`,
                        tipo: "desconto"
                      }
                    ),
                    calculo.desconto_periodo_pct > 0 && /* @__PURE__ */ jsx(
                      ResumoLinha,
                      {
                        label: `Desconto período (${calculo.desconto_periodo_pct}%)`,
                        valor: `-${fmt(calculo.num_imoveis * calculo.preco_base_kz * calculo.meses * (1 - calculo.desconto_qtd_pct / 100) * (calculo.desconto_periodo_pct / 100))}`,
                        tipo: "desconto"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "my-3 border-t border-zinc-800" }),
                    /* @__PURE__ */ jsx(ResumoLinha, { label: "Subtotal", valor: fmt(calculo.subtotal_kz), forte: true }),
                    calculo.imposto_aplicavel && /* @__PURE__ */ jsx(
                      ResumoLinha,
                      {
                        label: `${calculo.imposto_tipo} ${calculo.imposto_taxa_pct}%`,
                        valor: `+${fmt(calculo.imposto_valor_kz)}`
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "my-3 border-t border-zinc-800" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-base font-semibold text-white", children: "TOTAL a pagar" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-cyan-400", children: [
                        fmt(calculo.total_kz),
                        " Kz"
                      ] })
                    ] }),
                    calculo.meses > 1 && /* @__PURE__ */ jsxs("p", { className: "text-right text-xs text-zinc-500", children: [
                      "= ",
                      fmt(calculo.total_mensal_equivalente_kz),
                      " Kz/mês equivalente"
                    ] })
                  ] })
                ] }),
                loading && !calculo && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-zinc-800 bg-zinc-950 p-5 text-center text-sm text-zinc-500", children: "A calcular..." }),
                calculo && !(subscricao == null ? void 0 : subscricao.activa) && !(subscricao == null ? void 0 : subscricao.em_trial) && ((subscricao == null ? void 0 : subscricao.estado) === "limitado" || (subscricao == null ? void 0 : subscricao.estado) === "cancelada") && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: pagarSubscricao,
                    disabled: loading,
                    className: "flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:from-cyan-400 hover:to-purple-500 disabled:opacity-60",
                    children: [
                      /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5" }),
                      loading ? "A gerar referência..." : "Pagar agora"
                    ]
                  }
                ),
                calculo && !(subscricao == null ? void 0 : subscricao.activa) && (subscricao == null ? void 0 : subscricao.em_trial) && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: activarSubscricao,
                    className: "flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:from-cyan-400 hover:to-purple-500",
                    children: [
                      /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5" }),
                      "Confirmar e activar subscrição"
                    ]
                  }
                ),
                calculo && !subscricao && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: activarSubscricao,
                    className: "flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:from-cyan-400 hover:to-purple-500",
                    children: [
                      /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5" }),
                      `Iniciar trial de ${config.trial_duracao_dias} dias`
                    ]
                  }
                ),
                referencia && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 text-cyan-400", children: [
                    /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Referência de pagamento gerada" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Entidade" }),
                      /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-white", children: referencia.entity_id })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Referência" }),
                      /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-white", children: referencia.referencia })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Montante" }),
                      /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-cyan-400", children: [
                        fmt(referencia.amount),
                        " Kz"
                      ] })
                    ] }),
                    referencia.numero && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Factura" }),
                      /* @__PURE__ */ jsx("span", { className: "font-mono text-white", children: referencia.numero })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-zinc-500", children: "Pague esta referência via Multicaixa Express ou no ATM. Após confirmação, a subscrição será reactivada automaticamente." })
                ] }),
                calculo && (subscricao == null ? void 0 : subscricao.activa) && numImoveis !== subscricao.num_imoveis && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: alterarImoveis,
                    className: "flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:from-purple-400 hover:to-pink-500",
                    children: [
                      /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5" }),
                      "Alterar para ",
                      numImoveis,
                      " imóveis (",
                      numImoveis > subscricao.num_imoveis ? "+" : "",
                      numImoveis - subscricao.num_imoveis,
                      ")"
                    ]
                  }
                ),
                calculo && (subscricao == null ? void 0 : subscricao.activa) && numImoveis === subscricao.num_imoveis && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm text-green-400", children: [
                  /* @__PURE__ */ jsx(CheckCircle, { className: "mr-2 inline h-4 w-4" }),
                  "A sua subscrição está activa com ",
                  /* @__PURE__ */ jsxs("strong", { children: [
                    subscricao.num_imoveis,
                    " imóveis"
                  ] }),
                  ". Para alterar, modifique o número acima."
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-medium text-zinc-300", children: "Escalões disponíveis" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: escaloes.map((e) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border border-zinc-800 p-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: e.nome }),
                  /* @__PURE__ */ jsxs("span", { className: "ml-2 text-xs text-zinc-500", children: [
                    e.min_imoveis,
                    " - ",
                    e.max_imoveis ?? "∞",
                    " imóveis"
                  ] })
                ] }),
                e.desconto_pct > 0 ? /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-cyan-400", children: [
                  "-",
                  e.desconto_pct,
                  "% desconto"
                ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-500", children: "Preço base" })
              ] }, e.id)) })
            ] })
          ] }),
          subscricao && subscricao.estado !== "cancelada" && /* @__PURE__ */ jsx(SeccaoMudarPlano, { subscricao }),
          subscricao && /* @__PURE__ */ jsx(
            SeccaoGerirSubscricao,
            {
              subscricao,
              motivos: motivos_cancelamento
            }
          )
        ] })
      ]
    }
  );
}
function SubscricaoStatus({ subscricao, trialDias }) {
  if (subscricao.em_trial && subscricao.trial_expira_em) {
    const expira = new Date(subscricao.trial_expira_em);
    const dias = Math.max(0, Math.ceil((expira.getTime() - Date.now()) / (1e3 * 60 * 60 * 24)));
    return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-orange-500/30 bg-orange-500/5 p-4", children: [
      /* @__PURE__ */ jsx(Clock, { className: "mr-2 inline h-4 w-4 text-orange-400" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-orange-300", children: [
        "Está em ",
        /* @__PURE__ */ jsx("strong", { children: "período de trial" }),
        ". Faltam ",
        /* @__PURE__ */ jsxs("strong", { children: [
          dias,
          " dias"
        ] }),
        "."
      ] })
    ] });
  }
  if (subscricao.activa) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-green-500/30 bg-green-500/5 p-4", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "mr-2 inline h-4 w-4 text-green-400" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-green-300", children: [
        "Subscrição ",
        /* @__PURE__ */ jsx("strong", { children: "activa" }),
        ". Plano: ",
        subscricao.ciclo,
        ", ",
        subscricao.num_imoveis,
        " imóveis."
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4", children: [
    /* @__PURE__ */ jsx(AlertCircle, { className: "mr-2 inline h-4 w-4 text-yellow-400" }),
    /* @__PURE__ */ jsx("span", { className: "text-sm text-yellow-300", children: "A sua subscrição não está activa. Configure abaixo para começar." })
  ] });
}
function PeriodoCard({
  active,
  onClick,
  nome,
  meses,
  desconto
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: `relative rounded-lg border-2 p-4 text-left transition ${active ? "border-cyan-500 bg-cyan-500/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"}`,
      children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-white", children: nome }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-400", children: meses }),
        desconto > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 inline-block rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-400", children: [
          "-",
          desconto,
          "% desconto"
        ] })
      ]
    }
  );
}
function ResumoLinha({ label, valor, tipo, forte }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("span", { className: `${forte ? "text-zinc-200" : "text-zinc-400"}`, children: label }),
    /* @__PURE__ */ jsxs(
      "span",
      {
        className: `${forte ? "font-semibold text-white" : tipo === "desconto" ? "text-cyan-400" : "text-zinc-300"}`,
        children: [
          valor,
          " Kz"
        ]
      }
    )
  ] });
}
function SeccaoGerirSubscricao({
  subscricao,
  motivos
}) {
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalReverter, setModalReverter] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-2 text-lg font-bold text-zinc-100", children: "Gerir subscrição" }),
      /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-zinc-400", children: "Pode cancelar a subscrição a qualquer momento. Mantém o acesso até ao fim do período pago." }),
      subscricao.cancela_no_fim_periodo ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-orange-500/30 bg-orange-500/5 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold text-orange-300", children: "Cancelamento agendado" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-sm text-zinc-300", children: [
              "Subscrição cancelada em",
              " ",
              subscricao.cancelada_em ? new Date(subscricao.cancelada_em).toLocaleDateString("pt-PT") : "—",
              ". Mantém acesso até ao fim do período pago."
            ] }),
            subscricao.motivo_cancelamento && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-zinc-400", children: [
              /* @__PURE__ */ jsx("strong", { children: "Motivo:" }),
              " ",
              subscricao.motivo_cancelamento
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalReverter(true),
            className: "flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-400 hover:to-purple-500",
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              "Reverter cancelamento"
            ]
          }
        )
      ] }) : subscricao.estado !== "cancelada" && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setModalCancelar(true),
          className: "flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-500 hover:bg-red-500/10",
          children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
            "Cancelar subscrição"
          ]
        }
      )
    ] }),
    modalCancelar && /* @__PURE__ */ jsx(
      ModalCancelarSubscricao,
      {
        motivos,
        onClose: () => setModalCancelar(false)
      }
    ),
    modalReverter && /* @__PURE__ */ jsx(ModalReverterCancelamento, { onClose: () => setModalReverter(false) })
  ] });
}
function ModalCancelarSubscricao({
  motivos,
  onClose
}) {
  const { data, setData, post, processing, errors } = useForm({
    motivo_chave: "",
    detalhes: "",
    confirma: false
  });
  const submit = (e) => {
    e.preventDefault();
    if (!data.confirma || !data.motivo_chave) return;
    post(route("subscricao.cancelar"), {
      preserveScroll: true,
      onSuccess: onClose
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4", children: /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: submit,
      className: "w-full max-w-lg rounded-2xl border border-red-500/30 bg-zinc-900 p-6",
      children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-2 flex items-center gap-2 text-lg font-bold text-red-300", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
          " Cancelar subscrição"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg bg-orange-500/10 border border-orange-500/30 p-3 text-xs text-orange-200", children: "A sua subscrição mantém-se activa até ao fim do período pago. Após essa data o acesso será limitado." }),
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Motivo do cancelamento *" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: data.motivo_chave,
            onChange: (e) => setData("motivo_chave", e.target.value),
            required: true,
            className: "mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar motivo..." }),
              Object.entries(motivos).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v }, k))
            ]
          }
        ),
        errors.motivo_chave && /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs text-red-400", children: errors.motivo_chave }),
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Detalhes adicionais (opcional)" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: data.detalhes,
            onChange: (e) => setData("detalhes", e.target.value),
            rows: 3,
            placeholder: "Ajude-nos a melhorar...",
            className: "mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsxs("label", { className: "mb-4 flex cursor-pointer items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: data.confirma,
              onChange: (e) => setData("confirma", e.target.checked),
              className: "mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-red-500"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-300", children: "Confirmo que quero cancelar a subscrição. Mantenho acesso até ao fim do período pago." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm",
              children: "Voltar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing || !data.confirma || !data.motivo_chave,
              className: "rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50",
              children: processing ? "A processar..." : "Confirmar cancelamento"
            }
          )
        ] })
      ]
    }
  ) });
}
function ModalReverterCancelamento({ onClose }) {
  const [processing, setProcessing] = useState(false);
  const reverter = () => {
    setProcessing(true);
    router.post(
      route("subscricao.reverter-cancelamento"),
      {},
      {
        preserveScroll: true,
        onFinish: () => setProcessing(false),
        onSuccess: onClose
      }
    );
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6", children: [
    /* @__PURE__ */ jsxs("h3", { className: "mb-2 flex items-center gap-2 text-lg font-bold text-blue-300", children: [
      /* @__PURE__ */ jsx(RotateCcw, { className: "h-5 w-5" }),
      " Reverter cancelamento"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-zinc-400", children: "A sua subscrição voltará a renovar-se automaticamente no fim do período pago. Tem a certeza?" }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm",
          children: "Voltar"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: reverter,
          disabled: processing,
          className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50",
          children: processing ? "A processar..." : "Confirmar"
        }
      )
    ] })
  ] }) });
}
function SeccaoMudarPlano({ subscricao }) {
  const [modalAberto, setModalAberto] = useState(false);
  const cicloLabel = {
    mensal: "Mensal",
    semestral: "Semestral",
    anual: "Anual"
  };
  return /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-2 text-lg font-bold text-zinc-100", children: "Mudar plano" }),
      /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-zinc-400", children: "Pode mudar entre Mensal, Semestral e Anual. Upgrades aplicam-se imediatamente; downgrades passam a vigorar no fim do período actual." }),
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Plano actual" }),
        /* @__PURE__ */ jsx("div", { className: "font-semibold text-white", children: cicloLabel[subscricao.ciclo] ?? subscricao.ciclo })
      ] }) }),
      subscricao.proximo_ciclo ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-blue-500/30 bg-blue-500/5 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(CalendarClock, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold text-blue-300", children: "Mudança agendada" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-sm text-zinc-300", children: [
              "Passa para ",
              /* @__PURE__ */ jsx("strong", { children: cicloLabel[subscricao.proximo_ciclo] }),
              " em",
              " ",
              subscricao.proximo_ciclo_aplica_em ? new Date(subscricao.proximo_ciclo_aplica_em).toLocaleDateString("pt-PT") : "—"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => router.post(route("subscricao.cancelar-downgrade"), {}, { preserveScroll: true }),
            className: "rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-600",
            children: "Cancelar mudança agendada"
          }
        )
      ] }) : /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setModalAberto(true),
          className: "flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-400 hover:to-purple-500",
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            "Mudar plano"
          ]
        }
      )
    ] }),
    modalAberto && /* @__PURE__ */ jsx(
      ModalMudarPlano,
      {
        cicloActual: subscricao.ciclo,
        onClose: () => setModalAberto(false)
      }
    )
  ] });
}
function ModalMudarPlano({ cicloActual, onClose }) {
  const [cicloNovo, setCicloNovo] = useState("");
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cicloLabel = {
    mensal: "Mensal",
    semestral: "Semestral",
    anual: "Anual"
  };
  useEffect(() => {
    var _a;
    if (!cicloNovo) {
      setPreview(null);
      return;
    }
    setLoadingPreview(true);
    fetch(route("subscricao.mudar-plano.preview"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "",
        "Accept": "application/json"
      },
      body: JSON.stringify({ ciclo_novo: cicloNovo })
    }).then((r) => r.json()).then((data) => {
      setPreview(data);
      setLoadingPreview(false);
    }).catch(() => setLoadingPreview(false));
  }, [cicloNovo]);
  const submit = () => {
    if (!cicloNovo || !(preview == null ? void 0 : preview.valida)) return;
    setSubmitting(true);
    router.post(route("subscricao.mudar-plano"), { ciclo_novo: cicloNovo }, {
      preserveScroll: true,
      onSuccess: onClose,
      onFinish: () => setSubmitting(false)
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6", children: [
    /* @__PURE__ */ jsxs("h3", { className: "mb-2 flex items-center gap-2 text-lg font-bold", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "h-5 w-5 text-blue-400" }),
      " Mudar plano"
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mb-4 text-sm text-zinc-400", children: [
      "Plano actual: ",
      /* @__PURE__ */ jsx("strong", { children: cicloLabel[cicloActual] })
    ] }),
    /* @__PURE__ */ jsx("label", { className: "mb-2 block text-xs font-semibold text-zinc-300", children: "Escolha o novo plano" }),
    /* @__PURE__ */ jsx("div", { className: "mb-4 grid grid-cols-3 gap-2", children: ["mensal", "semestral", "anual"].map((c) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled: c === cicloActual,
        onClick: () => setCicloNovo(c),
        className: `rounded-lg border px-3 py-3 text-sm font-semibold transition ${cicloNovo === c ? "border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/10 text-white" : c === cicloActual ? "border-zinc-800 bg-zinc-950 text-zinc-600 cursor-not-allowed" : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"}`,
        children: [
          cicloLabel[c],
          c === cicloActual && /* @__PURE__ */ jsx("div", { className: "text-[10px] font-normal text-zinc-500 mt-1", children: "Actual" })
        ]
      },
      c
    )) }),
    loadingPreview && /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg bg-zinc-800/50 p-3 text-center text-xs text-zinc-500", children: "A calcular..." }),
    preview && preview.valida && /* @__PURE__ */ jsxs("div", { className: "mb-4 space-y-2", children: [
      preview.tipo === "upgrade" && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-green-500/30 bg-green-500/5 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-green-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-green-300 text-sm", children: "Upgrade imediato" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-300 mb-2", children: "O upgrade aplica-se imediatamente. Será gerada uma factura para concluir o upgrade." }),
        /* @__PURE__ */ jsxs("div", { className: "rounded bg-zinc-900/50 p-3 mt-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Valor a pagar agora" }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-green-300", children: [
              Math.round(preview.pro_rata_estimado_kz ?? 0).toLocaleString("pt-AO"),
              " Kz"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs mt-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-zinc-500", children: "Valor próximo ciclo completo" }),
            /* @__PURE__ */ jsxs("span", { className: "text-zinc-400", children: [
              Math.round(preview.valor_proximo_ciclo_kz ?? 0).toLocaleString("pt-AO"),
              " Kz"
            ] })
          ] })
        ] })
      ] }),
      preview.tipo === "downgrade" && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-orange-500/30 bg-orange-500/5 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx(TrendingDown, { className: "h-4 w-4 text-orange-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-orange-300 text-sm", children: "Downgrade agendado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-300", children: [
          "Mantém o plano actual até",
          " ",
          preview.aplica_em ? new Date(preview.aplica_em).toLocaleDateString("pt-PT") : "—",
          ". A partir dessa data passa para ",
          cicloLabel[preview.ciclo_novo],
          "."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded bg-zinc-900/50 p-3 mt-2", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Valor próximo ciclo" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-orange-300", children: [
            Math.round(preview.valor_proximo_ciclo_kz ?? 0).toLocaleString("pt-AO"),
            " Kz"
          ] })
        ] }) })
      ] })
    ] }),
    preview && !preview.valida && preview.erro && /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300", children: preview.erro }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm", children: "Voltar" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: submit,
          disabled: submitting || !cicloNovo || !(preview == null ? void 0 : preview.valida),
          className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50",
          children: submitting ? "A processar..." : "Confirmar"
        }
      )
    ] })
  ] }) });
}
export {
  Index as default
};
