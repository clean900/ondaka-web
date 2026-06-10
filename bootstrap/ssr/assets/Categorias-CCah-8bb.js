import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BxaWWjLC.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, Tag, Plus, Edit, Trash2, X, Check } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const COR_PADRAO = ["#a855f7", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#facc15", "#ec4899"];
function CategoriasIndex({ categorias }) {
  const [modalNova, setModalNova] = useState(false);
  const [editando, setEditando] = useState(null);
  const formNova = useForm({
    nome: "",
    icone: "",
    cor: COR_PADRAO[0],
    activa: true
  });
  const formEditar = useForm({
    nome: "",
    icone: "",
    cor: "",
    activa: true
  });
  const submitNova = (e) => {
    e.preventDefault();
    formNova.post("/despesas/categorias", {
      preserveScroll: true,
      onSuccess: () => {
        formNova.reset();
        formNova.setData("cor", COR_PADRAO[0]);
        setModalNova(false);
      }
    });
  };
  const abrirEditar = (c) => {
    formEditar.setData({
      nome: c.nome,
      icone: c.icone ?? "",
      cor: c.cor ?? COR_PADRAO[0],
      activa: c.activa
    });
    setEditando(c);
  };
  const submitEditar = (e) => {
    e.preventDefault();
    if (!editando) return;
    formEditar.put(`/despesas/categorias/${editando.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setEditando(null);
        formEditar.reset();
      }
    });
  };
  const eliminar = (c) => {
    if (c.despesas_count > 0) {
      window.alert(`Esta categoria tem ${c.despesas_count} despesa(s) associada(s). Desactive-a em vez de eliminar.`);
      return;
    }
    if (!window.confirm(`Eliminar a categoria "${c.nome}"?`)) return;
    router.delete(`/despesas/categorias/${c.id}`, { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Categorias de Despesas" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto py-6 px-4 space-y-6", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/despesas", className: "inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Voltar a despesas"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-medium text-white flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Tag, { className: "h-6 w-6 text-purple-400" }),
            "Categorias de Despesas"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mt-1", children: "Organize as despesas em categorias personalizadas." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalNova(true),
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium",
            style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" },
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              " Nova categoria"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-white/10 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-white/5 border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-[10px] uppercase tracking-wider text-white/50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 w-10", children: "Cor" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Nome" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Slug" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-center", children: "Despesas" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-center", children: "Activa" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right", children: "Acções" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          categorias.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-3 py-12 text-center text-white/40 text-sm", children: "Sem categorias." }) }),
          categorias.map((c) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 hover:bg-white/[0.02]", children: [
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsx("span", { className: "inline-block w-5 h-5 rounded", style: { background: c.cor ?? "#a855f7" } }) }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-white font-medium", children: c.nome }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-white/40 text-xs font-mono", children: c.slug }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-center text-white/70 text-xs", children: c.despesas_count }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-center", children: c.activa ? /* @__PURE__ */ jsx("span", { className: "inline-block px-1.5 py-0.5 rounded text-[10px] bg-green-500/15 text-green-300", children: "Sim" }) : /* @__PURE__ */ jsx("span", { className: "inline-block px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/40", children: "Não" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => abrirEditar(c), title: "Editar", className: "p-1.5 rounded text-white/50 hover:bg-white/10 hover:text-white", children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => eliminar(c), title: "Eliminar", className: "p-1.5 rounded text-red-300 hover:bg-red-500/10", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }) })
          ] }, c.id))
        ] })
      ] }) })
    ] }),
    modalNova && /* @__PURE__ */ jsx(
      ModalCategoria,
      {
        titulo: "Nova categoria",
        form: formNova,
        onSubmit: submitNova,
        onClose: () => {
          setModalNova(false);
          formNova.reset();
        },
        submitLabel: "Criar"
      }
    ),
    editando && /* @__PURE__ */ jsx(
      ModalCategoria,
      {
        titulo: `Editar "${editando.nome}"`,
        form: formEditar,
        onSubmit: submitEditar,
        onClose: () => {
          setEditando(null);
          formEditar.reset();
        },
        submitLabel: "Guardar"
      }
    )
  ] });
}
function ModalCategoria({ titulo, form, onSubmit, onClose, submitLabel }) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-white text-base font-medium", children: titulo }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white p-1", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Nome" }),
        /* @__PURE__ */ jsx("input", { type: "text", required: true, maxLength: 80, value: form.data.nome, onChange: (e) => form.setData("nome", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Cor" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: COR_PADRAO.map((c) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => form.setData("cor", c),
            className: `w-7 h-7 rounded transition-all ${form.data.cor === c ? "ring-2 ring-white scale-110" : ""}`,
            style: { background: c }
          },
          c
        )) }),
        /* @__PURE__ */ jsx("input", { type: "text", value: form.data.cor, onChange: (e) => form.setData("cor", e.target.value), placeholder: "#a855f7", className: "w-full mt-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-white text-xs font-mono" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Ícone (opcional)" }),
        /* @__PURE__ */ jsx("input", { type: "text", maxLength: 40, value: form.data.icone, onChange: (e) => form.setData("icone", e.target.value), placeholder: "ex: wrench, droplet, zap", className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/90", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.data.activa, onChange: (e) => form.setData("activa", e.target.checked), className: "rounded" }),
        "Categoria activa"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 rounded-md text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10", children: "Cancelar" }),
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: form.processing, className: "px-5 py-2 rounded-md text-white text-sm font-medium", style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" }, children: [
          /* @__PURE__ */ jsx(Check, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
          " ",
          form.processing ? "A guardar..." : submitLabel
        ] })
      ] })
    ] })
  ] }) });
}
export {
  CategoriasIndex as default
};
