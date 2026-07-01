import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head, Link, router } from "@inertiajs/react";
import { Calendar, ChevronLeft, ChevronRight, Plus, User, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const ESTADO_LABEL = {
  agendado: { label: "Agendado", cor: "text-blue-300 bg-blue-500/10" },
  em_curso: { label: "Em curso", cor: "text-emerald-300 bg-emerald-500/10" },
  concluido: { label: "Concluído", cor: "text-zinc-400 bg-zinc-500/10" },
  falhou: { label: "Falhou", cor: "text-red-300 bg-red-500/10" },
  cancelado: { label: "Cancelado", cor: "text-zinc-500 bg-zinc-700/10" }
};
function Escala({ escalas, turnos_modelo, users_escalaveis, semana_inicio, semana_fim, is_admin }) {
  const [modal, setModal] = useState(false);
  const navegarSemana = (offset) => {
    const d = new Date(semana_inicio);
    d.setDate(d.getDate() + offset * 7);
    const nova = d.toISOString().slice(0, 10);
    router.get("/turnos/escala", { semana: nova }, { preserveState: false });
  };
  const eliminar = (id) => {
    if (!confirm("Eliminar esta escala?")) return;
    router.delete(`/turnos/escala/${id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Escala removida.")
    });
  };
  const escalasPorDia = {};
  for (const e of escalas) {
    if (!escalasPorDia[e.data]) escalasPorDia[e.data] = [];
    escalasPorDia[e.data].push(e);
  }
  const diasSemana = [];
  const inicio = new Date(semana_inicio);
  for (let i = 0; i < 7; i++) {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    diasSemana.push({
      data: d.toISOString().slice(0, 10),
      label: DIAS_SEMANA[i],
      dia: d.getDate()
    });
  }
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Escala de Turnos — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Calendar, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Escala de Turnos" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              "Semana de ",
              new Date(semana_inicio).toLocaleDateString("pt-PT"),
              " a ",
              new Date(semana_fim).toLocaleDateString("pt-PT")
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => navegarSemana(-1), className: "p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => navegarSemana(0), className: "px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm text-zinc-300", children: "Hoje" }),
          /* @__PURE__ */ jsx("button", { onClick: () => navegarSemana(1), className: "p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) }),
          is_admin && /* @__PURE__ */ jsxs("button", { onClick: () => setModal(true), className: "ml-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium shadow-lg", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Agendar"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-7 gap-3", children: diasSemana.map((d) => {
        const lista = escalasPorDia[d.data] ?? [];
        const hoje = d.data === (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        return /* @__PURE__ */ jsxs("div", { className: `rounded-xl bg-zinc-900/40 border ${hoje ? "border-cyan-500/40" : "border-zinc-800"} p-3`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-3", children: [
            /* @__PURE__ */ jsx("span", { className: `text-xs font-semibold uppercase ${hoje ? "text-cyan-300" : "text-zinc-400"}`, children: d.label }),
            /* @__PURE__ */ jsx("span", { className: `text-2xl font-bold ${hoje ? "text-cyan-300" : "text-zinc-200"}`, children: d.dia })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 min-h-[100px]", children: [
            lista.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-700 text-center py-4", children: "—" }),
            lista.map((e) => {
              var _a, _b, _c, _d;
              const cfg = ESTADO_LABEL[e.estado] ?? { label: e.estado, cor: "text-zinc-400 bg-zinc-500/10" };
              return /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-2 text-xs", style: { background: `${((_a = e.turno) == null ? void 0 : _a.cor_hex) ?? "#06B6D4"}15`, border: `1px solid ${((_b = e.turno) == null ? void 0 : _b.cor_hex) ?? "#06B6D4"}30` }, children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-zinc-100 mb-1", children: ((_c = e.turno) == null ? void 0 : _c.nome) ?? "Turno" }),
                /* @__PURE__ */ jsxs("p", { className: "text-zinc-400 font-mono", children: [
                  e.hora_inicio,
                  "–",
                  e.hora_fim
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-zinc-300 mt-1 truncate inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
                  ((_d = e.user) == null ? void 0 : _d.name) ?? "—"
                ] }),
                e.condominio && /* @__PURE__ */ jsx("p", { className: "text-zinc-500 text-[10px] truncate", children: e.condominio.nome }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.cor}`, children: cfg.label }),
                  is_admin && /* @__PURE__ */ jsx("button", { onClick: () => eliminar(e.id), className: "text-red-400 hover:text-red-300", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
                ] })
              ] }, e.id);
            })
          ] })
        ] }, d.data);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Link, { href: "/turnos/relatorio", className: "text-xs text-cyan-400 hover:text-cyan-300", children: "Ver relatório de horas →" }),
        is_admin && /* @__PURE__ */ jsx(Link, { href: "/configuracoes/turnos", className: "text-xs text-zinc-400 hover:text-zinc-200", children: "Configurar turnos modelo →" })
      ] })
    ] }),
    modal && /* @__PURE__ */ jsx(ModalAgendar, { onClose: () => setModal(false), turnosModelo: turnos_modelo, users: users_escalaveis })
  ] });
}
function ModalAgendar({ onClose, turnosModelo, users }) {
  const [turnoId, setTurnoId] = useState("");
  const [userId, setUserId] = useState("");
  const [datas, setDatas] = useState([(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)]);
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);
  const addData = () => setDatas([...datas, ""]);
  const updateData = (i, v) => {
    const nv = [...datas];
    nv[i] = v;
    setDatas(nv);
  };
  const removeData = (i) => setDatas(datas.filter((_, idx) => idx !== i));
  const submit = () => {
    if (!turnoId || !userId) {
      toast.error("Turno e utilizador obrigatórios.");
      return;
    }
    const datasValidas = datas.filter((d) => d);
    if (datasValidas.length === 0) {
      toast.error("Pelo menos uma data.");
      return;
    }
    setEnviando(true);
    router.post("/turnos/escala", { turno_modelo_id: turnoId, user_id: userId, datas: datasValidas, observacoes }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Escala criada.");
        onClose();
      },
      onError: (errs) => toast.error(Object.values(errs)[0]),
      onFinish: () => setEnviando(false)
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Agendar turno" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Turno *" }),
        /* @__PURE__ */ jsxs("select", { value: turnoId, onChange: (e) => setTurnoId(e.target.value ? Number(e.target.value) : ""), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Escolha um turno..." }),
          turnosModelo.map((t) => /* @__PURE__ */ jsxs("option", { value: t.id, children: [
            t.nome,
            " (",
            t.hora_inicio.slice(0, 5),
            "–",
            t.hora_fim.slice(0, 5),
            ")"
          ] }, t.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Funcionário *" }),
        /* @__PURE__ */ jsxs("select", { value: userId, onChange: (e) => setUserId(e.target.value ? Number(e.target.value) : ""), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Escolha um utilizador..." }),
          users.map((u) => /* @__PURE__ */ jsx("option", { value: u.id, children: u.name }, u.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Datas *" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          datas.map((d, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("input", { type: "date", value: d, onChange: (e) => updateData(i, e.target.value), className: "flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" }),
            datas.length > 1 && /* @__PURE__ */ jsx("button", { onClick: () => removeData(i), className: "text-red-400 hover:text-red-300", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }, i)),
          /* @__PURE__ */ jsx("button", { onClick: addData, className: "text-xs text-cyan-400 hover:text-cyan-300", children: "+ Adicionar outra data" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Observações" }),
        /* @__PURE__ */ jsx("textarea", { value: observacoes, onChange: (e) => setObservacoes(e.target.value), rows: 2, className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white resize-none" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm text-white/60 hover:text-white", children: "Cancelar" }),
      /* @__PURE__ */ jsx("button", { onClick: submit, disabled: enviando, className: "px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold disabled:opacity-50", children: enviando ? "A guardar..." : "Criar escala" })
    ] })
  ] }) });
}
export {
  Escala as default
};
