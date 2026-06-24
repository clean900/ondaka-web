import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Users, Send, Play, XCircle, Square, CheckCircle2, Video, Copy, Mail, MessageSquare, Calendar, MapPin, AlertCircle } from "lucide-react";
import { useState } from "react";
import VotacoesPanel from "./VotacoesPanel-DZjgzv9q.js";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function AssembleiaShow({ assembleia }) {
  const [filtroPart, setFiltroPart] = useState("todos");
  const data = new Date(assembleia.data_agendada);
  const enviarConvocatorias = () => {
    if (!confirm("Enviar email + SMS a todos os condóminos convocados? Consume saldo da feature sms_sender_id.")) return;
    router.post(`/assembleias/${assembleia.id}/convocatorias`);
  };
  const iniciar = () => {
    if (!confirm("Iniciar assembleia agora?")) return;
    router.post(`/assembleias/${assembleia.id}/iniciar`);
  };
  const terminar = () => {
    if (!confirm("Terminar assembleia? Presenças serão consolidadas.")) return;
    router.post(`/assembleias/${assembleia.id}/terminar`);
  };
  const cancelar = () => {
    if (!confirm("Cancelar assembleia? Esta acção não pode ser desfeita.")) return;
    router.post(`/assembleias/${assembleia.id}/cancelar`);
  };
  const copiarLink = () => {
    const url = window.location.origin + `/assembleias/${assembleia.id}/entrar`;
    navigator.clipboard.writeText(url);
    alert("Link copiado!");
  };
  const regenerar = () => {
    if (!confirm("Actualizar lista de participantes com base nos contratos de propriedade actuais? Participantes já convocados serão mantidos.")) return;
    router.post(`/assembleias/${assembleia.id}/regenerar-participantes`);
  };
  const participantesFiltrados = assembleia.participantes.filter((p) => {
    if (filtroPart === "presentes") return p.presente;
    if (filtroPart === "ausentes") return !p.presente;
    return true;
  });
  const estaEmCurso = assembleia.estado === "em_curso";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${assembleia.numero} — ONDAKA` }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-6xl", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/assembleias", className: "inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Voltar"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 mb-6 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100 font-mono", children: assembleia.numero }),
              /* @__PURE__ */ jsx(EstadoBadge, { estado: assembleia.estado, label: assembleia.estado_label })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: assembleia.titulo }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
              assembleia.tipo_label,
              " · ",
              assembleia.condominio.nome
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          assembleia.estado === "agendada" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("button", { onClick: enviarConvocatorias, className: "inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-4 py-2 text-sm", children: [
              /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
              "Enviar convocatórias"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: iniciar, className: "inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-4 py-2 text-sm", children: [
              /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
              "Iniciar"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: cancelar, className: "inline-flex items-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 text-sm", children: [
              /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
              "Cancelar"
            ] })
          ] }),
          estaEmCurso && /* @__PURE__ */ jsxs("button", { onClick: terminar, className: "inline-flex items-center gap-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600 px-4 py-2 text-sm", children: [
            /* @__PURE__ */ jsx(Square, { className: "h-4 w-4" }),
            "Terminar"
          ] }),
          (assembleia.estado === "concluida" || assembleia.estado === "sem_quorum") && /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/assembleias/${assembleia.id}/acta`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 px-4 py-2 text-sm",
              children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
                "Descarregar acta PDF"
              ]
            }
          )
        ] })
      ] }),
      estaEmCurso && assembleia.modo !== "presencial" && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-emerald-500/30 rounded-xl p-5 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-emerald-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Video, { className: "h-4 w-4" }),
            "Sala virtual em curso"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: copiarLink, className: "text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
            "Copiar link de entrada"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center gap-3", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: assembleia.url_jitsi,
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-2.5 text-sm font-semibold",
              children: [
                /* @__PURE__ */ jsx(Video, { className: "h-4 w-4" }),
                "Abrir vídeo numa nova aba"
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 font-mono break-all", children: assembleia.url_jitsi })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Ordem do dia" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-zinc-200 whitespace-pre-line", children: assembleia.ordem_do_dia })
          ] }),
          assembleia.observacoes && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2", children: "Observações" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 whitespace-pre-line", children: assembleia.observacoes })
          ] }),
          /* @__PURE__ */ jsx(
            VotacoesPanel,
            {
              assembleiaId: assembleia.id,
              assembleiaEstado: assembleia.estado,
              pontos: assembleia.pontos_votacao || [],
              podeGerir: assembleia.pode_gerir,
              participantePresente: !!assembleia.participante_actual_id && assembleia.participantes.some(
                (p) => p.id === assembleia.participante_actual_id && p.presente
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-zinc-200", children: [
                "Participantes (",
                assembleia.participantes.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                assembleia.estado === "agendada" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: regenerar,
                    className: "text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 hover:border-cyan-500/50",
                    children: "Actualizar lista"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-1 text-xs", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setFiltroPart("todos"),
                      className: `px-2.5 py-1 rounded-md ${filtroPart === "todos" ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-500 hover:text-zinc-300"}`,
                      children: "Todos"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setFiltroPart("presentes"),
                      className: `px-2.5 py-1 rounded-md ${filtroPart === "presentes" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-500 hover:text-zinc-300"}`,
                      children: [
                        "Presentes (",
                        assembleia.participantes.filter((p) => p.presente).length,
                        ")"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setFiltroPart("ausentes"),
                      className: `px-2.5 py-1 rounded-md ${filtroPart === "ausentes" ? "bg-zinc-500/20 text-zinc-300" : "text-zinc-500 hover:text-zinc-300"}`,
                      children: [
                        "Ausentes (",
                        assembleia.participantes.filter((p) => !p.presente).length,
                        ")"
                      ]
                    }
                  )
                ] })
              ] })
            ] }),
            participantesFiltrados.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-zinc-500", children: "Nenhum participante a mostrar." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800/50", children: participantesFiltrados.map((p) => /* @__PURE__ */ jsxs("div", { className: "p-3 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full shrink-0 ${p.presente ? "bg-emerald-400" : "bg-zinc-700"}` }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200 truncate", children: p.nome }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-zinc-500", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    p.numero_fraccoes,
                    " fracçã",
                    p.numero_fraccoes === 1 ? "o" : "es"
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: "·" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    p.permilagem_total.toFixed(4),
                    "‰"
                  ] }),
                  p.entrou_em && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("span", { children: "·" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-emerald-500/80", children: [
                      "entrou às ",
                      new Date(p.entrou_em).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-1 text-xs", children: [
                p.email_enviado && /* @__PURE__ */ jsx("span", { title: "Email enviado", className: "text-cyan-500/70", children: /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }) }),
                p.sms_enviado && /* @__PURE__ */ jsx("span", { title: "SMS enviado", className: "text-purple-500/70", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }) })
              ] })
            ] }, p.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: `rounded-xl p-5 border ${assembleia.quorum.tem_quorum ? "bg-emerald-500/5 border-emerald-500/30" : "bg-amber-500/5 border-amber-500/30"}`, children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2", children: "Quórum" }),
            /* @__PURE__ */ jsxs("div", { className: `text-2xl font-bold ${assembleia.quorum.tem_quorum ? "text-emerald-400" : "text-amber-400"}`, children: [
              assembleia.quorum.percent_fraccoes,
              "%"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-1", children: [
              assembleia.quorum.fraccoes_presentes,
              " de ",
              assembleia.quorum.total_fraccoes,
              " fracções"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-1", children: [
              "Mínimo: ",
              assembleia.quorum.quorum_minimo,
              "%",
              assembleia.quorum.tem_quorum ? /* @__PURE__ */ jsx("span", { className: "text-emerald-400 ml-2", children: "✓ atingido" }) : /* @__PURE__ */ jsx("span", { className: "text-amber-400 ml-2", children: "⚠ abaixo" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Agendamento" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("dt", { className: "text-xs text-zinc-500 flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
                  "1ª convocatória"
                ] }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: data.toLocaleString("pt-PT") })
              ] }),
              assembleia.data_segunda_convocatoria && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs text-zinc-500", children: "2ª convocatória" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-400", children: new Date(assembleia.data_segunda_convocatoria).toLocaleString("pt-PT") })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("dt", { className: "text-xs text-zinc-500 flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                  "Local"
                ] }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-200", children: assembleia.local })
              ] })
            ] })
          ] }),
          assembleia.convocatorias_enviadas && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Convocatórias" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-1.5 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "Emails" }),
                /* @__PURE__ */ jsx("dd", { className: "text-cyan-400", children: assembleia.convocatorias_enviadas.emails ?? 0 })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-zinc-500", children: "SMS" }),
                /* @__PURE__ */ jsx("dd", { className: "text-purple-400", children: assembleia.convocatorias_enviadas.sms ?? 0 })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-5", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3", children: "Timeline" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
              assembleia.criada_por && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs text-zinc-500", children: "Criada por" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: assembleia.criada_por })
              ] }),
              assembleia.iniciada_em && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs text-emerald-400/80", children: "Iniciada" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: new Date(assembleia.iniciada_em).toLocaleString("pt-PT") })
              ] }),
              assembleia.terminada_em && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs text-zinc-400", children: "Terminada" }),
                /* @__PURE__ */ jsx("dd", { className: "text-zinc-300", children: new Date(assembleia.terminada_em).toLocaleString("pt-PT") })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function EstadoBadge({ estado, label }) {
  const config = {
    agendada: { color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", Icon: Calendar },
    em_curso: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", Icon: Video },
    concluida: { color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", Icon: CheckCircle2 },
    cancelada: { color: "text-red-400 bg-red-500/10 border-red-500/30", Icon: XCircle },
    sem_quorum: { color: "text-amber-400 bg-amber-500/10 border-amber-500/30", Icon: AlertCircle }
  };
  const cfg = config[estado] ?? config.agendada;
  const { Icon } = cfg;
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${cfg.color}`, children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
    label
  ] });
}
export {
  AssembleiaShow as default
};
