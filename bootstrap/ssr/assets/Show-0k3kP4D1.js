import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, AlertCircle, CreditCard, User, FileText, Receipt, CheckCircle2, XCircle, Wallet, Send, RotateCcw, X, Loader2 } from "lucide-react";
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
const formatarData = (data) => {
  return new Date(data).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
};
const formatarDataHora = (data) => {
  return new Date(data).toLocaleString("pt-PT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const metodoLabel = {
  transferencia_bancaria: "Transferência bancária",
  deposito_bancario: "Depósito bancário",
  proxypay_rps: "Multicaixa Express",
  dinheiro: "Dinheiro",
  outro: "Outro"
};
const tipoLabel = {
  quota_base: "Taxa de Condomínio",
  fundo_reserva: "Fundo comum de reserva",
  despesa_extra: "Despesa extra",
  multa: "Penalização"
};
function Show({ pagamento, lancamentos_em_aberto, creditos_fraccao }) {
  var _a, _b, _c, _d, _e, _f, _g;
  const [imputacoes, setImputacoes] = useState(() => {
    var _a2;
    const inicial = {};
    (_a2 = pagamento.imputacoes) == null ? void 0 : _a2.forEach((i) => {
      inicial[i.lancamento_id] = i.valor;
    });
    return inicial;
  });
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [showRejeitar, setShowRejeitar] = useState(false);
  const totalImputado = Object.values(imputacoes).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const valorPagamento = parseFloat(pagamento.valor);
  const diff = valorPagamento - totalImputado;
  const podeAccionar = pagamento.estado === "pendente" || pagamento.estado === "em_revisao";
  const podeReverter = pagamento.estado === "confirmado";
  const [showDevolver, setShowDevolver] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [creditoModal, setCreditoModal] = useState(null);
  const [motivoDevolver, setMotivoDevolver] = useState("");
  const [motivoConverter, setMotivoConverter] = useState("");
  const handleImputacaoChange = (lancamentoId, valor) => {
    const next = { ...imputacoes };
    if (valor === "" || valor === "0") {
      delete next[lancamentoId];
    } else {
      next[lancamentoId] = valor;
    }
    setImputacoes(next);
  };
  const handleConfirmar = (e) => {
    e.preventDefault();
    const imputacoesArray = Object.entries(imputacoes).filter(([_, v]) => parseFloat(v) > 0).map(([id, v]) => ({ lancamento_id: parseInt(id), valor: v }));
    router.post(route("pagamentos.confirmar", pagamento.id), {
      imputacoes: imputacoesArray.length > 0 ? imputacoesArray : null
    });
  };
  const handleDevolver = (e) => {
    e.preventDefault();
    if (motivoDevolver.length < 5) return;
    router.post(route("pagamentos.devolver", pagamento.id), {
      motivo: motivoDevolver
    });
  };
  const handleConverter = (e) => {
    e.preventDefault();
    if (motivoConverter.length < 5) return;
    router.post(route("pagamentos.converter-credito", pagamento.id), {
      motivo: motivoConverter
    });
  };
  const handleRejeitar = (e) => {
    e.preventDefault();
    if (motivoRejeicao.length < 5) return;
    router.post(route("pagamentos.rejeitar", pagamento.id), {
      motivo: motivoRejeicao
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Pagamento ${pagamento.referencia}` }),
    /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("pagamentos.index"),
          className: "inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }),
            " Voltar"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: pagamento.referencia }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mt-1", children: [
            "Submetido em ",
            formatarDataHora(pagamento.data_pagamento)
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx(EstadoBadge, { estado: pagamento.estado }) })
      ] }),
      pagamento.estado === "rejeitado" && pagamento.motivo_rejeicao && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "text-red-400 flex-shrink-0", size: 18 }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-red-400 font-semibold text-sm", children: "Pagamento rejeitado" }),
          /* @__PURE__ */ jsx("div", { className: "text-red-300/80 text-sm mt-1", children: pagamento.motivo_rejeicao })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-white mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CreditCard, { size: 16 }),
              " Detalhes"
            ] }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-sm", children: [
              /* @__PURE__ */ jsx(Field, { label: "Valor", children: /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-white", children: formatarKz(pagamento.valor) }) }),
              /* @__PURE__ */ jsx(Field, { label: "Método", children: metodoLabel[pagamento.metodo] || pagamento.metodo }),
              /* @__PURE__ */ jsx(Field, { label: "Data pagamento", children: formatarData(pagamento.data_pagamento) }),
              pagamento.referencia_externa && /* @__PURE__ */ jsx(Field, { label: "Ref. externa", children: pagamento.referencia_externa }),
              pagamento.banco_origem && /* @__PURE__ */ jsx(Field, { label: "Banco origem", children: pagamento.banco_origem }),
              pagamento.notas_condomino && /* @__PURE__ */ jsx(Field, { label: "Notas condómino", children: pagamento.notas_condomino })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-white mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(User, { size: 16 }),
              " Condómino"
            ] }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-sm", children: [
              /* @__PURE__ */ jsx(Field, { label: "Nome", children: (_a = pagamento.condomino) == null ? void 0 : _a.nome_completo }),
              ((_b = pagamento.condomino) == null ? void 0 : _b.numero_bi) && /* @__PURE__ */ jsx(Field, { label: "BI/Passaporte", children: pagamento.condomino.numero_bi }),
              /* @__PURE__ */ jsx(Field, { label: "Condomínio", children: (_c = pagamento.condominio) == null ? void 0 : _c.nome }),
              /* @__PURE__ */ jsx(Field, { label: "Imóvel", children: (_d = pagamento.fraccao) == null ? void 0 : _d.identificador })
            ] })
          ] }),
          pagamento.comprovativo_url && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-white mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(FileText, { size: 16 }),
              " Comprovativo"
            ] }),
            ((_e = pagamento.comprovativo_mime) == null ? void 0 : _e.startsWith("image/")) ? /* @__PURE__ */ jsx("a", { href: pagamento.comprovativo_url, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: pagamento.comprovativo_url,
                alt: "Comprovativo",
                className: "rounded-lg w-full hover:opacity-90 transition-opacity cursor-pointer"
              }
            ) }) : /* @__PURE__ */ jsxs(
              "a",
              {
                href: pagamento.comprovativo_url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(FileText, { size: 32, className: "text-cyan-400" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-white truncate", children: pagamento.comprovativo_nome_original || "Abrir comprovativo" }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-400", children: pagamento.comprovativo_mime })
                  ] })
                ]
              }
            )
          ] }),
          pagamento.tem_confirmacao_pdf && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-white mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(FileText, { size: 16 }),
              " Confirmação de Pagamento"
            ] }),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: route("pagamentos.confirmacao-pdf", pagamento.id),
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex items-center gap-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-4 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(FileText, { size: 32, className: "text-cyan-400" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-cyan-300", children: "Descarregar confirmação (PDF)" }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-400", children: "Documento interno — não é recibo fiscal" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-white mb-4", children: "Histórico" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-xs text-zinc-400", children: [
              pagamento.registado_por && /* @__PURE__ */ jsxs("div", { children: [
                "Submetido por ",
                /* @__PURE__ */ jsx("span", { className: "text-white", children: pagamento.registado_por.name })
              ] }),
              pagamento.confirmado_em && /* @__PURE__ */ jsxs("div", { children: [
                "Confirmado em ",
                formatarDataHora(pagamento.confirmado_em),
                " por ",
                /* @__PURE__ */ jsx("span", { className: "text-white", children: (_f = pagamento.confirmado_por) == null ? void 0 : _f.name })
              ] }),
              pagamento.rejeitado_em && /* @__PURE__ */ jsxs("div", { children: [
                "Rejeitado em ",
                formatarDataHora(pagamento.rejeitado_em),
                " por ",
                /* @__PURE__ */ jsx("span", { className: "text-white", children: (_g = pagamento.confirmado_por) == null ? void 0 : _g.name })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-white mb-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Receipt, { size: 16 }),
              " Aplicação a lançamentos"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-4", children: podeAccionar ? "Indica quanto deste pagamento vai para cada lançamento. As aplicações sugeridas pelo condómino estão pré-preenchidas." : "Aplicações finais a este pagamento." }),
            lancamentos_em_aberto.length === 0 && pagamento.imputacoes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-zinc-500 text-sm", children: "Sem lançamentos em aberto nesta fracção." }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              lancamentos_em_aberto.map((l) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `bg-zinc-800/50 rounded-lg p-3 border ${imputacoes[l.id] ? "border-cyan-500/40" : "border-zinc-700/50"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 mb-2", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300", children: tipoLabel[l.tipo] || l.tipo }),
                          l.em_atraso && /* @__PURE__ */ jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400", children: "Em atraso" })
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: "text-sm text-white", children: l.descricao }),
                        /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-400 mt-0.5", children: [
                          "Em dívida: ",
                          /* @__PURE__ */ jsx("span", { className: "text-white", children: formatarKz(l.valor_em_divida) }),
                          l.data_vencimento && ` · Vence ${formatarData(l.data_vencimento)}`
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-right", children: podeAccionar ? /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "number",
                          step: "0.01",
                          min: "0",
                          max: l.valor_em_divida,
                          placeholder: "0,00",
                          value: imputacoes[l.id] || "",
                          onChange: (e) => handleImputacaoChange(l.id, e.target.value),
                          className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white w-32 text-right focus:outline-none focus:border-cyan-500"
                        }
                      ) : /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-400", children: "—" }) })
                    ] }),
                    podeAccionar && imputacoes[l.id] && /* @__PURE__ */ jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleImputacaoChange(l.id, l.valor_em_divida),
                        className: "text-xs text-cyan-400 hover:text-cyan-300",
                        children: [
                          "Aplicar tudo (",
                          formatarKz(l.valor_em_divida),
                          ")"
                        ]
                      }
                    )
                  ]
                },
                l.id
              )),
              !podeAccionar && pagamento.imputacoes.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: pagamento.imputacoes.map((i) => {
                var _a2;
                return /* @__PURE__ */ jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: ((_a2 = i.lancamento) == null ? void 0 : _a2.descricao) || `Lançamento #${i.lancamento_id}` }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-white", children: formatarKz(i.valor) })
                ] }, i.lancamento_id);
              }) })
            ] }),
            podeAccionar && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-zinc-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-400", children: "Valor do pagamento" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-white", children: formatarKz(pagamento.valor) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-400", children: "Total aplicado" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-cyan-400", children: formatarKz(totalImputado.toFixed(2)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-400", children: "Não aplicado" }),
                /* @__PURE__ */ jsx("span", { className: `text-sm font-bold ${Math.abs(diff) < 0.01 ? "text-emerald-400" : "text-amber-400"}`, children: formatarKz(diff.toFixed(2)) })
              ] })
            ] })
          ] }),
          podeAccionar && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-white mb-4", children: "Acções" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsx("form", { onSubmit: handleConfirmar, children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "submit",
                  className: "w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(CheckCircle2, { size: 16 }),
                    " Confirmar pagamento"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setShowRejeitar(!showRejeitar),
                  className: "w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(XCircle, { size: 16 }),
                    " Rejeitar"
                  ]
                }
              )
            ] }),
            showRejeitar && /* @__PURE__ */ jsxs("form", { onSubmit: handleRejeitar, className: "mt-4 space-y-2", children: [
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: motivoRejeicao,
                  onChange: (e) => setMotivoRejeicao(e.target.value),
                  placeholder: "Motivo da rejeição (mínimo 5 caracteres)...",
                  rows: 3,
                  className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: motivoRejeicao.length < 5,
                  className: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed",
                  children: "Confirmar rejeição"
                }
              )
            ] })
          ] }),
          creditos_fraccao && creditos_fraccao.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-emerald-500/20 rounded-xl p-5 mt-4", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-white mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Wallet, { size: 16, className: "text-emerald-400" }),
              " Créditos da fracção"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-3", children: "Saldos disponíveis neste imóvel, podem ser usados em lançamentos em aberto." }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: creditos_fraccao.map((c) => /* @__PURE__ */ jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-sm font-semibold text-white", children: [
                  "Crédito #",
                  c.id
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-400 truncate", children: c.descricao })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right flex-shrink-0", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-emerald-400", children: formatarKz(c.saldo) }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setCreditoModal(c),
                    disabled: lancamentos_em_aberto.length === 0,
                    className: "mt-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5",
                    children: [
                      /* @__PURE__ */ jsx(Send, { size: 12 }),
                      " Usar"
                    ]
                  }
                )
              ] })
            ] }, c.id)) })
          ] }),
          podeReverter && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-white mb-1", children: "Reverter pagamento" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-4", children: "Em caso de erro ou devolução. Aplicações desfeitas, lançamentos voltam ao estado original." }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setShowDevolver(!showDevolver),
                  className: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(RotateCcw, { size: 16 }),
                    " Devolver dinheiro"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setShowConverter(!showConverter),
                  className: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Wallet, { size: 16 }),
                    " Manter como saldo"
                  ]
                }
              )
            ] }),
            showDevolver && /* @__PURE__ */ jsxs("form", { onSubmit: handleDevolver, className: "mt-4 space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-orange-300/80", children: "Indica que o dinheiro foi (ou será) devolvido fisicamente." }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: motivoDevolver,
                  onChange: (e) => setMotivoDevolver(e.target.value),
                  placeholder: "Motivo da devolução (mínimo 5 caracteres)...",
                  rows: 3,
                  className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: motivoDevolver.length < 5,
                  className: "bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed",
                  children: "Confirmar devolução"
                }
              )
            ] }),
            showConverter && /* @__PURE__ */ jsxs("form", { onSubmit: handleConverter, className: "mt-4 space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-300/80", children: "O valor fica como saldo do imóvel, disponível para usar em pagamentos futuros." }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: motivoConverter,
                  onChange: (e) => setMotivoConverter(e.target.value),
                  placeholder: "Motivo (mínimo 5 caracteres)...",
                  rows: 3,
                  className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: motivoConverter.length < 5,
                  className: "bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed",
                  children: "Confirmar conversão em saldo"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    creditoModal && /* @__PURE__ */ jsx(
      ModalUsarCreditoPagamento,
      {
        credito: creditoModal,
        lancamentos: lancamentos_em_aberto,
        onClose: () => setCreditoModal(null)
      }
    )
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("dt", { className: "text-xs text-zinc-500 mb-0.5", children: label }),
    /* @__PURE__ */ jsx("dd", { className: "text-sm text-white", children })
  ] });
}
function EstadoBadge({ estado }) {
  const styles = {
    pendente: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", label: "Pendente" },
    em_revisao: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", label: "Em revisão" },
    confirmado: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", label: "Confirmado" },
    rejeitado: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400", label: "Rejeitado" },
    devolvido: { bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-400", label: "Devolvido" }
  };
  const style = styles[estado] || styles.pendente;
  return /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-lg border ${style.bg} ${style.text} text-sm font-bold`, children: style.label });
}
function ModalUsarCreditoPagamento({ credito, lancamentos, onClose }) {
  var _a, _b;
  const form = useForm({
    lancamento_id: ((_b = (_a = lancamentos[0]) == null ? void 0 : _a.id) == null ? void 0 : _b.toString()) || "",
    valor: ""
  });
  const lancamentoEscolhido = lancamentos.find((l) => l.id.toString() === form.data.lancamento_id);
  const maxValor = lancamentoEscolhido ? Math.min(parseFloat(credito.saldo), parseFloat(lancamentoEscolhido.valor_em_divida)).toFixed(2) : credito.saldo;
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
    /* @__PURE__ */ jsx("div", { className: "bg-zinc-800/50 rounded-lg p-3 mb-4 text-xs", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Saldo disponível:" }),
      /* @__PURE__ */ jsx("span", { className: "text-emerald-400 font-bold", children: formatarKz(credito.saldo) })
    ] }) }),
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
          formatarKz(l.valor_em_divida)
        ] }, l.id)) }),
        form.errors.lancamento_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.lancamento_id })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: [
          "Valor (Kz) — máx: ",
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
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => form.setData("valor", maxValor), className: "px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-xs font-semibold", children: "Máx" })
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
export {
  Show as default
};
