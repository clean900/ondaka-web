import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BevyWQSg.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Users, UserPlus, Search, Filter, X, Clock, Mail, RefreshCw, Trash2, Phone, Shield, MoreVertical, Pencil, Key, Building2, Ban, CheckCircle2, Lock, AlertCircle, Send } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const roleLabel = {
  "super-admin": "Super Admin",
  "admin-empresa": "Admin Empresa",
  "gestor": "Gestor",
  "administrador-condominio": "Admin Condomínio",
  "condomino": "Condómino",
  "funcionario": "Funcionário",
  "prestador": "Prestador",
  "guarda": "Guarda"
};
const roleColor = {
  "super-admin": "#EC4899",
  "admin-empresa": "#A855F7",
  "gestor": "#00D4FF",
  "administrador-condominio": "#3B82F6",
  "condomino": "#10B981",
  "funcionario": "#F59E0B",
  "prestador": "#6B7280",
  "guarda": "#EF4444"
};
function Index({ utilizadores, convites_pendentes, roles_disponiveis, condominios, filtros }) {
  const [modalCriar, setModalCriar] = useState(false);
  const [busca, setBusca] = useState(filtros.busca ?? "");
  const [roleFiltro, setRoleFiltro] = useState(filtros.role ?? "");
  const [estadoFiltro, setEstadoFiltro] = useState(filtros.estado ?? "");
  const aplicarFiltros = () => {
    router.get(route("utilizadores.index"), {
      busca: busca || void 0,
      role: roleFiltro || void 0,
      estado: estadoFiltro || void 0
    }, { preserveState: true, replace: true });
  };
  const limparFiltros = () => {
    setBusca("");
    setRoleFiltro("");
    setEstadoFiltro("");
    router.get(route("utilizadores.index"));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Utilizadores" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-white tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-[#00D4FF]" }),
          "Utilizadores"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Gerir gestores, guardas, condóminos e outros utilizadores da empresa." })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setModalCriar(true), className: "btn-primary", children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4" }),
        "Novo utilizador"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "card-elevated mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Pesquisar por nome, email ou telefone...",
            value: busca,
            onChange: (e) => setBusca(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && aplicarFiltros(),
            className: "input pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("select", { value: roleFiltro, onChange: (e) => setRoleFiltro(e.target.value), className: "input lg:w-52", children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Todas as funções" }),
        roles_disponiveis.map((r) => /* @__PURE__ */ jsx("option", { value: r.name, children: r.label }, r.name))
      ] }),
      /* @__PURE__ */ jsxs("select", { value: estadoFiltro, onChange: (e) => setEstadoFiltro(e.target.value), className: "input lg:w-40", children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Todos estados" }),
        /* @__PURE__ */ jsx("option", { value: "activo", children: "Activo" }),
        /* @__PURE__ */ jsx("option", { value: "suspenso", children: "Suspenso" }),
        /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendente" })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: aplicarFiltros, className: "btn-secondary", children: [
        /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }),
        "Filtrar"
      ] }),
      (busca || roleFiltro || estadoFiltro) && /* @__PURE__ */ jsx("button", { onClick: limparFiltros, className: "btn-ghost", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
    ] }) }),
    convites_pendentes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "card-elevated mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-white flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-amber-400" }),
        "Convites pendentes (",
        convites_pendentes.length,
        ")"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: convites_pendentes.map((c) => /* @__PURE__ */ jsx(ConvitePendenteRow, { convite: c }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card-elevated", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto -mx-5", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 text-left text-[10px] uppercase tracking-wider text-white/50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Nome" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Função" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Estado" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium", children: "Último login" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-medium text-right", children: "Acções" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: utilizadores.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-5 py-12 text-center text-white/40 text-sm", children: "Nenhum utilizador encontrado." }) }) : utilizadores.data.map((u) => /* @__PURE__ */ jsx(UtilizadorRow, { user: u, condominios }, u.id)) })
      ] }) }),
      utilizadores.total > utilizadores.data.length && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs text-white/50", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          "A mostrar ",
          utilizadores.from,
          "-",
          utilizadores.to,
          " de ",
          utilizadores.total
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: utilizadores.links.map((l, i) => /* @__PURE__ */ jsx(
          Link,
          {
            href: l.url ?? "#",
            className: `px-3 py-1 rounded ${l.active ? "bg-[#00D4FF] text-black font-medium" : l.url ? "text-white/60 hover:text-white hover:bg-white/5" : "text-white/20 cursor-not-allowed"}`,
            dangerouslySetInnerHTML: { __html: l.label },
            preserveScroll: true,
            preserveState: true
          },
          i
        )) })
      ] })
    ] }),
    modalCriar && /* @__PURE__ */ jsx(
      ModalNovoUtilizador,
      {
        onClose: () => setModalCriar(false),
        rolesDisponiveis: roles_disponiveis,
        condominios
      }
    )
  ] });
}
function UtilizadorRow({ user, condominios }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalCondominio, setModalCondominio] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const cor = user.role ? roleColor[user.role] ?? "#6B7280" : "#6B7280";
  const suspender = () => {
    if (!confirm(`Suspender utilizador ${user.name}?`)) return;
    router.post(route("utilizadores.suspender", user.id));
  };
  const reactivar = () => router.post(route("utilizadores.reactivar", user.id));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 hover:bg-white/[0.02] transition", children: [
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white",
            style: { background: `${cor}25`, border: `0.5px solid ${cor}50` },
            children: user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-white font-medium truncate", children: user.name }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/50 truncate flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Mail, { className: "w-3 h-3" }),
            user.email,
            user.telefone && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "text-white/20", children: "·" }),
              /* @__PURE__ */ jsx(Phone, { className: "w-3 h-3" }),
              user.telefone
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxs(
        "span",
        {
          className: "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide",
          style: { background: `${cor}15`, color: cor, border: `0.5px solid ${cor}30` },
          children: [
            /* @__PURE__ */ jsx(Shield, { className: "w-3 h-3" }),
            user.role ? roleLabel[user.role] ?? user.role : "Sem função"
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsx(EstadoBadge, { estado: user.estado }) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4 text-xs text-white/60", children: user.ultimo_login_em ? new Date(user.ultimo_login_em).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—" }),
      /* @__PURE__ */ jsxs("td", { className: "px-5 py-4 text-right relative", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setMenuAberto(!menuAberto),
            className: "p-1.5 rounded hover:bg-white/5 text-white/60 hover:text-white",
            children: /* @__PURE__ */ jsx(MoreVertical, { className: "w-4 h-4" })
          }
        ),
        menuAberto && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40", onClick: () => setMenuAberto(false) }),
          /* @__PURE__ */ jsxs("div", { className: "absolute right-5 mt-1 w-56 bg-[#16163A] border border-white/10 rounded-lg shadow-xl z-50 py-1", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setMenuAberto(false);
                  setModalEditar(true);
                },
                className: "w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(Pencil, { className: "w-3.5 h-3.5 text-[#A855F7]" }),
                  "Editar dados"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setMenuAberto(false);
                  setModalPassword(true);
                },
                className: "w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(Key, { className: "w-3.5 h-3.5 text-[#00D4FF]" }),
                  "Alterar password"
                ]
              }
            ),
            (user.role === "guarda" || user.role === "administrador-condominio") && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setMenuAberto(false);
                  setModalCondominio(true);
                },
                className: "w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(Building2, { className: "w-3.5 h-3.5" }),
                  "Mudar condomínio"
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "my-1 border-t border-white/5" }),
            user.estado === "activo" ? /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setMenuAberto(false);
                  suspender();
                },
                className: "w-full px-3 py-2 text-left text-xs text-amber-400 hover:bg-white/5 flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(Ban, { className: "w-3.5 h-3.5" }),
                  "Suspender"
                ]
              }
            ) : /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setMenuAberto(false);
                  reactivar();
                },
                className: "w-full px-3 py-2 text-left text-xs text-emerald-400 hover:bg-white/5 flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5" }),
                  "Reactivar"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    modalCondominio && /* @__PURE__ */ jsx(ModalAlterarCondominio, { user, condominios, onClose: () => setModalCondominio(false) }),
    modalPassword && /* @__PURE__ */ jsx(ModalAlterarPassword, { user, onClose: () => setModalPassword(false) }),
    modalEditar && /* @__PURE__ */ jsx(ModalEditarUtilizador, { user, condominios, onClose: () => setModalEditar(false) })
  ] });
}
function EstadoBadge({ estado }) {
  const config = {
    activo: { label: "Activo", cor: "#10B981", bg: "rgba(16,185,129,0.12)" },
    suspenso: { label: "Suspenso", cor: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
    pendente: { label: "Pendente", cor: "#6B7280", bg: "rgba(107,114,128,0.12)" }
  };
  const c = config[estado] ?? config.pendente;
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium", style: { color: c.cor, background: c.bg }, children: [
    /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { background: c.cor } }),
    c.label
  ] });
}
function ConvitePendenteRow({ convite }) {
  const reenviar = () => router.post(route("utilizadores.convites.reenviar", convite.id), {}, { preserveScroll: true });
  const cancelar = () => {
    if (!confirm(`Cancelar convite para ${convite.email}?`)) return;
    router.post(route("utilizadores.convites.cancelar", convite.id), {}, { preserveScroll: true });
  };
  const cor = roleColor[convite.role_name] ?? "#6B7280";
  const expiraEmDias = Math.max(0, Math.ceil((new Date(convite.expira_em).getTime() - Date.now()) / 864e5));
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center", style: { background: `${cor}15`, border: `0.5px solid ${cor}30` }, children: /* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5", style: { color: cor } }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-white font-medium truncate", children: [
          convite.nome,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "·" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-white/60", children: convite.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-white/40 mt-0.5", children: [
          roleLabel[convite.role_name] ?? convite.role_name,
          convite.condominio_nome && ` · ${convite.condominio_nome}`,
          " · ",
          "Expira em ",
          expiraEmDias,
          " ",
          expiraEmDias === 1 ? "dia" : "dias"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 flex-shrink-0", children: [
      /* @__PURE__ */ jsx("button", { onClick: reenviar, className: "p-2 rounded hover:bg-white/5 text-white/60 hover:text-white", title: "Reenviar", children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5" }) }),
      /* @__PURE__ */ jsx("button", { onClick: cancelar, className: "p-2 rounded hover:bg-red-500/10 text-white/60 hover:text-red-400", title: "Cancelar", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }) })
    ] })
  ] });
}
function ModalNovoUtilizador({ onClose, rolesDisponiveis, condominios }) {
  const [tab, setTab] = useState("convidar");
  const formConvidar = useForm({
    nome: "",
    email: "",
    telefone: "",
    role_name: "gestor",
    condominio_id: "",
    fraccao_id: ""
  });
  const formCriar = useForm({
    nome: "",
    email: "",
    telefone: "",
    role_name: "gestor",
    condominio_id: "",
    password: "",
    forcar_troca_password: true
  });
  const submitConvidar = (e) => {
    e.preventDefault();
    formConvidar.post(route("utilizadores.convidar"), {
      onSuccess: () => {
        formConvidar.reset();
        onClose();
      },
      preserveScroll: true
    });
  };
  const submitCriar = (e) => {
    e.preventDefault();
    formCriar.post(route("utilizadores.criar-directo"), {
      onSuccess: () => {
        formCriar.reset();
        onClose();
      },
      preserveScroll: true
    });
  };
  const dadosActivos = tab === "convidar" ? formConvidar.data : formCriar.data;
  const setDadosActivos = tab === "convidar" ? formConvidar.setData : formCriar.setData;
  const errorsActivos = tab === "convidar" ? formConvidar.errors : formCriar.errors;
  const processingActivo = tab === "convidar" ? formConvidar.processing : formCriar.processing;
  const precisaCondominio = ["administrador-condominio", "guarda", "condomino"].includes(dadosActivos.role_name);
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "w-5 h-5 text-[#00D4FF]" }),
        "Novo utilizador"
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex border-b border-white/5", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setTab("convidar"),
          className: `flex-1 px-5 py-3 text-xs font-medium uppercase tracking-wide transition ${tab === "convidar" ? "text-[#00D4FF] border-b-2 border-[#00D4FF]" : "text-white/40 hover:text-white/60"}`,
          children: [
            /* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5 inline mr-1.5" }),
            "Convidar por email"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setTab("criar"),
          className: `flex-1 px-5 py-3 text-xs font-medium uppercase tracking-wide transition ${tab === "criar" ? "text-[#A855F7] border-b-2 border-[#A855F7]" : "text-white/40 hover:text-white/60"}`,
          children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-3.5 h-3.5 inline mr-1.5" }),
            "Criar com password"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: tab === "convidar" ? submitConvidar : submitCriar, children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Nome completo *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              required: true,
              className: "input",
              value: dadosActivos.nome,
              onChange: (e) => setDadosActivos("nome", e.target.value)
            }
          ),
          errorsActivos.nome && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errorsActivos.nome })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Email *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              required: true,
              className: "input",
              value: dadosActivos.email,
              onChange: (e) => setDadosActivos("email", e.target.value)
            }
          ),
          errorsActivos.email && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errorsActivos.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Telefone (Angola)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "tel",
              placeholder: "+244 XXX XXX XXX",
              className: "input",
              value: dadosActivos.telefone,
              onChange: (e) => setDadosActivos("telefone", e.target.value)
            }
          ),
          tab === "convidar" && /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40 mt-1", children: "Se preencher, será enviado SMS com o link de convite." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Função *" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              required: true,
              className: "input",
              value: dadosActivos.role_name,
              onChange: (e) => setDadosActivos("role_name", e.target.value),
              children: rolesDisponiveis.map((r) => /* @__PURE__ */ jsx("option", { value: r.name, children: r.label }, r.name))
            }
          ),
          errorsActivos.role_name && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errorsActivos.role_name })
        ] }),
        precisaCondominio && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Condomínio *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              required: true,
              className: "input",
              value: dadosActivos.condominio_id,
              onChange: (e) => setDadosActivos("condominio_id", e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione..." }),
                condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
              ]
            }
          ),
          errorsActivos.condominio_id && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errorsActivos.condominio_id })
        ] }),
        tab === "criar" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Password inicial *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                minLength: 8,
                className: "input",
                value: formCriar.data.password,
                onChange: (e) => formCriar.setData("password", e.target.value)
              }
            ),
            formCriar.errors.password && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: formCriar.errors.password }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40 mt-1", children: "Mínimo 8 caracteres. Comunique ao utilizador." })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2.5 cursor-pointer p-3 rounded-lg bg-amber-500/5 border border-amber-500/20", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: formCriar.data.forcar_troca_password,
                onChange: (e) => formCriar.setData("forcar_troca_password", e.target.checked),
                className: "mt-0.5"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-white font-medium", children: "Forçar troca no primeiro login" }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 mt-0.5", children: "O utilizador será obrigado a definir uma nova password antes de aceder à plataforma." })
            ] })
          ] })
        ] }),
        tab === "convidar" && /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-3 bg-blue-500/5 border border-blue-500/20 flex gap-2", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/70 leading-relaxed", children: [
            "Será enviado um email ",
            dadosActivos.telefone && "(e SMS)",
            " com um link de convite válido durante 7 dias. O utilizador define a sua própria password ao aceitar."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: processingActivo, className: "btn-primary", children: tab === "convidar" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
          processingActivo ? "A enviar..." : "Enviar convite"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4" }),
          processingActivo ? "A criar..." : "Criar utilizador"
        ] }) })
      ] })
    ] })
  ] }) });
}
function ModalAlterarCondominio({ user, condominios, onClose }) {
  const [novoCondominio, setNovoCondominio] = useState(user.condominio_activo_id ? String(user.condominio_activo_id) : "");
  const submit = (e) => {
    e.preventDefault();
    router.patch(route("utilizadores.alterar-condominio", user.id), {
      condominio_id: novoCondominio || null
    }, { onSuccess: onClose, preserveScroll: true });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4", onClick: onClose, children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-md", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Alterar condomínio" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-white/60", children: user.name }),
      /* @__PURE__ */ jsxs("select", { className: "input", value: novoCondominio, onChange: (e) => setNovoCondominio(e.target.value), children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Sem condomínio activo" }),
        condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "btn-ghost", children: "Cancelar" }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary", children: "Guardar" })
    ] })
  ] }) });
}
function ModalAlterarPassword({ user, onClose }) {
  const { data, setData, patch, processing, errors, reset } = useForm({
    password: "",
    forcar_troca_password: true
  });
  const submit = (e) => {
    e.preventDefault();
    patch(route("utilizadores.alterar-password", user.id), {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4", onClick: onClose, children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-md", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Key, { className: "w-5 h-5 text-[#00D4FF]" }),
        "Alterar password"
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-3 bg-white/[0.03] border border-white/5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40 uppercase tracking-wide", children: "Utilizador" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-white font-medium mt-0.5", children: user.name }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-white/60 mt-0.5", children: user.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Nova password *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            required: true,
            minLength: 8,
            className: "input",
            value: data.password,
            onChange: (e) => setData("password", e.target.value)
          }
        ),
        errors.password && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errors.password }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40 mt-1", children: "Mínimo 8 caracteres. Comunique ao utilizador." })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2.5 cursor-pointer p-3 rounded-lg bg-amber-500/5 border border-amber-500/20", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: data.forcar_troca_password,
            onChange: (e) => setData("forcar_troca_password", e.target.checked),
            className: "mt-0.5"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-white font-medium", children: "Forçar troca no próximo login" }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 mt-0.5", children: "Recomendado quando o admin define a password." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-3 bg-red-500/5 border border-red-500/20 flex gap-2", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/70 leading-relaxed", children: [
          "Esta acção altera ",
          /* @__PURE__ */ jsx("strong", { children: "imediatamente" }),
          " a password. O utilizador perde acesso com a password antiga."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "btn-ghost", children: "Cancelar" }),
      /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing, className: "btn-primary", children: [
        /* @__PURE__ */ jsx(Key, { className: "w-4 h-4" }),
        processing ? "A guardar..." : "Alterar password"
      ] })
    ] })
  ] }) });
}
function ModalEditarUtilizador({ user, condominios, onClose }) {
  const { data, setData, patch, processing, errors } = useForm({
    nome: user.name,
    email: user.email,
    telefone: user.telefone ?? "",
    role_name: user.role ?? "gestor",
    condominio_id: user.condominio_activo_id ? String(user.condominio_activo_id) : ""
  });
  const submit = (e) => {
    e.preventDefault();
    patch(route("utilizadores.editar", user.id), {
      onSuccess: onClose,
      preserveScroll: true
    });
  };
  const rolesEditaveis = [
    { name: "gestor", label: "Gestor de Condomínios" },
    { name: "administrador-condominio", label: "Administrador de Condomínio" },
    { name: "guarda", label: "Guarda / Porteiro" },
    { name: "funcionario", label: "Funcionário" },
    { name: "condomino", label: "Condómino" },
    { name: "prestador", label: "Prestador de Serviços" }
  ];
  const precisaCondominio = ["administrador-condominio", "guarda", "condomino"].includes(data.role_name);
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Pencil, { className: "w-5 h-5 text-[#A855F7]" }),
        "Editar utilizador"
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Nome completo *" }),
          /* @__PURE__ */ jsx("input", { type: "text", required: true, className: "input", value: data.nome, onChange: (e) => setData("nome", e.target.value) }),
          errors.nome && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errors.nome })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Email *" }),
          /* @__PURE__ */ jsx("input", { type: "email", required: true, className: "input", value: data.email, onChange: (e) => setData("email", e.target.value) }),
          errors.email && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errors.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Telefone (Angola)" }),
          /* @__PURE__ */ jsx("input", { type: "tel", placeholder: "+244 XXX XXX XXX", className: "input", value: data.telefone, onChange: (e) => setData("telefone", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Função *" }),
          /* @__PURE__ */ jsx("select", { required: true, className: "input", value: data.role_name, onChange: (e) => setData("role_name", e.target.value), children: rolesEditaveis.map((r) => /* @__PURE__ */ jsx("option", { value: r.name, children: r.label }, r.name)) }),
          errors.role_name && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errors.role_name })
        ] }),
        precisaCondominio && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Condomínio *" }),
          /* @__PURE__ */ jsxs("select", { required: true, className: "input", value: data.condominio_id, onChange: (e) => setData("condominio_id", e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione..." }),
            condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
          ] }),
          errors.condominio_id && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errors.condominio_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-3 bg-blue-500/5 border border-blue-500/20 flex gap-2", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-white/70 leading-relaxed", children: 'Para alterar a password, use a opção "Alterar password" no menu.' })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing, className: "btn-primary", children: [
          /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" }),
          processing ? "A guardar..." : "Guardar alterações"
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Index as default
};
