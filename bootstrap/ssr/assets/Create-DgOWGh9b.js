import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Megaphone, Users, Paperclip, X, Save } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const CATEGORIAS = [
  { v: "geral", label: "Geral" },
  { v: "manutencao", label: "Manutenção" },
  { v: "reuniao", label: "Reunião" },
  { v: "urgente", label: "Urgente" },
  { v: "evento", label: "Evento" },
  { v: "aviso_legal", label: "Aviso legal" },
  { v: "outro", label: "Outro" }
];
const PRIORIDADES = [
  { v: "baixa", label: "Baixa" },
  { v: "media", label: "Média" },
  { v: "alta", label: "Alta" },
  { v: "urgente", label: "Urgente" }
];
function AvisosCreate({ condominios }) {
  const { data, setData, post, processing, errors } = useForm({
    condominio_ids: [],
    titulo: "",
    descricao: "",
    categoria: "geral",
    prioridade: "media",
    publicar_em: "",
    arquivar_em: "",
    permite_comentarios: true,
    requer_confirmacao: false,
    notificar_push: true,
    notificar_email: true,
    notificar_sms: false,
    // segmentação: por agora "todos" (segmentação fina fica para evolução)
    segmentacoes: [{ tipo: "todos" }],
    anexos: []
  });
  const [ficheiros, setFicheiros] = useState([]);
  const onFicheiros = (e) => {
    const lista = Array.from(e.target.files ?? []);
    const novos = [...ficheiros, ...lista].slice(0, 5);
    setFicheiros(novos);
    setData("anexos", novos);
  };
  const removerFicheiro = (idx) => {
    const novos = ficheiros.filter((_, i) => i !== idx);
    setFicheiros(novos);
    setData("anexos", novos);
  };
  const toggleCondominio = (id) => {
    const atual = data.condominio_ids;
    if (atual.includes(id)) {
      setData("condominio_ids", atual.filter((x) => x !== id));
    } else {
      setData("condominio_ids", [...atual, id]);
    }
  };
  const todosSelecionados = condominios.length > 0 && data.condominio_ids.length === condominios.length;
  const toggleTodos = () => {
    if (todosSelecionados) {
      setData("condominio_ids", []);
    } else {
      setData("condominio_ids", condominios.map((c) => c.id));
    }
  };
  const submeter = (e) => {
    e.preventDefault();
    post("/avisos", { forceFormData: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Novo aviso — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/avisos",
          className: "inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm mb-4",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Megaphone, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Novo aviso" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Comunique com os condóminos do condomínio" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400", children: "Condomínios *" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: toggleTodos,
                  className: "text-xs text-cyan-400 hover:text-cyan-300 font-medium",
                  children: todosSelecionados ? "Limpar seleção" : "Selecionar todos"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "max-h-56 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 divide-y divide-zinc-800", children: condominios.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 p-3", children: "Sem condomínios disponíveis." }) : condominios.map((c) => {
              const marcado = data.condominio_ids.includes(c.id);
              return /* @__PURE__ */ jsxs(
                "label",
                {
                  className: `flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-900 transition-colors ${marcado ? "bg-cyan-500/5" : ""}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: marcado,
                        onChange: () => toggleCondominio(c.id),
                        className: "rounded border-zinc-700"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-200", children: c.nome })
                  ]
                },
                c.id
              );
            }) }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-1", children: [
              data.condominio_ids.length,
              " condomínio(s) selecionado(s)"
            ] }),
            errors.condominio_ids && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.condominio_ids })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Título *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.titulo,
                onChange: (e) => setData("titulo", e.target.value),
                placeholder: "Ex: Corte de água programado",
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                maxLength: 200,
                required: true
              }
            ),
            errors.titulo && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.titulo })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Descrição *" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: data.descricao,
                onChange: (e) => setData("descricao", e.target.value),
                placeholder: "Descreva o aviso...",
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 min-h-[140px]",
                required: true
              }
            ),
            errors.descricao && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.descricao })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Categoria" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: data.categoria,
                  onChange: (e) => setData("categoria", e.target.value),
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                  children: CATEGORIAS.map((c) => /* @__PURE__ */ jsx("option", { value: c.v, children: c.label }, c.v))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Prioridade" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: data.prioridade,
                  onChange: (e) => setData("prioridade", e.target.value),
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                  children: PRIORIDADES.map((p) => /* @__PURE__ */ jsx("option", { value: p.v, children: p.label }, p.v))
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2 text-zinc-200 text-sm font-semibold", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
            "Destinatários"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
            "Este aviso será enviado a ",
            /* @__PURE__ */ jsx("span", { className: "text-zinc-300 font-medium", children: "todos os condóminos" }),
            " do condomínio selecionado."
          ] }),
          errors.segmentacoes && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.segmentacoes })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 space-y-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-zinc-200 mb-1", children: "Notificações" }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.notificar_push, onChange: (e) => setData("notificar_push", e.target.checked), className: "rounded" }),
            "Enviar notificação push (telemóvel)"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.notificar_email, onChange: (e) => setData("notificar_email", e.target.checked), className: "rounded" }),
            "Enviar por email"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.notificar_sms, onChange: (e) => setData("notificar_sms", e.target.checked), className: "rounded" }),
            "Enviar por SMS"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800 pt-3 space-y-3", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.permite_comentarios, onChange: (e) => setData("permite_comentarios", e.target.checked), className: "rounded" }),
              "Permitir comentários"
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-300 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.requer_confirmacao, onChange: (e) => setData("requer_confirmacao", e.target.checked), className: "rounded" }),
              "Exigir confirmação de leitura"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2 text-zinc-200 text-sm font-semibold", children: [
            /* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4" }),
            "Anexos ",
            /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500 font-normal", children: "(máx. 5, até 10MB cada)" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              multiple: true,
              onChange: onFicheiros,
              accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx",
              className: "block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-200 hover:file:bg-zinc-700"
            }
          ),
          ficheiros.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-2", children: ficheiros.map((f, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate", children: f.name }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => removerFicheiro(i), className: "text-zinc-500 hover:text-zinc-300 flex-shrink-0", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }, i)) }),
          errors.anexos && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.anexos })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: "/avisos", className: "rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm", children: "Cancelar" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: processing || data.condominio_ids.length === 0,
              className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                processing ? "A criar..." : "Criar aviso"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  AvisosCreate as default
};
