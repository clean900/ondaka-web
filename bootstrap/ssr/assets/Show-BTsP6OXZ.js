import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DLR7YGWj.js";
import { Head, router, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { CalendarPlus, RefreshCw, XCircle, LogIn, Building2, User, Mail, Phone, MapPin, Calendar, AlertTriangle, Home, Users, Receipt, Activity, ArrowLeft } from "lucide-react";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const fmt = (v) => new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
const fmtData = (v) => {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("pt-PT");
};
const fmtDataHora = (v) => {
  if (!v) return "—";
  return new Date(v).toLocaleString("pt-PT");
};
function Show({ detalhe }) {
  const { empresa, subscricao, facturas, eventos, total_condominios, total_users, mrr_kz, trial_dias_restantes } = detalhe;
  const afiliado = detalhe.afiliado ?? null;
  const afiliadosActivos = detalhe.afiliados_activos ?? [];
  const [afiliadoSel, setAfiliadoSel] = useState("");
  const [modalExtender, setModalExtender] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalMudarPlano, setModalMudarPlano] = useState(false);
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Link, { href: "/super-admin/clientes", className: "text-zinc-500 hover:text-white", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-zinc-100", children: empresa.nome }),
        /* @__PURE__ */ jsx(TipoBadge, { tipo: empresa.tipo_cliente })
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: `Cliente: ${empresa.nome}` }),
        /* @__PURE__ */ jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
            subscricao && subscricao.estado === "trial" && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setModalExtender(true),
                className: "flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-blue-400 hover:to-purple-500",
                children: [
                  /* @__PURE__ */ jsx(CalendarPlus, { className: "h-4 w-4" }),
                  "Estender trial"
                ]
              }
            ),
            subscricao && (subscricao.estado === "activa" || subscricao.estado === "trial") && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setModalMudarPlano(true),
                className: "flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-blue-500",
                children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
                  "Mudar plano"
                ]
              }
            ),
            subscricao && subscricao.estado !== "cancelada" && !subscricao.cancela_no_fim_periodo && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setModalCancelar(true),
                className: "flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-500",
                children: [
                  /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
                  "Cancelar"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => router.post(`/super-admin/clientes/${empresa.id}/login-as`),
                className: "flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-yellow-500 hover:text-yellow-300",
                children: [
                  /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }),
                  "Entrar como"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-3 text-xs uppercase tracking-wider text-zinc-500", children: "Dados" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                  empresa.tipo_cliente === "empresa_gestora" ? /* @__PURE__ */ jsx(Building2, { className: "mt-0.5 h-4 w-4 text-blue-400" }) : /* @__PURE__ */ jsx(User, { className: "mt-0.5 h-4 w-4 text-purple-400" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-100", children: empresa.nome }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500", children: [
                      empresa.documento_tipo,
                      " ",
                      empresa.nif
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-zinc-400", children: [
                  /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }),
                  empresa.email_contacto
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-zinc-400", children: [
                  /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
                  empresa.telefone
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-zinc-400", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
                  empresa.municipio,
                  ", ",
                  empresa.provincia
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-zinc-400", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
                  "Cliente desde ",
                  fmtData(empresa.created_at)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-3 text-xs uppercase tracking-wider text-zinc-500", children: "Subscrição" }),
              subscricao ? /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Estado" }),
                  /* @__PURE__ */ jsx(EstadoBadge, { estado: subscricao.estado })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Ciclo" }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-zinc-200 capitalize", children: subscricao.ciclo })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Imóveis" }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-zinc-200", children: subscricao.num_imoveis })
                ] }),
                subscricao.estado === "trial" && trial_dias_restantes !== null && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-2 text-xs", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-yellow-300 font-semibold", children: [
                    trial_dias_restantes,
                    " dias restantes"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-zinc-400", children: [
                    "Expira ",
                    fmtData(subscricao.trial_expira_em)
                  ] })
                ] }),
                subscricao.cancela_no_fim_periodo && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-red-300 font-semibold flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3" }),
                    " Cancelada"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-zinc-400", children: subscricao.motivo_cancelamento })
                ] })
              ] }) : /* @__PURE__ */ jsx("div", { className: "text-sm text-zinc-500", children: "Sem subscrição activa." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/10 p-5", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-3 text-xs uppercase tracking-wider text-purple-300", children: "MRR estimado" }),
              /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-white", children: [
                fmt(mrr_kz),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-lg text-zinc-400", children: "Kz" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-zinc-400", children: "por mês recorrente" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-1.5 border-t border-zinc-800 pt-3 text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-zinc-400", children: [
                    /* @__PURE__ */ jsx(Home, { className: "h-3 w-3" }),
                    " Condomínios"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: total_condominios })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-zinc-400", children: [
                    /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
                    " Utilizadores"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: total_users })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Programa de Afiliados" }),
              afiliado && /* @__PURE__ */ jsx(Link, { href: `/super-admin/afiliados/${afiliado.id}`, className: "text-xs text-blue-400 hover:underline", children: "Ver afiliado →" })
            ] }),
            afiliado ? /* @__PURE__ */ jsxs("div", { className: "grid gap-3 text-sm md:grid-cols-5", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Indicado por" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-100", children: afiliado.nome }),
                /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs text-zinc-500", children: [
                  afiliado.codigo,
                  " · ",
                  afiliado.estado
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Atribuído" }),
                /* @__PURE__ */ jsx("div", { className: "text-zinc-200", children: fmtData(afiliado.atribuido_em) }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: afiliado.origem === "manual" ? "manualmente" : "via link" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Indicação" }),
                /* @__PURE__ */ jsx("div", { className: "text-zinc-200", children: afiliado.expira_em ? `até ${fmtData(afiliado.expira_em)}` : "vitalícia" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Comissões geradas" }),
                /* @__PURE__ */ jsxs("div", { className: "text-zinc-200", children: [
                  afiliado.comissoes_n,
                  " · ",
                  fmt(afiliado.comissoes_kz),
                  " Kz"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex items-end justify-end", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    if (confirm("Remover a atribuição deste cliente ao afiliado? As comissões já geradas mantêm-se.")) router.post(`/super-admin/afiliados/${afiliado.id}/remover-cliente`, { empresa_id: empresa.id }, { preserveScroll: true });
                  },
                  className: "rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:border-red-500",
                  children: "Remover atribuição"
                }
              ) })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 text-sm text-zinc-400", children: "Este cliente não está ligado a nenhum afiliado. Se foi indicado fora do link (contacto directo, evento), atribua-o aqui — os próximos pagamentos passam a gerar comissão." }),
              /* @__PURE__ */ jsxs("select", { value: afiliadoSel, onChange: (e) => setAfiliadoSel(e.target.value), className: "rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none md:w-72", children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar afiliado activo…" }),
                afiliadosActivos.map((a) => /* @__PURE__ */ jsxs("option", { value: a.id, children: [
                  a.nome,
                  " (",
                  a.codigo,
                  ")"
                ] }, a.id))
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  disabled: !afiliadoSel,
                  onClick: () => router.post(`/super-admin/afiliados/${afiliadoSel}/atribuir-cliente`, { empresa_id: empresa.id, notificar: true }, { preserveScroll: true, onSuccess: () => setAfiliadoSel("") }),
                  className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-50",
                  children: "Atribuir"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsxs("h3", { className: "mb-3 flex items-center gap-2 font-semibold", children: [
                /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4 text-blue-400" }),
                " Últimas facturas"
              ] }),
              facturas.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Sem facturas emitidas." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: facturas.map((f) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg bg-zinc-800/50 p-3 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-100", children: f.numero }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500", children: [
                    "Emitida ",
                    fmtData(f.emitida_em)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxs("div", { className: "font-semibold text-white", children: [
                    fmt(f.valor_total_kz),
                    " Kz"
                  ] }),
                  /* @__PURE__ */ jsx(FacturaEstadoBadge, { estado: f.estado })
                ] })
              ] }, f.id)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-5", children: [
              /* @__PURE__ */ jsxs("h3", { className: "mb-3 flex items-center gap-2 font-semibold", children: [
                /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-green-400" }),
                " Histórico de eventos"
              ] }),
              eventos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Sem eventos registados." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: eventos.map((e) => /* @__PURE__ */ jsxs("div", { className: "border-l-2 border-zinc-700 pl-3 text-sm", children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-200", children: e.descricao }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500", children: [
                  fmtDataHora(e.created_at),
                  " · ",
                  e.tipo
                ] })
              ] }, e.id)) })
            ] })
          ] })
        ] }) }),
        modalExtender && subscricao && /* @__PURE__ */ jsx(ModalExtenderTrial, { subscricaoId: subscricao.id, onClose: () => setModalExtender(false) }),
        modalCancelar && subscricao && /* @__PURE__ */ jsx(ModalCancelar, { subscricaoId: subscricao.id, onClose: () => setModalCancelar(false) }),
        modalMudarPlano && subscricao && /* @__PURE__ */ jsx(ModalMudarPlano, { subscricaoId: subscricao.id, cicloActual: subscricao.ciclo, onClose: () => setModalMudarPlano(false) })
      ]
    }
  );
}
function ModalExtenderTrial({ subscricaoId, onClose }) {
  const { data, setData, post, processing } = useForm({ dias: 7, motivo: "" });
  const submit = (e) => {
    e.preventDefault();
    post(`/super-admin/clientes/subscricao/${subscricaoId}/extender-trial`, {
      onSuccess: onClose
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "mb-2 text-lg font-bold", children: "Estender trial" }),
    /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-zinc-400", children: "Adicione dias ao período de trial." }),
    /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Dias adicionais" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "number",
        min: 1,
        max: 365,
        value: data.dias,
        onChange: (e) => setData("dias", parseInt(e.target.value)),
        className: "mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      }
    ),
    /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Motivo (opcional)" }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        value: data.motivo,
        onChange: (e) => setData("motivo", e.target.value),
        rows: 2,
        className: "mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm", children: "Cancelar" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white", children: processing ? "A processar..." : "Confirmar" })
    ] })
  ] }) });
}
function ModalCancelar({ subscricaoId, onClose }) {
  const { data, setData, post, processing } = useForm({ motivo: "" });
  const submit = (e) => {
    e.preventDefault();
    post(`/super-admin/clientes/subscricao/${subscricaoId}/cancelar`, {
      onSuccess: onClose
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-900 p-6", children: [
    /* @__PURE__ */ jsxs("h3", { className: "mb-2 flex items-center gap-2 text-lg font-bold text-red-300", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
      " Cancelar subscrição"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-zinc-400", children: "A subscrição termina no fim do período pago. O cliente continua a ter acesso até essa data." }),
    /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-semibold text-zinc-300", children: "Motivo *" }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        value: data.motivo,
        onChange: (e) => setData("motivo", e.target.value),
        rows: 3,
        required: true,
        className: "mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm", children: "Voltar" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing || !data.motivo, className: "rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50", children: processing ? "A processar..." : "Confirmar cancelamento" })
    ] })
  ] }) });
}
function ModalMudarPlano({ subscricaoId, cicloActual, onClose }) {
  const { data, setData, post, processing } = useForm({ ciclo: cicloActual });
  const submit = (e) => {
    e.preventDefault();
    post(`/super-admin/clientes/subscricao/${subscricaoId}/mudar-plano`, {
      onSuccess: onClose
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "mb-2 text-lg font-bold", children: "Mudar plano" }),
    /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-zinc-400", children: "Altere o ciclo de pagamento da subscrição." }),
    /* @__PURE__ */ jsx("div", { className: "mb-4 grid grid-cols-3 gap-2", children: ["mensal", "semestral", "anual"].map((c) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setData("ciclo", c),
        className: `rounded-lg border px-3 py-3 text-sm font-semibold transition ${data.ciclo === c ? "border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/10 text-white" : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"}`,
        children: c.charAt(0).toUpperCase() + c.slice(1)
      },
      c
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm", children: "Cancelar" }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing || data.ciclo === cicloActual, className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50", children: processing ? "A processar..." : "Confirmar" })
    ] })
  ] }) });
}
function TipoBadge({ tipo }) {
  if (tipo === "admin_independente") {
    return /* @__PURE__ */ jsx("span", { className: "rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300", children: "Admin Independente" });
  }
  return /* @__PURE__ */ jsx("span", { className: "rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300", children: "Empresa Gestora" });
}
function EstadoBadge({ estado }) {
  const config = {
    trial: { color: "bg-yellow-500/20 text-yellow-300", label: "● Trial" },
    activa: { color: "bg-green-500/20 text-green-300", label: "● Activa" },
    limitado: { color: "bg-orange-500/20 text-orange-300", label: "● Limitado" },
    cancelada: { color: "bg-red-500/20 text-red-300", label: "● Cancelada" }
  };
  const c = config[estado] ?? { color: "bg-zinc-700 text-zinc-300", label: estado };
  return /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-semibold ${c.color}`, children: c.label });
}
function FacturaEstadoBadge({ estado }) {
  const config = {
    emitida: { color: "bg-blue-500/20 text-blue-300", label: "Emitida" },
    paga: { color: "bg-green-500/20 text-green-300", label: "Paga" },
    anulada: { color: "bg-red-500/20 text-red-300", label: "Anulada" },
    vencida: { color: "bg-orange-500/20 text-orange-300", label: "Vencida" }
  };
  const c = config[estado] ?? { color: "bg-zinc-700 text-zinc-300", label: estado };
  return /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.color}`, children: c.label });
}
export {
  Show as default
};
