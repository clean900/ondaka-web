import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { useForm, Head } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function ChecklistForm({ modelo, condominios }) {
  var _a;
  const editar = !!modelo;
  const { data, setData, processing, errors, post, put } = useForm({
    nome: (modelo == null ? void 0 : modelo.nome) || "",
    descricao: (modelo == null ? void 0 : modelo.descricao) || "",
    tipo: (modelo == null ? void 0 : modelo.tipo) || "ronda",
    condominio_id: (modelo == null ? void 0 : modelo.condominio_id) || "",
    activo: (modelo == null ? void 0 : modelo.activo) ?? true,
    itens: ((_a = modelo == null ? void 0 : modelo.itens) == null ? void 0 : _a.length) ? modelo.itens : [{ texto: "", ordem: 1, obrigatorio: true }]
  });
  const addItem = () => setData("itens", [...data.itens, { texto: "", ordem: data.itens.length + 1, obrigatorio: true }]);
  const remItem = (i) => setData("itens", data.itens.filter((_, idx) => idx !== i));
  const upItem = (i, k, v) => {
    const nv = [...data.itens];
    nv[i][k] = v;
    setData("itens", nv);
  };
  const submit = (e) => {
    e.preventDefault();
    if (editar) put(`/checklist/${modelo.id}`);
    else post("/checklist");
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: editar ? "Editar modelo" : "Novo modelo" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "max-w-3xl mx-auto px-4 py-6 space-y-5", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white", children: editar ? "Editar modelo" : "Novo modelo" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Nome" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: data.nome,
              onChange: (e) => setData("nome", e.target.value),
              required: true,
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          ),
          errors.nome && /* @__PURE__ */ jsx("span", { className: "text-xs text-red-400", children: errors.nome })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Tipo" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.tipo,
              onChange: (e) => setData("tipo", e.target.value),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
              children: [
                /* @__PURE__ */ jsx("option", { value: "ronda", children: "Ronda" }),
                /* @__PURE__ */ jsx("option", { value: "inspeccao", children: "Inspecção" }),
                /* @__PURE__ */ jsx("option", { value: "limpeza", children: "Limpeza" }),
                /* @__PURE__ */ jsx("option", { value: "manutencao", children: "Manutenção" }),
                /* @__PURE__ */ jsx("option", { value: "outro", children: "Outro" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block sm:col-span-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Descrição (opcional)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: data.descricao,
              onChange: (e) => setData("descricao", e.target.value),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Condomínio (opcional)" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.condominio_id,
              onChange: (e) => setData("condominio_id", e.target.value),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
                condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 mt-6", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.activo, onChange: (e) => setData("activo", e.target.checked) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-white/80", children: "Activo" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70", children: "Itens da checklist" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: addItem, className: "text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10", children: "+ Adicionar item" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: data.itens.map((it, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40 w-6 text-center", children: i + 1 }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: it.texto,
              onChange: (e) => upItem(i, "texto", e.target.value),
              placeholder: "Descrição do item...",
              className: "flex-1 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-sm"
            }
          ),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1 text-xs text-white/60", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: it.obrigatorio, onChange: (e) => upItem(i, "obrigatorio", e.target.checked) }),
            "obrigatório"
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => remItem(i), className: "text-xs px-2 py-1 rounded text-red-300 hover:bg-red-500/10", children: "×" })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("a", { href: "/checklist", className: "text-sm px-3 py-2 rounded-lg text-white/70 hover:bg-white/5", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50", children: processing ? "A guardar..." : "Guardar" })
      ] })
    ] })
  ] });
}
export {
  ChecklistForm as default
};
