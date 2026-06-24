import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Building, Mail, Phone, Clock, RefreshCw, PenLine } from "lucide-react";
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
function AdminSubscricoesShow({
  subscricao,
  empresa,
  periodos,
  preco_mensal,
  preco_anual
}) {
  const [modalTrialAberto, setModalTrialAberto] = useState(false);
  const [modalPrecoAberto, setModalPrecoAberto] = useState(false);
  const formTrial = useForm({ dias: 7 });
  const formPreco = useForm({
    preco_customizado_por_fraccao: subscricao.preco_customizado_por_fraccao ?? "",
    nota_preco_customizado: subscricao.nota_preco_customizado ?? ""
  });
  const reactivar = () => {
    if (confirm("Reactivar subscrição? A empresa voltará ao estado activa.")) {
      router.post(`/admin/subscricoes/${subscricao.id}/reactivar`);
    }
  };
  const submeterTrial = (e) => {
    e.preventDefault();
    formTrial.post(`/admin/subscricoes/${subscricao.id}/estender-trial`, {
      onSuccess: () => setModalTrialAberto(false)
    });
  };
  const submeterPreco = (e) => {
    e.preventDefault();
    formPreco.patch(`/admin/subscricoes/${subscricao.id}/preco-customizado`, {
      onSuccess: () => setModalPrecoAberto(false)
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Subscrição — ${(empresa == null ? void 0 : empresa.nome) ?? ""}` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/subscricoes",
          className: "inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx(Building, { className: "w-4 h-4 text-white/50" }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-white/60", children: [
              "#",
              subscricao.id
            ] })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white", children: (empresa == null ? void 0 : empresa.nome) ?? "—" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-white/60", children: [
            (empresa == null ? void 0 : empresa.email_contacto) && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5" }),
              empresa.email_contacto
            ] }),
            (empresa == null ? void 0 : empresa.telefone) && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Phone, { className: "w-3.5 h-3.5" }),
              empresa.telefone
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: "px-2.5 py-1 rounded-lg bg-white/10 text-sm text-white", children: subscricao.estado_label }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        (subscricao.estado === "trial" || subscricao.estado === "grace") && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalTrialAberto(true),
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#8FE7FF] text-sm hover:bg-[#00D4FF]/15 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
              "Estender trial"
            ]
          }
        ),
        subscricao.estado === "suspensa" && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: reactivar,
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm hover:bg-emerald-500/15 transition-colors",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
              "Reactivar"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalPrecoAberto(true),
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors",
            children: [
              /* @__PURE__ */ jsx(PenLine, { className: "w-4 h-4" }),
              "Preço customizado"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(InfoCard, { titulo: "Estado", children: [
          /* @__PURE__ */ jsx(InfoRow, { label: "Estado", valor: subscricao.estado_label }),
          /* @__PURE__ */ jsx(InfoRow, { label: "Ciclo", valor: subscricao.ciclo_label }),
          /* @__PURE__ */ jsx(InfoRow, { label: "Dia aniversário", valor: `Dia ${subscricao.dia_aniversario}` }),
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Renovação automática",
              valor: subscricao.renovacao_automatica ? "Sim" : "Não"
            }
          ),
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Converteu do trial",
              valor: subscricao.converteu_do_trial ? "Sim" : "Não"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(InfoCard, { titulo: "Datas", children: [
          /* @__PURE__ */ jsx(InfoRow, { label: "Trial começou", valor: formatDataHora(subscricao.trial_inicia_em) }),
          /* @__PURE__ */ jsx(InfoRow, { label: "Trial expira", valor: formatDataHora(subscricao.trial_expira_em) }),
          /* @__PURE__ */ jsx(InfoRow, { label: "Grace expira", valor: formatDataHora(subscricao.grace_expira_em) }),
          /* @__PURE__ */ jsx(InfoRow, { label: "Activa desde", valor: formatDataHora(subscricao.activa_desde) }),
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Período actual até",
              valor: formatDataHora(subscricao.periodo_actual_fim)
            }
          ),
          subscricao.cancelada_em && /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Cancelada em",
              valor: formatDataHora(subscricao.cancelada_em)
            }
          )
        ] }),
        preco_mensal && /* @__PURE__ */ jsxs(InfoCard, { titulo: "Preço actual (cálculo)", children: [
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Nº fracções",
              valor: String(preco_mensal.numero_fraccoes)
            }
          ),
          /* @__PURE__ */ jsx(InfoRow, { label: "Escalão", valor: preco_mensal.escalao_nome ?? "—" }),
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Preço/fracção",
              valor: formatMoeda(preco_mensal.preco_por_fraccao)
            }
          ),
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Valor mensal",
              valor: formatMoeda(preco_mensal.valor_mensal),
              destaque: true
            }
          ),
          preco_anual && /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: `Valor anual (−${preco_anual.desconto_pct}%)`,
              valor: formatMoeda(preco_anual.valor_anual ?? 0),
              destaque: true
            }
          )
        ] }),
        subscricao.preco_customizado_por_fraccao && /* @__PURE__ */ jsxs(InfoCard, { titulo: "Preço customizado", children: [
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Por fracção",
              valor: formatMoeda(subscricao.preco_customizado_por_fraccao),
              destaque: true
            }
          ),
          /* @__PURE__ */ jsx(
            InfoRow,
            {
              label: "Desconto anual",
              valor: `${subscricao.desconto_anual_pct}%`
            }
          ),
          subscricao.nota_preco_customizado && /* @__PURE__ */ jsx(InfoRow, { label: "Nota", valor: subscricao.nota_preco_customizado })
        ] })
      ] }),
      periodos.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b border-white/10", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-white", children: "Histórico de períodos" }) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-white/[0.02]", children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-[11px] uppercase tracking-wide text-white/50", children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Período" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Ciclo" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Fracções" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Total" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-2 font-medium", children: "Estado" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: periodos.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-white/5", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-2 text-white/80", children: [
              formatDataHora(p.inicio_em),
              " → ",
              formatDataHora(p.fim_em)
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-white/70", children: p.ciclo }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-white/70", children: p.fraccoes_cobradas }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 font-medium text-white", children: formatMoeda(p.valor_total) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: `text-[11px] px-2 py-0.5 rounded ${p.estado === "pago" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`,
                children: p.estado
              }
            ) })
          ] }, p.id)) })
        ] }) })
      ] })
    ] }),
    modalTrialAberto && /* @__PURE__ */ jsx(Modal, { onClose: () => setModalTrialAberto(false), titulo: "Estender trial", children: /* @__PURE__ */ jsxs("form", { onSubmit: submeterTrial, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm text-white/80 block mb-2", children: "Dias adicionais" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: 1,
            max: 90,
            value: formTrial.data.dias,
            onChange: (e) => formTrial.setData("dias", parseInt(e.target.value || "0")),
            className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          }
        ),
        formTrial.errors.dias && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: formTrial.errors.dias })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setModalTrialAberto(false),
            className: "px-3 py-2 text-sm text-white/70 hover:text-white",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: formTrial.processing,
            className: "px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] transition-colors disabled:opacity-50",
            children: "Estender"
          }
        )
      ] })
    ] }) }),
    modalPrecoAberto && /* @__PURE__ */ jsx(Modal, { onClose: () => setModalPrecoAberto(false), titulo: "Preço customizado", children: /* @__PURE__ */ jsxs("form", { onSubmit: submeterPreco, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm text-white/80 block mb-2", children: "Preço por fracção (Kz)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            step: "0.01",
            min: 0,
            value: formPreco.data.preco_customizado_por_fraccao,
            onChange: (e) => formPreco.setData(
              "preco_customizado_por_fraccao",
              e.target.value
            ),
            placeholder: "Vazio para usar tabela",
            className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mt-1", children: "Deixar vazio para usar os escalões standard." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm text-white/80 block mb-2", children: "Nota (opcional)" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            rows: 2,
            value: formPreco.data.nota_preco_customizado,
            onChange: (e) => formPreco.setData("nota_preco_customizado", e.target.value),
            className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white",
            placeholder: "Ex: Contrato Enterprise Boa Vida, aprovado em..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setModalPrecoAberto(false),
            className: "px-3 py-2 text-sm text-white/70 hover:text-white",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: formPreco.processing,
            className: "px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] transition-colors disabled:opacity-50",
            children: "Guardar"
          }
        )
      ] })
    ] }) })
  ] });
}
function InfoCard({ titulo, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-xs uppercase tracking-wide text-white/50 mb-3", children: titulo }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children })
  ] });
}
function InfoRow({
  label,
  valor,
  destaque
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3 text-sm", children: [
    /* @__PURE__ */ jsx("span", { className: "text-white/60", children: label }),
    /* @__PURE__ */ jsx("span", { className: destaque ? "text-[#8FE7FF] font-medium" : "text-white", children: valor })
  ] });
}
function Modal({
  titulo,
  children,
  onClose
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-full max-w-md rounded-2xl bg-[#0A0A1A] border border-white/10 p-6",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-white mb-4", children: titulo }),
            children
          ]
        }
      )
    }
  );
}
export {
  AdminSubscricoesShow as default
};
