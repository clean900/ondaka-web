import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-ChtKe8ca.js";
import { useForm, Head, router } from "@inertiajs/react";
import { FileText, Plus, Upload, Smartphone, Download, Trash2 } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function RepositorioDocumentos({ titulo, descricao, categoria, modelos }) {
  const fileRef = useRef(null);
  const form = useForm({
    categoria,
    nome: "",
    descricao: "",
    ficheiro: null
  });
  const submit = (e) => {
    e.preventDefault();
    if (!form.data.ficheiro) {
      toast.error("Escolha um ficheiro.");
      return;
    }
    form.post("/documentos/modelos", {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Modelo adicionado.");
        form.reset("nome", "descricao", "ficheiro");
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  };
  const apagar = (m) => {
    if (!confirm(`Apagar o modelo "${m.nome}"?`)) return;
    router.delete(`/documentos/modelos/${m.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Modelo removido.")
    });
  };
  const toggleMobile = (m) => {
    router.patch(`/documentos/modelos/${m.id}/visibilidade`, {}, {
      preserveScroll: true,
      onSuccess: () => toast.success(m.visivel_mobile ? "Escondido do mobile." : "Visível no mobile.")
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: titulo }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto py-8 px-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-cyan-500/10", children: /* @__PURE__ */ jsx(FileText, { className: "w-6 h-6 text-cyan-400" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white", children: titulo })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-zinc-400 mb-6", children: descricao }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-5 mb-6 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
          " Adicionar modelo"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx("input", { type: "text", value: form.data.nome, onChange: (e) => form.setData("nome", e.target.value), placeholder: "Nome (ex: Contrato de administração)", className: "rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: form.data.descricao, onChange: (e) => form.setData("descricao", e.target.value), placeholder: "Descrição (opcional)", className: "rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" })
        ] }),
        form.errors.nome && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: form.errors.nome }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: fileRef,
            type: "file",
            accept: ".pdf,.doc,.docx,image/*",
            onChange: (e) => {
              var _a;
              return form.setData("ficheiro", ((_a = e.target.files) == null ? void 0 : _a[0]) ?? null);
            },
            className: "w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
          }
        ),
        form.errors.ficheiro && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: form.errors.ficheiro }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs("button", { type: "submit", disabled: form.processing, className: "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50", children: [
          /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }),
          " ",
          form.processing ? "A enviar..." : "Adicionar modelo"
        ] }) })
      ] }),
      modelos.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-zinc-700/50 bg-zinc-900/40 p-10 text-center text-sm text-zinc-400", children: "Ainda não há modelos nesta categoria. Adicione o primeiro acima." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: modelos.map((m) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-900/50 px-4 py-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-white truncate flex items-center gap-2", children: [
            m.nome,
            m.visivel_mobile && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30", children: "No mobile" })
          ] }),
          m.descricao && /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-400 truncate", children: m.descricao }),
          m.criado_em && /* @__PURE__ */ jsx("div", { className: "text-[11px] text-zinc-500", children: m.criado_em })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => toggleMobile(m), title: m.visivel_mobile ? "Esconder do mobile" : "Mostrar no mobile dos condóminos", className: `p-1.5 rounded ${m.visivel_mobile ? "text-emerald-300 bg-emerald-500/10" : "text-white/40 hover:bg-white/10"}`, children: /* @__PURE__ */ jsx(Smartphone, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxs("a", { href: m.url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-cyan-300 hover:underline text-sm", children: [
            /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
            " Abrir"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => apagar(m), className: "p-1.5 rounded text-red-400 hover:bg-red-500/10", title: "Apagar", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
        ] })
      ] }, m.id)) })
    ] })
  ] });
}
export {
  RepositorioDocumentos as default
};
