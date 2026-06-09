import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Megaphone, Plus, Edit, Trash2, X } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function PublicidadeIndex({ popups }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    titulo: "",
    mensagem: "",
    botao_texto: "",
    link_url: "",
    alvo: "ambos",
    ativo: true,
    inicio_em: "",
    fim_em: ""
  });
  const [imagem, setImagem] = useState(null);
  const [processing, setProcessing] = useState(false);
  function abrirNovo() {
    setEditId(null);
    setForm({ titulo: "", mensagem: "", botao_texto: "", link_url: "", alvo: "ambos", ativo: true, inicio_em: "", fim_em: "" });
    setImagem(null);
    setModal(true);
  }
  function abrirEditar(p) {
    setEditId(p.id);
    setForm({
      titulo: p.titulo,
      mensagem: p.mensagem ?? "",
      botao_texto: p.botao_texto ?? "",
      link_url: p.link_url ?? "",
      alvo: p.alvo,
      ativo: p.ativo,
      inicio_em: p.inicio_em ?? "",
      fim_em: p.fim_em ?? ""
    });
    setImagem(null);
    setModal(true);
  }
  function submeter() {
    setProcessing(true);
    const fd = new FormData();
    Object.keys(form).forEach((k) => {
      if (k === "ativo") fd.append(k, form[k] ? "1" : "0");
      else if (form[k] !== null && form[k] !== "") fd.append(k, form[k]);
    });
    if (imagem) fd.append("imagem", imagem);
    const url = editId ? `/admin/publicidade/${editId}` : "/admin/publicidade";
    router.post(url, fd, {
      forceFormData: true,
      onSuccess: () => {
        setModal(false);
        setProcessing(false);
      },
      onError: () => setProcessing(false)
    });
  }
  function remover(id) {
    if (confirm("Remover este popup?")) {
      router.delete(`/admin/publicidade/${id}`);
    }
  }
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Publicidade" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 p-2", children: /* @__PURE__ */ jsx(Megaphone, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Publicidade (Popups)" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: "Popups promocionais para condóminos e gestores." })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: abrirNovo, className: "flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Novo popup"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        popups.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-zinc-500", children: "Ainda não há popups." }),
        popups.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4", children: [
          p.imagem_url && /* @__PURE__ */ jsx("img", { src: p.imagem_url, alt: "", className: "h-16 w-16 rounded object-cover" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-zinc-100", children: p.titulo }),
              /* @__PURE__ */ jsx("span", { className: `rounded px-2 py-0.5 text-xs ${p.ativo ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"}`, children: p.ativo ? "Ativo" : "Inativo" }),
              /* @__PURE__ */ jsx("span", { className: "rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400", children: p.alvo })
            ] }),
            p.mensagem && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-zinc-400", children: p.mensagem }),
            (p.inicio_em || p.fim_em) && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-zinc-500", children: [
              p.inicio_em ? `De ${p.inicio_em.replace("T", " ")}` : "",
              " ",
              p.fim_em ? `até ${p.fim_em.replace("T", " ")}` : ""
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => abrirEditar(p), className: "rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white", children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => remover(p.id), className: "rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-red-400", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, p.id))
      ] })
    ] }),
    modal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10", onClick: () => setModal(false), children: /* @__PURE__ */ jsxs("div", { className: "my-auto w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-zinc-100", children: editId ? "Editar popup" : "Novo popup" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setModal(false), children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-zinc-400" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("input", { className: "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100", placeholder: "Título", value: form.titulo, onChange: (e) => setForm({ ...form, titulo: e.target.value }) }),
        /* @__PURE__ */ jsx("textarea", { className: "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100", placeholder: "Mensagem", rows: 3, value: form.mensagem, onChange: (e) => setForm({ ...form, mensagem: e.target.value }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx("input", { className: "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100", placeholder: "Texto do botão", value: form.botao_texto, onChange: (e) => setForm({ ...form, botao_texto: e.target.value }) }),
          /* @__PURE__ */ jsx("input", { className: "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100", placeholder: "Link (https://...)", value: form.link_url, onChange: (e) => setForm({ ...form, link_url: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-zinc-400", children: "Imagem" }),
          /* @__PURE__ */ jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
            var _a;
            return setImagem(((_a = e.target.files) == null ? void 0 : _a[0]) ?? null);
          }, className: "text-sm text-zinc-400" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-zinc-400", children: "Início (data e hora)" }),
            /* @__PURE__ */ jsx("input", { type: "datetime-local", className: "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100", value: form.inicio_em, onChange: (e) => setForm({ ...form, inicio_em: e.target.value }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-zinc-400", children: "Fim (data e hora)" }),
            /* @__PURE__ */ jsx("input", { type: "datetime-local", className: "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100", value: form.fim_em, onChange: (e) => setForm({ ...form, fim_em: e.target.value }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("select", { className: "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100", value: form.alvo, onChange: (e) => setForm({ ...form, alvo: e.target.value }), children: [
            /* @__PURE__ */ jsx("option", { value: "ambos", children: "Ambos" }),
            /* @__PURE__ */ jsx("option", { value: "mobile", children: "Só mobile" }),
            /* @__PURE__ */ jsx("option", { value: "web", children: "Só web" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.ativo, onChange: (e) => setForm({ ...form, ativo: e.target.checked }) }),
            " Ativo"
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { disabled: processing, onClick: submeter, className: "w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-white hover:bg-cyan-600 disabled:opacity-50", children: processing ? "A guardar..." : "Guardar" })
      ] })
    ] }) })
  ] });
}
export {
  PublicidadeIndex as default
};
