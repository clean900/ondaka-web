import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-X_1jlzlW.js";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, MessageSquare, GripVertical, Power, PowerOff, Pencil, Trash2, X, Tag, Eye, Save } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "driver.js";
function Index({ faqs: initialFaqs, categoriasExistentes }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categoriaCustom, setCategoriaCustom] = useState("");
  const [usaCategoriaCustom, setUsaCategoriaCustom] = useState(false);
  const [formato, setFormato] = useState("markdown");
  const [activa, setActiva] = useState(true);
  const [palavrasChave, setPalavrasChave] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setFaqs(initialFaqs);
  }, [initialFaqs]);
  const abrirModalNovo = () => {
    setEditingFaq(null);
    setPergunta("");
    setResposta("");
    setCategoria("");
    setCategoriaCustom("");
    setUsaCategoriaCustom(false);
    setFormato("markdown");
    setActiva(true);
    setPalavrasChave([]);
    setTagInput("");
    setShowPreview(false);
    setModalOpen(true);
  };
  const abrirModalEditar = (faq) => {
    setEditingFaq(faq);
    setPergunta(faq.pergunta);
    setResposta(faq.resposta);
    const cat = faq.categoria || "";
    if (cat && !categoriasExistentes.includes(cat)) {
      setUsaCategoriaCustom(true);
      setCategoriaCustom(cat);
      setCategoria("");
    } else {
      setUsaCategoriaCustom(false);
      setCategoria(cat);
      setCategoriaCustom("");
    }
    setFormato(faq.formato);
    setActiva(faq.activa);
    setPalavrasChave(faq.palavras_chave || []);
    setTagInput("");
    setShowPreview(false);
    setModalOpen(true);
  };
  const fecharModal = () => {
    setModalOpen(false);
    setEditingFaq(null);
  };
  const getCsrf = () => {
    var _a;
    return ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "";
  };
  const adicionarTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || palavrasChave.includes(tag) || palavrasChave.length >= 10) {
      return;
    }
    if (tag.length > 50) {
      alert("Palavra-chave muito longa (máximo 50 caracteres).");
      return;
    }
    setPalavrasChave([...palavrasChave, tag]);
    setTagInput("");
  };
  const removerTag = (tag) => {
    setPalavrasChave(palavrasChave.filter((t) => t !== tag));
  };
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      adicionarTag();
    } else if (e.key === "Backspace" && tagInput === "" && palavrasChave.length > 0) {
      setPalavrasChave(palavrasChave.slice(0, -1));
    }
  };
  const guardar = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!pergunta.trim() || !resposta.trim()) {
      alert("Pergunta e resposta são obrigatórias.");
      return;
    }
    setSaving(true);
    const cat = usaCategoriaCustom ? categoriaCustom.trim() : categoria;
    const payload = {
      pergunta: pergunta.trim(),
      resposta,
      categoria: cat || null,
      palavras_chave: palavrasChave,
      formato,
      activa
    };
    try {
      const url = editingFaq ? `/admin/chatbot/faqs/${editingFaq.id}` : "/admin/chatbot/faqs";
      const method = editingFaq ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf()
        },
        credentials: "same-origin",
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        alert(data.message || "Erro ao guardar.");
        return;
      }
      fecharModal();
      router.reload({ only: ["faqs", "categoriasExistentes"] });
    } catch (err) {
      alert("Erro de ligação.");
    } finally {
      setSaving(false);
    }
  };
  const toggleFaq = async (faq) => {
    try {
      const r = await fetch(`/admin/chatbot/faqs/${faq.id}/toggle`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf()
        },
        credentials: "same-origin"
      });
      if (r.ok) {
        router.reload({ only: ["faqs"] });
      }
    } catch (err) {
      alert("Erro ao alterar estado.");
    }
  };
  const eliminarFaq = async (faq) => {
    if (!confirm(`Eliminar a FAQ "${faq.pergunta.substring(0, 60)}..."?`)) return;
    try {
      const r = await fetch(`/admin/chatbot/faqs/${faq.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf()
        },
        credentials: "same-origin"
      });
      if (r.ok) {
        router.reload({ only: ["faqs"] });
      }
    } catch (err) {
      alert("Erro ao eliminar.");
    }
  };
  const handleDragStart = (id) => setDraggedId(id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (targetId) => {
    if (!draggedId || draggedId === targetId) return;
    const draggedIdx = faqs.findIndex((f) => f.id === draggedId);
    const targetIdx = faqs.findIndex((f) => f.id === targetId);
    if (draggedIdx < 0 || targetIdx < 0) return;
    const newFaqs = [...faqs];
    const [moved] = newFaqs.splice(draggedIdx, 1);
    newFaqs.splice(targetIdx, 0, moved);
    setFaqs(newFaqs);
    try {
      await fetch("/admin/chatbot/faqs/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf()
        },
        credentials: "same-origin",
        body: JSON.stringify({ ids: newFaqs.map((f) => f.id) })
      });
    } catch (err) {
      alert("Erro ao reordenar.");
      setFaqs(initialFaqs);
    }
    setDraggedId(null);
  };
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold leading-tight text-zinc-100", children: "Chatbot — FAQs do Condomínio" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Chatbot FAQs" }),
        /* @__PURE__ */ jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: "FAQs específicas deste condomínio. Aparecem no Chatbot dos condóminos." }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: abrirModalNovo,
                className: "flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                  "Nova FAQ"
                ]
              }
            )
          ] }),
          faqs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "mx-auto h-12 w-12 text-zinc-600" }),
            /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-medium text-zinc-100", children: "Sem FAQs ainda" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-zinc-400", children: "Cria a primeira FAQ para os condóminos verem no Chatbot." }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: abrirModalNovo,
                className: "mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                  "Nova FAQ"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
            /* @__PURE__ */ jsx("thead", { className: "border-b border-zinc-800 bg-zinc-950", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "w-10 px-2 py-3" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400", children: "Categoria" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400", children: "Pergunta" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400", children: "Palavras-chave" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-400", children: "Estado" }),
              /* @__PURE__ */ jsx("th", { className: "w-32 px-3 py-3" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-zinc-800", children: faqs.map((faq) => /* @__PURE__ */ jsxs(
              "tr",
              {
                draggable: true,
                onDragStart: () => handleDragStart(faq.id),
                onDragOver: handleDragOver,
                onDrop: () => handleDrop(faq.id),
                className: `hover:bg-zinc-850 ${draggedId === faq.id ? "opacity-50" : ""} ${!faq.activa ? "opacity-60" : ""}`,
                children: [
                  /* @__PURE__ */ jsx("td", { className: "px-2 py-3 text-center", children: /* @__PURE__ */ jsx(GripVertical, { className: "mx-auto h-4 w-4 cursor-move text-zinc-600" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-3", children: faq.categoria ? /* @__PURE__ */ jsx("span", { className: "rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300", children: faq.categoria }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-600", children: "—" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-sm text-zinc-100", children: faq.pergunta }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-3", children: faq.palavras_chave && faq.palavras_chave.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1", children: [
                    faq.palavras_chave.slice(0, 3).map((kw) => /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "rounded bg-cyan-500/20 px-1.5 py-0.5 text-xs text-cyan-300",
                        children: kw
                      },
                      kw
                    )),
                    faq.palavras_chave.length > 3 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500", children: [
                      "+",
                      faq.palavras_chave.length - 3
                    ] })
                  ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-600", children: "—" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center", children: /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => toggleFaq(faq),
                      title: faq.activa ? "Desactivar" : "Activar",
                      className: "inline-flex items-center",
                      children: faq.activa ? /* @__PURE__ */ jsx(Power, { className: "h-4 w-4 text-green-500" }) : /* @__PURE__ */ jsx(PowerOff, { className: "h-4 w-4 text-zinc-600" })
                    }
                  ) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => abrirModalEditar(faq),
                        className: "rounded p-1.5 text-cyan-400 hover:bg-cyan-500/10",
                        title: "Editar",
                        children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => eliminarFaq(faq),
                        className: "rounded p-1.5 text-red-400 hover:bg-red-500/10",
                        title: "Eliminar",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] }) })
                ]
              },
              faq.id
            )) })
          ] }) })
        ] }) }),
        modalOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              onClick: fecharModal,
              className: "fixed inset-0 z-40 bg-black/60"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl", children: [
            /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between border-b border-zinc-800 px-6 py-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white", children: editingFaq ? "Editar FAQ" : "Nova FAQ" }),
              /* @__PURE__ */ jsx("button", { onClick: fecharModal, className: "text-zinc-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: guardar, className: "max-h-[calc(90vh-130px)] overflow-y-auto p-6 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-medium text-zinc-200", children: "Categoria" }),
                !usaCategoriaCustom ? /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: categoria,
                      onChange: (e) => setCategoria(e.target.value),
                      className: "flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: "— Sem categoria —" }),
                        categoriasExistentes.map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setUsaCategoriaCustom(true),
                      className: "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700",
                      children: "+ Outra"
                    }
                  )
                ] }) : /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: categoriaCustom,
                      onChange: (e) => setCategoriaCustom(e.target.value),
                      placeholder: "Nova categoria...",
                      className: "flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white",
                      maxLength: 100
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setUsaCategoriaCustom(false);
                        setCategoriaCustom("");
                      },
                      className: "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700",
                      children: "Cancelar"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-medium text-zinc-200", children: "Pergunta *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: pergunta,
                    onChange: (e) => setPergunta(e.target.value),
                    placeholder: "Ex: A piscina abre a que horas?",
                    className: "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white",
                    maxLength: 500,
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { className: "mb-1 block text-sm font-medium text-zinc-200", children: [
                  /* @__PURE__ */ jsx(Tag, { className: "mr-1 inline h-3 w-3" }),
                  "Palavras-chave (ajuda o chatbot a encontrar)"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
                  palavrasChave.map((tag) => /* @__PURE__ */ jsxs(
                    "span",
                    {
                      className: "flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300",
                      children: [
                        tag,
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => removerTag(tag),
                            className: "ml-0.5 hover:text-white",
                            children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
                          }
                        )
                      ]
                    },
                    tag
                  )),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: tagInput,
                      onChange: (e) => setTagInput(e.target.value),
                      onKeyDown: handleTagKeyDown,
                      onBlur: adicionarTag,
                      placeholder: palavrasChave.length === 0 ? "Ex: piscina, horário, reserva (Enter ou vírgula para adicionar)" : "Adicionar mais...",
                      className: "flex-1 min-w-[200px] bg-transparent text-sm text-white placeholder-zinc-500 outline-none",
                      maxLength: 50
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-zinc-500", children: [
                  palavrasChave.length,
                  "/10 palavras. Pressiona Enter ou vírgula para adicionar. Backspace remove última."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-zinc-200", children: [
                    "Resposta * (",
                    formato === "markdown" ? "Markdown" : "Texto simples",
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowPreview(!showPreview),
                      className: "flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300",
                      children: [
                        /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" }),
                        showPreview ? "Ocultar preview" : "Ver preview"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: resposta,
                    onChange: (e) => setResposta(e.target.value),
                    rows: 10,
                    placeholder: formato === "markdown" ? "**Resposta com Markdown**\n\n- Lista com bullets\n- Outra dica\n\n> Bloco importante" : "Resposta em texto simples.",
                    className: "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white",
                    required: true
                  }
                ),
                showPreview && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-cyan-500/30 bg-zinc-950 p-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs font-medium text-cyan-400", children: "Preview:" }),
                  formato === "markdown" ? /* @__PURE__ */ jsx("div", { className: "prose prose-invert prose-sm max-w-none text-sm text-zinc-100", children: /* @__PURE__ */ jsx(
                    ReactMarkdown,
                    {
                      remarkPlugins: [remarkGfm],
                      components: {
                        p: (p) => /* @__PURE__ */ jsx("p", { className: "mb-2", ...p }),
                        strong: (p) => /* @__PURE__ */ jsx("strong", { className: "font-semibold text-white", ...p }),
                        ul: (p) => /* @__PURE__ */ jsx("ul", { className: "mb-2 ml-2 list-inside list-disc space-y-1", ...p }),
                        ol: (p) => /* @__PURE__ */ jsx("ol", { className: "mb-2 ml-2 list-inside list-decimal space-y-1", ...p }),
                        blockquote: (p) => /* @__PURE__ */ jsx(
                          "blockquote",
                          {
                            className: "my-2 border-l-4 border-cyan-500/50 bg-cyan-500/5 py-2 pl-3 italic",
                            ...p
                          }
                        ),
                        code: (p) => /* @__PURE__ */ jsx("code", { className: "rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-cyan-400", ...p })
                      },
                      children: resposta || "*(vazio)*"
                    }
                  ) }) : /* @__PURE__ */ jsx("p", { className: "whitespace-pre-line text-sm text-zinc-100", children: resposta || "(vazio)" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-medium text-zinc-200", children: "Formato" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: formato,
                      onChange: (e) => setFormato(e.target.value),
                      className: "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "markdown", children: "Markdown (recomendado)" }),
                        /* @__PURE__ */ jsx("option", { value: "texto", children: "Texto simples" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-medium text-zinc-200", children: "Estado" }),
                  /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: activa,
                        onChange: (e) => setActiva(e.target.checked),
                        className: "rounded border-zinc-600 bg-zinc-900 text-cyan-500"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { children: "Activa (visível no Chatbot)" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("footer", { className: "flex items-center justify-end gap-2 border-t border-zinc-800 px-6 py-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: fecharModal,
                  className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700",
                  children: "Cancelar"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: guardar,
                  disabled: saving,
                  className: "flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                    saving ? "A guardar..." : "Guardar"
                  ]
                }
              )
            ] })
          ] }) })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
