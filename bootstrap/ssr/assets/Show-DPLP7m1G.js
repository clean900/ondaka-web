import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Package, Building, User, Plus, Pause, Play, CircleX } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatDataHora(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}
function formatMoeda(valor) {
  return new Intl.NumberFormat("pt-PT").format(valor) + " Kz";
}
function AdminFeaturesShow({ subscription, usages }) {
  const [modalSaldoAberto, setModalSaldoAberto] = useState(false);
  const form = useForm({
    quantidade: "",
    valor_pago: "",
    notas: ""
  });
  const executarAcao = (acao, mensagemConfirm) => {
    if (confirm(mensagemConfirm)) {
      router.post(`/admin/features/${subscription.id}/${acao}`);
    }
  };
  const submeterAdicaoSaldo = (e) => {
    e.preventDefault();
    form.post(`/admin/features/${subscription.id}/adicionar-saldo`, {
      onSuccess: () => {
        setModalSaldoAberto(false);
        form.reset();
      }
    });
  };
  const percentSaldo = subscription.saldo_inicial > 0 ? Math.round(subscription.saldo_actual / subscription.saldo_inicial * 100) : 0;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `#${subscription.id} — ${subscription.feature.nome}` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-6 pt-2", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/features",
          className: "inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx(Package, { className: "w-4 h-4 text-white/50" }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-white/60", children: [
              "#",
              subscription.id
            ] })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white", children: subscription.feature.nome }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 mt-2 text-sm text-white/60", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            subscription.owner.tipo === "empresa" ? /* @__PURE__ */ jsx(Building, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5" }),
            subscription.owner.nome
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "px-2.5 py-1 rounded-lg bg-white/10 text-sm text-white", children: subscription.estado_label })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        subscription.feature.modelo_cobranca === "consumable" && subscription.estado === "activa" && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalSaldoAberto(true),
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm hover:bg-emerald-500/15",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Adicionar saldo"
            ]
          }
        ),
        subscription.estado === "activa" && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => executarAcao("suspender", "Suspender esta feature?"),
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/15",
            children: [
              /* @__PURE__ */ jsx(Pause, { className: "w-4 h-4" }),
              "Suspender"
            ]
          }
        ),
        ["suspensa", "cancelada", "expirada"].includes(subscription.estado) && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => executarAcao("reactivar", "Reactivar esta feature?"),
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#8FE7FF] text-sm hover:bg-[#00D4FF]/15",
            children: [
              /* @__PURE__ */ jsx(Play, { className: "w-4 h-4" }),
              "Reactivar"
            ]
          }
        ),
        subscription.estado !== "cancelada" && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => executarAcao(
              "cancelar",
              "Cancelar esta feature? Esta acção não remove o histórico."
            ),
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/15",
            children: [
              /* @__PURE__ */ jsx(CircleX, { className: "w-4 h-4" }),
              "Cancelar"
            ]
          }
        )
      ] }),
      subscription.feature.modelo_cobranca === "consumable" && subscription.saldo_inicial > 0 && /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60 uppercase tracking-wide", children: "Saldo" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-white/80", children: [
            subscription.saldo_actual.toLocaleString("pt-PT"),
            " /",
            " ",
            subscription.saldo_inicial.toLocaleString("pt-PT"),
            " ",
            subscription.feature.unidade
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `h-full rounded-full ${subscription.saldo_baixo ? "bg-amber-400" : "bg-emerald-400"}`,
            style: { width: `${percentSaldo}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mt-2 text-xs text-white/50", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            subscription.saldo_utilizado.toLocaleString("pt-PT"),
            " utilizados"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            percentSaldo,
            "% disponível"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(InfoCard, { titulo: "Subscription", children: [
          /* @__PURE__ */ jsx(InfoRow, { label: "Estado", valor: subscription.estado_label }),
          /* @__PURE__ */ jsx(InfoRow, { label: "Categoria", valor: subscription.feature.categoria_label }),
          /* @__PURE__ */ jsx(InfoRow, { label: "Modelo", valor: subscription.feature.modelo_cobranca_label }),
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Valor pago total",
              valor: formatMoeda(subscription.valor_pago_total)
            }
          ),
          subscription.renovacao_automatica && /* @__PURE__ */ jsx(InfoRow, { label: "Renovação auto", valor: "Sim" }),
          subscription.recarga_automatica && /* @__PURE__ */ jsx(InfoRow, { label: "Recarga auto", valor: "Sim" })
        ] }),
        /* @__PURE__ */ jsxs(InfoCard, { titulo: "Datas", children: [
          /* @__PURE__ */ jsx(InfoRow, { label: "Activada em", valor: formatDataHora(subscription.activada_em) }),
          subscription.expira_em && /* @__PURE__ */ jsx(InfoRow, { label: "Expira em", valor: formatDataHora(subscription.expira_em) }),
          subscription.cancelada_em && /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Cancelada em",
              valor: formatDataHora(subscription.cancelada_em)
            }
          ),
          subscription.activada_por_nome && /* @__PURE__ */ jsx(InfoRow, { label: "Activada por", valor: subscription.activada_por_nome })
        ] })
      ] }),
      subscription.notas_admin && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-white/50 uppercase tracking-wide mb-2", children: "Notas administrativas" }),
        /* @__PURE__ */ jsx("pre", { className: "text-sm text-white/80 whitespace-pre-wrap font-sans", children: subscription.notas_admin })
      ] }),
      usages.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b border-white/10", children: /* @__PURE__ */ jsxs("h2", { className: "text-sm font-medium text-white", children: [
          "Histórico de consumo (últimas ",
          usages.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-white/[0.02]", children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-[11px] uppercase tracking-wide text-white/50", children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Quando" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Acção" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Quantidade" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Saldo depois" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Utilizador" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: usages.map((u) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-white/5", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-white/70", children: formatDataHora(u.created_at) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-white font-mono text-xs", children: u.acao }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-2 text-white/80", children: [
              "-",
              u.quantidade
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-white/80", children: u.saldo_depois.toLocaleString("pt-PT") }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-white/70", children: u.user_nome ?? "—" })
          ] }, u.id)) })
        ] }) })
      ] })
    ] }),
    modalSaldoAberto && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",
        onClick: () => setModalSaldoAberto(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "w-full max-w-md rounded-2xl bg-[#0A0A1A] border border-white/10 p-6",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-white mb-4", children: "Adicionar saldo" }),
              /* @__PURE__ */ jsxs("form", { onSubmit: submeterAdicaoSaldo, className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-sm text-white/80 block mb-2", children: "Quantidade" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      min: "1",
                      value: form.data.quantidade,
                      onChange: (e) => form.setData("quantidade", e.target.value),
                      className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white",
                      placeholder: `Ex: 500 ${subscription.feature.unidade}`,
                      required: true
                    }
                  )
                ] }),
                subscription.feature.pacotes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-white/[0.03] border border-white/10", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-white/60 mb-2", children: "Pacotes rápidos:" }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: subscription.feature.pacotes.map((p) => /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        form.setData("quantidade", String(p.quantidade));
                        form.setData("valor_pago", String(p.preco));
                      },
                      className: "px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-white/80",
                      children: [
                        p.nome,
                        ": ",
                        p.quantidade,
                        " (",
                        formatMoeda(p.preco),
                        ")"
                      ]
                    },
                    p.id
                  )) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-sm text-white/80 block mb-2", children: "Valor pago (Kz) — opcional" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      step: "0.01",
                      min: "0",
                      value: form.data.valor_pago,
                      onChange: (e) => form.setData("valor_pago", e.target.value),
                      className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white",
                      placeholder: "0"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-sm text-white/80 block mb-2", children: "Notas — opcional" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      rows: 2,
                      value: form.data.notas,
                      onChange: (e) => form.setData("notas", e.target.value),
                      className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setModalSaldoAberto(false),
                      className: "px-3 py-2 text-sm text-white/70",
                      children: "Cancelar"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: form.processing,
                      className: "px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] disabled:opacity-50",
                      children: "Adicionar"
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      }
    )
  ] });
}
function InfoCard({ titulo, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-xs uppercase tracking-wide text-white/50 mb-3", children: titulo }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children })
  ] });
}
function InfoRow({ label, valor }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3 text-sm", children: [
    /* @__PURE__ */ jsx("span", { className: "text-white/60", children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-white", children: valor })
  ] });
}
export {
  AdminFeaturesShow as default
};
