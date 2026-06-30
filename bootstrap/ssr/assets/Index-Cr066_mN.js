import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Search, Filter, Sparkles, Clock, CheckCircle2, DollarSign, Building2, Home, Users, Smartphone, DoorOpen, Bot, Plug, ShieldCheck, Briefcase } from "lucide-react";
const categorias = [
  {
    id: "facturacao",
    titulo: "Facturação Condomínio",
    Icon: DollarSign,
    cor: "blue",
    descricao: "Cobrança de taxas, multas e gestão financeira do condomínio",
    features: [
      { nome: "Geração automática de taxas mensais", desc: "Por permilagem ou valor fixo. Configurável por condomínio.", estado: "pronto" },
      { nome: "Multicaixa Express via ProxyPay", desc: "Pagamentos online directos. Webhook activa pagamento automaticamente.", estado: "pronto" },
      { nome: "Gestão de Multas", desc: "Configuração por activa/tolerância/tipo (fixa ou %)/recorrência.", estado: "pronto" },
      { nome: "Fundo de Reserva ≥10%", desc: "Conformidade DP 141/15 — cálculo automático.", estado: "pronto" },
      { nome: "UCF/m² limite 6", desc: "Fórmula legal angolana aplicada automaticamente.", estado: "pronto" },
      { nome: "Lançamentos Manuais", desc: "Despesas extra, ajustes débito/crédito, multi-fracção.", estado: "pronto" },
      { nome: "Sistema de Créditos", desc: "Saldo da fracção utilizável em pagamentos futuros.", estado: "pronto" },
      { nome: "Lista de Pagamentos com filtros", desc: "Busca, paginação, anular pagamento.", estado: "pronto" },
      { nome: "Email com factura PDF", desc: "Anexa PDF profissional na confirmação de pagamento.", estado: "pronto" },
      { nome: "Reverter pagamentos", desc: "Anular operação completa com auditoria.", estado: "pronto" },
      { nome: "Uso automático de saldo", desc: "Sistema deduz saldo da fracção em novo pagamento.", estado: "breve", quando: "Agosto 2026" },
      { nome: "Relatórios contabilísticos", desc: "Export Excel/PDF com filtros por período/condomínio.", estado: "pronto" }
    ]
  },
  {
    id: "estrutural",
    titulo: "Gestão Estrutural",
    Icon: Building2,
    cor: "purple",
    descricao: "Condomínios, edifícios, fracções e cadastros base",
    features: [
      { nome: "CRUD Condomínios completo", desc: "Multi-tenant com slug único, configurações por condomínio.", estado: "pronto" },
      { nome: "Edifícios e Fracções", desc: "Hierarquia condomínio→edifício→fracção com permilagem.", estado: "pronto" },
      { nome: "Cadastro de Condóminos", desc: "Proprietários, inquilinos, dependentes com role e permissões.", estado: "pronto" },
      { nome: "Importação massiva (Excel)", desc: "Upload XLSX com validação e preview antes de importar.", estado: "pronto" },
      { nome: "Histórico de alterações", desc: "Auditoria completa de quem alterou o quê e quando.", estado: "pronto" },
      { nome: "Cadastro de Funcionários", desc: "BI/Passaporte + foto + função + datas. Compliance RGPD.", estado: "roadmap", quando: "Março 2027" }
    ]
  },
  {
    id: "operacao",
    titulo: "Operação Diária",
    Icon: Home,
    cor: "cyan",
    descricao: "Assembleias, pedidos, manutenção e tarefas do dia-a-dia",
    features: [
      { nome: "Assembleias Digitais", desc: "Convocatórias, votações online, presença, quorum automático.", estado: "pronto" },
      { nome: "Geração automática de Acta PDF", desc: "Acta como título executivo conforme DP 141/15 art.7.", estado: "pronto" },
      { nome: "Sistema de Votos", desc: "Apuramento por quota proporcional (permilagem), com acta automática.", estado: "pronto" },
      { nome: "Pedidos de Intervenção", desc: "Manutenção rastreada, fotos, comentários, timeline.", estado: "pronto" },
      { nome: "Reservas de Áreas Comuns", desc: "Calendário com aprovação por gestor.", estado: "pronto" },
      { nome: "Layout PDF profissional Acta", desc: "Logo, fonte serif, NIF rodapé, paginação.", estado: "breve", quando: "Julho 2026" },
      { nome: "Relatórios operacionais", desc: "KPIs de pedidos resolvidos, tempo médio, por estado e categoria.", estado: "pronto" }
    ]
  },
  {
    id: "comunidade",
    titulo: "Comunidade",
    Icon: Users,
    cor: "pink",
    descricao: "Comunicação entre condóminos, gestores e administração",
    features: [
      { nome: "Chat Tempo Real", desc: "Comunicação directa entre condóminos e gestão. Anexos suportados.", estado: "breve", quando: "Q4 2026" },
      { nome: "Avisos Comunidade", desc: "Broadcasts segmentados por edifício/fracção.", estado: "pronto" },
      { nome: "Confirmação de Leitura", desc: "Tracking automático de quem leu cada aviso.", estado: "pronto" },
      { nome: "Notificações Push (FCM)", desc: "Push em iOS e Android via Firebase Cloud Messaging.", estado: "pronto" },
      { nome: "Email transaccional", desc: "Convocatórias, recibos, avisos via SMTP configurável.", estado: "pronto" },
      { nome: "SMS Angola via TelcoSMS", desc: "Para 2FA e alertas críticos.", estado: "pronto" }
    ]
  },
  {
    id: "mobile",
    titulo: "App Mobile",
    Icon: Smartphone,
    cor: "blue",
    descricao: "Aplicação Flutter para iOS e Android",
    features: [
      { nome: "Login com 2FA SMS", desc: "Autenticação segura via TelcoSMS Angola.", estado: "pronto" },
      { nome: "Dashboard Condómino", desc: "Saldo, próximas taxas, avisos, pedidos abertos.", estado: "pronto" },
      { nome: "Extracto Financeiro", desc: "Histórico completo de pagamentos e taxas.", estado: "pronto" },
      { nome: "Pagamentos Multicaixa Express", desc: "Gerar referência ProxyPay direto da app.", estado: "pronto" },
      { nome: "Visitantes com QR Pass", desc: "Pré-aprovação + scanner QR na portaria.", estado: "pronto" },
      { nome: "Encomendas", desc: "Notificação ao destinatário quando guarda regista.", estado: "pronto" },
      { nome: "Pedidos com fotos", desc: "Anexar fotos directamente da câmara.", estado: "pronto" },
      { nome: "Chatbot 2-em-1 (v1)", desc: "Assistente Condomínio + Assistente ONDAKA.", estado: "pronto" },
      { nome: "Sincronização total Mobile/Web", desc: "Replicar todas as funcionalidades web no mobile.", estado: "curso", quando: "Q4 2026" },
      { nome: "Personalização visual", desc: "Tema/branding por empresa, dark/light mode.", estado: "breve", quando: "Setembro 2026" }
    ]
  },
  {
    id: "portaria",
    titulo: "Portaria & Visitantes",
    Icon: DoorOpen,
    cor: "purple",
    descricao: "Controlo de acessos, visitantes, encomendas",
    features: [
      { nome: "App Portaria dedicada", desc: "Interface optimizada para tablet/telemóvel do guarda.", estado: "pronto" },
      { nome: "Scanner QR Code", desc: "Validação automática de visitantes pré-aprovados.", estado: "pronto" },
      { nome: "Registo de Encomendas", desc: "Captura entrega + foto + notificação automática.", estado: "pronto" },
      { nome: "Histórico de Entradas", desc: "Quem entrou, quando, autorizado por quem.", estado: "pronto" },
      { nome: "Chamadas de Voz na App", desc: "Portaria↔morador↔gestão por voz dentro da app, sem custos de operadora.", estado: "pronto" },
      { nome: "Portaria em Modo Offline", desc: "Valida QR/OTP sem internet contra cópia local e sincroniza ao voltar a rede.", estado: "pronto" },
      { nome: "Acesso por Horário e Área", desc: "Pré-aprovações com horários recorrentes e áreas autorizadas; alerta fora de horário.", estado: "pronto" },
      { nome: "Lista Negra Visitantes", desc: "Bloqueio por nome/BI/matrícula. Alerta no check-in.", estado: "pronto" },
      { nome: "Controlo de Saída de Bens", desc: "Regista bens à entrada; na saída só liberta o declarado. Não declarados aguardam autorização do morador.", estado: "pronto" },
      { nome: "ANPR Hikvision", desc: "Leitura automática de matrículas (≥98.5% precisão).", estado: "roadmap", quando: "Agosto 2027" },
      { nome: "Biometria ZKTeco", desc: "SpeedFace facial + impressão digital.", estado: "roadmap", quando: "Agosto 2027" }
    ]
  },
  {
    id: "automacao",
    titulo: "Automação & Chatbot",
    Icon: Bot,
    cor: "cyan",
    descricao: "Cron jobs, chatbot, automatizações de fluxos",
    features: [
      { nome: "Chatbot 150+ perguntas", desc: "Base de conhecimento Markdown. Sem dependência de IA externa.", estado: "pronto" },
      { nome: "CRUD FAQs Condomínio", desc: "Admin gere FAQs próprias do condomínio. Drag-and-drop.", estado: "pronto" },
      { nome: "Scoring algorithm 4 níveis", desc: "Keywords + question + answer + bonus condomínio.", estado: "pronto" },
      { nome: "Cron geração taxas mensais", desc: "Automático no dia configurado por condomínio.", estado: "pronto" },
      { nome: "Cron polling ProxyPay", desc: "Verificação a cada 5 min para sandbox.", estado: "pronto" },
      { nome: "Cron emissão facturas plataforma", desc: "Trial→primeira factura, renovação 24h antes.", estado: "pronto" },
      { nome: "Audit Trail completo", desc: "Eventos rastreados por subscrição, factura, pagamento.", estado: "pronto" },
      { nome: "Chatbot v2 com imagens HTML", desc: "Respostas com screenshots, formatação rica.", estado: "breve", quando: "Q3 2026" }
    ]
  },
  {
    id: "integracoes",
    titulo: "Integrações",
    Icon: Plug,
    cor: "pink",
    descricao: "Conectores com sistemas externos",
    features: [
      { nome: "ProxyPay RPS v2", desc: "Multicaixa Express, ATM, homebanking. Webhook HMAC.", estado: "pronto" },
      { nome: "TelcoSMS Angola", desc: "SMS para 2FA e notificações críticas.", estado: "pronto" },
      { nome: "Firebase FCM", desc: "Push notifications iOS e Android.", estado: "pronto" },
      { nome: "Pusher Channels", desc: "Infraestrutura de tempo real (chat, votos, notificações).", estado: "breve", quando: "Q4 2026" },
      { nome: "ProxyPay DDS", desc: "Débito Directo automático mensal.", estado: "roadmap", quando: "Maio 2027" }
    ]
  },
  {
    id: "compliance",
    titulo: "Compliance & Segurança",
    Icon: ShieldCheck,
    cor: "blue",
    descricao: "Conformidade legal, segurança, autenticação",
    features: [
      { nome: "Conformidade DP 141/15", desc: "Decreto Presidencial Angolano integralmente respeitado.", estado: "pronto" },
      { nome: "2FA por SMS", desc: "Autenticação dois factores para gestores e admin.", estado: "pronto" },
      { nome: "Encriptação E2E", desc: "TLS 1.3, dados sensíveis encriptados em repouso.", estado: "pronto" },
      { nome: "Glossário PT-AO", desc: "75+ termos angolanizados (Taxa de Condomínio, Imóvel, etc).", estado: "pronto" },
      { nome: "Multi-tenant seguro", desc: "Isolamento total entre empresas gestoras.", estado: "pronto" },
      { nome: "Roles & Permissões", desc: "7 roles: super-admin, admin-empresa, gestor, etc.", estado: "pronto" },
      { nome: "RGPD compliance", desc: "Consentimentos, direito ao esquecimento, exportação dados.", estado: "pronto" },
      { nome: "Bloqueio Inteligente", desc: "Modo limitado para incumprimento. Configurável por condomínio.", estado: "pronto" },
      { nome: "Lista Negra Devedores", desc: "Histórico de dívida, acordos negociados, acção em massa.", estado: "curso", quando: "Setembro 2026" },
      { nome: "SOS 13 Tipos por Gravidade", desc: "Botão emergência por gravidade com localização GPS. Alerta guarda e gestão em tempo real.", estado: "pronto" }
    ]
  },
  {
    id: "saas",
    titulo: "SaaS B2B (Soluções Simples)",
    Icon: Briefcase,
    cor: "purple",
    descricao: "Gestão da plataforma e subscrições B2B",
    features: [
      { nome: "Configuração de Preços", desc: "Preço base + 5 escalões CRUD + descontos + trial + imposto.", estado: "pronto" },
      { nome: "Calculadora Subscrição", desc: "Cálculo dinâmico AJAX com 3 períodos.", estado: "pronto" },
      { nome: "Trial 30 dias automático", desc: "Activação imediata para novas empresas.", estado: "pronto" },
      { nome: "Pagamento activa subscrição", desc: "Webhook ProxyPay processa custom_fields.tipo='factura_plataforma'.", estado: "pronto" },
      { nome: "Modo Limitado", desc: "Trial expirado sem pagamento → acesso restrito.", estado: "pronto" },
      { nome: "Banner Trial 3 cores", desc: "Verde/laranja/vermelho conforme dias restantes.", estado: "pronto" },
      { nome: "Lista Global Facturas Plataforma", desc: "Super-admin vê todas as facturas com filtros e anular.", estado: "pronto" },
      { nome: "Histórico Imóveis (Crédito/Acréscimo)", desc: "Aumento/redução com pro-rata automático. Glossário PT-AO.", estado: "pronto" },
      { nome: "Dashboard Super-Admin", desc: "MRR, ARR, churn, pipeline, clientes recentes.", estado: "pronto" },
      { nome: "Distinção Empresa/Admin Independente", desc: "tipo_cliente diferencia UI e workflow.", estado: "pronto" },
      { nome: "Auto-registo + Wizard Onboarding", desc: "Visitantes podem criar conta sem aprovação manual.", estado: "pronto" },
      { nome: "Cancelamento subscrição", desc: "Modal confirmação + razão. Termina fim do período pago.", estado: "pronto" },
      { nome: "Templates email 5 tipos", desc: "Trial, factura emitida, pagamento, cancelamento, recuperação.", estado: "pronto" },
      { nome: "Mudança de plano", desc: "Mensal↔Semestral↔Anual com pro-rata.", estado: "pronto" }
    ]
  }
];
const estadoConfig = {
  pronto: { label: "Em produção", color: "bg-green-500/20 text-green-300 border-green-500/30", Icon: CheckCircle2 },
  curso: { label: "Em desenvolvimento", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", Icon: Clock },
  breve: { label: "Em breve", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", Icon: Clock },
  roadmap: { label: "Roadmap", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", Icon: Sparkles }
};
const corClasses = {
  blue: "from-blue-500/20 to-blue-700/10 ring-blue-500/30 text-blue-400",
  purple: "from-purple-500/20 to-purple-700/10 ring-purple-500/30 text-purple-400",
  cyan: "from-cyan-500/20 to-cyan-700/10 ring-cyan-500/30 text-cyan-400",
  pink: "from-pink-500/20 to-pink-700/10 ring-pink-500/30 text-pink-400"
};
const ESTADOS_PUBLICOS = ["pronto", "breve"];
const categoriasPublicas = categorias.filter((c) => c.id !== "saas").map((c) => ({ ...c, features: c.features.filter((f) => ESTADOS_PUBLICOS.includes(f.estado)) })).filter((c) => c.features.length > 0);
function Catalogo() {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busca, setBusca] = useState("");
  const stats = useMemo(() => {
    const all = categoriasPublicas.flatMap((c) => c.features);
    return {
      total: all.length,
      pronto: all.filter((f) => f.estado === "pronto").length,
      breve: all.filter((f) => f.estado === "breve").length
    };
  }, []);
  const filtradas = useMemo(() => {
    return categoriasPublicas.map((cat) => ({
      ...cat,
      features: cat.features.filter((f) => {
        const matchEstado = filtroEstado === "todos" || f.estado === filtroEstado;
        const matchBusca = busca === "" || f.nome.toLowerCase().includes(busca.toLowerCase()) || f.desc.toLowerCase().includes(busca.toLowerCase());
        return matchEstado && matchBusca;
      })
    })).filter((cat) => cat.features.length > 0);
  }, [filtroEstado, busca]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Catálogo · ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0a0a1a] text-zinc-100", style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }, children: [
      /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 border-b border-blue-900/30 bg-[#0a0a1a]/90 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-3", children: [
        /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: "/img/ondaka-logo.png", alt: "ONDAKA", className: "h-9 w-9 rounded" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold tracking-wide", children: "ONDAKA" }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-zinc-500", children: "Soluções Simples, Lda" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden gap-8 text-sm md:flex", children: [
          /* @__PURE__ */ jsx(Link, { href: "/#features", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Funcionalidades" }),
          /* @__PURE__ */ jsx(Link, { href: "/catalogo", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Catálogo" }),
          /* @__PURE__ */ jsx(Link, { href: "/loja", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Loja" }),
          /* @__PURE__ */ jsx(Link, { href: "/#pricing", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Preços" }),
          /* @__PURE__ */ jsx(Link, { href: "/login", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Entrar" })
        ] }),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/registo",
            className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500",
            children: "Trial 30 dias →"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden border-b border-blue-900/30 py-16", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-7xl px-6 text-center", children: [
          /* @__PURE__ */ jsxs("h1", { className: "mb-4 text-4xl font-bold md:text-5xl", children: [
            "Catálogo",
            " ",
            /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent", children: "completo" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-8 mx-auto max-w-2xl text-zinc-400", children: "Tudo o que a plataforma ONDAKA oferece — já em produção e a chegar em breve." }),
          /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-2xl grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/50 p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold", children: stats.total }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-zinc-500", children: "Total" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-green-500/30 bg-green-500/5 p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-green-300", children: stats.pronto }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-green-400", children: "Em produção" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-blue-500/30 bg-blue-500/5 p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-blue-300", children: stats.breve }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-blue-400", children: "Em breve" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "sticky top-[57px] z-40 border-b border-zinc-800 bg-[#0a0a1a]/95 backdrop-blur-md", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 md:max-w-md", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Buscar funcionalidade...",
              value: busca,
              onChange: (e) => setBusca(e.target.value),
              className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 overflow-x-auto", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 flex-shrink-0 text-zinc-500" }),
          ["todos", "pronto", "breve"].map((e) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setFiltroEstado(e),
              className: `flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filtroEstado === e ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`,
              children: e === "todos" ? "Todos" : estadoConfig[e].label
            },
            e
          ))
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("section", { className: "py-12", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-6 space-y-12", children: filtradas.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500", children: "Nenhuma funcionalidade encontrada com estes filtros." }) : filtradas.map((cat) => {
        const Icon = cat.Icon;
        const corClass = corClasses[cat.cor];
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: `flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${corClass.split(" ").slice(0, 2).join(" ")} ring-1 ${corClass.split(" ")[2]}`, children: /* @__PURE__ */ jsx(Icon, { className: `h-7 w-7 ${corClass.split(" ")[3]}`, strokeWidth: 1.5 }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: cat.titulo }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: cat.descricao })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-400", children: cat.features.length })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: cat.features.map((f) => {
            const conf = estadoConfig[f.estado];
            const StatusIcon = conf.Icon;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "group relative rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 transition hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 flex items-start justify-between gap-2", children: /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold leading-tight text-zinc-100", children: f.nome }) }),
                  /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs leading-relaxed text-zinc-400", children: f.desc }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${conf.color}`, children: [
                      /* @__PURE__ */ jsx(StatusIcon, { className: "h-3 w-3" }),
                      conf.label
                    ] }),
                    f.quando && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-zinc-500", children: f.quando })
                  ] })
                ]
              },
              f.nome
            );
          }) })
        ] }, cat.id);
      }) }) }),
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden py-20", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-4xl px-6 text-center", children: [
          /* @__PURE__ */ jsxs("h2", { className: "mb-4 text-3xl font-bold md:text-4xl", children: [
            "Veja a ONDAKA em",
            " ",
            /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent", children: "acção" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-8 text-zinc-400", children: "30 dias 100% grátis. Sem compromisso, cancele quando quiser." }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/registo",
              className: "inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-blue-500/40 transition hover:from-blue-400 hover:to-purple-500",
              children: "Começar agora →"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("footer", { className: "border-t border-blue-900/30 py-10", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 md:flex-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: "/img/ondaka-logo.png", alt: "ONDAKA", className: "h-8 w-8 rounded" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-zinc-300", children: "ONDAKA" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
              "© ",
              (/* @__PURE__ */ new Date()).getFullYear(),
              " Soluções Simples, Lda · Todos os direitos reservados"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-6 text-xs", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", className: "hover:text-white", children: "Início" }),
          /* @__PURE__ */ jsx(Link, { href: "/catalogo", className: "hover:text-white", children: "Catálogo" }),
          /* @__PURE__ */ jsx(Link, { href: "/#pricing", className: "hover:text-white", children: "Preços" }),
          /* @__PURE__ */ jsx(Link, { href: "/login", className: "hover:text-white", children: "Entrar" })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  Catalogo as default
};
