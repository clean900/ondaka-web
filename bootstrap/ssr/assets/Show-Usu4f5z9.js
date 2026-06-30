import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, AlertCircle, CreditCard, User, FileText, Receipt, CheckCircle2, XCircle } from "lucide-react";
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
  quota_base: "Quota mensal",
  fundo_reserva: "Fundo reserva",
  despesa_extra: "Despesa extra",
  multa: "Multa"
};
function Show({ pagamento, lancamentos_em_aberto }) {
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
              ((_b = pagamento.condomino) == null ? void 0 : _b.bi_passport) && /* @__PURE__ */ jsx(Field, { label: "BI/Passaporte", children: pagamento.condomino.bi_passport }),
              /* @__PURE__ */ jsx(Field, { label: "Condomínio", children: (_c = pagamento.condominio) == null ? void 0 : _c.nome }),
              /* @__PURE__ */ jsx(Field, { label: "Fracção", children: (_d = pagamento.fraccao) == null ? void 0 : _d.identificador })
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
              " Imputação a lançamentos"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-4", children: podeAccionar ? "Indica quanto deste pagamento vai para cada lançamento. As imputações sugeridas pelo condómino estão pré-preenchidas." : "Imputações finais aplicadas a este pagamento." }),
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
                          "Imputar tudo (",
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
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-400", children: "Total imputado" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-cyan-400", children: formatarKz(totalImputado.toFixed(2)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-400", children: "Não imputado" }),
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
          ] })
        ] })
      ] })
    ] }) })
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
export {
  Show as default
};
