import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BhN0vln8.js";
import { Head, router } from "@inertiajs/react";
import { Clock, Plus, Moon, ToggleRight, ToggleLeft, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const CORES_PREDEFINIDAS = ["#06B6D4", "#A855F7", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];
function Modelos({ turnos }) {
  const [modal, setModal] = useState(null);
  const toggle = (t) => {
    router.patch(`/configuracoes/turnos/${t.id}`, {
      nome: t.nome,
      hora_inicio: t.hora_inicio.slice(0, 5),
      hora_fim: t.hora_fim.slice(0, 5),
      cor_hex: t.cor_hex,
      descricao: t.descricao,
      ativo: !t.ativo
    }, { preserveScroll: true, onSuccess: () => toast.success("Estado actualizado.") });
  };
  const eliminar = (t) => {
    if (!confirm(`Eliminar turno "${t.nome}"?`)) return;
    router.delete(`/configuracoes/turnos/${t.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Turno removido.")
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Modelos de Turno — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Modelos de Turno" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Configure os turnos disponíveis para escalas" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModal({ tipo: "novo" }),
            className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium shadow-lg",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Novo turno"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: [
        turnos.map((t) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 hover:border-zinc-700 transition", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", style: { background: `linear-gradient(135deg, ${t.cor_hex}40, ${t.cor_hex}10)`, border: `1px solid ${t.cor_hex}60` }, children: /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5", style: { color: t.cor_hex } }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-zinc-100", children: t.nome }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 mt-0.5", children: [
                t.hora_inicio.slice(0, 5),
                " – ",
                t.hora_fim.slice(0, 5),
                t.atravessa_meia_noite && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 ml-2 text-purple-400", children: [
                  /* @__PURE__ */ jsx(Moon, { className: "h-3 w-3" }),
                  "atravessa"
                ] })
              ] }),
              t.descricao && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1 line-clamp-2", children: t.descricao })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => toggle(t), className: "text-zinc-400 hover:text-zinc-200", children: t.ativo ? /* @__PURE__ */ jsx(ToggleRight, { className: "h-5 w-5 text-emerald-400" }) : /* @__PURE__ */ jsx(ToggleLeft, { className: "h-5 w-5 text-zinc-600" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 mt-3 pt-3 border-t border-zinc-800/60", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => setModal({ tipo: "editar", t }), className: "text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" }),
              " Editar"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => eliminar(t), className: "text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }),
              " Eliminar"
            ] })
          ] })
        ] }, t.id)),
        turnos.length === 0 && /* @__PURE__ */ jsxs("div", { className: "col-span-full text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-10 w-10 text-zinc-700 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Nenhum turno configurado. Crie o primeiro para começar a escalar a equipa." })
        ] })
      ] })
    ] }),
    modal && /* @__PURE__ */ jsx(ModalTurno, { modal, onClose: () => setModal(null) })
  ] });
}
function ModalTurno({ modal, onClose }) {
  var _a, _b;
  const t = modal.t;
  const [nome, setNome] = useState((t == null ? void 0 : t.nome) ?? "");
  const [horaInicio, setHoraInicio] = useState(((_a = t == null ? void 0 : t.hora_inicio) == null ? void 0 : _a.slice(0, 5)) ?? "08:00");
  const [horaFim, setHoraFim] = useState(((_b = t == null ? void 0 : t.hora_fim) == null ? void 0 : _b.slice(0, 5)) ?? "16:00");
  const [cor, setCor] = useState((t == null ? void 0 : t.cor_hex) ?? "#06B6D4");
  const [descricao, setDescricao] = useState((t == null ? void 0 : t.descricao) ?? "");
  const [ativo, setAtivo] = useState((t == null ? void 0 : t.ativo) ?? true);
  const [enviando, setEnviando] = useState(false);
  const submit = () => {
    if (!nome.trim()) {
      toast.error("Nome obrigatório.");
      return;
    }
    setEnviando(true);
    const payload = { nome, hora_inicio: horaInicio, hora_fim: horaFim, cor_hex: cor, descricao, ativo };
    if (modal.tipo === "novo") {
      router.post("/configuracoes/turnos", payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Turno criado.");
          onClose();
        },
        onFinish: () => setEnviando(false)
      });
    } else {
      router.patch(`/configuracoes/turnos/${t.id}`, payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Turno actualizado.");
          onClose();
        },
        onFinish: () => setEnviando(false)
      });
    }
  };
  const atravessa = horaFim < horaInicio;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: modal.tipo === "novo" ? "Novo turno" : "Editar turno" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Nome *" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: nome, onChange: (e) => setNome(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white", placeholder: "Ex: Turno da manhã" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Início *" }),
          /* @__PURE__ */ jsx("input", { type: "time", value: horaInicio, onChange: (e) => setHoraInicio(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Fim *" }),
          /* @__PURE__ */ jsx("input", { type: "time", value: horaFim, onChange: (e) => setHoraFim(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" })
        ] })
      ] }),
      atravessa && /* @__PURE__ */ jsxs("p", { className: "text-xs text-purple-300 inline-flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(Moon, { className: "h-3 w-3" }),
        " Este turno atravessa a meia-noite"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Cor" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: CORES_PREDEFINIDAS.map((c) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setCor(c), className: `h-8 w-8 rounded-lg border-2 transition ${cor === c ? "border-white scale-110" : "border-transparent"}`, style: { background: c } }, c)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Descrição" }),
        /* @__PURE__ */ jsx("textarea", { value: descricao, onChange: (e) => setDescricao(e.target.value), rows: 2, className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white resize-none" })
      ] }),
      modal.tipo === "editar" && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: ativo, onChange: (e) => setAtivo(e.target.checked) }),
        "Activo"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm text-white/60 hover:text-white", children: "Cancelar" }),
      /* @__PURE__ */ jsx("button", { onClick: submit, disabled: enviando, className: "px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold disabled:opacity-50", children: enviando ? "A guardar..." : "Guardar" })
    ] })
  ] }) });
}
export {
  Modelos as default
};
