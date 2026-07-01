import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { XCircle, CheckCircle2, Activity, Clock, Inbox, ArrowLeft, Ticket, Heart, Ban, Lock, Globe, AlertCircle, Tag, MessageSquare, EyeOff, Send, UserCheck, User, Briefcase, Home, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_CONFIG = {
  aberto: { label: "Aberto", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Inbox },
  em_analise: { label: "Em análise", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Clock },
  em_curso: { label: "Em curso", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", icon: Activity },
  resolvido: { label: "Resolvido", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  fechado: { label: "Fechado", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: XCircle },
  cancelado: { label: "Cancelado", color: "text-zinc-500 bg-zinc-700/20 border-zinc-700/30", icon: XCircle }
};
const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30" },
  media: { label: "Média", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  alta: { label: "Alta", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  urgente: { label: "Urgente", color: "text-red-400 bg-red-500/10 border-red-500/30" }
};
const CATEGORIA_LABEL = {
  manutencao: "Manutenção",
  limpeza: "Limpeza",
  seguranca: "Segurança",
  ruido: "Ruído",
  agua: "Água",
  electricidade: "Electricidade",
  jardim: "Jardim",
  estacionamento: "Estacionamento",
  reclamacao: "Reclamação",
  sugestao: "Sugestão",
  outro: "Outro"
};
const ESTADOS_DISPONIVEIS = ["aberto", "em_analise", "em_curso", "resolvido", "fechado", "cancelado"];
function TicketShow({ ticket, meta, empresasPrestadoras = [] }) {
  var _a, _b, _c, _d;
  const estadoCfg = ESTADO_CONFIG[ticket.estado];
  const EstadoIcon = estadoCfg.icon;
  const prioCfg = PRIORIDADE_CONFIG[ticket.prioridade];
  const formComentario = useForm({ mensagem: "", publico: true });
  const [atribuiveis, setAtribuiveis] = useState([]);
  const [modoAtribuir, setModoAtribuir] = useState(ticket.atribuido_empresa ? "empresa" : "user");
  const [selecionadoId, setSelecionadoId] = useState(((_a = ticket.atribuido_a) == null ? void 0 : _a.id) ?? null);
  const [empresaSelId, setEmpresaSelId] = useState(((_b = ticket.atribuido_empresa) == null ? void 0 : _b.id) ?? null);
  const [custo, setCusto] = useState(ticket.custo_intervencao != null ? String(ticket.custo_intervencao) : "");
  const [aAtribuir, setAAtribuir] = useState(false);
  useEffect(() => {
    fetch("/tickets/atribuiveis", {
      headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin"
    }).then((r) => r.json()).then((res) => setAtribuiveis(res.data || [])).catch(() => {
    });
  }, []);
  const formatarData = (iso) => {
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const ano = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  };
  const submitComentario = (e) => {
    e.preventDefault();
    if (formComentario.data.mensagem.trim().length < 2) return;
    formComentario.post(`/tickets/${ticket.id}/comentarios`, {
      preserveScroll: true,
      onSuccess: () => formComentario.reset("mensagem")
    });
  };
  const mudarEstado = (novoEstado) => {
    var _a2;
    if (novoEstado === ticket.estado) return;
    if (!confirm(`Mudar estado para "${(_a2 = ESTADO_CONFIG[novoEstado]) == null ? void 0 : _a2.label}"?`)) return;
    router.patch(
      `/tickets/${ticket.id}/estado`,
      { estado: novoEstado },
      { preserveScroll: true }
    );
  };
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [motivoCancelar, setMotivoCancelar] = useState("");
  const [aCancelar, setACancelar] = useState(false);
  const cancelarPedido = () => {
    setACancelar(true);
    router.patch(`/tickets/${ticket.id}/cancelar`, { motivo: motivoCancelar }, {
      preserveScroll: true,
      onSuccess: () => {
        setMostrarModalCancelar(false);
        setMotivoCancelar("");
      },
      onFinish: () => setACancelar(false)
    });
  };
  const podeCancelar = () => {
    var _a2;
    if (ticket.estado === "cancelado") return false;
    const role = meta == null ? void 0 : meta.role;
    const isAdmin = ["super-admin", "admin-empresa", "gestor", "administrador-condominio"].includes(role || "");
    const isAutor = ((_a2 = ticket.aberto_por) == null ? void 0 : _a2.email) === (meta == null ? void 0 : meta.email) || ticket.aberto_por_user_id !== void 0;
    return isAdmin || isAutor;
  };
  const submeterAtribuicao = () => {
    setAAtribuir(true);
    let payload;
    if (modoAtribuir === "user") {
      if (!selecionadoId) {
        payload = { modo: "remover" };
      } else {
        payload = { modo: "user", atribuido_a_user_id: selecionadoId };
      }
    } else {
      if (!empresaSelId) {
        payload = { modo: "remover" };
      } else {
        payload = {
          modo: "empresa",
          atribuido_a_empresa_id: empresaSelId,
          custo_intervencao: custo.trim() === "" ? null : Number(custo)
        };
      }
    }
    router.patch(`/tickets/${ticket.id}/atribuir`, payload, {
      preserveScroll: true,
      onFinish: () => setAAtribuir(false)
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Pedido #${ticket.id} — ONDAKA` }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/tickets",
          className: "inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm mb-4",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Ticket, { className: "h-6 w-6 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500 mb-1", children: [
                  "Pedido #",
                  ticket.id
                ] }),
                /* @__PURE__ */ jsx("h1", { className: "text-xl md:text-2xl font-bold text-zinc-100", children: ticket.titulo })
              ] }),
              (meta == null ? void 0 : meta.is_condomino) && ticket.tipo === "publico" && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => router.post(`/tickets/${ticket.id}/apoiar`, {}, { preserveScroll: true }),
                  className: `inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${meta.ja_apoiei ? "border-pink-500/50 bg-pink-500/15 text-pink-300 hover:bg-pink-500/25" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-pink-500/40 hover:text-pink-300"}`,
                  children: [
                    /* @__PURE__ */ jsx(Heart, { className: `h-4 w-4 ${meta.ja_apoiei ? "fill-pink-500" : ""}` }),
                    meta.ja_apoiei ? "Apoiado" : "Apoiar",
                    /* @__PURE__ */ jsxs("span", { className: "ml-1 text-xs opacity-70", children: [
                      "(",
                      ticket.apoios_count ?? 0,
                      ")"
                    ] })
                  ]
                }
              ),
              !(meta == null ? void 0 : meta.is_condomino) && ticket.tipo === "publico" && (ticket.apoios_count ?? 0) > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-300 px-3 py-2 text-sm font-medium", children: [
                /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4" }),
                ticket.apoios_count,
                " apoio",
                (ticket.apoios_count ?? 0) !== 1 ? "s" : ""
              ] }),
              ticket.estado !== "cancelado" && podeCancelar() && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setMostrarModalCancelar(true),
                  className: "inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-3 py-2 text-sm font-medium transition",
                  children: [
                    /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }),
                    "Cancelar"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
              ticket.tipo === "particular" && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 px-2.5 py-1 text-xs font-medium", children: [
                /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5" }),
                "Particular"
              ] }),
              ticket.tipo === "publico" && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 px-2.5 py-1 text-xs font-medium", children: [
                /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5" }),
                "Público"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoCfg.color}`, children: [
                /* @__PURE__ */ jsx(EstadoIcon, { className: "h-3.5 w-3.5" }),
                estadoCfg.label
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${prioCfg.color}`, children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
                prioCfg.label
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300", children: [
                /* @__PURE__ */ jsx(Tag, { className: "h-3.5 w-3.5" }),
                ((_c = ticket.categoria) == null ? void 0 : _c.nome) ?? CATEGORIA_LABEL[ticket.categoria_legacy ?? ""] ?? "Sem categoria"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-zinc-300 whitespace-pre-wrap leading-relaxed", children: ticket.descricao }),
            ticket.fotos && ticket.fotos.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-2 md:grid-cols-3 gap-2", children: ticket.fotos.map((foto) => /* @__PURE__ */ jsx(
              "a",
              {
                href: foto.url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "block rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700",
                children: /* @__PURE__ */ jsx("img", { src: foto.url, alt: foto.nome_original || `Foto ${foto.id}`, className: "w-full h-32 object-cover" })
              },
              foto.id
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }),
              "Comentários (",
              ((_d = ticket.comentarios) == null ? void 0 : _d.length) || 0,
              ")"
            ] }),
            !ticket.comentarios || ticket.comentarios.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 text-center py-6", children: "Ainda não há comentários neste pedido." }) : /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-6", children: ticket.comentarios.map((c) => {
              var _a2, _b2, _c2, _d2;
              return /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-purple-300", children: ((_c2 = (_b2 = (_a2 = c.user) == null ? void 0 : _a2.name) == null ? void 0 : _b2[0]) == null ? void 0 : _c2.toUpperCase()) || "?" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-zinc-200", children: ((_d2 = c.user) == null ? void 0 : _d2.name) || "Anónimo" }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-600", children: formatarData(c.created_at) }),
                    !c.publico && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5", children: [
                      /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3" }),
                      " Privado"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 whitespace-pre-wrap", children: c.mensagem })
                ] })
              ] }, c.id);
            }) }),
            /* @__PURE__ */ jsxs("form", { onSubmit: submitComentario, className: "space-y-3 pt-4 border-t border-zinc-800", children: [
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: formComentario.data.mensagem,
                  onChange: (e) => formComentario.setData("mensagem", e.target.value),
                  placeholder: "Escreve um comentário...",
                  rows: 3,
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none"
                }
              ),
              formComentario.errors.mensagem && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: formComentario.errors.mensagem }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-400 cursor-pointer", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: formComentario.data.publico,
                      onChange: (e) => formComentario.setData("publico", e.target.checked),
                      className: "rounded"
                    }
                  ),
                  "Visível ao condómino"
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "submit",
                    disabled: formComentario.processing || formComentario.data.mensagem.trim().length < 2,
                    className: "inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60",
                    children: [
                      /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
                      formComentario.processing ? "A enviar..." : "Enviar"
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Mudar estado" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ESTADOS_DISPONIVEIS.map((e) => {
              const cfg = ESTADO_CONFIG[e];
              const Icon = cfg.icon;
              const isActual = e === ticket.estado;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => mudarEstado(e),
                  disabled: isActual,
                  className: `flex items-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${isActual ? `${cfg.color} ring-2 ring-offset-2 ring-offset-zinc-950 ring-current cursor-default` : "text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200"}`,
                  children: [
                    /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
                    cfg.label
                  ]
                },
                e
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(UserCheck, { className: "h-3.5 w-3.5" }),
              "Atribuir"
            ] }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: selecionadoId ?? "",
                onChange: (e) => setSelecionadoId(e.target.value ? parseInt(e.target.value) : null),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 mb-2",
                disabled: aAtribuir,
                style: { display: "none" },
                children: /* @__PURE__ */ jsx("option", { value: "", children: "--" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1 mb-3 p-1 bg-zinc-950 rounded-lg border border-zinc-800", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setModoAtribuir("user"),
                  className: `flex-1 px-3 py-1.5 text-xs font-medium rounded transition ${modoAtribuir === "user" ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400 hover:text-zinc-200"}`,
                  children: "👤 Colaborador"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setModoAtribuir("empresa"),
                  className: `flex-1 px-3 py-1.5 text-xs font-medium rounded transition ${modoAtribuir === "empresa" ? "bg-amber-500/20 text-amber-300" : "text-zinc-400 hover:text-zinc-200"}`,
                  children: "🏢 Empresa"
                }
              )
            ] }),
            modoAtribuir === "user" && /* @__PURE__ */ jsxs(
              "select",
              {
                value: selecionadoId ?? "",
                onChange: (e) => setSelecionadoId(e.target.value ? parseInt(e.target.value) : null),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 mb-2",
                disabled: aAtribuir,
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Sem atribuição" }),
                  atribuiveis.map((u) => /* @__PURE__ */ jsx("option", { value: u.id, children: u.name }, u.id))
                ]
              }
            ),
            modoAtribuir === "empresa" && /* @__PURE__ */ jsxs(
              "select",
              {
                value: empresaSelId ?? "",
                onChange: (e) => setEmpresaSelId(e.target.value ? parseInt(e.target.value) : null),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 mb-2",
                disabled: aAtribuir,
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Sem atribuição" }),
                  empresasPrestadoras.map((e) => /* @__PURE__ */ jsx("option", { value: e.id, children: e.nome }, e.id))
                ]
              }
            ),
            modoAtribuir === "empresa" && empresaSelId != null && /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-[11px] text-zinc-500 mb-1", children: "Custo da intervenção (Kz) — opcional" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: 0,
                  step: "0.01",
                  value: custo,
                  onChange: (e) => setCusto(e.target.value),
                  placeholder: "ex.: 45000",
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                  disabled: aAtribuir
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-zinc-600 mt-1", children: "Alimenta o preço médio do fornecedor no diretório." })
            ] }),
            modoAtribuir === "empresa" && empresasPrestadoras.length === 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mb-2", children: [
              "Sem empresas registadas. ",
              /* @__PURE__ */ jsx("a", { href: "/configuracoes/empresas-prestadoras", className: "text-cyan-400 hover:underline", children: "Criar agora" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: submeterAtribuicao,
                disabled: aAtribuir,
                className: "w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-60",
                children: aAtribuir ? "A guardar..." : "Confirmar atribuição"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Detalhes" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-sm", children: [
              ticket.aberto_por && /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Aberto por" }),
                  /* @__PURE__ */ jsx("div", { className: "text-zinc-200", children: ticket.aberto_por.name })
                ] })
              ] }),
              ticket.atribuido_a && /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Atribuído a" }),
                  /* @__PURE__ */ jsx("div", { className: "text-cyan-300", children: ticket.atribuido_a.name })
                ] })
              ] }),
              ticket.atribuido_empresa && /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(Briefcase, { className: "h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Empresa atribuída" }),
                  /* @__PURE__ */ jsx("div", { className: "text-amber-300", children: ticket.atribuido_empresa.nome })
                ] })
              ] }),
              ticket.fraccao && /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(Home, { className: "h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Imóvel" }),
                  /* @__PURE__ */ jsx("div", { className: "text-zinc-200", children: ticket.fraccao.identificador })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Criado em" }),
                  /* @__PURE__ */ jsx("div", { className: "text-zinc-200", children: formatarData(ticket.created_at) })
                ] })
              ] }),
              ticket.resolvido_em && /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Resolvido em" }),
                  /* @__PURE__ */ jsx("div", { className: "text-emerald-300", children: formatarData(ticket.resolvido_em) })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    mostrarModalCancelar && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto", onClick: () => setMostrarModalCancelar(false), children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Ban, { className: "h-5 w-5 text-red-400" }),
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Cancelar pedido" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setMostrarModalCancelar(false), className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-300", children: [
          "Tem a certeza que pretende cancelar o pedido ",
          /* @__PURE__ */ jsxs("strong", { children: [
            "#",
            ticket.id,
            " ",
            ticket.titulo
          ] }),
          "?"
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Motivo (opcional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: motivoCancelar,
              onChange: (e) => setMotivoCancelar(e.target.value),
              rows: 3,
              placeholder: "Ex: Problema já resolvido, pedido feito por engano...",
              className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white resize-none",
              maxLength: 1e3
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setMostrarModalCancelar(false),
            className: "px-4 py-2 text-sm text-white/60 hover:text-white",
            children: "Voltar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: cancelarPedido,
            disabled: aCancelar,
            className: "px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold disabled:opacity-50",
            children: aCancelar ? "A cancelar..." : "Confirmar cancelamento"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  TicketShow as default
};
