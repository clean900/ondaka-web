import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-ChtKe8ca.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { Archive, CheckCircle2, Clock, FileText, ArrowLeft, Megaphone, AlertCircle, Tag, Paperclip, MessageSquare, Send, Eye, Users, User, Calendar } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_CONFIG = {
  rascunho: { label: "Rascunho", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: FileText },
  agendado: { label: "Agendado", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Clock },
  publicado: { label: "Publicado", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  arquivado: { label: "Arquivado", color: "text-zinc-500 bg-zinc-700/20 border-zinc-700/30", icon: Archive }
};
const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30" },
  media: { label: "Média", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  alta: { label: "Alta", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  urgente: { label: "Urgente", color: "text-red-400 bg-red-500/10 border-red-500/30" }
};
const CATEGORIA_LABEL = {
  geral: "Geral",
  manutencao: "Manutenção",
  reuniao: "Reunião",
  urgente: "Urgente",
  evento: "Evento",
  aviso_legal: "Aviso legal",
  outro: "Outro"
};
const SEGMENTO_LABEL = {
  todos: "Todos os condóminos",
  fraccao: "Imóvel",
  bloco: "Bloco",
  grupo: "Grupo"
};
function AvisosShow({ aviso, estatisticas }) {
  const estadoCfg = ESTADO_CONFIG[aviso.estado] ?? ESTADO_CONFIG.rascunho;
  const EstadoIcon = estadoCfg.icon;
  const prioCfg = PRIORIDADE_CONFIG[aviso.prioridade] ?? PRIORIDADE_CONFIG.media;
  const formComentario = useForm({ mensagem: "" });
  const formatarData = (iso) => {
    if (!iso) return "—";
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
    formComentario.post(`/avisos/${aviso.id}/comentarios`, {
      preserveScroll: true,
      onSuccess: () => formComentario.reset("mensagem")
    });
  };
  const publicar = () => {
    if (!confirm("Publicar este aviso? Os condóminos serão notificados.")) return;
    router.post(`/avisos/${aviso.id}/publicar`, {}, { preserveScroll: true });
  };
  const arquivar = () => {
    if (!confirm("Arquivar este aviso? Deixa de aparecer nas listas ativas.")) return;
    router.post(`/avisos/${aviso.id}/arquivar`, {}, { preserveScroll: true });
  };
  const comentarios = aviso.todos_comentarios ?? [];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Aviso #${aviso.id} — ONDAKA` }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/avisos",
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
              /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Megaphone, { className: "h-6 w-6 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500 mb-1", children: [
                  "Aviso #",
                  aviso.id
                ] }),
                /* @__PURE__ */ jsx("h1", { className: "text-xl md:text-2xl font-bold text-zinc-100", children: aviso.titulo })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
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
                CATEGORIA_LABEL[aviso.categoria] ?? aviso.categoria
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-zinc-300 whitespace-pre-wrap leading-relaxed", children: aviso.descricao }),
            aviso.anexos && aviso.anexos.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-zinc-800", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Paperclip, { className: "h-3.5 w-3.5" }),
                " Anexos"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: aviso.anexos.map((anexo) => /* @__PURE__ */ jsxs(
                "a",
                {
                  href: anexo.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:border-zinc-700",
                  children: [
                    /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-cyan-400 flex-shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: anexo.nome_original })
                  ]
                },
                anexo.id
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }),
              "Comentários (",
              comentarios.length,
              ")"
            ] }),
            comentarios.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 text-center py-6", children: "Ainda não há comentários neste aviso." }) : /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-6", children: comentarios.map((c) => {
              var _a, _b, _c, _d;
              return /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-purple-300", children: ((_c = (_b = (_a = c.user) == null ? void 0 : _a.name) == null ? void 0 : _b[0]) == null ? void 0 : _c.toUpperCase()) || "?" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-zinc-200", children: ((_d = c.user) == null ? void 0 : _d.name) || "Anónimo" }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-600", children: formatarData(c.created_at) })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 whitespace-pre-wrap", children: c.mensagem })
                ] })
              ] }, c.id);
            }) }),
            aviso.permite_comentarios && /* @__PURE__ */ jsxs("form", { onSubmit: submitComentario, className: "space-y-3 pt-4 border-t border-zinc-800", children: [
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
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsxs(
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
              ) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Ações" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              aviso.estado !== "publicado" && aviso.estado !== "arquivado" && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: publicar,
                  className: "w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium",
                  children: [
                    /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
                    "Publicar agora"
                  ]
                }
              ),
              aviso.estado !== "arquivado" && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: arquivar,
                  className: "w-full inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm font-medium",
                  children: [
                    /* @__PURE__ */ jsx(Archive, { className: "h-4 w-4" }),
                    "Arquivar"
                  ]
                }
              )
            ] })
          ] }),
          aviso.estado === "publicado" && estatisticas && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" }),
              "Leitura"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2 mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-zinc-100", children: estatisticas.total_lidos ?? 0 }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-500 mb-1", children: "leram" })
            ] }),
            aviso.requer_confirmacao && /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 inline text-emerald-400 mr-1" }),
              estatisticas.total_confirmados ?? 0,
              " confirmaram a leitura"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }),
              "Destinatários"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              (aviso.segmentacoes ?? []).map((s) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300", children: [
                SEGMENTO_LABEL[s.tipo] ?? s.tipo,
                s.valor_texto ? `: ${s.valor_texto}` : ""
              ] }, s.id)),
              (aviso.segmentacoes ?? []).length === 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-500", children: "Sem segmentação definida" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Detalhes" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-sm", children: [
              aviso.condominio && /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Condomínio" }),
                  /* @__PURE__ */ jsx("div", { className: "text-zinc-200", children: aviso.condominio.nome })
                ] })
              ] }),
              aviso.autor && /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Autor" }),
                  /* @__PURE__ */ jsx("div", { className: "text-zinc-200", children: aviso.autor.name })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Criado em" }),
                  /* @__PURE__ */ jsx("div", { className: "text-zinc-200", children: formatarData(aviso.created_at) })
                ] })
              ] }),
              aviso.publicado_em && /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "Publicado em" }),
                  /* @__PURE__ */ jsx("div", { className: "text-emerald-300", children: formatarData(aviso.publicado_em) })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  AvisosShow as default
};
