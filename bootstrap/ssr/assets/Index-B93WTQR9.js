import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Ticket, Plus, Inbox, AlertTriangle, CheckCircle2, Filter, XCircle, Activity, Clock, Search, Lock, Globe, Heart, X, UserPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_CONFIG = {
  aberto: { label: "Aberto", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Inbox },
  em_analise: { label: "Em análise", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Clock },
  em_curso: { label: "Em curso", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", icon: Activity },
  resolvido: { label: "Resolvido", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  fechado: { label: "Fechado", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: XCircle },
  cancelado: { label: "Cancelado", color: "text-zinc-500 bg-zinc-700/20 border-zinc-700/30", icon: XCircle }
};
const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", color: "text-zinc-400" },
  media: { label: "Média", color: "text-blue-400" },
  alta: { label: "Alta", color: "text-amber-400" },
  urgente: { label: "Urgente", color: "text-red-400" }
};
const CATEGORIA_LABEL = {
  manutencao: "Manutenção",
  limpeza: "Limpeza",
  seguranca: "Segurança",
  ruido: "Ruído",
  agua: "Água",
  electricidade: "Electricidade",
  jardim: "Jardim",
  estacionamento: "Estacionamento",
  reclamacao: "Reclamação",
  sugestao: "Sugestão",
  outro: "Outro"
};
function TicketsIndex({ tickets, filtros, stats = { total: 0, abertos: 0, urgentes: 0, resolvidos_mes: 0 }, categoriasParticulares = [], categoriasPublicas = [], meta }) {
  const [form, setForm] = useState(filtros);
  const [modalNovo, setModalNovo] = useState(false);
  const aplicarFiltros = () => {
    const params = {};
    if (form.estado) params.estado = form.estado;
    if (form.categoria) params.categoria = form.categoria;
    if (form.prioridade) params.prioridade = form.prioridade;
    if (form.busca) params.busca = form.busca;
    router.get("/tickets", params, { preserveState: true, preserveScroll: true });
  };
  const limparFiltros = () => {
    setForm({});
    router.get("/tickets", {}, { preserveState: true, preserveScroll: true });
  };
  const formatarData = (iso) => {
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const ano = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Pedidos de intervenção — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Ticket, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Pedidos de intervenção" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              (tickets == null ? void 0 : tickets.total) ?? 0,
              " pedido",
              ((tickets == null ? void 0 : tickets.total) ?? 0) !== 1 ? "s" : "",
              " no total"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalNovo(true),
            className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Novo pedido"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Total", valor: stats.total, icon: Ticket, cor: "text-zinc-300 bg-zinc-500/10" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Por resolver", valor: stats.abertos, icon: Inbox, cor: "text-blue-400 bg-blue-500/10" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Urgentes", valor: stats.urgentes, icon: AlertTriangle, cor: "text-red-400 bg-red-500/10" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Resolvidos este mês", valor: stats.resolvidos_mes, icon: CheckCircle2, cor: "text-emerald-400 bg-emerald-500/10" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 text-zinc-400 text-sm", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
          "Filtros"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Estado" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.estado || "",
                onChange: (e) => setForm({ ...form, estado: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
                  Object.entries(ESTADO_CONFIG).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v.label }, k))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Prioridade" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.prioridade || "",
                onChange: (e) => setForm({ ...form, prioridade: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todas" }),
                  Object.entries(PRIORIDADE_CONFIG).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v.label }, k))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Categoria" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.categoria || "",
                onChange: (e) => setForm({ ...form, categoria: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todas" }),
                  Object.entries(CATEGORIA_LABEL).map(([k, v]) => /* @__PURE__ */ jsx("option", { value: k, children: v }, k))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Pesquisar" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: form.busca || "",
                    onChange: (e) => setForm({ ...form, busca: e.target.value }),
                    onKeyDown: (e) => e.key === "Enter" && aplicarFiltros(),
                    placeholder: "Título ou descrição...",
                    className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: aplicarFiltros,
                  className: "bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium",
                  children: "Filtrar"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: limparFiltros,
                  className: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm",
                  children: "Limpar"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: tickets.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(Ticket, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-400 font-medium", children: "Nenhum pedido" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-600 mt-1", children: "Os pedidos reportados pelos condóminos aparecem aqui." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: tickets.data.map((t) => {
        var _a;
        const estadoCfg = ESTADO_CONFIG[t.estado];
        const EstadoIcon = estadoCfg.icon;
        const prioCfg = PRIORIDADE_CONFIG[t.prioridade];
        return /* @__PURE__ */ jsx(
          Link,
          {
            href: `/tickets/${t.id}`,
            className: "block p-4 md:p-5 hover:bg-zinc-900 transition-colors",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Ticket, { className: "h-5 w-5 text-purple-400" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-zinc-100", children: t.titulo }),
                    t.tipo === "particular" && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", children: [
                      /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3" }),
                      "Particular"
                    ] }),
                    t.tipo === "publico" && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", children: [
                      /* @__PURE__ */ jsx(Globe, { className: "h-3 w-3" }),
                      "Público"
                    ] }),
                    (meta == null ? void 0 : meta.is_condomino) && t.tipo === "publico" && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-pink-500/10 border border-pink-500/30 text-pink-300 px-2 py-0.5 text-[10px] font-medium", children: [
                      /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3" }),
                      t.apoios_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: `text-xs font-semibold ${prioCfg.color}`, children: [
                      "• ",
                      prioCfg.label
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 mt-0.5 line-clamp-1", children: t.descricao }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-600", children: [
                    /* @__PURE__ */ jsx("span", { children: ((_a = t.categoria) == null ? void 0 : _a.nome) ?? CATEGORIA_LABEL[t.categoria_legacy ?? ""] ?? "Sem categoria" }),
                    t.aberto_por && /* @__PURE__ */ jsxs("span", { children: [
                      "· ",
                      t.aberto_por.name
                    ] }),
                    t.fraccao && /* @__PURE__ */ jsxs("span", { children: [
                      "· Imóvel ",
                      t.fraccao.identificador
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "· ",
                      formatarData(t.created_at)
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${estadoCfg.color} flex-shrink-0`, children: [
                /* @__PURE__ */ jsx(EstadoIcon, { className: "h-3.5 w-3.5" }),
                estadoCfg.label
              ] })
            ] })
          },
          t.id
        );
      }) }) }),
      tickets.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-1 mt-4", children: tickets.links.map((link, i) => /* @__PURE__ */ jsx(
        "button",
        {
          disabled: !link.url,
          onClick: () => link.url && router.get(link.url, {}, { preserveScroll: true }),
          className: `px-3 py-1.5 rounded-lg text-sm ${link.active ? "bg-cyan-500 text-white" : link.url ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-900 text-zinc-600 cursor-not-allowed"}`,
          dangerouslySetInnerHTML: { __html: link.label }
        },
        i
      )) }),
      modalNovo && /* @__PURE__ */ jsx(ModalNovoTicket, { onClose: () => setModalNovo(false), categoriasParticulares: categoriasParticulares ?? [], categoriasPublicas: categoriasPublicas ?? [] })
    ] })
  ] });
}
function StatCard({ label, valor, icon: Icon, cor }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
    /* @__PURE__ */ jsx("div", { className: `inline-flex items-center justify-center w-9 h-9 rounded-lg ${cor} mb-2`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-zinc-100", children: valor }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-0.5", children: label })
  ] });
}
function ModalNovoTicket({
  onClose,
  categoriasParticulares,
  categoriasPublicas
}) {
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [focado, setFocado] = useState(false);
  const [todosCondominos, setTodosCondominos] = useState([]);
  const [pesquisando, setPesquisando] = useState(false);
  const [condominoSelecionado, setCondominoSelecionado] = useState(null);
  const { data, setData, post, processing, errors, reset } = useForm({
    titulo: "",
    descricao: "",
    categoria_id: 0,
    prioridade: "media",
    fraccao_id: 0,
    tipo: ""
  });
  const categoriasDisponiveis = tipo === "particular" ? categoriasParticulares : tipo === "publico" ? categoriasPublicas : [];
  const escolherTipo = (t) => {
    setTipo(t);
    setData("tipo", t);
    setData("categoria_id", 0);
    setStep(2);
  };
  useEffect(() => {
    setPesquisando(true);
    fetch(`/tickets/condominos`, {
      headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin"
    }).then((r) => r.json()).then((res) => setTodosCondominos(res.data || [])).catch(() => setTodosCondominos([])).finally(() => setPesquisando(false));
  }, []);
  const resultados = pesquisa.length < 1 ? todosCondominos.slice(0, 30) : todosCondominos.filter(
    (c) => c.nome_completo.toLowerCase().includes(pesquisa.toLowerCase()) || c.fraccao_identificador.toLowerCase().includes(pesquisa.toLowerCase())
  ).slice(0, 30);
  const seleccionarCondomino = (c) => {
    setData("fraccao_id", c.fraccao_id);
    setCondominoSelecionado({ nome: c.nome_completo, fraccao_identificador: c.fraccao_identificador });
    setPesquisa("");
  };
  const limparCondomino = () => {
    setCondominoSelecionado(null);
    setData("fraccao_id", 0);
  };
  const submit = (e) => {
    e.preventDefault();
    if (!data.categoria_id) {
      return;
    }
    post("/tickets", {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-zinc-800 p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-zinc-100 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" }),
          "Novo pedido ",
          step === 2 && tipo ? `— ${tipo === "particular" ? "🔒 Particular" : "🌐 Público"}` : ""
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-zinc-200", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-5 pt-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: `h-1 flex-1 rounded ${step >= 1 ? "bg-cyan-500" : "bg-zinc-800"}` }),
        /* @__PURE__ */ jsx("div", { className: `h-1 flex-1 rounded ${step >= 2 ? "bg-cyan-500" : "bg-zinc-800"}` })
      ] }),
      step === 1 && /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mb-3", children: "Escolha o tipo de pedido" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => escolherTipo("particular"),
            className: "w-full text-left p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 hover:bg-zinc-900/80 transition group",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5 text-cyan-400" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-zinc-100", children: "Particular" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-0.5", children: "Problema do imóvel — visível apenas para si, administração e prestador atribuído" })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => escolherTipo("publico"),
            className: "w-full text-left p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/60 hover:bg-zinc-900/80 transition group",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5 text-purple-400" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-zinc-100", children: "Público" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-0.5", children: "Bem comum (passeios, postes, jardins) — visível para todos os condóminos" })
              ] })
            ] })
          }
        )
      ] }),
      step === 2 && /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "p-5 space-y-4 max-h-[80vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Categoria *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.categoria_id,
              onChange: (e) => setData("categoria_id", Number(e.target.value)),
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
              required: true,
              children: [
                /* @__PURE__ */ jsx("option", { value: 0, children: "Escolha uma categoria..." }),
                categoriasDisponiveis.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.nome }, cat.id))
              ]
            }
          ),
          errors.categoria_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.categoria_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-xs text-zinc-400 mb-1", children: [
            "Condómino / Fracção ",
            tipo === "particular" ? "*" : "(opcional)"
          ] }),
          !condominoSelecionado && pesquisa.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-zinc-500 mb-1.5 italic", children: "Comece a digitar o nome do condómino..." }),
          condominoSelecionado ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4 text-cyan-400" }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-zinc-200", children: [
                condominoSelecionado.nome,
                " — Imóvel ",
                condominoSelecionado.fraccao_identificador
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: limparCondomino, className: "text-zinc-500 hover:text-zinc-300", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: pesquisa,
                onChange: (e) => setPesquisa(e.target.value),
                onFocus: () => setFocado(true),
                onBlur: () => setTimeout(() => setFocado(false), 150),
                placeholder: "Pesquisar por nome...",
                className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
              }
            ),
            pesquisando && /* @__PURE__ */ jsx(Loader2, { className: "absolute right-3 top-2.5 h-4 w-4 text-zinc-500 animate-spin" }),
            (focado || pesquisa.length > 0) && resultados.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto", children: resultados.map((c) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => seleccionarCondomino(c), className: "w-full text-left px-3 py-2 hover:bg-zinc-800 text-sm text-zinc-200 border-b border-zinc-800 last:border-0", children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: c.nome_completo }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
                "Imóvel ",
                c.fraccao_identificador
              ] })
            ] }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Título *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.titulo,
              onChange: (e) => setData("titulo", e.target.value),
              placeholder: "Ex: Bomba de água sem pressão",
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
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
              placeholder: "Descreva o problema...",
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 min-h-[100px]",
              required: true
            }
          ),
          errors.descricao && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: errors.descricao })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Prioridade *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.prioridade,
              onChange: (e) => setData("prioridade", e.target.value),
              className: "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
              children: [
                /* @__PURE__ */ jsx("option", { value: "baixa", children: "Baixa" }),
                /* @__PURE__ */ jsx("option", { value: "media", children: "Média" }),
                /* @__PURE__ */ jsx("option", { value: "alta", children: "Alta" }),
                /* @__PURE__ */ jsx("option", { value: "urgente", children: "Urgente" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setStep(1), className: "text-sm text-zinc-400 hover:text-zinc-200", children: "← Voltar" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 text-sm", children: "Cancelar" }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing || !data.categoria_id, className: "rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-4 py-2 text-sm font-medium disabled:opacity-50", children: processing ? "A criar..." : "Criar pedido" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  TicketsIndex as default
};
