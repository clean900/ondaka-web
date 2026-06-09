import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Save } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function FaqForm({ condominios, categorias, faq }) {
  var _a;
  const isEdit = !!faq;
  const { data, setData, post, put, processing, errors } = useForm({
    condominio_id: ((_a = faq == null ? void 0 : faq.condominio_id) == null ? void 0 : _a.toString()) || "",
    categoria: (faq == null ? void 0 : faq.categoria) || "geral",
    pergunta: (faq == null ? void 0 : faq.pergunta) || "",
    resposta: (faq == null ? void 0 : faq.resposta) || "",
    palavras_chave: (faq == null ? void 0 : faq.palavras_chave) || "",
    ordem: (faq == null ? void 0 : faq.ordem) || 0,
    activa: (faq == null ? void 0 : faq.activa) ?? true
  });
  const submit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route("faqs.update", faq.id));
    } else {
      post(route("faqs.store"));
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: isEdit ? "Editar FAQ" : "Nova FAQ" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 max-w-3xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("faqs.index"),
            className: "inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-2",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
              " Voltar à lista"
            ]
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-zinc-100", children: isEdit ? "Editar FAQ" : "Nova FAQ" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Condomínio" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: data.condominio_id,
                onChange: (e) => setData("condominio_id", e.target.value),
                className: "w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios (geral)" }),
                  condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
                ]
              }
            ),
            errors.condominio_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mt-1", children: errors.condominio_id })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Categoria *" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: data.categoria,
                onChange: (e) => setData("categoria", e.target.value),
                className: "w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none",
                children: Object.entries(categorias).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v }, k))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Pergunta *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.pergunta,
              onChange: (e) => setData("pergunta", e.target.value),
              placeholder: "Ex: Como pago a minha quota mensal?",
              className: "w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none",
              maxLength: 300
            }
          ),
          errors.pergunta && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mt-1", children: errors.pergunta })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Resposta *" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.resposta,
              onChange: (e) => setData("resposta", e.target.value),
              rows: 6,
              placeholder: "Resposta detalhada. Podes usar várias frases e parágrafos.",
              className: "w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none",
              maxLength: 5e3
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-600 mt-1", children: [
            data.resposta.length,
            " / 5000 caracteres"
          ] }),
          errors.resposta && /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-400 mt-1", children: errors.resposta })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Palavras-chave (separadas por vírgula)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.palavras_chave,
              onChange: (e) => setData("palavras_chave", e.target.value),
              placeholder: "Ex: pagar, quota, multicaixa, referência, transferência",
              className: "w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-600 mt-1", children: "Ajudam o chatbot a encontrar esta FAQ mais rápido. São usadas em matching prioritário." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Ordem" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: data.ordem,
                onChange: (e) => setData("ordem", parseInt(e.target.value) || 0),
                min: 0,
                className: "w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center mt-5", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.activa,
                onChange: (e) => setData("activa", e.target.checked),
                className: "rounded bg-zinc-950 border-zinc-700 text-cyan-500 focus:ring-cyan-500"
              }
            ),
            "FAQ activa"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-4 border-t border-zinc-800", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("faqs.index"),
              className: "px-4 py-2 text-sm rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200",
              children: "Cancelar"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "inline-flex items-center gap-2 px-4 py-2 text-sm rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                isEdit ? "Actualizar" : "Criar FAQ"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  FaqForm as default
};
