import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { usePage, Link, router } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { AlertCircle, AlertTriangle, Clock, MessageCircle, Bot, X, User, Send, FileBarChart, Calculator, PieChart, BadgeCheck, Building2, Settings, UserPlus, KeyRound, Receipt, CreditCard, Wallet, FileText, Bell, MessageSquare, Calendar, Wrench, Users, GraduationCap, Search, ChevronRight, CheckCheck, Lock, Sparkles, Gift, ArrowRight, Loader2, LayoutDashboard, Upload, UserCog, DoorOpen, Shield, Package, CalendarCheck, Cog, Ticket, Briefcase, ShoppingBag, Megaphone, Siren, DollarSign, Handshake, Tag, LifeBuoy, ChartBar, Gauge, Flag, Menu, Map, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { driver } from "driver.js";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatKz(valor) {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  if (isNaN(num)) return "Kz 0";
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num).replace("AOA", "Kz");
}
function formatDate(data) {
  if (!data) return "—";
  try {
    const d = typeof data === "string" ? new Date(data) : data;
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(d);
  } catch {
    return "—";
  }
}
function formatRelativo(data) {
  const d = typeof data === "string" ? new Date(data) : data;
  const agora = /* @__PURE__ */ new Date();
  const diffMs = agora.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 6e4);
  const diffHoras = Math.floor(diffMs / 36e5);
  const diffDias = Math.floor(diffMs / 864e5);
  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHoras < 24) return `Há ${diffHoras}h`;
  if (diffDias < 7) return `Há ${diffDias} dias`;
  return formatDate(d);
}
function iniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
function gradientDeNome(nome) {
  const gradientes = [
    "linear-gradient(135deg, #00D4FF, #A855F7)",
    "linear-gradient(135deg, #A855F7, #EC4899)",
    "linear-gradient(135deg, #EC4899, #00D4FF)",
    "linear-gradient(135deg, #00D4FF, #10B981)",
    "linear-gradient(135deg, #A855F7, #F59E0B)",
    "linear-gradient(135deg, #EC4899, #F59E0B)"
  ];
  const hash = nome.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradientes[hash % gradientes.length];
}
function SubscricaoBanner() {
  const { props } = usePage();
  const subscricao = props.subscricao;
  if (!subscricao) return null;
  if (subscricao.estado === "limitado" || subscricao.estado === "cancelada") {
    return /* @__PURE__ */ jsx("div", { className: "border-y border-red-500/30 bg-red-500/10 px-6 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 text-red-400" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-200", children: [
          /* @__PURE__ */ jsx("strong", { children: "A sua subscrição não está activa." }),
          " ",
          "Regularize o pagamento para restabelecer o acesso completo."
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/subscricao",
          className: "flex-shrink-0 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400",
          children: "Subscrever agora"
        }
      )
    ] }) });
  }
  if (subscricao.em_trial && typeof subscricao.dias_restantes_trial === "number") {
    const dias = subscricao.dias_restantes_trial;
    if (dias > 7) return null;
    const urgente = dias <= 3;
    const cor = urgente ? { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-200", icon: "text-orange-400", btn: "bg-orange-500 hover:bg-orange-400" } : { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-200", icon: "text-yellow-400", btn: "bg-yellow-500 hover:bg-yellow-400" };
    const Icon = urgente ? AlertTriangle : Clock;
    const mensagem = dias === 0 ? "O seu trial expira hoje!" : dias === 1 ? "O seu trial expira amanhã!" : `O seu trial expira em ${dias} dias.`;
    return /* @__PURE__ */ jsx("div", { className: `border-y ${cor.border} ${cor.bg} px-6 py-3`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Icon, { className: `h-5 w-5 flex-shrink-0 ${cor.icon}` }),
        /* @__PURE__ */ jsxs("p", { className: `text-sm ${cor.text}`, children: [
          /* @__PURE__ */ jsx("strong", { children: mensagem }),
          " ",
          "Subscreva agora para continuar a usar a plataforma sem interrupção."
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/subscricao",
          className: `flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white ${cor.btn}`,
          children: "Ver opções"
        }
      )
    ] }) });
  }
  return null;
}
function ChatbotFab({ onClick }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      "aria-label": "Abrir assistente",
      className: "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group",
      children: [
        /* @__PURE__ */ jsx(MessageCircle, { className: "w-6 h-6 text-white" }),
        /* @__PURE__ */ jsx("span", { className: "absolute right-full mr-3 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none", children: "Precisas de ajuda?" })
      ]
    }
  );
}
const SUGESTOES_INICIAIS = [
  "Como pago a taxa de condomínio?",
  "Como pré-aprovo uma visita?",
  "O que é o Fundo de Reserva?",
  "Como activar o ProxyPay?"
];
function ConteudoMensagem({ texto, formato }) {
  if (formato === "markdown") {
    return /* @__PURE__ */ jsx("div", { className: "markdown-body text-sm leading-relaxed", children: /* @__PURE__ */ jsx(
      ReactMarkdown,
      {
        remarkPlugins: [remarkGfm],
        components: {
          // Estilos customizados para combinar com o tema dark
          p: ({ node, ...props }) => /* @__PURE__ */ jsx("p", { className: "mb-2 last:mb-0", ...props }),
          strong: ({ node, ...props }) => /* @__PURE__ */ jsx("strong", { className: "font-semibold text-white", ...props }),
          ul: ({ node, ...props }) => /* @__PURE__ */ jsx("ul", { className: "list-disc list-inside mb-2 ml-2 space-y-1", ...props }),
          ol: ({ node, ...props }) => /* @__PURE__ */ jsx("ol", { className: "list-decimal list-inside mb-2 ml-2 space-y-1", ...props }),
          li: ({ node, ...props }) => /* @__PURE__ */ jsx("li", { className: "text-zinc-100", ...props }),
          blockquote: ({ node, ...props }) => /* @__PURE__ */ jsx("blockquote", { className: "border-l-4 border-cyan-500/50 bg-cyan-500/5 pl-3 py-2 my-2 italic", ...props }),
          code: ({ node, ...props }) => /* @__PURE__ */ jsx("code", { className: "bg-zinc-900 px-1.5 py-0.5 rounded text-xs text-cyan-400 font-mono", ...props }),
          a: ({ node, ...props }) => /* @__PURE__ */ jsx("a", { className: "text-cyan-400 hover:text-cyan-300 underline", target: "_blank", rel: "noopener noreferrer", ...props }),
          h1: ({ node, ...props }) => /* @__PURE__ */ jsx("h1", { className: "text-base font-semibold text-white mb-2", ...props }),
          h2: ({ node, ...props }) => /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white mb-2", ...props }),
          h3: ({ node, ...props }) => /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-1", ...props }),
          hr: ({ node, ...props }) => /* @__PURE__ */ jsx("hr", { className: "border-zinc-700 my-2", ...props })
        },
        children: texto
      }
    ) });
  }
  return /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed whitespace-pre-line", children: texto });
}
function ChatbotDrawer({ open, onClose, userName }) {
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const primeiroNome = (userName == null ? void 0 : userName.split(" ")[0]) || "";
  useEffect(() => {
    if (open && mensagens.length === 0) {
      setMensagens([
        {
          id: "welcome",
          tipo: "bot",
          texto: primeiroNome ? `Olá ${primeiroNome}! Sobre o que precisa de ajuda?` : "Olá! Sobre o que precisa de ajuda?"
        }
      ]);
    }
  }, [open, primeiroNome, mensagens.length]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens, loading]);
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        var _a;
        return (_a = inputRef.current) == null ? void 0 : _a.focus();
      }, 300);
    }
  }, [open]);
  const enviarPergunta = async (texto) => {
    var _a;
    if (!texto.trim() || loading) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      tipo: "user",
      texto
    };
    setMensagens((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const csrf = ((_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.content) || "";
      const response = await fetch("/chatbot/perguntar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf
        },
        credentials: "same-origin",
        body: JSON.stringify({ texto })
      });
      const data = await response.json();
      await new Promise((r) => setTimeout(r, 600));
      if (data.resposta) {
        const botMsg = {
          id: `b-${Date.now()}`,
          tipo: "bot",
          texto: data.resposta.resposta,
          formato: data.resposta.formato || "texto",
          perguntaTitulo: data.resposta.pergunta,
          relacionadas: data.relacionadas || []
        };
        setMensagens((prev) => [...prev, botMsg]);
      } else {
        const errorMsg = {
          id: `b-${Date.now()}`,
          tipo: "bot",
          texto: data.message || "Não encontrei uma resposta. Tente reformular a pergunta ou contacte o suporte."
        };
        setMensagens((prev) => [...prev, errorMsg]);
      }
    } catch (e) {
      const errorMsg = {
        id: `b-${Date.now()}`,
        tipo: "bot",
        texto: "Erro de ligação. Tenta novamente."
      };
      setMensagens((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    enviarPergunta(input);
  };
  const handleSugestaoClick = (texto) => {
    enviarPergunta(texto);
  };
  const handleRelacionadaClick = (p) => {
    enviarPergunta(p.pergunta);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        onClick: onClose,
        className: `fixed inset-0 bg-black/50 z-40 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`
      }
    ),
    /* @__PURE__ */ jsx(
      "aside",
      {
        className: `fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-zinc-900 border-l border-zinc-800 z-50 transition-transform shadow-2xl ${open ? "translate-x-0" : "translate-x-full"}`,
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
          /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-cyan-500/10 to-purple-500/10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Bot, { className: "w-5 h-5 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-white", children: "Assistente ONDAKA" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400", children: "Sempre a postos para ajudar" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "p-1 hover:bg-zinc-800 rounded transition",
                "aria-label": "Fechar",
                children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-zinc-400" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
            mensagens.map((m, idx) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `flex gap-2 ${m.tipo === "user" ? "flex-row-reverse" : "flex-row"}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: `w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.tipo === "user" ? "bg-zinc-700" : "bg-gradient-to-br from-cyan-500 to-purple-500"}`,
                        children: m.tipo === "user" ? /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-zinc-300" }) : /* @__PURE__ */ jsx(Bot, { className: "w-4 h-4 text-white" })
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `max-w-[78%] rounded-2xl px-4 py-2.5 ${m.tipo === "user" ? "bg-cyan-600/30 border border-cyan-500/30 text-white" : "bg-zinc-800 text-zinc-100"}`,
                        children: [
                          m.perguntaTitulo && m.tipo === "bot" && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-cyan-400 mb-1", children: m.perguntaTitulo }),
                          /* @__PURE__ */ jsx(ConteudoMensagem, { texto: m.texto, formato: m.formato })
                        ]
                      }
                    )
                  ]
                }
              ),
              idx === 0 && m.id === "welcome" && mensagens.length === 1 && /* @__PURE__ */ jsxs("div", { className: "mt-3 ml-9 space-y-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mb-2", children: "Sugestões:" }),
                SUGESTOES_INICIAIS.map((s) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleSugestaoClick(s),
                    className: "block w-full text-left text-sm text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-800 transition",
                    children: s
                  },
                  s
                ))
              ] }),
              m.relacionadas && m.relacionadas.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 ml-9 space-y-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mb-1", children: "Quer saber também:" }),
                m.relacionadas.map((p) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => handleRelacionadaClick(p),
                    className: "block w-full text-left text-sm text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg transition",
                    children: [
                      "↳ ",
                      p.pergunta
                    ]
                  },
                  p.id
                ))
              ] })
            ] }, m.id)),
            loading && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Bot, { className: "w-4 h-4 text-white" }) }),
              /* @__PURE__ */ jsx("div", { className: "bg-zinc-800 rounded-2xl px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-zinc-500 rounded-full animate-bounce", style: { animationDelay: "0ms" } }),
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-zinc-500 rounded-full animate-bounce", style: { animationDelay: "150ms" } }),
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-zinc-500 rounded-full animate-bounce", style: { animationDelay: "300ms" } })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "border-t border-zinc-800 p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: inputRef,
                  type: "text",
                  value: input,
                  onChange: (e) => setInput(e.target.value),
                  placeholder: "Escreva a sua pergunta...",
                  disabled: loading,
                  className: "flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: loading || !input.trim(),
                  className: "w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform",
                  "aria-label": "Enviar",
                  children: /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 text-white" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-600 text-center mt-2", children: "ONDAKA · Soluções Simples" })
          ] })
        ] })
      }
    )
  ] });
}
const STORAGE_KEY = "ondaka_tour_v2_visto";
function OnboardingTour({ role, permissions = [], autoStart = true }) {
  const driverRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const passos = construirPassos(role, permissions);
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.7,
      stagePadding: 4,
      popoverClass: "ondaka-tour-popover",
      nextBtnText: "Próximo →",
      prevBtnText: "← Anterior",
      doneBtnText: "Concluir ✓",
      progressText: "Passo {{current}} de {{total}}",
      steps: passos,
      onDestroyed: () => {
        try {
          localStorage.setItem(STORAGE_KEY, "1");
        } catch (e) {
        }
      }
    });
    driverRef.current = driverObj;
    if (autoStart) {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          const t = setTimeout(() => driverObj.drive(), 1e3);
          return () => clearTimeout(t);
        }
      } catch (e) {
      }
    }
    window.ondakaTour = {
      iniciar: () => driverObj.drive(),
      reset: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
        }
        driverObj.drive();
      }
    };
    return () => {
      driverObj.destroy();
      delete window.ondakaTour;
    };
  }, [role, permissions, autoStart]);
  return null;
}
function construirPassos(role, permissions = []) {
  const tem = (perm) => !perm || permissions.includes(perm);
  const isCondomino = role === "condomino";
  const isGuarda = role === "guarda";
  const isGestor = ["admin-empresa", "gestor", "super-admin"].includes(role ?? "");
  if (isCondomino) return filtrarPassos(passosCondomino(), tem);
  if (isGuarda) return filtrarPassos(passosGuarda(), tem);
  if (isGestor) return filtrarPassos(passosGestor(), tem);
  return passosGenerico();
}
function filtrarPassos(passos, tem) {
  return passos.filter((p) => tem(p.permissaoNecessaria));
}
function passosGestor() {
  return [
    {
      popover: {
        title: "🚀 Bem-vindo ao ONDAKA",
        description: "Esta é a sua plataforma de gestão de condomínios em Angola. Vamos dar uma volta detalhada por todas as áreas — pode saltar a qualquer momento.",
        side: "over",
        align: "center"
      }
    },
    // === SECÇÃO 1: PRINCIPAL ===
    {
      element: '[href="/dashboard"]',
      popover: {
        title: "📊 1. Painel principal",
        description: "Aqui vê resumo de tudo: KPIs (condomínios, imóveis, pendentes, receita), próximas assembleias e actividade recente. É o seu centro de controlo.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "condominios.ver",
      element: '[href="/condominios"]',
      popover: {
        title: "🏢 2. Condomínios",
        description: "A base de tudo. Crie aqui o seu primeiro condomínio com nome, NIF, morada, IBAN. Cada condomínio tem edifícios, fracções e condóminos.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "condominos.ver",
      element: '[href="/condominos"]',
      popover: {
        title: "👥 3. Condóminos",
        description: "Lista de todos os residentes (proprietários e inquilinos). Adicione contactos, BI, telefone para facilitar comunicação e cobrança.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "empresa.utilizadores.ver",
      element: '[href="/utilizadores"]',
      popover: {
        title: "👤 4. Utilizadores da plataforma",
        description: "Convide gestores, guardas, administradores e condóminos. Pode enviar convite por email+SMS ou criar directamente com password. Permissões específicas por função.",
        side: "right"
      }
    },
    // === SECÇÃO 2: OPERAÇÃO ===
    {
      permissaoNecessaria: "votacoes.ver",
      element: '[href="/assembleias"]',
      popover: {
        title: "🗳️ 5. Assembleias virtuais",
        description: "Agende assembleias gerais, conduza por videoconferência, faça votações electrónicas. Acta em PDF gerada automaticamente. Cumpre Decreto 141/15.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "visitantes.ver",
      element: '[href="/visitantes/dentro-agora"]',
      popover: {
        title: "🚪 6. Controlo de visitantes",
        description: "Veja quem está dentro do condomínio em tempo real. Pré-aprovações, registo de entradas/saídas, listas negras. Funciona com app de portaria.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "encomendas.ver",
      element: '[href="/encomendas"]',
      popover: {
        title: "📦 7. Encomendas",
        description: "Quando uma encomenda chega à portaria, regista-se e o destinatário é notificado por push/SMS automaticamente. Histórico completo.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "chat.usar",
      element: '[href="/tickets"]',
      popover: {
        title: "🔧 8. Pedidos de intervenção",
        description: "Condóminos abrem pedidos (avarias, queixas, sugestões). Atribua a prestadores, mude estado, comente. Tudo registado para histórico.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "empresa.configuracoes.editar",
      element: '[href="/admin/chatbot/faqs"]',
      popover: {
        title: "🤖 9. FAQs do Chatbot",
        description: "Configure perguntas frequentes específicas do seu condomínio (horários, regras, contactos). Os condóminos têm respostas instantâneas 24/7.",
        side: "right"
      }
    },
    // === SECÇÃO 3: FACTURAÇÃO ===
    {
      permissaoNecessaria: "pagamentos.ver",
      element: '[href="/pagamentos"]',
      popover: {
        title: "💳 10. Pagamentos",
        description: "Lista de todos os pagamentos recebidos. Confirme, rejeite ou converta em crédito. Integração com ProxyPay para Multicaixa Express e referências bancárias.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "facturacao.faturas.ver",
      element: '[href="/quotas"]',
      popover: {
        title: "💰 11. Taxas de Condomínio (Quotas)",
        description: "Gere quotas mensais com um clique. Sistema calcula proporcional à fracção (permilagem), aplica multas, gere extractos.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "pagamentos.ver",
      element: '[href="/creditos"]',
      popover: {
        title: "💵 12. Créditos",
        description: "Quando um condómino paga a mais ou tem reembolso, fica em crédito para abater na próxima quota. Controlo total de saldos.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "facturacao.faturas.ver",
      element: '[href="/lancamentos"]',
      popover: {
        title: "📝 13. Lançamentos manuais",
        description: "Registe despesas extra (manutenções, multas), receitas avulsas (parques alugados) ou ajustes. Tudo aparece nos relatórios.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "avisos.ver",
      element: 'a[href*="avisos"]',
      popover: {
        title: "📢 14. Avisos",
        description: "Comunique com condóminos por email + push + SMS. Modelos pré-prontos para cortes de água, assembleias, manutenções. Histórico de leituras.",
        side: "right"
      }
    },
    // === SECÇÃO 4: SUPORTE ===
    {
      popover: {
        title: "🤖 15. Chatbot da plataforma",
        description: "Botão flutuante no canto inferior direito. Faz perguntas em português sobre como usar a plataforma — 150+ respostas pré-preparadas, sem IA externa.",
        side: "over",
        align: "center"
      }
    },
    {
      element: "#tour-btn-aprenda",
      popover: {
        title: "🎓 16. Aprenda a usar",
        description: "Botão na barra superior — abre lista de tutoriais passo-a-passo das tarefas mais comuns. Ideal para quando precisa de aprender uma funcionalidade específica.",
        side: "bottom"
      }
    },
    {
      element: "#tour-btn-tour",
      popover: {
        title: "🗺️ 17. Reabrir este tour",
        description: "Pode voltar a fazer este tour a qualquer momento clicando neste botão. Sem stress!",
        side: "bottom"
      }
    },
    {
      element: "#tour-btn-suporte",
      popover: {
        title: "💬 18. Suporte por WhatsApp",
        description: "Precisa de ajuda humana? Clique aqui para falar directamente com a equipa ONDAKA via WhatsApp. Resposta rápida em horário comercial.",
        side: "bottom"
      }
    },
    // === SECÇÃO 5: CONFIG (super-admin only - ainda visível só para esses) ===
    {
      popover: {
        title: "⚙️ 19. Configurações importantes",
        description: "Há configurações importantes em cada condomínio: coordenadas bancárias, ProxyPay, quotas e multas. Configure ANTES de gerar a primeira quota.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "🔐 20. Segurança e 2FA",
        description: "Active a autenticação de 2 factores via SMS para mais segurança. No seu perfil, pode também alterar a sua password a qualquer momento.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "📱 21. App mobile",
        description: "A app ONDAKA está disponível para Android e iOS: os condóminos vêem quotas, pagam, consultam as contas do condomínio, recebem avisos e chamadas de voz. Portaria com SOS, chamadas e modo offline.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "📊 22. Relatórios",
        description: "Gere relatórios financeiros à medida (secções à escolha ou construtor visual drag-and-drop), exporte em PDF e agende o envio automático por email. Inclui exportação para contabilidade (CSV e SAF-T).",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "💼 23. Loja de Add-ons",
        description: "Expanda o ONDAKA com funcionalidades premium: Passe de Visitante, Lista Negra, Manutenção Preventiva, Dashboard BI, Importação Massiva e mais. Aceda em Funcionalidades no menu lateral.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "🚫 24. Lista Negra de Visitantes",
        description: "Bloqueie visitantes indesejados por BI, matrícula ou nome. Quando um visitante bloqueado tenta entrar, a portaria recebe alerta imediato. Aplica-se a todos os condomínios da empresa.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "🪪 25. Passe de Visitante com Branding",
        description: "O condómino solicita um passe digital para prestadores e trabalhadores — com foto, documento e QR Code. O gestor aprova e escolhe entre 12 modelos visuais por condomínio. Partilhável via WhatsApp.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "🔧 26. Manutenção Preventiva",
        description: "Registe equipamentos (elevadores, geradores, piscinas) com periodicidade de manutenção. Receba alertas automáticos a 30, 15 e 7 dias antes da data prevista. Histórico completo de manutenções.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "📊 27. Dashboard BI Executivo",
        description: "Painel de análise avançada com indicadores financeiros e operacionais em tempo real: receita cobrada vs prevista, taxa de cobrança, imóveis em dívida e evolução de pagamentos por condomínio.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "📥 28. Importação Massiva",
        description: "Adicione dezenas de condóminos de uma vez via ficheiro CSV. Descarregue o modelo, preencha e faça upload — com pré-visualização antes de confirmar. Poupa horas de trabalho manual.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "⚖️ 29. Conformidade legal",
        description: "A plataforma cumpre integralmente o Decreto Presidencial 141/15 (gestão de condomínios em Angola) — fundo de reserva, UCF, actas como título executivo.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "💡 30. Dica importante",
        description: "Comece sempre pelos CONDOMÍNIOS, depois EDIFÍCIOS, depois FRACÇÕES, depois CONDÓMINOS. Só depois disso pode gerar quotas. Esta sequência é fundamental.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "🔄 31. Subscrição e plano",
        description: "No menu CONTA, em Subscrição, pode mudar de plano (Mensal/Semestral/Anual), adicionar imóveis, ver facturas da plataforma e gerir pagamento.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "🎯 32. Pronto para começar!",
        description: "Comece pela criação do seu primeiro condomínio. Se precisar de ajuda, lembra-se: 🎓 Aprenda a Usar, 🗺️ Tour ou 💬 Suporte na top bar.",
        side: "over",
        align: "center"
      }
    },
    {
      popover: {
        title: "✨ Bom trabalho!",
        description: "O ONDAKA foi feito para simplificar a sua vida. Se tiver sugestões, partilhe connosco — somos uma equipa pequena que ouve os utilizadores. 🇦🇴",
        side: "over",
        align: "center"
      }
    }
  ];
}
function passosCondomino() {
  return [
    {
      popover: {
        title: "👋 Bem-vindo ao ONDAKA",
        description: "A plataforma de gestão do seu condomínio. Vamos mostrar-lhe o essencial em poucos passos.",
        side: "over",
        align: "center"
      }
    },
    {
      element: '[href="/dashboard"]',
      popover: {
        title: "📊 O seu painel",
        description: "Resumo da sua fracção: quotas pendentes, próximas assembleias, avisos importantes do condomínio.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "proprio.pagamentos.efectuar",
      element: '[href="/pagamentos"]',
      popover: {
        title: "💳 Pagamentos",
        description: "Pague as suas quotas online. Aceitamos Multicaixa Express, referência ATM e transferência bancária.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "proprio.faturas.ver",
      element: '[href="/quotas"]',
      popover: {
        title: "📋 Histórico de quotas",
        description: "Veja todas as suas quotas (pagas e pendentes), descarregue extractos e comprovativos.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "avisos.ver",
      element: 'a[href*="avisos"]',
      popover: {
        title: "🔔 Avisos do condomínio",
        description: "Comunicação oficial: cortes de água, manutenções, eventos. Receberá também por email e push.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "votacoes.ver",
      element: '[href="/assembleias"]',
      popover: {
        title: "🗳️ Assembleias",
        description: "Veja convocatórias, participe online por videoconferência e vote electronicamente. As suas decisões contam!",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "chat.usar",
      element: '[href="/tickets"]',
      popover: {
        title: "🔧 Abrir um pedido",
        description: "Reportar avarias, queixas de barulho, sugestões. A administração responde e atribui a um prestador.",
        side: "right"
      }
    },
    {
      element: "#tour-btn-suporte",
      popover: {
        title: "💬 Precisa de ajuda?",
        description: "Botão de suporte WhatsApp na top bar. Resposta rápida da equipa ONDAKA.",
        side: "bottom"
      }
    },
    {
      popover: {
        title: "✨ Pronto!",
        description: "Pode reabrir este tour a qualquer momento clicando em 🗺️ na top bar.",
        side: "over",
        align: "center"
      }
    }
  ];
}
function passosGuarda() {
  return [
    {
      popover: {
        title: "🛡️ Bem-vindo, guarda",
        description: "Plataforma de portaria ONDAKA. Vamos ver o essencial para o seu trabalho diário.",
        side: "over",
        align: "center"
      }
    },
    {
      permissaoNecessaria: "visitantes.ver",
      element: '[href="/visitantes/dentro-agora"]',
      popover: {
        title: "👥 Quem está dentro",
        description: "Lista em tempo real de visitantes dentro do condomínio. Registe entradas e saídas com 1 clique.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "encomendas.ver",
      element: '[href="/encomendas"]',
      popover: {
        title: "📦 Encomendas chegadas",
        description: "Quando chega uma encomenda, registe aqui (foto, transportadora, destinatário). O sistema notifica automaticamente.",
        side: "right"
      }
    },
    {
      permissaoNecessaria: "chat.usar",
      element: '[href="/tickets"]',
      popover: {
        title: "🔧 Reportar ocorrências",
        description: "Avarias, problemas de segurança, situações estranhas — abra um pedido aqui. A administração é alertada.",
        side: "right"
      }
    },
    {
      element: "#tour-btn-suporte",
      popover: {
        title: "💬 Precisa de ajuda técnica?",
        description: "Botão de suporte WhatsApp na top bar para questões técnicas da plataforma.",
        side: "bottom"
      }
    },
    {
      popover: {
        title: "✨ Bom trabalho!",
        description: "Use sempre a app de portaria no telemóvel para mais agilidade. Bom turno!",
        side: "over",
        align: "center"
      }
    }
  ];
}
function passosGenerico() {
  return [{
    popover: {
      title: "👋 Bem-vindo ao ONDAKA",
      description: "Explore o menu lateral à esquerda para começar.",
      side: "over",
      align: "center"
    }
  }];
}
const TUTORIAIS = [
  // ===== Relatórios & BI =====
  {
    id: "gerar-relatorio",
    titulo: "Gerar um relatório personalizado",
    descricao: "Escolha secções ou use o construtor visual para um PDF à medida",
    icon: FileBarChart,
    cor: "#A855F7",
    categoria: "Relatórios & BI",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/relatorios"]', titulo: "1. Abrir Relatórios", descricao: 'No menu, clique em "Relatórios".', side: "right" },
      { titulo: "2. Escolher secções", descricao: "Selecione as secções (receitas/despesas, cobrança, devedores, despesas por categoria, saúde financeira), o período e o condomínio.", side: "over" },
      { titulo: "3. Construtor visual (opcional)", descricao: 'Em "Construtor visual", arraste blocos para montar o relatório na ordem que quiser.', side: "over" },
      { titulo: "4. Gerar PDF", descricao: 'Clique em "Gerar PDF". Pode ainda agendar o envio automático por email.', side: "over" }
    ]
  },
  {
    id: "exportar-contabilidade",
    titulo: "Exportar para a contabilidade",
    descricao: "CSV para Excel ou ficheiro SAF-T (AO) para o ERP",
    icon: Calculator,
    cor: "#10B981",
    categoria: "Relatórios & BI",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/contabilidade"]', titulo: "1. Abrir Contabilidade", descricao: 'No menu Qualidade & BI, clique em "Contabilidade".', side: "right" },
      { titulo: "2. Escolher período", descricao: "Defina o período e o condomínio.", side: "over" },
      { titulo: "3. Exportar", descricao: "Exporte Recibos, Taxas ou Despesas em CSV, ou gere o SAF-T (AO) em XML para importar no PHC/Primavera.", side: "over" }
    ]
  },
  {
    id: "publicar-transparencia",
    titulo: "Publicar transparência financeira",
    descricao: "Dê aos condóminos acesso às contas do condomínio na app",
    icon: PieChart,
    cor: "#00D4FF",
    categoria: "Relatórios & BI",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { titulo: "1. Abrir o condomínio", descricao: "Vá ao detalhe do condomínio → Configuração → separador Quotas.", side: "over" },
      { titulo: "2. Ativar transparência", descricao: 'Ative "Publicar transparência financeira aos condóminos".', side: "over" },
      { titulo: "3. Guardar", descricao: "Os condóminos passam a ver as Contas do Condomínio na app (sem nomes de devedores).", side: "over" }
    ]
  },
  {
    id: "certificar-fornecedor",
    titulo: "Certificar um fornecedor",
    descricao: "Marque prestadores de confiança e acompanhe o preço médio",
    icon: BadgeCheck,
    cor: "#10B981",
    categoria: "Relatórios & BI",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/configuracoes/empresas-prestadoras"]', titulo: "1. Empresas Prestadoras", descricao: "Vá a Configurações → Empresas Prestadoras.", side: "right" },
      { titulo: "2. Certificar", descricao: "Clique no ícone de certificação (selo) ao lado do fornecedor de confiança.", side: "over" },
      { titulo: "3. Custo nas intervenções", descricao: "Ao atribuir um fornecedor a um Pedido, registe o custo — alimenta o nº de intervenções e o preço médio.", side: "over" }
    ]
  },
  // ===== Configuração inicial =====
  {
    id: "criar-condominio",
    permissaoNecessaria: "condominios.criar",
    titulo: "Criar primeiro condomínio",
    descricao: "Configure um novo condomínio de raiz com edifícios e fracções",
    icon: Building2,
    cor: "#00D4FF",
    categoria: "Configuração inicial",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/condominios"]', titulo: "1. Abrir Condomínios", descricao: 'No menu lateral, clique em "Condomínios".', side: "right" },
      { titulo: "2. Botão Novo", descricao: 'Na página de listagem, clique em "+ Novo condomínio" no canto superior direito.', side: "over" },
      { titulo: "3. Preencher dados", descricao: "Nome, NIF, morada, número de polícia, IBAN do condomínio. Tudo obrigatório.", side: "over" },
      { titulo: "4. Guardar", descricao: 'Clique em "Criar". Depois adicione edifícios, fracções e condóminos a partir do detalhe.', side: "over" }
    ]
  },
  {
    id: "configurar-facturacao",
    permissaoNecessaria: "facturacao.quotas.configurar",
    titulo: "Configurar facturação do condomínio",
    descricao: "Definir coordenadas bancárias, ProxyPay, regras de quotas e multas",
    icon: Settings,
    cor: "#10B981",
    categoria: "Configuração inicial",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/condominios"]', titulo: "1. Abrir Condomínios", descricao: 'No menu, vá a "Condomínios" e clique no condomínio que quer configurar.', side: "right" },
      { titulo: "2. Configurar facturação", descricao: 'Na página de detalhe, clique no botão "Configurar facturação".', side: "over" },
      { titulo: "3. Coordenadas Bancárias", descricao: "Tab 1: IBAN, banco, NIB para receber transferências.", side: "over" },
      { titulo: "4. ProxyPay", descricao: "Tab 2: configurar Sender ID e Entity ID para gerar referências Multicaixa.", side: "over" },
      { titulo: "5. Quotas", descricao: "Tab 3: dia do mês para gerar quota, valor base por permilagem, regras de cálculo.", side: "over" },
      { titulo: "6. Multas", descricao: "Tab 4: percentagem de multa por atraso, dias de tolerância, juros.", side: "over" }
    ]
  },
  // ===== Utilizadores =====
  {
    id: "convidar-utilizador",
    permissaoNecessaria: "empresa.utilizadores.criar",
    titulo: "Convidar gestor / guarda / utilizador",
    descricao: "Adicionar membros à sua equipa por email + SMS",
    icon: UserPlus,
    cor: "#A855F7",
    categoria: "Utilizadores",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/utilizadores"]', titulo: "1. Abrir Utilizadores", descricao: 'No menu lateral em "Principal", clique em "Utilizadores".', side: "right" },
      { titulo: "2. Novo utilizador", descricao: 'Clique no botão "+ Novo utilizador" no topo direito.', side: "over" },
      { titulo: "3. Aba Convidar por email", descricao: "Aba activa por defeito. Preencha nome, email, telefone (opcional para SMS), função.", side: "over" },
      { titulo: "4. Para guarda", descricao: 'Se a função for "Guarda", "Admin Condomínio" ou "Condómino", aparece selector de Condomínio — obrigatório.', side: "over" },
      { titulo: "5. Enviar convite", descricao: 'Clique em "Enviar convite". O utilizador recebe email (e SMS) com link para definir password.', side: "over" }
    ]
  },
  {
    id: "criar-com-password",
    permissaoNecessaria: "empresa.utilizadores.criar",
    titulo: "Criar utilizador com password directa",
    descricao: "Alternativa ao convite: definir password na hora",
    icon: KeyRound,
    cor: "#EC4899",
    categoria: "Utilizadores",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/utilizadores"]', titulo: "1. Abrir Utilizadores", descricao: 'No menu, clique em "Utilizadores".', side: "right" },
      { titulo: "2. Novo utilizador", descricao: 'Clique em "+ Novo utilizador".', side: "over" },
      { titulo: "3. Aba Criar com password", descricao: 'Mude para a 2ª aba "Criar com password".', side: "over" },
      { titulo: "4. Dados + password", descricao: "Preencha tudo + uma password mínima de 8 caracteres.", side: "over" },
      { titulo: "5. Forçar troca", descricao: 'Marque "Forçar troca no primeiro login" (recomendado) — o utilizador será obrigado a definir nova password ao entrar.', side: "over" },
      { titulo: "6. Comunicar", descricao: "Após criar, comunique a password ao utilizador por canal seguro (telefone, presencial, etc).", side: "over" }
    ]
  },
  {
    id: "mudar-condominio-guarda",
    permissaoNecessaria: "empresa.utilizadores.editar",
    titulo: "Reatribuir guarda a outro condomínio",
    descricao: "Mudar o condomínio activo de um guarda ou admin condomínio",
    icon: Building2,
    cor: "#F59E0B",
    categoria: "Utilizadores",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/utilizadores"]', titulo: "1. Abrir Utilizadores", descricao: 'No menu, clique em "Utilizadores".', side: "right" },
      { titulo: "2. Encontrar o guarda", descricao: 'Use o filtro "Função → Guarda" ou pesquise pelo nome.', side: "over" },
      { titulo: "3. Menu de acções", descricao: "Clique nos 3 pontos (...) na linha do guarda.", side: "over" },
      { titulo: "4. Mudar condomínio", descricao: 'Selecione "Mudar condomínio" e escolha o novo condomínio.', side: "over" }
    ]
  },
  // ===== Facturação =====
  {
    id: "gerar-quotas",
    permissaoNecessaria: "facturacao.faturas.criar",
    titulo: "Gerar quotas mensais",
    descricao: "Calcular e emitir quotas para todas as fracções",
    icon: Receipt,
    cor: "#EC4899",
    categoria: "Facturação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/quotas"]', titulo: "1. Abrir Taxas de Condomínio", descricao: 'No menu Facturação, clique em "Taxas de Condomínio".', side: "right" },
      { titulo: "2. Botão Gerar quotas", descricao: 'No topo da página, clique em "Gerar quotas". Sistema calcula automaticamente baseado na permilagem de cada fracção.', side: "over" },
      { titulo: "3. Confirmar", descricao: "Sistema gera quotas para todas as fracções activas do condomínio. Cada uma com sua referência ProxyPay.", side: "over" },
      { titulo: "4. Notificar condóminos", descricao: 'Envie um aviso geral em "Avisos" a informar que as quotas foram emitidas.', side: "over" }
    ]
  },
  {
    id: "confirmar-pagamento",
    permissaoNecessaria: "pagamentos.reconciliar",
    titulo: "Confirmar pagamento manual",
    descricao: "Quando recebe transferência ou depósito bancário",
    icon: CreditCard,
    cor: "#10B981",
    categoria: "Facturação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/pagamentos"]', titulo: "1. Abrir Pagamentos", descricao: 'No menu, clique em "Pagamentos".', side: "right" },
      { titulo: "2. Filtrar pendentes", descricao: 'Filtre por estado "Pendente" ou "Em revisão".', side: "over" },
      { titulo: "3. Abrir pagamento", descricao: "Clique no pagamento que quer processar.", side: "over" },
      { titulo: "4. Confirmar", descricao: 'Verifique comprovativo, valor, data. Clique "Confirmar". A quota associada é marcada como paga.', side: "over" }
    ]
  },
  {
    id: "criar-credito",
    permissaoNecessaria: "pagamentos.reembolsar",
    titulo: "Devolver crédito a um condómino",
    descricao: "Quando há pagamento a mais ou ajuste favorável",
    icon: Wallet,
    cor: "#A855F7",
    categoria: "Facturação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/pagamentos"]', titulo: "1. Abrir o pagamento", descricao: 'Em "Pagamentos", abra o pagamento confirmado a converter em crédito.', side: "right" },
      { titulo: "2. Converter em crédito", descricao: 'No detalhe, clique em "Converter em crédito". Indique o valor e nota.', side: "over" },
      { titulo: "3. Crédito disponível", descricao: "O crédito fica disponível na fracção para abater na próxima quota — automaticamente.", side: "over" }
    ]
  },
  {
    id: "lancamento-manual",
    permissaoNecessaria: "facturacao.faturas.criar",
    titulo: "Registar lançamento manual",
    descricao: "Despesa extra, receita avulsa ou ajuste",
    icon: FileText,
    cor: "#F59E0B",
    categoria: "Facturação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin"],
    passos: [
      { elemento: '[href="/lancamentos"]', titulo: "1. Abrir Lançamentos", descricao: 'No menu Facturação, clique em "Lançamentos".', side: "right" },
      { titulo: "2. Novo lançamento", descricao: 'Clique em "+ Novo lançamento".', side: "over" },
      { titulo: "3. Tipo", descricao: "Escolha: Despesa (gastos do condomínio), Receita (entradas extra), Ajuste.", side: "over" },
      { titulo: "4. Multi-fracção", descricao: "Pode dividir por todas as fracções proporcionalmente, ou aplicar a uma só.", side: "over" }
    ]
  },
  // ===== Comunicação =====
  {
    id: "enviar-aviso",
    permissaoNecessaria: "avisos.criar",
    titulo: "Enviar aviso aos condóminos",
    descricao: "Comunicação por email + push + SMS",
    icon: Bell,
    cor: "#3B82F6",
    categoria: "Comunicação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin", "administrador-condominio"],
    passos: [
      { elemento: 'a[href*="avisos"]', titulo: "1. Abrir Avisos", descricao: 'No menu, clique em "Avisos".', side: "right" },
      { titulo: "2. Novo aviso", descricao: 'Clique em "+ Novo aviso".', side: "over" },
      { titulo: "3. Conteúdo", descricao: 'Título, mensagem (suporta Markdown), data programada (ou "agora").', side: "over" },
      { titulo: "4. Segmentação", descricao: "Escolher: todos os condóminos, edifício específico, fracção, ou role.", side: "over" },
      { titulo: "5. Canais", descricao: "Escolher: email (sempre), push (se app instalada), SMS (custo extra).", side: "over" }
    ]
  },
  {
    id: "configurar-faqs",
    permissaoNecessaria: "empresa.configuracoes.editar",
    titulo: "Configurar FAQs do chatbot",
    descricao: "Respostas automáticas para perguntas frequentes do seu condomínio",
    icon: MessageSquare,
    cor: "#A855F7",
    categoria: "Comunicação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin", "administrador-condominio"],
    passos: [
      { elemento: '[href="/admin/chatbot/faqs"]', titulo: "1. Abrir FAQs", descricao: 'No menu, "FAQs do Chatbot".', side: "right" },
      { titulo: "2. Nova FAQ", descricao: 'Clique em "+ Nova FAQ".', side: "over" },
      { titulo: "3. Pergunta + resposta", descricao: "Escreva pergunta clara e resposta detalhada (Markdown suportado).", side: "over" },
      { titulo: "4. Keywords", descricao: "Adicione até 10 palavras-chave (JSON) que activam esta resposta.", side: "over" },
      { titulo: "5. Drag-and-drop", descricao: "Reordene as FAQs por relevância arrastando.", side: "over" }
    ]
  },
  // ===== Operação =====
  {
    id: "agendar-assembleia",
    permissaoNecessaria: "votacoes.criar",
    titulo: "Agendar assembleia geral",
    descricao: "Convocação, ordem do dia e votação electrónica",
    icon: Calendar,
    cor: "#00D4FF",
    categoria: "Operação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin", "administrador-condominio"],
    passos: [
      { elemento: '[href="/assembleias"]', titulo: "1. Abrir Assembleias", descricao: 'No menu Operação, clique em "Assembleias".', side: "right" },
      { titulo: "2. Nova assembleia", descricao: 'Clique em "+ Nova assembleia".', side: "over" },
      { titulo: "3. Tipo + data", descricao: "Ordinária ou extraordinária, data, hora, local físico (se aplicável).", side: "over" },
      { titulo: "4. Modo", descricao: "Virtual (videoconferência automática), presencial, ou híbrida.", side: "over" },
      { titulo: "5. Ordem do dia", descricao: "Liste pontos a discutir. Cada ponto pode ter uma votação associada.", side: "over" },
      { titulo: "6. Convocatórias", descricao: "Sistema envia convocatória automática a todos os condóminos por email.", side: "over" }
    ]
  },
  {
    id: "gerir-pedidos",
    permissaoNecessaria: "chat.usar",
    titulo: "Atender pedidos de manutenção",
    descricao: "Atribuir, mudar estado, comentar tickets",
    icon: Wrench,
    cor: "#F59E0B",
    categoria: "Operação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin", "administrador-condominio"],
    passos: [
      { elemento: '[href="/tickets"]', titulo: "1. Abrir Pedidos de intervenção", descricao: 'No menu Operação, clique em "Pedidos de intervenção".', side: "right" },
      { titulo: "2. Filtrar abertos", descricao: 'Filtre por estado "Aberto" para ver os por atender.', side: "over" },
      { titulo: "3. Abrir ticket", descricao: "Clique no ticket. Veja descrição, fotos anexadas, condómino que reportou.", side: "over" },
      { titulo: "4. Atribuir", descricao: "Atribua a um prestador (canalizador, electricista, etc).", side: "over" },
      { titulo: "5. Mudar estado", descricao: 'À medida que avança: "Em curso" → "Concluído". Comente para histórico.', side: "over" }
    ]
  },
  {
    id: "pre-aprovar-visitante",
    permissaoNecessaria: "visitantes.autorizar",
    titulo: "Pré-aprovar um visitante",
    descricao: "Para que a portaria deixe entrar sem confirmação",
    icon: Users,
    cor: "#EF4444",
    categoria: "Operação",
    rolesPermitidos: ["admin-empresa", "gestor", "super-admin", "administrador-condominio", "condomino"],
    passos: [
      { elemento: '[href="/visitantes/dentro-agora"]', titulo: "1. Abrir Visitantes", descricao: 'No menu, "Visitantes".', side: "right" },
      { titulo: "2. Pré-aprovações", descricao: 'Vá ao separador "Pré-aprovações".', side: "over" },
      { titulo: "3. Nova pré-aprovação", descricao: 'Clique em "+ Nova". Indique nome, BI, validade (ex: hoje 14h-18h).', side: "over" },
      { titulo: "4. Partilhar QR", descricao: "Sistema gera QR Code para o visitante mostrar à portaria.", side: "over" }
    ]
  },
  // ===== Tutoriais para CONDÓMINO =====
  {
    id: "pagar-quota",
    permissaoNecessaria: "proprio.pagamentos.efectuar",
    titulo: "Pagar quota de condomínio",
    descricao: "Aprenda a efectuar o pagamento da sua quota mensal",
    icon: CreditCard,
    cor: "#10B981",
    categoria: "Condóminos",
    rolesPermitidos: ["condomino"],
    passos: [
      { elemento: '[href="/pagamentos"]', titulo: "1. Abrir Pagamentos", descricao: 'No menu lateral, clique em "Pagamentos".', side: "right" },
      { titulo: "2. Quota pendente", descricao: 'Veja a sua quota em aberto. Clique no botão "Pagar".', side: "over" },
      { titulo: "3. Escolher método", descricao: "Multicaixa Express (rápido), referência ATM ou transferência bancária.", side: "over" },
      { titulo: "4. Confirmar pagamento", descricao: "Após pagar, o sistema actualiza automaticamente em poucos minutos.", side: "over" }
    ]
  },
  {
    id: "ver-extrato",
    permissaoNecessaria: "proprio.extrato.ver",
    titulo: "Ver o meu extracto",
    descricao: "Consultar histórico de quotas, pagamentos e saldo da sua fracção",
    icon: FileText,
    cor: "#A855F7",
    categoria: "Condóminos",
    rolesPermitidos: ["condomino"],
    passos: [
      { titulo: "1. Aceder ao perfil", descricao: "Clique no seu nome no canto superior direito.", side: "over" },
      { titulo: "2. Extracto", descricao: 'No menu, encontre "Extracto" ou "Histórico".', side: "over" },
      { titulo: "3. Ler", descricao: "Veja todas as suas quotas, pagamentos efectuados e saldo actual.", side: "over" },
      { titulo: "4. Exportar", descricao: "Pode descarregar PDF para guardar ou apresentar em assembleia.", side: "over" }
    ]
  },
  {
    id: "pre-autorizar-visita",
    permissaoNecessaria: "proprio.visitantes.pre_autorizar",
    titulo: "Pré-autorizar uma visita",
    descricao: "Para que a portaria deixe entrar a sua visita sem confirmação",
    icon: Users,
    cor: "#EF4444",
    categoria: "Condóminos",
    rolesPermitidos: ["condomino"],
    passos: [
      { elemento: '[href="/visitantes/dentro-agora"]', titulo: "1. Abrir Visitantes", descricao: 'No menu, clique em "Visitantes".', side: "right" },
      { titulo: "2. Nova autorização", descricao: 'Clique em "+ Pré-autorizar".', side: "over" },
      { titulo: "3. Dados", descricao: "Nome, BI, validade (ex: hoje 14h-18h ou para sempre).", side: "over" },
      { titulo: "4. QR Code", descricao: "O sistema gera um QR Code que pode partilhar com a visita.", side: "over" }
    ]
  },
  {
    id: "votar-assembleia",
    permissaoNecessaria: "proprio.votacoes.participar",
    titulo: "Participar em votações",
    descricao: "Votar em assembleia online (mesmo sem estar presente)",
    icon: Calendar,
    cor: "#00D4FF",
    categoria: "Condóminos",
    rolesPermitidos: ["condomino"],
    passos: [
      { elemento: '[href="/assembleias"]', titulo: "1. Abrir Assembleias", descricao: 'No menu, clique em "Assembleias".', side: "right" },
      { titulo: "2. Assembleia activa", descricao: "Veja a assembleia em curso ou agendada.", side: "over" },
      { titulo: "3. Participar", descricao: "Clique para entrar na videoconferência ou ler ordem do dia.", side: "over" },
      { titulo: "4. Votar", descricao: 'Em cada ponto da ordem do dia com votação, escolha "A favor", "Contra" ou "Abstenção".', side: "over" }
    ]
  },
  {
    id: "editar-perfil",
    permissaoNecessaria: "proprio.perfil.editar",
    titulo: "Editar o meu perfil",
    descricao: "Alterar telefone, palavra-passe, foto, dados de contacto",
    icon: KeyRound,
    cor: "#EC4899",
    categoria: "Condóminos",
    rolesPermitidos: ["condomino"],
    passos: [
      { titulo: "1. Aceder ao perfil", descricao: "Clique no seu nome no canto superior direito.", side: "over" },
      { titulo: "2. Definições", descricao: 'No menu, escolha "Definições" ou "Perfil".', side: "over" },
      { titulo: "3. Editar", descricao: 'Altere telefone, foto. Para a palavra-passe, use "Alterar password".', side: "over" },
      { titulo: "4. Guardar", descricao: 'Clique em "Guardar" para confirmar as alterações.', side: "over" }
    ]
  },
  {
    id: "ver-avisos",
    permissaoNecessaria: "avisos.ver",
    titulo: "Ver avisos do condomínio",
    descricao: "Comunicação oficial: cortes de água, manutenções, eventos",
    icon: Bell,
    cor: "#3B82F6",
    categoria: "Condóminos",
    rolesPermitidos: ["condomino"],
    passos: [
      { elemento: 'a[href*="avisos"]', titulo: "1. Abrir Avisos", descricao: 'No menu, clique em "Avisos".', side: "right" },
      { titulo: "2. Lista", descricao: "Veja todos os avisos publicados pela administração, ordenados do mais recente para o mais antigo.", side: "over" },
      { titulo: "3. Detalhe", descricao: "Clique num aviso para ver o conteúdo completo (texto, anexos).", side: "over" },
      { titulo: "4. Notificações", descricao: "Receberá também notificação por email e push (app móvel) sempre que houver novo aviso.", side: "over" }
    ]
  }
];
function AprendaUsar({ aberto, onClose, role, permissions = [] }) {
  const [busca, setBusca] = useState("");
  const [tutorialActivo, setTutorialActivo] = useState(null);
  if (!aberto) return null;
  const tutoriais = TUTORIAIS.filter((t) => {
    if (t.rolesPermitidos.length > 0 && role && !t.rolesPermitidos.includes(role)) return false;
    if (t.permissaoNecessaria && !permissions.includes(t.permissaoNecessaria)) return false;
    if (busca) {
      const t2 = busca.toLowerCase();
      return t.titulo.toLowerCase().includes(t2) || t.descricao.toLowerCase().includes(t2);
    }
    return true;
  });
  const categorias = Array.from(new Set(tutoriais.map((t) => t.categoria)));
  const iniciarTutorial = (tutorial) => {
    onClose();
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.7,
      stagePadding: 4,
      popoverClass: "ondaka-tour-popover",
      nextBtnText: "Próximo →",
      prevBtnText: "← Anterior",
      doneBtnText: "Concluído ✓",
      progressText: "Passo {{current}} de {{total}}",
      steps: tutorial.passos.map((p) => ({
        element: p.elemento,
        popover: {
          title: p.titulo,
          description: p.descricao,
          side: p.side ?? "over",
          align: "center"
        }
      }))
    });
    setTimeout(() => driverObj.drive(), 300);
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-md py-8 px-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-2xl mx-auto shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(GraduationCap, { className: "w-5 h-5 text-[#00D4FF]" }),
        "Aprenda a usar"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-4", children: "Escolha um tutorial passo-a-passo. O sistema vai guiar-lhe directamente pela acção." }),
      /* @__PURE__ */ jsxs("div", { className: "relative mb-5", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Pesquisar tutorial...",
            value: busca,
            onChange: (e) => setBusca(e.target.value),
            className: "w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#00D4FF]/50 text-white"
          }
        )
      ] }),
      tutoriais.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-white/40 text-sm", children: "Nenhum tutorial encontrado." }) : /* @__PURE__ */ jsx("div", { className: "space-y-5", children: categorias.map((cat) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-[#00D4FF] font-semibold mb-2", children: cat }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: tutoriais.filter((t) => t.categoria === cat).map((t) => {
          const Icon = t.icon;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => iniciarTutorial(t),
              className: "w-full text-left p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition group flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    style: { background: `${t.cor}15`, border: `0.5px solid ${t.cor}30` },
                    children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5", style: { color: t.cor } })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white", children: t.titulo }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-white/50 mt-0.5", children: t.descricao })
                ] }),
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-white/30 group-hover:text-white/60 transition flex-shrink-0" })
              ]
            },
            t.id
          );
        }) })
      ] }, cat)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-5 py-3 border-t border-white/5 text-[11px] text-white/40 text-center", children: [
      "Não encontra o que procura? Use o ",
      /* @__PURE__ */ jsx("strong", { className: "text-white/60", children: "Suporte WhatsApp" }),
      " 💬 ou o ",
      /* @__PURE__ */ jsx("strong", { className: "text-white/60", children: "Chatbot" }),
      " 🤖"
    ] })
  ] }) });
}
const SUPORTE = {
  whatsapp: {
    // formato para wa.me (sem '+', sem espaços)
    url: "https://wa.me/244929167474",
    mensagemPreFeita: "Olá ONDAKA! Preciso de ajuda com a plataforma."
  }
};
function abrirWhatsAppSuporte(mensagemPersonalizada) {
  const msg = encodeURIComponent(SUPORTE.whatsapp.mensagemPreFeita);
  const url = `${SUPORTE.whatsapp.url}?text=${msg}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
function BellNotificacoes() {
  const [aberto, setAberto] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const refPanel = useRef(null);
  const carregar = () => {
    setCarregando(true);
    fetch("/notificacoes", {
      headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin"
    }).then((r) => r.json()).then((res) => {
      setNotifs(res.notificacoes ?? []);
      setNaoLidas(res.nao_lidas ?? 0);
    }).catch(() => {
    }).finally(() => setCarregando(false));
  };
  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 6e4);
    return () => clearInterval(intervalo);
  }, []);
  useEffect(() => {
    if (!aberto) return;
    const handler = (e) => {
      if (refPanel.current && !refPanel.current.contains(e.target)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [aberto]);
  const csrfToken = () => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return (meta == null ? void 0 : meta.content) ?? "";
  };
  const clicarNotif = (n) => {
    if (!n.lida) {
      fetch(`/notificacoes/${n.id}/marcar-lida`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrfToken()
        },
        credentials: "same-origin"
      }).catch(() => {
      });
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, lida: true } : x));
      setNaoLidas((prev) => Math.max(0, prev - 1));
    }
    if (n.url) {
      setAberto(false);
      router.visit(n.url);
    }
  };
  const marcarTodas = () => {
    fetch("/notificacoes/marcar-todas-lidas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": csrfToken()
      },
      credentials: "same-origin"
    }).catch(() => {
    });
    setNotifs((prev) => prev.map((x) => ({ ...x, lida: true })));
    setNaoLidas(0);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", ref: refPanel, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setAberto((v) => !v),
        className: "p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition relative",
        "aria-label": "Notificações",
        children: [
          /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }),
          naoLidas > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center", children: naoLidas > 9 ? "9+" : naoLidas })
        ]
      }
    ),
    aberto && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[#16163A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white", children: "Notificações" }),
        naoLidas > 0 && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: marcarTodas,
            className: "inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition",
            children: [
              /* @__PURE__ */ jsx(CheckCheck, { className: "h-3 w-3" }),
              "Marcar todas como lidas"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-[400px] overflow-y-auto", children: carregando && notifs.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-white/40 py-8", children: "A carregar..." }) : notifs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 px-4", children: [
        /* @__PURE__ */ jsx(Bell, { className: "h-8 w-8 text-white/20 mx-auto mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40", children: "Sem notificações por agora." })
      ] }) : notifs.map((n) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => clicarNotif(n),
          className: `w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition flex items-start gap-3 ${!n.lida ? "bg-cyan-500/5" : ""}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "mt-0.5", children: !n.lida ? /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-pink-500" }) : /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-transparent" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${!n.lida ? "text-white" : "text-white/70"}`, children: n.titulo }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mt-0.5 line-clamp-2", children: n.mensagem }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/30 mt-1", children: n.created_human })
            ] })
          ]
        },
        n.id
      )) })
    ] })
  ] });
}
function formatarSlug(slug) {
  return slug.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
function formatarPreco(preco) {
  if (preco === void 0 || preco === null || preco === "") return null;
  const n = typeof preco === "string" ? parseFloat(preco) : preco;
  if (isNaN(n) || n <= 0) return null;
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0
  }).format(n).replace("AOA", "Kz");
}
function AddonPremiumModal() {
  const [slug, setSlug] = useState(null);
  const [iniciandoTrial, setIniciandoTrial] = useState(false);
  const [solicitandoActivacao, setSolicitandoActivacao] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      var _a;
      const ev = e;
      if ((_a = ev.detail) == null ? void 0 : _a.slug) {
        setSlug(ev.detail.slug);
      }
    };
    window.addEventListener("ondaka:premium-modal", handler);
    return () => {
      window.removeEventListener("ondaka:premium-modal", handler);
    };
  }, []);
  useEffect(() => {
    if (!slug) return;
    const handleEsc = (e) => {
      if (e.key === "Escape" && !iniciandoTrial) setSlug(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [slug, iniciandoTrial]);
  useEffect(() => {
    if (!slug) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [slug]);
  if (!slug) return null;
  const catalog = window.__ondakaFeaturesCatalog ?? {};
  const entry = catalog[slug];
  const nome = (entry == null ? void 0 : entry.nome) ?? formatarSlug(slug);
  const descricao = (entry == null ? void 0 : entry.descricao) ?? "Esta é uma funcionalidade premium da Loja ONDAKA. Active-a para desbloquear capacidades adicionais para o seu condomínio.";
  const precoFormatado = formatarPreco(entry == null ? void 0 : entry.preco_kz);
  const trialDisponivel = (entry == null ? void 0 : entry.trial_usado) !== true;
  const fechar = () => {
    if (iniciandoTrial) return;
    setSlug(null);
  };
  const iniciarTrial = () => {
    if (iniciandoTrial) return;
    setIniciandoTrial(true);
    router.post(
      `/funcionalidades/${slug}/trial`,
      {},
      {
        preserveScroll: true,
        onFinish: () => {
          setIniciandoTrial(false);
          setSlug(null);
        }
      }
    );
  };
  const solicitarActivacao = () => {
    if (solicitandoActivacao) return;
    setSolicitandoActivacao(true);
    router.post(
      `/funcionalidades/${slug}/activar`,
      {},
      {
        preserveScroll: true,
        onFinish: () => {
          setSolicitandoActivacao(false);
          setSlug(null);
        }
      }
    );
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "addon-premium-modal-title",
      className: "fixed inset-0 z-[100] flex items-center justify-center p-4",
      onClick: fechar,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 bg-black/70 backdrop-blur-sm",
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "relative px-6 py-5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: fechar,
                    disabled: iniciandoTrial,
                    "aria-label": "Fechar",
                    className: "absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50",
                    children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-white", "aria-hidden": "true" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-2.5 rounded-xl bg-white/20 backdrop-blur-sm", children: /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5 text-white", "aria-hidden": "true" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-0.5", children: [
                      /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5 text-white", "aria-hidden": "true" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-white/90 uppercase tracking-wider", children: "Funcionalidade Premium" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "h2",
                      {
                        id: "addon-premium-modal-title",
                        className: "text-lg font-bold text-white",
                        children: nome
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "px-6 py-5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 leading-relaxed mb-4", children: descricao }),
                precoFormatado && /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5 mb-4 px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-400 uppercase tracking-wide", children: "A partir de" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-white", children: precoFormatado }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-400", children: "/mês" })
                ] }),
                trialDisponivel && /* @__PURE__ */ jsxs("div", { className: "mb-4 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                    /* @__PURE__ */ jsx(Gift, { className: "w-4 h-4 text-cyan-400", "aria-hidden": "true" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-cyan-300", children: "Experimente 7 dias grátis" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400", children: "Sem compromisso. Cancele quando quiser durante o trial." })
                ] }),
                (entry == null ? void 0 : entry.categoria) && /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("span", { className: "inline-block px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-700", children: entry.categoria }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-zinc-950/50 border-t border-zinc-800 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: fechar,
                    disabled: iniciandoTrial,
                    className: "px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-lg transition-colors disabled:opacity-50",
                    children: "Fechar"
                  }
                ),
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: `/funcionalidades/${slug}`,
                    onClick: () => setSlug(null),
                    className: "inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-300 rounded-lg border border-zinc-600 hover:border-zinc-400 hover:text-white transition-colors",
                    children: [
                      "Saber mais",
                      /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4", "aria-hidden": "true" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: solicitarActivacao,
                    disabled: solicitandoActivacao,
                    className: "inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-wait",
                    children: solicitandoActivacao ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin", "aria-hidden": "true" }),
                      "A enviar pedido..."
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(CreditCard, { className: "w-4 h-4", "aria-hidden": "true" }),
                      "Activar subscrição"
                    ] })
                  }
                ),
                trialDisponivel && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: iniciarTrial,
                    disabled: iniciandoTrial,
                    className: "inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-wait",
                    children: iniciandoTrial ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin", "aria-hidden": "true" }),
                      "A activar..."
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Gift, { className: "w-4 h-4", "aria-hidden": "true" }),
                      "Experimentar 7 dias"
                    ] })
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
function useFeatures(slugs) {
  const { props } = usePage();
  const features = props.features ?? {};
  return slugs.reduce(
    (acc, slug) => {
      acc[slug] = features[slug] === true;
      return acc;
    },
    {}
  );
}
function AuthenticatedLayout({ children }) {
  var _a, _b, _c, _d, _e, _f, _g;
  const { auth, flash, url } = usePage().props;
  const currentUrl = usePage().url || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [aprendaAberto, setAprendaAberto] = useState(false);
  const [sosCriticosAbertos, setSosCriticosAbertos] = useState(0);
  const [seccoesAbertas, setSeccoesAbertas] = useState(() => {
    if (typeof window === "undefined") return { PRINCIPAL: true };
    try {
      const saved = localStorage.getItem("ondaka.sidebar.seccoes");
      if (saved) return JSON.parse(saved);
    } catch {
    }
    return { PRINCIPAL: true };
  });
  useEffect(() => {
    try {
      localStorage.setItem("ondaka.sidebar.seccoes", JSON.stringify(seccoesAbertas));
    } catch {
    }
  }, [seccoesAbertas]);
  const toggleSeccao = (titulo) => {
    setSeccoesAbertas((prev) => ({ ...prev, [titulo]: !prev[titulo] }));
  };
  const sosIdsSeenRef = useRef(/* @__PURE__ */ new Set());
  const sosFirstLoadRef = useRef(true);
  useEffect(() => {
    if (flash == null ? void 0 : flash.success) toast.success(flash.success);
    if (flash == null ? void 0 : flash.error) toast.error(flash.error);
    if (flash == null ? void 0 : flash.info) toast.info(flash.info);
    if (flash == null ? void 0 : flash.warning) toast.warning(flash.warning);
  }, [flash]);
  useEffect(() => {
    console.log("[SOS] Hook init. Roles:", auth.user.roles);
    const podeVerSos = (auth.user.roles ?? []).some(
      (r) => ["super-admin", "admin-empresa", "gestor", "administrador-condominio"].includes(r)
    );
    console.log("[SOS] Pode ver SOS?", podeVerSos);
    if (!podeVerSos) return;
    let audioCtx = null;
    const getOrCreateCtx = () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    };
    const unlockAudio = async () => {
      try {
        const ctx = getOrCreateCtx();
        if (ctx.state === "suspended") {
          await ctx.resume();
          console.log("[SOS] 🔊 AudioContext destravado pelo user");
        }
      } catch (e) {
        console.warn("[SOS] Erro ao destravar áudio:", e);
      }
    };
    window.addEventListener("click", unlockAudio, { once: false });
    window.addEventListener("keydown", unlockAudio, { once: false });
    const tocarSirene = async () => {
      try {
        const ctx = getOrCreateCtx();
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        console.log("[SOS] AudioContext state:", ctx.state);
        if (ctx.state !== "running") {
          console.warn("[SOS] AudioContext não está running. Estado:", ctx.state);
          return;
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.6);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.9);
        gain.gain.setValueAtTime(1e-3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.3);
        console.log("[SOS] 🔔 Sirene tocou com sucesso");
      } catch (e) {
        console.warn("[SOS] Erro ao tocar sirene:", e);
      }
    };
    const fetchSos = async () => {
      try {
        console.log("[SOS] Polling...");
        const r = await fetch("/sos/alertas/data", { headers: { Accept: "application/json" } });
        if (!r.ok) {
          console.log("[SOS] Response not OK:", r.status);
          return;
        }
        const json = await r.json();
        const alertas = json.data || [];
        console.log("[SOS] Alertas recebidos:", alertas.length, "first load?", sosFirstLoadRef.current);
        const criticos = alertas.filter((a) => a.estado === "aberto" && a.gravidade === "critico").length;
        setSosCriticosAbertos(criticos);
        const idsAbertos = alertas.filter((a) => a.estado === "aberto" && (a.gravidade === "critico" || a.gravidade === "alto")).map((a) => a.id);
        if (!sosFirstLoadRef.current) {
          const novos = idsAbertos.filter((id) => !sosIdsSeenRef.current.has(id));
          console.log("[SOS] Novos detectados:", novos.length, "path actual:", window.location.pathname);
          if (novos.length > 0 && !window.location.pathname.startsWith("/sos/alertas")) {
            console.log("[SOS] TOCANDO SIRENE para alerta", novos[0]);
            const alertaNovo = alertas.find((a) => a.id === novos[0]);
            const isCritico = alertaNovo.gravidade === "critico";
            tocarSirene();
            toast.error(`🚨 ${isCritico ? "EMERGÊNCIA CRÍTICA" : "Alerta SOS"}: ${alertaNovo.tipo_label}`, {
              duration: 1e4,
              action: { label: "Ver", onClick: () => window.location.href = `/sos/alertas/${alertaNovo.id}` }
            });
          }
        }
        sosIdsSeenRef.current = new Set(idsAbertos);
        sosFirstLoadRef.current = false;
      } catch (e) {
        console.warn("SOS polling error:", e);
      }
    };
    fetchSos();
    const interval = setInterval(fetchSos, 3e4);
    return () => clearInterval(interval);
  }, [auth.user.roles]);
  const isSuperAdmin = ((_a = auth.user.roles) == null ? void 0 : _a.includes("super-admin")) ?? false;
  const isGestoraNps = (auth.user.roles ?? []).some((r) => ["admin-empresa", "gestor"].includes(r));
  const [numAlertas, setNumAlertas] = useState(0);
  useEffect(() => {
    if (!isGestoraNps) return;
    fetch("/bi/dados/alertas", { headers: { Accept: "application/json" } }).then((r) => r.ok ? r.json() : null).then((j) => {
      if (j && typeof j.total === "number") setNumAlertas(j.total);
    }).catch(() => {
    });
  }, [isGestoraNps]);
  const isAdminIndependente = ((_b = auth.user.empresa_gestora) == null ? void 0 : _b.tipo_cliente) === "admin_independente";
  const seccoes = [
    {
      titulo: "Principal",
      itens: [
        { label: "Painel", href: "/dashboard", icon: LayoutDashboard },
        ...isAdminIndependente ? [] : [{ label: "Condomínios", href: "/condominios", icon: Building2 }],
        { label: "Condóminos", href: "/condominos", icon: Users },
        { label: "Importar", href: "/importacao", icon: Upload, feature_slug: "importacao_massiva" },
        { label: "Utilizadores", href: "/utilizadores", icon: UserCog }
      ]
    },
    {
      titulo: "Operação",
      itens: [
        { label: "Assembleias", href: "/assembleias", icon: Users, feature_slug: "assembleia_virtual" },
        { label: "Visitantes", href: "/visitantes/dentro-agora", icon: DoorOpen },
        { label: "Lista Negra", href: "/visitantes/lista-negra", icon: Shield, feature_slug: "lista_negra_visitantes" },
        { label: "Passes", href: "/visitantes/passes", icon: CreditCard, feature_slug: "passe_visitante_branding" },
        { label: "Encomendas", href: "/encomendas", icon: Package, feature_slug: "encomendas_avancado" },
        { label: "Reservas", href: "/reservas", icon: CalendarCheck, feature_slug: "reservas_areas_comuns" },
        { label: "Manutenção", href: "/manutencao", icon: Cog, feature_slug: "manutencao_preventiva" },
        { label: "Pedidos de intervenção", href: "/tickets", icon: Ticket },
        { label: "Equipa", href: "/condominio/equipa", icon: Users },
        { label: "Minhas quotas", href: "/minhas-quotas", icon: Wallet },
        // { label: 'Modelos de Turno', href: '/configuracoes/turnos', icon: Clock, feature_slug: 'modulo_rh' }, // RH - fase futura
        // { label: 'Escala de Turnos', href: '/turnos/escala', icon: Calendar, feature_slug: 'modulo_rh' }, // RH - fase futura
        // { label: 'Marcar Presença', href: '/turnos/presenca', icon: Clock, feature_slug: 'modulo_rh' }, // RH - fase futura
        // { label: 'Relatório de Horas', href: '/turnos/relatorio', icon: FileBarChart, feature_slug: 'modulo_rh' }, // RH - fase futura
        { label: "Empresas Prestadoras", href: "/configuracoes/empresas-prestadoras", icon: Briefcase, feature_slug: "empresas_prestadoras" },
        { label: "FAQs do Chatbot", href: "/admin/chatbot/faqs", icon: MessageSquare, feature_slug: "chatbot_faq" },
        { label: "Domínio Personalizado", href: "/funcionalidades/dominio_personalizado", icon: Sparkles, feature_slug: "dominio_personalizado" },
        { label: "Marketplace", href: "/funcionalidades/marketplace", icon: ShoppingBag, feature_slug: "marketplace" }
      ]
    },
    {
      titulo: "Comunicação",
      itens: [
        { label: "Avisos", href: "/avisos", icon: Megaphone },
        { label: "Serviço SMS", href: "/funcionalidades/sms_basico", icon: MessageSquare, feature_slug: "sms_basico" },
        { label: "SMS Sender ID", href: "/funcionalidades/sms_sender_id", icon: MessageSquare, feature_slug: "sms_sender_id" },
        { label: "SMS Pack Extra", href: "/funcionalidades/sms_pack_extra", icon: MessageSquare, feature_slug: "sms_pack_extra" }
      ]
    },
    {
      titulo: "Documentos",
      itens: [
        { label: "Contratos", href: "/documentos/contratos", icon: FileText },
        { label: "Regulamentos", href: "/documentos/regulamentos", icon: FileText },
        { label: "Outros", href: "/documentos/outros", icon: FileText },
        { label: "Formulário de Registo", href: "/documentos/formulario-registo", icon: FileText, externo: true }
      ]
    },
    {
      titulo: "Segurança",
      itens: [
        { label: "Emergências SOS", href: "/sos/alertas", icon: Siren, urgentBadge: sosCriticosAbertos }
      ]
    },
    {
      titulo: "Finanças",
      itens: [
        { label: "Contas Bancárias", href: "/financas/contas-bancarias", icon: Wallet },
        { label: "Despesas", href: "/despesas", icon: Receipt }
      ]
    },
    {
      titulo: "Facturação",
      itens: [
        { label: "Pagamentos", href: "/pagamentos", icon: DollarSign },
        { label: "Taxas de Condomínio", href: "/quotas", icon: FileText },
        { label: "Acordos", href: "/acordos", icon: Handshake },
        { label: "Créditos", href: "/creditos", icon: Wallet },
        { label: "Lançamentos", href: "/lancamentos", icon: Receipt },
        { label: "ProxyPay", href: "/funcionalidades/proxypay_rps", icon: CreditCard, feature_slug: "proxypay_rps" }
      ]
    },
    {
      titulo: "Funcionalidades",
      itens: [
        { label: "Loja de add-ons", href: "/funcionalidades", icon: Sparkles },
        { label: "Minhas funcionalidades", href: "/funcionalidades/minhas", icon: Package }
      ]
    },
    {
      titulo: "Configurações",
      itens: [
        { label: "Categorias de Pedidos", href: "/configuracoes/categorias-pedidos", icon: Tag },
        { label: "Contactos & Suporte", href: "/configuracoes/contactos-suporte", icon: LifeBuoy }
      ]
    },
    ...isGestoraNps ? [{
      titulo: "Qualidade & BI",
      itens: [
        { label: "Dashboard BI", href: "/bi", icon: ChartBar, urgentBadge: numAlertas, feature_slug: "dashboard_bi" },
        { label: "Contabilidade", href: "/contabilidade", icon: Calculator, feature_slug: "integracao_contabilidade" },
        { label: "Relatórios", href: "/relatorios", icon: FileBarChart, feature_slug: "relatorios_personalizados" },
        { label: "NPS do Condomínio", href: "/nps/dashboard", icon: Gauge },
        { label: "Configurar NPS", href: "/nps/configuracao", icon: Settings }
      ]
    }] : [],
    {
      titulo: "Conta",
      itens: [
        { label: "Subscrição", href: "/subscricao", icon: CreditCard },
        { label: "Minhas ordens", href: "/ordens", icon: Receipt },
        ...isSuperAdmin ? [
          { label: "Admin subscrições", href: "/admin/subscricoes", icon: Settings },
          { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
          { label: "Comunicados", href: "/admin/comunicados", icon: Megaphone },
          { label: "Clientes B2B", href: "/super-admin/clientes", icon: Users },
          { label: "ERP Welwitschia", href: "/admin/welwitschia", icon: Building2 },
          { label: "Config subscrições", href: "/super-admin/subscricoes-config", icon: Settings },
          { label: "Permissões", href: "/super-admin/permissoes", icon: Shield },
          { label: "Facturas plataforma", href: "/super-admin/facturas-plataforma", icon: Receipt },
          { label: "Admin features", href: "/admin/features", icon: Package },
          { label: "Moderação Marketplace", href: "/admin/marketplace", icon: Flag },
          { label: "Anúncios Marketplace", href: "/admin/marketplace/anuncios", icon: ShoppingBag },
          { label: "NPS — Satisfação", href: "/admin/nps", icon: Gauge },
          { label: "Configurar NPS", href: "/admin/nps/configuracao", icon: Gauge },
          { label: "Admin ordens", href: "/admin/ordens", icon: Receipt },
          { label: "Admin SMS", href: "/admin/sms", icon: MessageSquare }
        ] : []
      ]
    }
  ];
  const todosSlugs = seccoes.flatMap((s) => s.itens).map((i) => i.feature_slug).filter((s) => !!s);
  const slugsUnicos = Array.from(new Set(todosSlugs));
  const featuresMap = useFeatures(slugsUnicos);
  if (!auth.user) {
    return null;
  }
  const nomeCompleto = auth.user.name;
  const role = ((_c = auth.user.roles) == null ? void 0 : _c[0]) ?? "";
  const roleFormatado = role.replace(/-/g, " ");
  const empresaNome = ((_d = auth.user.empresa_gestora) == null ? void 0 : _d.nome) ?? "Plataforma";
  const avatarGradient = gradientDeNome(nomeCompleto);
  const horaActual = (/* @__PURE__ */ new Date()).getHours();
  const saudacao = horaActual < 12 ? "Bom dia" : horaActual < 19 ? "Boa tarde" : "Boa noite";
  const estaActivo = (href) => {
    if (href === "/dashboard") return currentUrl === "/dashboard" || currentUrl === "/";
    return currentUrl.startsWith(href);
  };
  const abrirModalPremium = (slug) => {
    window.dispatchEvent(new CustomEvent("ondaka:premium-modal", { detail: { slug } }));
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen relative", children: [
    sidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden",
        onClick: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform transition-transform lg:translate-x-0",
          "bg-[#070715] border-r border-white/5",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex h-[72px] items-center justify-between px-5 border-b border-white/5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0",
                  style: { background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)" },
                  children: "O"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-white tracking-wide", children: "ONDAKA" }),
                /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 truncate", children: empresaNome })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "lg:hidden text-white/60 hover:text-white",
                onClick: () => setSidebarOpen(false),
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "px-3 py-5 space-y-6 overflow-y-auto", style: { maxHeight: "calc(100vh - 160px)" }, children: seccoes.map((seccao) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => toggleSeccao(seccao.titulo),
                className: `w-full px-3 mb-2 flex items-center justify-between text-[10px] uppercase tracking-[1.5px] font-semibold transition-colors ${seccao.titulo === "Segurança" ? `text-red-500 hover:text-red-400 ${sosCriticosAbertos > 0 ? "animate-pulse" : ""}` : "text-white hover:text-white/80"}`,
                "aria-expanded": !!seccoesAbertas[seccao.titulo],
                children: [
                  /* @__PURE__ */ jsx("span", { children: seccao.titulo }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px]", "aria-hidden": "true", children: seccoesAbertas[seccao.titulo] ? "▼" : "▶" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: `space-y-0.5 overflow-hidden transition-all ${seccoesAbertas[seccao.titulo] ? "max-h-[2000px]" : "max-h-0"}`, children: seccao.itens.map((item) => {
              const featureBloqueada = !!item.feature_slug && !featuresMap[item.feature_slug];
              if (featureBloqueada && item.feature_slug) {
                const slug = item.feature_slug;
                const Icon = item.icon;
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => abrirModalPremium(slug),
                    className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/50 hover:text-white/70 hover:bg-white/5 transition-all group relative",
                    "aria-label": `${item.label} (Premium — bloqueado)`,
                    children: [
                      /* @__PURE__ */ jsx(Icon, { className: "h-[15px] w-[15px] flex-shrink-0" }),
                      /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: item.label }),
                      /* @__PURE__ */ jsxs(
                        "span",
                        {
                          className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[8px] font-semibold tracking-wider text-white",
                          style: { background: "linear-gradient(90deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)" },
                          children: [
                            /* @__PURE__ */ jsx(Lock, { className: "h-[9px] w-[9px]", "aria-hidden": "true" }),
                            "PRO"
                          ]
                        }
                      )
                    ]
                  },
                  item.label
                );
              }
              const activo = !item.disabled && estaActivo(item.href);
              const Comp = item.externo ? "a" : Link;
              const linkProps = item.externo ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : { href: item.disabled ? "#" : item.href };
              return /* @__PURE__ */ jsxs(
                Comp,
                {
                  ...linkProps,
                  className: cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all group relative",
                    item.disabled ? "text-white/25 cursor-not-allowed" : activo ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                  ),
                  style: activo ? {
                    background: "linear-gradient(90deg, rgba(0, 212, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)",
                    borderLeft: "2px solid #00D4FF",
                    borderRadius: "0 8px 8px 0",
                    marginLeft: "-2px"
                  } : void 0,
                  onClick: (e) => item.disabled && e.preventDefault(),
                  children: [
                    /* @__PURE__ */ jsx(item.icon, { className: "h-[15px] w-[15px] flex-shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.label }),
                    item.badge && /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-wider text-white/30 font-medium", children: item.badge }),
                    item.urgentBadge !== void 0 && item.urgentBadge > 0 && /* @__PURE__ */ jsx("span", { className: "ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse", children: item.urgentBadge > 99 ? "99+" : item.urgentBadge })
                  ]
                },
                item.label
              );
            }) })
          ] }, seccao.titulo)) }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 p-3 border-t border-white/5", children: /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-white/30 px-3 py-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" }),
            "Sistema operacional"
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "lg:pl-64", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-[72px] sticky top-0 z-20 border-b border-white/5 backdrop-blur-md bg-[#0A0A1A]/80 flex items-center justify-between px-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "lg:hidden text-white/70 hover:text-white p-2 -ml-2",
              onClick: () => setSidebarOpen(true),
              children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 max-w-md flex-1", children: [
            /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-white/40" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Pesquisar condomínios, condóminos...",
                className: "bg-transparent outline-none text-sm text-white placeholder-white/40 flex-1"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5", children: "⌘K" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              id: "tour-btn-aprenda",
              onClick: () => setAprendaAberto(true),
              className: "hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition",
              title: "Aprenda a usar a plataforma",
              children: [
                /* @__PURE__ */ jsx(GraduationCap, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsx("span", { className: "hidden lg:inline", children: "Aprenda" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              id: "tour-btn-tour",
              onClick: () => {
                var _a2, _b2;
                return (_b2 = (_a2 = window.ondakaTour) == null ? void 0 : _a2.reset) == null ? void 0 : _b2.call(_a2);
              },
              className: "hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition",
              title: "Conheça a plataforma",
              children: [
                /* @__PURE__ */ jsx(Map, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsx("span", { className: "hidden lg:inline", children: "Conheça" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              id: "tour-btn-suporte",
              onClick: () => abrirWhatsAppSuporte(),
              className: "hidden md:inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition",
              title: "Falar com suporte via WhatsApp",
              children: [
                /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsx("span", { className: "hidden lg:inline", children: "Suporte" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(BellNotificacoes, {}),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition",
              "aria-label": "Definições",
              children: /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "h-6 w-px bg-white/10 mx-1" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 pl-2", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/perfil",
                className: "flex items-center gap-2.5 rounded-lg hover:bg-white/5 px-1.5 py-1 transition group",
                title: "Meu perfil",
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0",
                      style: { background: avatarGradient },
                      children: iniciais(nomeCompleto)
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "hidden sm:block text-right leading-tight", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-white group-hover:text-cyan-300 transition", children: nomeCompleto }),
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 capitalize", children: roleFormatado })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => router.post("/logout"),
                className: "p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition ml-1",
                "aria-label": "Sair",
                title: "Sair",
                children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(SubscricaoBanner, {}),
      /* @__PURE__ */ jsx("main", { className: "p-6 lg:p-8 animate-fade-in", children }),
      /* @__PURE__ */ jsxs("footer", { className: "border-t border-white/5 py-6 text-center text-xs text-white/40", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ONDAKA · Soluções Simples, Lda · Luanda, Angola · ",
        /* @__PURE__ */ jsx(Link, { href: "/privacidade", className: "hover:text-white/70", children: "Privacidade" }),
        " · ",
        /* @__PURE__ */ jsx(Link, { href: "/termos", className: "hover:text-white/70", children: "Termos" }),
        " · ",
        /* @__PURE__ */ jsx("a", { href: "https://wa.me/244922772177", target: "_blank", rel: "noopener noreferrer", className: "hover:text-white/70", children: "Suporte" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(OnboardingTour, { role: ((_e = auth.user.roles) == null ? void 0 : _e[0]) ?? null, permissions: auth.user.permissions ?? [] }),
    /* @__PURE__ */ jsx(AprendaUsar, { aberto: aprendaAberto, onClose: () => setAprendaAberto(false), role: ((_f = auth.user.roles) == null ? void 0 : _f[0]) ?? null, permissions: auth.user.permissions ?? [] }),
    /* @__PURE__ */ jsx(ChatbotFab, { onClick: () => setChatbotOpen(true) }),
    /* @__PURE__ */ jsx(ChatbotDrawer, { open: chatbotOpen, onClose: () => setChatbotOpen(false), userName: (_g = auth == null ? void 0 : auth.user) == null ? void 0 : _g.name }),
    /* @__PURE__ */ jsx(AddonPremiumModal, {}),
    /* @__PURE__ */ jsx(
      Toaster,
      {
        position: "top-right",
        richColors: true,
        theme: "dark",
        toastOptions: {
          style: {
            background: "#16163A",
            border: "0.5px solid rgba(168, 85, 247, 0.2)",
            color: "#FFFFFF"
          }
        }
      }
    ),
    /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: `window.__ondakaSaudacao = '${saudacao}'` } })
  ] });
}
export {
  AuthenticatedLayout as A,
  formatKz as a,
  formatRelativo as b,
  cn as c,
  formatDate as f,
  gradientDeNome as g,
  iniciais as i
};
