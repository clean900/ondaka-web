import { jsxs, jsx } from "react/jsx-runtime";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { Vote, Plus, Lock, CheckCircle2, Clock, XCircle } from "lucide-react";
function VotacoesPanel({ assembleiaId, assembleiaEstado, pontos, podeGerir, participantePresente }) {
  const [mostrarFormManual, setMostrarFormManual] = useState(false);
  const [tituloManual, setTituloManual] = useState("");
  const [descricaoManual, setDescricaoManual] = useState("");
  const detectar = () => {
    router.post(`/assembleias/${assembleiaId}/votacoes/detectar`);
  };
  const criarManual = () => {
    if (!tituloManual.trim()) return;
    router.post(
      `/assembleias/${assembleiaId}/votacoes/manual`,
      { titulo: tituloManual, descricao: descricaoManual || null },
      {
        onSuccess: () => {
          setMostrarFormManual(false);
          setTituloManual("");
          setDescricaoManual("");
        }
      }
    );
  };
  const abrirVotacao = (pontoId) => {
    if (!confirm("Abrir votação deste ponto? Participantes presentes poderão votar.")) return;
    router.post(`/assembleias/votacoes/${pontoId}/abrir`);
  };
  const fecharVotacao = (pontoId) => {
    if (!confirm("Fechar votação? O resultado será registado definitivamente.")) return;
    router.post(`/assembleias/votacoes/${pontoId}/fechar`);
  };
  const votar = (pontoId, opcao) => {
    const labels = { sim: "SIM", nao: "NÃO", abstencao: "ABSTENÇÃO" };
    if (!confirm(`Confirmar voto: ${labels[opcao]}? Esta acção não pode ser anulada.`)) return;
    router.post(`/assembleias/votacoes/${pontoId}/votar`, { opcao });
  };
  const estaActiva = assembleiaEstado === "em_curso";
  const estaAgendada = assembleiaEstado === "agendada";
  const estaConcluida = assembleiaEstado === "concluida";
  if (pontos.length === 0 && !podeGerir) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Vote, { className: "w-4 h-4 text-purple-400" }),
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-zinc-200", children: [
          "Votações (",
          pontos.length,
          ")"
        ] })
      ] }),
      podeGerir && estaAgendada && pontos.length === 0 && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: detectar,
          className: "text-xs px-3 py-1.5 rounded border border-purple-500/30 text-purple-300 hover:border-purple-500/50 hover:text-purple-200",
          children: "Detectar pontos deliberativos automaticamente"
        }
      ),
      podeGerir && (estaAgendada || estaActiva) && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMostrarFormManual(!mostrarFormManual),
          className: "text-xs px-2.5 py-1 rounded border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-3 h-3" }),
            "Adicionar ponto"
          ]
        }
      )
    ] }),
    mostrarFormManual && /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-zinc-800 bg-zinc-950/50", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Título do ponto" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: tituloManual,
          onChange: (e) => setTituloManual(e.target.value),
          placeholder: "Ex: Aprovação das contas do exercício 2025",
          className: "w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:border-purple-500 focus:outline-none"
        }
      ),
      /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1 mt-3", children: "Descrição (opcional)" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: descricaoManual,
          onChange: (e) => setDescricaoManual(e.target.value),
          rows: 2,
          className: "w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:border-purple-500 focus:outline-none"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setMostrarFormManual(false);
              setTituloManual("");
              setDescricaoManual("");
            },
            className: "text-xs px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: criarManual,
            disabled: !tituloManual.trim(),
            className: "text-xs px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed",
            children: "Criar ponto"
          }
        )
      ] })
    ] }),
    pontos.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-sm text-zinc-500", children: estaAgendada ? "Nenhum ponto de votação ainda. Detecta automaticamente ou adiciona manualmente." : "Sem votações nesta assembleia." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: pontos.map((p) => /* @__PURE__ */ jsx(
      PontoItem,
      {
        ponto: p,
        podeGerir,
        podeVotar: estaActiva && participantePresente,
        onAbrir: () => abrirVotacao(p.id),
        onFechar: () => fecharVotacao(p.id),
        onVotar: (op) => votar(p.id, op),
        mostrarResultado: estaConcluida || p.estado === "encerrado"
      },
      p.id
    )) })
  ] });
}
function PontoItem({
  ponto,
  podeGerir,
  podeVotar,
  onAbrir,
  onFechar,
  onVotar,
  mostrarResultado
}) {
  const totalVotos = ponto.total_votos_sim + ponto.total_votos_nao + ponto.total_votos_abstencao;
  const totalPerm = Number(ponto.permilagem_sim) + Number(ponto.permilagem_nao) + Number(ponto.permilagem_abstencao);
  return /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-600 font-mono", children: [
            "#",
            ponto.ordem
          ] }),
          /* @__PURE__ */ jsx(EstadoPontoBadge, { estado: ponto.estado }),
          ponto.detectado_automaticamente && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded", children: "auto" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200 font-medium", children: ponto.titulo }),
        ponto.descricao && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1 whitespace-pre-line", children: ponto.descricao })
      ] }),
      podeGerir && ponto.estado === "pendente" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onAbrir,
          className: "text-xs px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white whitespace-nowrap",
          children: "Abrir votação"
        }
      ),
      podeGerir && ponto.estado === "em_votacao" && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onFechar,
          className: "text-xs px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white whitespace-nowrap inline-flex items-center gap-1",
          children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }),
            " Fechar votação"
          ]
        }
      )
    ] }),
    ponto.estado === "em_votacao" && podeVotar && !ponto.ja_votou && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-zinc-950/50 border border-purple-500/20 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-2", children: "O teu voto:" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onVotar("sim"),
            className: "flex-1 py-2 text-sm rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30",
            children: "Sim"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onVotar("nao"),
            className: "flex-1 py-2 text-sm rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30",
            children: "Não"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onVotar("abstencao"),
            className: "flex-1 py-2 text-sm rounded bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-300 border border-zinc-600/30",
            children: "Abstenção"
          }
        )
      ] })
    ] }),
    ponto.estado === "em_votacao" && podeVotar && ponto.ja_votou && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 inline-flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5" }),
      " Já votaste neste ponto."
    ] }),
    mostrarResultado && ponto.estado === "encerrado" && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500", children: "Resultado:" }),
        /* @__PURE__ */ jsx(ResultadoBadge, { resultado: ponto.resultado }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500 ml-auto", children: [
          totalVotos,
          " votos · ",
          totalPerm.toFixed(2),
          "‰"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(BarraResultado, { label: "Sim", votos: ponto.total_votos_sim, permilagem: Number(ponto.permilagem_sim), cor: "emerald" }),
        /* @__PURE__ */ jsx(BarraResultado, { label: "Não", votos: ponto.total_votos_nao, permilagem: Number(ponto.permilagem_nao), cor: "rose" }),
        /* @__PURE__ */ jsx(BarraResultado, { label: "Abstenção", votos: ponto.total_votos_abstencao, permilagem: Number(ponto.permilagem_abstencao), cor: "zinc" })
      ] })
    ] }),
    ponto.estado === "em_votacao" && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2 text-xs text-purple-300", children: [
        /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 animate-pulse" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Votação em curso — ",
          totalVotos,
          " votos registados (",
          totalPerm.toFixed(2),
          "‰)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(BarraResultado, { label: "Sim", votos: ponto.total_votos_sim, permilagem: Number(ponto.permilagem_sim), cor: "emerald" }),
        /* @__PURE__ */ jsx(BarraResultado, { label: "Não", votos: ponto.total_votos_nao, permilagem: Number(ponto.permilagem_nao), cor: "rose" }),
        /* @__PURE__ */ jsx(BarraResultado, { label: "Abstenção", votos: ponto.total_votos_abstencao, permilagem: Number(ponto.permilagem_abstencao), cor: "zinc" })
      ] })
    ] })
  ] });
}
function EstadoPontoBadge({ estado }) {
  const config = {
    pendente: { cor: "bg-zinc-500/20 text-zinc-400", label: "Pendente" },
    em_votacao: { cor: "bg-purple-500/20 text-purple-300", label: "A votar" },
    encerrado: { cor: "bg-zinc-600/20 text-zinc-400", label: "Encerrado" }
  };
  const c = config[estado] ?? config.pendente;
  return /* @__PURE__ */ jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded ${c.cor}`, children: c.label });
}
function ResultadoBadge({ resultado }) {
  if (!resultado) return null;
  const config = {
    aprovado: { cor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", label: "Aprovado", Icon: CheckCircle2 },
    rejeitado: { cor: "bg-rose-500/20 text-rose-300 border-rose-500/30", label: "Rejeitado", Icon: XCircle },
    empate: { cor: "bg-amber-500/20 text-amber-300 border-amber-500/30", label: "Empate", Icon: XCircle }
  };
  const c = config[resultado] ?? config.empate;
  const I = c.Icon;
  return /* @__PURE__ */ jsxs("span", { className: `text-xs px-2 py-0.5 rounded border inline-flex items-center gap-1 ${c.cor}`, children: [
    /* @__PURE__ */ jsx(I, { className: "w-3 h-3" }),
    c.label
  ] });
}
function BarraResultado({
  label,
  votos,
  permilagem,
  cor
}) {
  const maxPerm = 1e3;
  const percent = permilagem / maxPerm * 100;
  const corClass = cor === "emerald" ? "bg-emerald-500" : cor === "rose" ? "bg-rose-500" : "bg-zinc-500";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
    /* @__PURE__ */ jsx("span", { className: "w-20 text-zinc-400", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 bg-zinc-800 rounded overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full ${corClass} transition-all`, style: { width: `${Math.min(percent, 100)}%` } }) }),
    /* @__PURE__ */ jsxs("span", { className: "w-24 text-right text-zinc-500 font-mono text-[11px]", children: [
      votos,
      " · ",
      permilagem.toFixed(2),
      "‰"
    ] })
  ] });
}
export {
  VotacoesPanel as default
};
