import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, Link, router } from "@inertiajs/react";
import { Users, Plus, Filter, Search, XCircle, CheckCircle2, AlertCircle, Clock, User, Phone, Home, Calendar, X, CalendarClock, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const DIAS_SEMANA = [
  { iso: 1, label: "Seg" },
  { iso: 2, label: "Ter" },
  { iso: 3, label: "Qua" },
  { iso: 4, label: "Qui" },
  { iso: 5, label: "Sex" },
  { iso: 6, label: "Sáb" },
  { iso: 7, label: "Dom" }
];
const ESTADO_CONFIG = {
  pendente: { label: "Pendente", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", icon: Clock },
  usada: { label: "Utilizada", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  expirada: { label: "Expirada", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: AlertCircle },
  cancelada: { label: "Cancelada", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle },
  aprovado: { label: "Aprovado", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
  recusado: { label: "Recusado", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle }
};
const ESTADO_FALLBACK = { label: "Desconhecido", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: AlertCircle };
function PreAprovacoes({ preAprovacoes, filtros, meta, minhasFraccoes, condominos, acessoHorarioAreaActivo = false }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(filtros);
  const aplicarFiltros = () => {
    const params = {};
    if (form.estado) params.estado = form.estado;
    if (form.nome) params.nome = form.nome;
    router.get("/visitantes/pre-aprovacoes", params, { preserveState: true, preserveScroll: true });
  };
  const limparFiltros = () => {
    setForm({ estado: "", nome: "" });
    router.get("/visitantes/pre-aprovacoes", {}, { preserveState: true, preserveScroll: true });
  };
  const formatarDataHora = (iso) => {
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const ano = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Pré-aprovações — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Pré-aprovações" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              preAprovacoes.total,
              " pré-aprovações criadas"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          ((meta == null ? void 0 : meta.is_condomino) || (meta == null ? void 0 : meta.is_gestor)) && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setModalAberto(true),
              className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-2 text-sm font-medium shadow-lg shadow-cyan-500/30",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                "Nova pré-aprovação"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/visitantes/dentro-agora",
              className: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium",
              children: "Dentro agora"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/visitantes/historico",
              className: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium",
              children: "Histórico"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 text-zinc-400 text-sm", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
          "Filtros"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Estado" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.estado,
                onChange: (e) => setForm({ ...form, estado: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
                  /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendentes" }),
                  /* @__PURE__ */ jsx("option", { value: "usada", children: "Utilizadas" }),
                  /* @__PURE__ */ jsx("option", { value: "expirada", children: "Expiradas" }),
                  /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Canceladas" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Nome do visitante" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: form.nome,
                  onChange: (e) => setForm({ ...form, nome: e.target.value }),
                  onKeyDown: (e) => e.key === "Enter" && aplicarFiltros(),
                  placeholder: "Pesquisar...",
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: aplicarFiltros,
                className: "flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium",
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
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: [
        preAprovacoes.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-zinc-400 font-medium", children: "Nenhuma pré-aprovação" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-600 mt-1", children: "Os condóminos criam pré-aprovações pela app mobile." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: preAprovacoes.data.map((pa) => {
          var _a;
          const estadoConfig = ESTADO_CONFIG[pa.estado] ?? ESTADO_FALLBACK;
          const EstadoIcon = estadoConfig.icon;
          return /* @__PURE__ */ jsx("div", { className: "p-4 md:p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-cyan-400" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-zinc-100", children: pa.nome_visitante }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-zinc-500", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
                    pa.telefone_visitante
                  ] }),
                  pa.fraccao && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Home, { className: "h-3.5 w-3.5" }),
                    "Imóvel ",
                    pa.fraccao.identificador
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-600", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
                    "Criada: ",
                    formatarDataHora(pa.created_at)
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                    "Válida até: ",
                    formatarDataHora(pa.valida_ate)
                  ] }),
                  ((_a = pa.condomino) == null ? void 0 : _a.user) && /* @__PURE__ */ jsxs("span", { children: [
                    "por ",
                    pa.condomino.user.name
                  ] })
                ] }),
                pa.observacoes && /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-600 mt-1 italic", children: [
                  '"',
                  pa.observacoes,
                  '"'
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2", children: [
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: `inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${estadoConfig.color}`,
                  children: [
                    /* @__PURE__ */ jsx(EstadoIcon, { className: "h-3 w-3" }),
                    estadoConfig.label
                  ]
                }
              ),
              pa.estado === "pendente" && /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500 font-mono tabular-nums", children: pa.otp_code }),
              pa.sms_enviado && /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-600", children: "SMS enviado" })
            ] })
          ] }) }, pa.id);
        }) }),
        preAprovacoes.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-zinc-800 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
            "Página ",
            preAprovacoes.current_page,
            " de ",
            preAprovacoes.last_page
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: preAprovacoes.links.map((link, i) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url ?? "#",
              preserveState: true,
              preserveScroll: true,
              className: `px-3 py-1 text-sm rounded-md ${link.active ? "bg-cyan-500 text-zinc-950 font-medium" : link.url ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "text-zinc-700 cursor-not-allowed"}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            i
          )) })
        ] })
      ] })
    ] }),
    modalAberto && /* @__PURE__ */ jsx(
      ModalNovaPreAprovacao,
      {
        aberto: modalAberto,
        onClose: () => setModalAberto(false),
        isCondomino: (meta == null ? void 0 : meta.is_condomino) ?? false,
        minhasFraccoes: minhasFraccoes ?? [],
        condominos: condominos ?? [],
        acessoHorarioAreaActivo
      }
    )
  ] });
}
function ModalNovaPreAprovacao({ aberto, onClose, isCondomino, minhasFraccoes, condominos, acessoHorarioAreaActivo }) {
  const [condominoId, setCondominoId] = useState(null);
  const [fraccaoId, setFraccaoId] = useState(
    isCondomino && minhasFraccoes.length > 0 ? minhasFraccoes[0].id : null
  );
  const [nomeVisitante, setNomeVisitante] = useState("");
  const [telefoneVisitante, setTelefoneVisitante] = useState("");
  const [validaDesde, setValidaDesde] = useState("");
  const [validaAte, setValidaAte] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [diasSel, setDiasSel] = useState([]);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [areas, setAreas] = useState([]);
  const [areaInput, setAreaInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState({});
  if (!aberto) return null;
  const condominoSelecionado = condominos.find((c) => c.id === condominoId);
  const fraccoesDisponiveis = isCondomino ? minhasFraccoes : (condominoSelecionado == null ? void 0 : condominoSelecionado.fraccoes) ?? [];
  const toggleDia = (iso) => setDiasSel((prev) => prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]);
  const adicionarArea = () => {
    const v = areaInput.trim();
    if (v && !areas.includes(v)) setAreas([...areas, v]);
    setAreaInput("");
  };
  const removerArea = (a) => setAreas(areas.filter((x) => x !== a));
  const submit = async () => {
    const novosErros = {};
    if (!isCondomino && !condominoId) novosErros.condomino_id = "Escolha o condómino.";
    if (!fraccaoId) novosErros.fraccao_id = "Escolha a fracção.";
    if (!nomeVisitante.trim()) novosErros.nome_visitante = "Nome do visitante obrigatório.";
    if (!telefoneVisitante.trim()) novosErros.telefone_visitante = "Telefone obrigatório.";
    if (!validaAte) novosErros.valida_ate = "Data/hora de validade é obrigatória.";
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      toast.error("Por favor preencha os campos obrigatórios.");
      return;
    }
    setErros({});
    setEnviando(true);
    const payload = {
      fraccao_id: fraccaoId,
      nome_visitante: nomeVisitante,
      telefone_visitante: telefoneVisitante,
      valida_ate: validaAte
    };
    if (!isCondomino) payload.condomino_id = condominoId;
    if (validaDesde) payload.valida_desde = validaDesde;
    if (observacoes.trim()) payload.observacoes = observacoes;
    if (acessoHorarioAreaActivo) {
      if (diasSel.length > 0) {
        const regra = { dias: [...diasSel].sort((a, b) => a - b) };
        if (horaInicio) regra.inicio = horaInicio;
        if (horaFim) regra.fim = horaFim;
        payload.horarios = [regra];
      }
      if (areas.length > 0) payload.areas = areas;
    }
    router.post("/visitantes/pre-aprovacoes", payload, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Pre-aprovacao criada com sucesso!");
        onClose();
      },
      onError: (errs) => {
        const novos = {};
        Object.entries(errs).forEach(([k, v]) => {
          novos[k] = Array.isArray(v) ? String(v[0]) : String(v);
        });
        setErros(novos);
        toast.error("Ha campos invalidos.");
      },
      onFinish: () => setEnviando(false)
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md py-8 px-4", onClick: onClose, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto shadow-2xl",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-cyan-400" }),
            "Nova pré-aprovação"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
          !isCondomino && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Condómino *" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: condominoId ?? "",
                onChange: (e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  setCondominoId(id);
                  setFraccaoId(null);
                },
                className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Escolha um condómino..." }),
                  condominos.map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
                    c.nome,
                    " ",
                    c.email && `(${c.email})`
                  ] }, c.id))
                ]
              }
            ),
            erros.condomino_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: erros.condomino_id })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Fracção *" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: fraccaoId ?? "",
                onChange: (e) => setFraccaoId(e.target.value ? Number(e.target.value) : null),
                disabled: fraccoesDisponiveis.length === 0,
                className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Escolha a fracção..." }),
                  fraccoesDisponiveis.map((f) => /* @__PURE__ */ jsxs("option", { value: f.id, children: [
                    f.edificio_nome ? `${f.edificio_nome} — ` : "",
                    f.identificador,
                    f.piso !== null ? ` (Piso ${f.piso})` : ""
                  ] }, f.id))
                ]
              }
            ),
            fraccoesDisponiveis.length === 0 && !isCondomino && condominoId && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-400 mt-1", children: "Este condómino não tem fracções activas." }),
            erros.fraccao_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: erros.fraccao_id })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Nome do visitante *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: nomeVisitante,
                onChange: (e) => setNomeVisitante(e.target.value),
                placeholder: "João Silva",
                className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              }
            ),
            erros.nome_visitante && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: erros.nome_visitante })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Telefone *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                value: telefoneVisitante,
                onChange: (e) => setTelefoneVisitante(e.target.value),
                placeholder: "+244 923 456 789",
                className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              }
            ),
            erros.telefone_visitante && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: erros.telefone_visitante })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Válida desde" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "datetime-local",
                  value: validaDesde,
                  onChange: (e) => setValidaDesde(e.target.value),
                  className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/40 mt-0.5", children: "Opcional. Vazio = imediato." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Válida até *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "datetime-local",
                  value: validaAte,
                  onChange: (e) => setValidaAte(e.target.value),
                  className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                }
              ),
              erros.valida_ate && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: erros.valida_ate })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Observações" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: observacoes,
                onChange: (e) => setObservacoes(e.target.value),
                rows: 2,
                maxLength: 500,
                placeholder: "Ex: Mobiliário, electricista, etc.",
                className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
              }
            )
          ] }),
          acessoHorarioAreaActivo && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-3", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-cyan-300 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(CalendarClock, { className: "h-3.5 w-3.5" }),
              " Acesso por horário/área (opcional)"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] text-white/60 block mb-1", children: "Dias permitidos" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: DIAS_SEMANA.map((d) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => toggleDia(d.iso),
                  className: `px-2.5 py-1 rounded-md text-xs font-medium border transition ${diasSel.includes(d.iso) ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`,
                  children: d.label
                },
                d.iso
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[11px] text-white/60 block mb-1", children: "Das" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "time",
                    value: horaInicio,
                    onChange: (e) => setHoraInicio(e.target.value),
                    className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[11px] text-white/60 block mb-1", children: "Até" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "time",
                    value: horaFim,
                    onChange: (e) => setHoraFim(e.target.value),
                    className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/40", children: "Sem dias/horas = sem limite. Fora do horário, a portaria é avisada (não bloqueia)." }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] text-white/60 block mb-1", children: "Áreas autorizadas" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: areaInput,
                    onChange: (e) => setAreaInput(e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        adicionarArea();
                      }
                    },
                    placeholder: "Ex: Piscina",
                    className: "flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: adicionarArea,
                    className: "px-3 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20",
                    children: "Adicionar"
                  }
                )
              ] }),
              areas.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: areas.map((a) => /* @__PURE__ */ jsxs(
                "span",
                {
                  className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs",
                  children: [
                    a,
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => removerArea(a),
                        className: "text-purple-300/70 hover:text-white",
                        children: "×"
                      }
                    )
                  ]
                },
                a
              )) }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/40 mt-1", children: "Mostradas ao guarda na validação (informativo)." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              disabled: enviando,
              className: "px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition",
              children: "Cancelar"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: submit,
              disabled: enviando,
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
                enviando ? "A criar..." : "Criar pré-aprovação"
              ]
            }
          )
        ] })
      ]
    }
  ) });
}
export {
  PreAprovacoes as default
};
