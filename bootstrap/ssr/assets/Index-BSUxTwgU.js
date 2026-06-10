import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BhN0vln8.js";
import { Head, router, useForm } from "@inertiajs/react";
import { Package, Plus, Settings, AlertCircle, MapPin, AlertTriangle, CheckCircle2, Filter, Search, XCircle, Clock, User, Home, Calendar, X, FileText, DollarSign, Unlock } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_CONFIG = {
  aguarda_chegada: { label: "Aguarda chegada", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Clock },
  aguarda_levantamento: { label: "Na portaria", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", icon: Package },
  entregue: { label: "Entregue", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  multa_aplicada: { label: "Multa aplicada", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: AlertTriangle },
  cancelada: { label: "Cancelada", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: XCircle }
};
const ORIGEM_LABEL = {
  pre_anunciada: "Pré-anunciada",
  sem_aviso: "Sem aviso"
};
function EncomendasIndex({ encomendas, filtros, stats, precisaCondominio, config }) {
  const [form, setForm] = useState(filtros);
  const [encomendaAberta, setEncomendaAberta] = useState(null);
  const [modalConfig, setModalConfig] = useState(false);
  const [modalCobrar, setModalCobrar] = useState(false);
  const [modalDesbloquear, setModalDesbloquear] = useState(false);
  const [modalNova, setModalNova] = useState(false);
  const aplicarFiltros = () => {
    const params = {};
    if (form.estado) params.estado = form.estado;
    if (form.pesquisa) params.pesquisa = form.pesquisa;
    router.get("/encomendas", params, { preserveState: true, preserveScroll: true });
  };
  const limparFiltros = () => {
    setForm({ estado: "", pesquisa: "" });
    router.get("/encomendas", {}, { preserveState: true, preserveScroll: true });
  };
  const formatarDataHora = (iso) => {
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const ano = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Encomendas — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Package, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Encomendas" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              stats.total,
              " encomendas registadas"
            ] })
          ] })
        ] }),
        !precisaCondominio && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setModalNova(true),
              className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                "Nova encomenda"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setModalConfig(true),
              className: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
                "Config"
              ]
            }
          )
        ] })
      ] }),
      precisaCondominio ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-amber-500/10 border border-amber-500/30 p-6 text-center", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-10 w-10 text-amber-400 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-amber-300 font-medium", children: "Selecciona um condomínio activo" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-200/70 mt-1", children: "Para gerir encomendas, define primeiro o condomínio activo no teu perfil." })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [
          /* @__PURE__ */ jsx(StatCard, { label: "Total", valor: stats.total, icon: Package, cor: "text-zinc-300 bg-zinc-500/10" }),
          /* @__PURE__ */ jsx(StatCard, { label: "Na portaria", valor: stats.na_portaria, icon: MapPin, cor: "text-cyan-400 bg-cyan-500/10" }),
          /* @__PURE__ */ jsx(StatCard, { label: "Multa pendente", valor: stats.multa_pendente, icon: AlertTriangle, cor: "text-red-400 bg-red-500/10" }),
          /* @__PURE__ */ jsx(StatCard, { label: "Entregues este mês", valor: stats.entregues_mes, icon: CheckCircle2, cor: "text-emerald-400 bg-emerald-500/10" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 text-zinc-400 text-sm", children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
            "Filtros"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Estado" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: form.estado,
                  onChange: (e) => setForm({ ...form, estado: e.target.value }),
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
                    /* @__PURE__ */ jsx("option", { value: "aguarda_chegada", children: "Aguarda chegada" }),
                    /* @__PURE__ */ jsx("option", { value: "aguarda_levantamento", children: "Na portaria" }),
                    /* @__PURE__ */ jsx("option", { value: "entregue", children: "Entregue" }),
                    /* @__PURE__ */ jsx("option", { value: "multa_aplicada", children: "Multa aplicada" }),
                    /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Cancelada" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Pesquisar" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: form.pesquisa,
                    onChange: (e) => setForm({ ...form, pesquisa: e.target.value }),
                    onKeyDown: (e) => e.key === "Enter" && aplicarFiltros(),
                    placeholder: "Descrição ou nome do condómino...",
                    className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: aplicarFiltros,
                  className: "flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium",
                  children: "Filtrar"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: limparFiltros,
                  className: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm",
                  children: "Limpar"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: encomendas.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
          /* @__PURE__ */ jsx(Package, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-zinc-400 font-medium", children: "Nenhuma encomenda" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-600 mt-1", children: "As encomendas aparecem aqui quando o guarda regista ou os condóminos pré-anunciam." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: encomendas.data.map((e) => {
          const estadoConfig = ESTADO_CONFIG[e.estado];
          const EstadoIcon = estadoConfig.icon;
          return /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setEncomendaAberta(e),
              className: "w-full p-4 md:p-5 hover:bg-zinc-900 text-left transition-colors",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5 text-purple-400" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-zinc-100", children: e.descricao }),
                    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-zinc-500", children: [
                      e.condomino && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
                        e.condomino.nome_completo
                      ] }),
                      e.fraccao && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(Home, { className: "h-3.5 w-3.5" }),
                        "Fracção ",
                        e.fraccao.identificador
                      ] }),
                      e.remetente && /* @__PURE__ */ jsxs("span", { className: "text-zinc-600", children: [
                        "· ",
                        e.remetente
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-600", children: [
                      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
                        "Registada ",
                        formatarDataHora(e.created_at)
                      ] }),
                      /* @__PURE__ */ jsxs("span", { children: [
                        "· ",
                        ORIGEM_LABEL[e.origem]
                      ] }),
                      e.multa_valor_kz && /* @__PURE__ */ jsxs("span", { className: "text-red-400", children: [
                        "· Multa ",
                        Number(e.multa_valor_kz).toLocaleString("pt-AO"),
                        " Kz (",
                        e.multa_estado,
                        ")"
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoConfig.color} flex-shrink-0`, children: [
                  /* @__PURE__ */ jsx(EstadoIcon, { className: "h-3.5 w-3.5" }),
                  estadoConfig.label
                ] })
              ] })
            },
            e.id
          );
        }) }) }),
        encomendas.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-1 mt-4", children: encomendas.links.map((link, i) => /* @__PURE__ */ jsx(
          "button",
          {
            disabled: !link.url,
            onClick: () => link.url && router.get(link.url, {}, { preserveScroll: true }),
            className: `px-3 py-1.5 rounded-lg text-sm ${link.active ? "bg-cyan-500 text-white" : link.url ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-900 text-zinc-600 cursor-not-allowed"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          i
        )) })
      ] }),
      encomendaAberta && /* @__PURE__ */ jsx(
        Drawer,
        {
          encomenda: encomendaAberta,
          onClose: () => setEncomendaAberta(null),
          onCobrarMulta: () => setModalCobrar(true),
          onDesbloquear: () => setModalDesbloquear(true),
          formatarDataHora
        }
      ),
      modalConfig && config && /* @__PURE__ */ jsx(ModalConfig, { config, onClose: () => setModalConfig(false) }),
      modalCobrar && encomendaAberta && /* @__PURE__ */ jsx(
        ModalCobrarMulta,
        {
          encomenda: encomendaAberta,
          onClose: () => setModalCobrar(false),
          onSucesso: () => {
            setModalCobrar(false);
            setEncomendaAberta(null);
          },
          config
        }
      ),
      modalDesbloquear && encomendaAberta && /* @__PURE__ */ jsx(
        ModalDesbloquear,
        {
          encomenda: encomendaAberta,
          onClose: () => setModalDesbloquear(false),
          onSucesso: () => {
            setModalDesbloquear(false);
            setEncomendaAberta(null);
          }
        }
      )
    ] })
  ] });
}
function StatCard({ label, valor, icon: Icon, cor }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
    /* @__PURE__ */ jsx("div", { className: `inline-flex items-center justify-center w-9 h-9 rounded-lg ${cor} mb-2`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-zinc-100", children: valor }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-0.5", children: label })
  ] });
}
function Drawer({ encomenda, onClose, onCobrarMulta, onDesbloquear, formatarDataHora }) {
  const estadoConfig = ESTADO_CONFIG[encomenda.estado];
  const EstadoIcon = estadoConfig.icon;
  const temMultaPendente = encomenda.estado === "multa_aplicada" && encomenda.multa_estado === "pendente";
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 bg-black/60", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-lg bg-zinc-950 border-l border-zinc-800 overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "sticky top-0 bg-zinc-950 border-b border-zinc-800 p-5 flex items-center justify-between z-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-zinc-100", children: "Detalhe" }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-zinc-200", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-5", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoConfig.color}`, children: [
          /* @__PURE__ */ jsx(EstadoIcon, { className: "h-3.5 w-3.5" }),
          estadoConfig.label
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-zinc-100", children: encomenda.descricao }),
          encomenda.remetente && /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500 mt-1", children: [
            "Remetente: ",
            encomenda.remetente
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-zinc-900 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 uppercase tracking-wide mb-2", children: "Destinatário" }),
          encomenda.condomino && /* @__PURE__ */ jsx("p", { className: "text-zinc-100 font-medium", children: encomenda.condomino.nome_completo }),
          encomenda.fraccao && /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mt-0.5", children: [
            "Fracção ",
            encomenda.fraccao.identificador
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-zinc-900 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 uppercase tracking-wide mb-3", children: "Linha do tempo" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Registada" }),
              /* @__PURE__ */ jsx("span", { className: "text-zinc-200", children: formatarDataHora(encomenda.created_at) })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Origem" }),
              /* @__PURE__ */ jsx("span", { className: "text-zinc-200", children: ORIGEM_LABEL[encomenda.origem] })
            ] }),
            encomenda.chegou_em && /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Chegou à portaria" }),
              /* @__PURE__ */ jsx("span", { className: "text-zinc-200", children: formatarDataHora(encomenda.chegou_em) })
            ] }),
            encomenda.recebida_por && /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Recebida por" }),
              /* @__PURE__ */ jsx("span", { className: "text-zinc-200", children: encomenda.recebida_por.name })
            ] }),
            encomenda.multa_aplicada_em && /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Multa aplicada" }),
              /* @__PURE__ */ jsx("span", { className: "text-red-400", children: formatarDataHora(encomenda.multa_aplicada_em) })
            ] }),
            encomenda.levantada_em && /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Levantada em" }),
              /* @__PURE__ */ jsx("span", { className: "text-zinc-200", children: formatarDataHora(encomenda.levantada_em) })
            ] }),
            encomenda.levantada_por && /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Levantada por" }),
              /* @__PURE__ */ jsx("span", { className: "text-zinc-200", children: encomenda.levantada_por })
            ] })
          ] })
        ] }),
        encomenda.multa_valor_kz && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-red-500/5 border border-red-500/20 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-red-300 uppercase tracking-wide mb-2", children: "Multa" }),
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-zinc-100", children: [
            Number(encomenda.multa_valor_kz).toLocaleString("pt-AO"),
            " Kz"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-300 mt-1", children: [
            "Estado: ",
            encomenda.multa_estado
          ] }),
          encomenda.multa_pago_via && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 mt-2", children: [
            "Pago via: ",
            encomenda.multa_pago_via
          ] }),
          encomenda.multa_pago_em && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400", children: [
            "Pago em: ",
            formatarDataHora(encomenda.multa_pago_em)
          ] }),
          encomenda.multa_pago_observacoes && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 mt-2 italic", children: [
            '"',
            encomenda.multa_pago_observacoes,
            '"'
          ] })
        ] }),
        encomenda.notas_guarda && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-zinc-900 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
            "Notas do guarda"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300", children: encomenda.notas_guarda })
        ] }),
        temMultaPendente && /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: onCobrarMulta,
              className: "w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white rounded-lg px-4 py-2.5 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4" }),
                "Cobrar multa"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: onDesbloquear,
              className: "w-full inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg px-4 py-2.5 text-sm",
              children: [
                /* @__PURE__ */ jsx(Unlock, { className: "h-4 w-4" }),
                "Desbloquear sem cobrança"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function ModalConfig({ config, onClose }) {
  const { data, setData, put, processing, errors } = useForm({
    multa_valor_padrao_kz: config.multa_valor_padrao_kz,
    dias_aviso: config.dias_aviso,
    dias_multa: config.dias_multa,
    permite_pagamento_proxypay: config.permite_pagamento_proxypay,
    permite_pagamento_extracto: config.permite_pagamento_extracto,
    permite_pagamento_dinheiro: config.permite_pagamento_dinheiro
  });
  const submit = (e) => {
    e.preventDefault();
    put("/encomendas/config", { onSuccess: () => onClose(), preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-zinc-800 p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-zinc-100 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" }),
          "Configurações"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-zinc-200", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Multa padrão (Kz)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0",
              value: data.multa_valor_padrao_kz,
              onChange: (e) => setData("multa_valor_padrao_kz", e.target.value),
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
            }
          ),
          errors.multa_valor_padrao_kz && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.multa_valor_padrao_kz })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Dias até aviso" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: "30",
                value: data.dias_aviso,
                onChange: (e) => setData("dias_aviso", parseInt(e.target.value)),
                className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
              }
            ),
            errors.dias_aviso && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.dias_aviso })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Dias até multa" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: "60",
                value: data.dias_multa,
                onChange: (e) => setData("dias_multa", parseInt(e.target.value)),
                className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
              }
            ),
            errors.dias_multa && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.dias_multa })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "block text-xs text-zinc-400 mb-2", children: "Vias de pagamento permitidas" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.permite_pagamento_proxypay, onChange: (e) => setData("permite_pagamento_proxypay", e.target.checked) }),
              "ProxyPay"
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.permite_pagamento_extracto, onChange: (e) => setData("permite_pagamento_extracto", e.target.checked) }),
              "Extracto"
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.permite_pagamento_dinheiro, onChange: (e) => setData("permite_pagamento_dinheiro", e.target.checked) }),
              "Dinheiro"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm", children: "Cancelar" }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium disabled:opacity-60", children: "Guardar" })
        ] })
      ] })
    ] })
  ] });
}
function ModalCobrarMulta({ encomenda, onClose, onSucesso, config }) {
  const { data, setData, post, processing, errors } = useForm({
    valor_kz: encomenda.multa_valor_kz || "",
    via: "dinheiro",
    observacoes: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(`/encomendas/${encomenda.id}/cobrar-multa`, {
      onSuccess: () => onSucesso(),
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-zinc-800 p-5", children: /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-zinc-100 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(DollarSign, { className: "h-5 w-5" }),
        "Cobrar multa"
      ] }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Valor (Kz)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0",
              value: data.valor_kz,
              onChange: (e) => setData("valor_kz", e.target.value),
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Via de pagamento" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.via,
              onChange: (e) => setData("via", e.target.value),
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
              children: [
                (config == null ? void 0 : config.permite_pagamento_dinheiro) && /* @__PURE__ */ jsx("option", { value: "dinheiro", children: "Dinheiro" }),
                (config == null ? void 0 : config.permite_pagamento_proxypay) && /* @__PURE__ */ jsx("option", { value: "proxypay", children: "ProxyPay" }),
                (config == null ? void 0 : config.permite_pagamento_extracto) && /* @__PURE__ */ jsx("option", { value: "extracto", children: "Extracto" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Observações" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.observacoes,
              onChange: (e) => setData("observacoes", e.target.value),
              rows: 3,
              placeholder: "Recibo, observações...",
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm", children: "Cancelar" }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium disabled:opacity-60", children: "Registar pagamento" })
        ] })
      ] })
    ] })
  ] });
}
function ModalDesbloquear({ encomenda, onClose, onSucesso }) {
  const { data, setData, post, processing } = useForm({ observacoes: "" });
  const submit = (e) => {
    e.preventDefault();
    post(`/encomendas/${encomenda.id}/desbloquear`, {
      onSuccess: () => onSucesso(),
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-zinc-800 p-5", children: /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-zinc-100 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Unlock, { className: "h-5 w-5" }),
        "Desbloquear sem cobrança"
      ] }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: "A encomenda volta a estar disponível na portaria sem que a multa seja cobrada." }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Razão (opcional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.observacoes,
              onChange: (e) => setData("observacoes", e.target.value),
              rows: 3,
              placeholder: "Justificação para o desbloqueio...",
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm", children: "Cancelar" }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 text-sm font-medium disabled:opacity-60", children: "Desbloquear" })
        ] })
      ] })
    ] })
  ] });
}
export {
  EncomendasIndex as default
};
