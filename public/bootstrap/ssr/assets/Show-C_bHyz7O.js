import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-TDdsYzgz.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Receipt, ShieldCheck, CircleX, CircleCheck, MessageSquare, File, Building } from "lucide-react";
import { useState } from "react";
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
const ESTADO_STYLES = {
  pendente: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  em_revisao: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  aprovada: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rejeitada: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  cancelada: "bg-zinc-700/30 border-zinc-700 text-zinc-400",
  expirada: "bg-zinc-700/30 border-zinc-700 text-zinc-400"
};
const PAGAMENTO_ESTADOS = {
  registado: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  em_analise: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  confirmado: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rejeitado: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  devolvido: "bg-zinc-700/30 border-zinc-700 text-zinc-400"
};
function AdminOrdensShow({ ordem }) {
  const [showAprovar, setShowAprovar] = useState(false);
  const [showRejeitar, setShowRejeitar] = useState(false);
  const [pagamentoAcao, setPagamentoAcao] = useState(null);
  const formAprovar = useForm({ notas_admin: "" });
  const formRejeitar = useForm({ motivo: "" });
  const formConfirmarPag = useForm({ notas: "" });
  const formRejeitarPag = useForm({ motivo: "" });
  const aprovar = (e) => {
    e.preventDefault();
    formAprovar.post(route("admin.ordens.aprovar", ordem.id), {
      onSuccess: () => setShowAprovar(false)
    });
  };
  const rejeitar = (e) => {
    e.preventDefault();
    formRejeitar.post(route("admin.ordens.rejeitar", ordem.id), {
      onSuccess: () => setShowRejeitar(false)
    });
  };
  const confirmarPagamento = (pagamentoId) => (e) => {
    e.preventDefault();
    formConfirmarPag.post(route("admin.ordens.pagamentos.confirmar", [ordem.id, pagamentoId]), {
      onSuccess: () => setPagamentoAcao(null)
    });
  };
  const rejeitarPagamento = (pagamentoId) => (e) => {
    e.preventDefault();
    formRejeitarPag.post(route("admin.ordens.pagamentos.rejeitar", [ordem.id, pagamentoId]), {
      onSuccess: () => setPagamentoAcao(null)
    });
  };
  const podeGerir = !["aprovada", "rejeitada", "cancelada", "expirada"].includes(ordem.estado);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Admin — ${ordem.numero}` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("admin.ordens.index"),
            className: "inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-3",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Voltar à lista"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5 text-cyan-400" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold text-zinc-100 flex items-center gap-3", children: [
                ordem.numero,
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `text-xs px-2 py-1 rounded-full border ${ESTADO_STYLES[ordem.estado] ?? ""}`,
                    children: ordem.estado_label
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: ordem.tipo_item_label })
            ] })
          ] }),
          podeGerir && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowAprovar(true),
                className: "text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition",
                children: [
                  /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 inline mr-1" }),
                  "Aprovar directamente"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowRejeitar(true),
                className: "text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg px-3 py-1.5 transition",
                children: [
                  /* @__PURE__ */ jsx(CircleX, { className: "h-3.5 w-3.5 inline mr-1" }),
                  "Rejeitar ordem"
                ]
              }
            )
          ] })
        ] })
      ] }),
      ordem.esta_aprovada && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(CircleCheck, { className: "h-5 w-5 text-emerald-400 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-emerald-300", children: "Ordem aprovada" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-emerald-200/80 mt-1", children: [
            "FeatureSubscription #",
            ordem.feature_subscription_id,
            " activada para ",
            ordem.owner.nome,
            ".",
            ordem.aprovada_por && /* @__PURE__ */ jsxs(Fragment, { children: [
              " ",
              "Aprovada por ",
              /* @__PURE__ */ jsx("strong", { children: ordem.aprovada_por }),
              "."
            ] })
          ] })
        ] }),
        ordem.feature_subscription_id && /* @__PURE__ */ jsx(
          Link,
          {
            href: route("admin.features.show", ordem.feature_subscription_id),
            className: "text-xs text-emerald-300 hover:text-emerald-200 underline shrink-0",
            children: "Ver subscription →"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Item" }),
            /* @__PURE__ */ jsx("p", { className: "text-zinc-200 font-medium", children: ordem.descricao_item }),
            ordem.notas_cliente && /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-zinc-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-zinc-500 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mb-1", children: "Notas do cliente" }),
                /* @__PURE__ */ jsx("p", { className: "text-zinc-300", children: ordem.notas_cliente })
              ] })
            ] }) }),
            ordem.notas_admin && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs text-zinc-400 whitespace-pre-wrap", children: [
              /* @__PURE__ */ jsx("strong", { className: "text-zinc-300", children: "Notas admin:" }),
              " ",
              ordem.notas_admin
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-4", children: "Valores" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-400", children: "Valor base" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: formatMoeda(ordem.valor_base) })
              ] }),
              ordem.valor_activacao > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-400", children: "Activação" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: formatMoeda(ordem.valor_activacao) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-400", children: "IVA (14%)" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: formatMoeda(ordem.valor_iva) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-3 border-t border-zinc-800", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-300 font-medium", children: "Total" }),
                /* @__PURE__ */ jsx("dd", { className: "text-lg font-semibold text-zinc-100", children: formatMoeda(ordem.valor_total) })
              ] }),
              ordem.total_pago > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-emerald-400", children: [
                /* @__PURE__ */ jsx("dt", { children: "Pago confirmado" }),
                /* @__PURE__ */ jsx("dd", { children: formatMoeda(ordem.total_pago) })
              ] }),
              ordem.saldo_em_falta > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-amber-400", children: [
                /* @__PURE__ */ jsx("dt", { children: "Em falta" }),
                /* @__PURE__ */ jsx("dd", { children: formatMoeda(ordem.saldo_em_falta) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-4", children: [
              "Pagamentos (",
              ordem.pagamentos.length,
              ")"
            ] }),
            ordem.pagamentos.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-sm text-zinc-500", children: "Cliente ainda não submeteu comprovativo." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: ordem.pagamentos.map((pag) => /* @__PURE__ */ jsxs("div", { className: "border border-zinc-800 rounded-lg p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-zinc-300", children: pag.referencia }),
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `text-[10px] px-2 py-0.5 rounded border ${PAGAMENTO_ESTADOS[pag.estado] ?? ""}`,
                        children: pag.estado_label
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
                    pag.metodo_label,
                    pag.data_transacao && ` · ${new Date(pag.data_transacao).toLocaleDateString("pt-PT")}`
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-base font-semibold text-zinc-100", children: formatMoeda(pag.valor) })
              ] }),
              /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-zinc-800", children: [
                pag.referencia_externa && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Ref. externa" }),
                  /* @__PURE__ */ jsx("dd", { className: "text-zinc-300 font-mono", children: pag.referencia_externa })
                ] }),
                pag.banco_origem && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Banco" }),
                  /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: pag.banco_origem })
                ] }),
                pag.nome_ordenante && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Ordenante" }),
                  /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: pag.nome_ordenante })
                ] })
              ] }),
              pag.tem_comprovativo && /* @__PURE__ */ jsxs(
                "a",
                {
                  href: route("pagamentos.comprovativo", pag.id),
                  target: "_blank",
                  className: "inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mt-3",
                  children: [
                    /* @__PURE__ */ jsx(File, { className: "h-3.5 w-3.5" }),
                    pag.comprovativo_nome,
                    /* @__PURE__ */ jsxs("span", { className: "text-zinc-500", children: [
                      "(",
                      pag.comprovativo_tamanho,
                      ")"
                    ] })
                  ]
                }
              ),
              pag.notas && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 mt-2 italic", children: [
                '"',
                pag.notas,
                '"'
              ] }),
              pag.motivo_rejeicao && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-2 rounded bg-rose-500/5 border border-rose-500/20 text-xs text-rose-300", children: [
                /* @__PURE__ */ jsx("strong", { children: "Rejeitado:" }),
                " ",
                pag.motivo_rejeicao
              ] }),
              ["registado", "em_analise"].includes(pag.estado) && (pagamentoAcao == null ? void 0 : pagamentoAcao.id) !== pag.id && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setPagamentoAcao({ id: pag.id, acao: "confirmar" }),
                    className: "text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5",
                    children: [
                      /* @__PURE__ */ jsx(CircleCheck, { className: "h-3 w-3 inline mr-1" }),
                      "Confirmar"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setPagamentoAcao({ id: pag.id, acao: "rejeitar" }),
                    className: "text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg px-3 py-1.5",
                    children: [
                      /* @__PURE__ */ jsx(CircleX, { className: "h-3 w-3 inline mr-1" }),
                      "Rejeitar"
                    ]
                  }
                )
              ] }),
              (pagamentoAcao == null ? void 0 : pagamentoAcao.id) === pag.id && pagamentoAcao.acao === "confirmar" && /* @__PURE__ */ jsxs(
                "form",
                {
                  onSubmit: confirmarPagamento(pag.id),
                  className: "mt-3 pt-3 border-t border-zinc-800 space-y-2",
                  children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs text-zinc-400", children: "Notas (opcional)" }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        value: formConfirmarPag.data.notas,
                        onChange: (e) => formConfirmarPag.setData("notas", e.target.value),
                        rows: 2,
                        maxLength: 500,
                        className: "w-full rounded bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-200 px-2 py-1.5"
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "submit",
                          disabled: formConfirmarPag.processing,
                          className: "text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded px-3 py-1 disabled:opacity-50",
                          children: formConfirmarPag.processing ? "A confirmar..." : "Confirmar pagamento"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            setPagamentoAcao(null);
                            formConfirmarPag.reset();
                          },
                          className: "text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1",
                          children: "Cancelar"
                        }
                      )
                    ] })
                  ]
                }
              ),
              (pagamentoAcao == null ? void 0 : pagamentoAcao.id) === pag.id && pagamentoAcao.acao === "rejeitar" && /* @__PURE__ */ jsxs(
                "form",
                {
                  onSubmit: rejeitarPagamento(pag.id),
                  className: "mt-3 pt-3 border-t border-zinc-800 space-y-2",
                  children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs text-zinc-400", children: "Motivo da rejeição *" }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        value: formRejeitarPag.data.motivo,
                        onChange: (e) => formRejeitarPag.setData("motivo", e.target.value),
                        rows: 2,
                        maxLength: 500,
                        required: true,
                        placeholder: "Ex: Valor não corresponde, comprovativo inválido...",
                        className: "w-full rounded bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-200 px-2 py-1.5"
                      }
                    ),
                    formRejeitarPag.errors.motivo && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400", children: formRejeitarPag.errors.motivo }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "submit",
                          disabled: formRejeitarPag.processing,
                          className: "text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded px-3 py-1 disabled:opacity-50",
                          children: formRejeitarPag.processing ? "A rejeitar..." : "Rejeitar pagamento"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            setPagamentoAcao(null);
                            formRejeitarPag.reset();
                          },
                          className: "text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1",
                          children: "Cancelar"
                        }
                      )
                    ] })
                  ]
                }
              )
            ] }, pag.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          ordem.factura && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-emerald-400/80 mb-3", children: "Factura emitida" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 mb-3", children: [
              /* @__PURE__ */ jsx(File, { className: "h-4 w-4 text-emerald-400 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-mono text-zinc-200 truncate", children: ordem.factura.numero }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-0.5", children: [
                  ordem.factura.tipo_documento_label,
                  ordem.factura.data_emissao && ` · ${new Date(ordem.factura.data_emissao).toLocaleDateString("pt-PT")}`
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: route("facturas.download", ordem.factura.id),
                target: "_blank",
                className: "text-xs rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 inline-block",
                children: "Abrir PDF"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Cliente" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(Building, { className: "h-4 w-4 text-zinc-500 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsx("p", { className: "text-zinc-200 font-medium", children: ordem.owner.nome }),
                ordem.owner.nif && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
                  "NIF: ",
                  ordem.owner.nif
                ] }),
                ordem.owner.email && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: ordem.owner.email })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Timeline" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Criada" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: new Date(ordem.created_at).toLocaleString("pt-PT") }),
                ordem.criada_por && /* @__PURE__ */ jsxs("dd", { className: "text-zinc-500", children: [
                  "por ",
                  ordem.criada_por
                ] })
              ] }),
              ordem.prazo_pagamento && !ordem.esta_aprovada && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Prazo pagamento" }),
                /* @__PURE__ */ jsx("dd", { className: ordem.expirou ? "text-rose-400" : "text-amber-400", children: new Date(ordem.prazo_pagamento).toLocaleDateString("pt-PT") })
              ] }),
              ordem.aprovada_em && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Aprovada" }),
                /* @__PURE__ */ jsx("dd", { className: "text-emerald-400", children: new Date(ordem.aprovada_em).toLocaleString("pt-PT") })
              ] }),
              ordem.rejeitada_em && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Rejeitada" }),
                /* @__PURE__ */ jsx("dd", { className: "text-rose-400", children: new Date(ordem.rejeitada_em).toLocaleString("pt-PT") })
              ] })
            ] })
          ] }),
          ordem.motivo_rejeicao && /* @__PURE__ */ jsxs("div", { className: "bg-rose-500/5 border border-rose-500/30 rounded-xl p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-rose-300 mb-1", children: "Motivo da rejeição" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-200/80", children: ordem.motivo_rejeicao })
          ] })
        ] })
      ] })
    ] }),
    showAprovar && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: aprovar,
        className: "bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-6 w-6 text-emerald-400" }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-zinc-100", children: "Aprovar directamente" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: "Esta acção aprova a ordem e activa a feature sem confirmar pagamentos individuais. Use apenas em casos excepcionais (ex: pagamento recebido fora do sistema)." }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Justificação *" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: formAprovar.data.notas_admin,
                onChange: (e) => formAprovar.setData("notas_admin", e.target.value),
                rows: 3,
                maxLength: 500,
                required: true,
                placeholder: "Ex: Pagamento confirmado por telefone...",
                className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2"
              }
            ),
            formAprovar.errors.notas_admin && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mt-1", children: formAprovar.errors.notas_admin })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setShowAprovar(false);
                  formAprovar.reset();
                },
                className: "text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2",
                children: "Cancelar"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: formAprovar.processing,
                className: "rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-sm font-medium px-4 py-2 disabled:opacity-50",
                children: formAprovar.processing ? "A aprovar..." : "Aprovar ordem"
              }
            )
          ] })
        ]
      }
    ) }),
    showRejeitar && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: rejeitar,
        className: "bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(CircleX, { className: "h-6 w-6 text-rose-400" }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-zinc-100", children: "Rejeitar ordem" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: "O cliente será notificado por email com o motivo. Esta acção não pode ser revertida." }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Motivo *" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: formRejeitar.data.motivo,
                onChange: (e) => formRejeitar.setData("motivo", e.target.value),
                rows: 3,
                maxLength: 500,
                required: true,
                className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2"
              }
            ),
            formRejeitar.errors.motivo && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mt-1", children: formRejeitar.errors.motivo })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setShowRejeitar(false);
                  formRejeitar.reset();
                },
                className: "text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2",
                children: "Cancelar"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: formRejeitar.processing,
                className: "rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-sm font-medium px-4 py-2 disabled:opacity-50",
                children: formRejeitar.processing ? "A rejeitar..." : "Rejeitar ordem"
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
export {
  AdminOrdensShow as default
};
