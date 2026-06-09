import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-TDdsYzgz.js";
import { Head, router } from "@inertiajs/react";
import { Tag, Plus, ToggleRight, ToggleLeft, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function CategoriasPedidos({ categorias }) {
  const [tipoActivo, setTipoActivo] = useState("particular");
  const [modal, setModal] = useState(null);
  const filtradas = categorias.filter((c) => c.tipo === tipoActivo);
  const toggle = (cat) => {
    router.patch(`/configuracoes/categorias-pedidos/${cat.id}`, {
      nome: cat.nome,
      icone: cat.icone,
      ordem: cat.ordem,
      ativo: !cat.ativo
    }, {
      preserveScroll: true,
      onSuccess: () => toast.success("Estado actualizado.")
    });
  };
  const eliminar = (cat) => {
    if (!confirm(`Eliminar categoria "${cat.nome}"?`)) return;
    router.delete(`/configuracoes/categorias-pedidos/${cat.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Categoria removida.")
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Categorias de Pedidos — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Tag, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Categorias de Pedidos de Intervenção" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              categorias.length,
              " categorias configuradas"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModal({ tipo: "novo" }),
            className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-2 text-sm font-medium shadow-lg",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Nova categoria"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1 mb-4 border-b border-zinc-800", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setTipoActivo("particular"),
            className: `px-4 py-2 text-sm font-medium ${tipoActivo === "particular" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-zinc-500 hover:text-zinc-300"}`,
            children: [
              "🔒 Particular (",
              categorias.filter((c) => c.tipo === "particular").length,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setTipoActivo("publico"),
            className: `px-4 py-2 text-sm font-medium ${tipoActivo === "publico" ? "text-purple-400 border-b-2 border-purple-400" : "text-zinc-500 hover:text-zinc-300"}`,
            children: [
              "🌐 Público (",
              categorias.filter((c) => c.tipo === "publico").length,
              ")"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-zinc-900/80 border-b border-zinc-800", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "Ordem" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "Nome" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "Ícone" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "Activo" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-2 text-zinc-400 text-xs uppercase", children: "Acções" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          filtradas.map((cat) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-zinc-800/50 hover:bg-zinc-900/40", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-500", children: cat.ordem }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-200 font-medium", children: cat.nome }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-500", children: cat.icone ?? "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("button", { onClick: () => toggle(cat), children: cat.ativo ? /* @__PURE__ */ jsx(ToggleRight, { className: "h-5 w-5 text-emerald-400" }) : /* @__PURE__ */ jsx(ToggleLeft, { className: "h-5 w-5 text-zinc-600" }) }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => setModal({ tipo: "editar", cat }), className: "text-zinc-400 hover:text-zinc-200 mr-2", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4 inline" }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => eliminar(cat), className: "text-red-400 hover:text-red-300", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 inline" }) })
            ] })
          ] }, cat.id)),
          filtradas.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-zinc-500", children: "Nenhuma categoria deste tipo." }) })
        ] })
      ] }) })
    ] }),
    modal && /* @__PURE__ */ jsx(ModalCategoria, { modal, tipoActivo, onClose: () => setModal(null) })
  ] });
}
function ModalCategoria({ modal, tipoActivo, onClose }) {
  const cat = modal.cat;
  const [nome, setNome] = useState((cat == null ? void 0 : cat.nome) ?? "");
  const [icone, setIcone] = useState((cat == null ? void 0 : cat.icone) ?? "Tag");
  const [ordem, setOrdem] = useState((cat == null ? void 0 : cat.ordem) ?? 50);
  const [ativo, setAtivo] = useState((cat == null ? void 0 : cat.ativo) ?? true);
  const [enviando, setEnviando] = useState(false);
  const submit = () => {
    if (!nome.trim()) {
      toast.error("Nome obrigatório.");
      return;
    }
    setEnviando(true);
    if (modal.tipo === "novo") {
      router.post("/configuracoes/categorias-pedidos", { nome, tipo: tipoActivo, icone, ordem }, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Criada.");
          onClose();
        },
        onFinish: () => setEnviando(false)
      });
    } else {
      router.patch(`/configuracoes/categorias-pedidos/${cat.id}`, { nome, icone, ordem, ativo }, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Actualizada.");
          onClose();
        },
        onFinish: () => setEnviando(false)
      });
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-md mx-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: modal.tipo === "novo" ? `Nova categoria (${tipoActivo})` : "Editar categoria" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Nome *" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: nome, onChange: (e) => setNome(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Ícone (Lucide name)" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: icone, onChange: (e) => setIcone(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Ordem" }),
        /* @__PURE__ */ jsx("input", { type: "number", value: ordem, onChange: (e) => setOrdem(Number(e.target.value)), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" })
      ] }),
      modal.tipo === "editar" && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: ativo, onChange: (e) => setAtivo(e.target.checked) }),
        "Activo"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm text-white/60 hover:text-white", children: "Cancelar" }),
      /* @__PURE__ */ jsx("button", { onClick: submit, disabled: enviando, className: "px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold disabled:opacity-50", children: enviando ? "A guardar..." : "Guardar" })
    ] })
  ] }) });
}
export {
  CategoriasPedidos as default
};
