import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { Handshake, ArrowRight, Link2, Building2, Wallet, CheckCircle2, Receipt, Smartphone, MessageSquare, ShieldCheck, Clock, ChevronDown, EyeOff, Eye } from "lucide-react";
import { a as fmtKz, f as fmtPct, N as NivelBadge } from "./ui-BNWuS-9O.js";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
function Landing({ config, autenticado, ja_afiliado, exemplo }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    nome: "",
    tipo: "particular",
    nif: "",
    email: "",
    telefone: "",
    como_divulga: "",
    password: "",
    password_confirmation: "",
    aceita_termos: false
  });
  const faqs = [
    { q: "O que conta para a comissão?", a: `Todos os pagamentos que o cliente indicado faz à ONDAKA: subscrição mensal/semestral/anual, add-ons da loja e pacotes de SMS. A base é o valor sem imposto (IVA/IPC). Os pagamentos dos condóminos ao condomínio não são receita da ONDAKA e não contam.` },
    { q: "Durante quanto tempo recebo?", a: config.duracao_meses > 0 ? `Durante ${config.duracao_meses} meses após o registo do cliente.` : "Enquanto o cliente for cliente da ONDAKA — a indicação é vitalícia." },
    { q: "Como é que o cliente fica ligado a mim?", a: `Ao abrir o seu link, o código fica memorizado no browser durante ${config.cookie_dias} dias. Se o cliente se registar nesse período, fica atribuído a si. Também pode indicar o seu código directamente no registo.` },
    { q: "Quando e como sou pago?", a: `Cada comissão tem ${config.carencia_dias} dias de carência (protecção contra estornos) e passa depois a aprovada. Quando o total aprovado atinge ${fmtKz(config.pagamento_minimo_kz, 0)}, a ONDAKA paga por transferência bancária para o seu IBAN e disponibiliza o comprovativo no seu painel.` },
    { q: "Como subo de nível?", a: `O nível depende do número de clientes indicados que já pagaram pelo menos uma vez: ${config.niveis.map((n) => `${n.label} ${fmtPct(n.taxa_pct)} (${n.max_clientes === null ? n.min_clientes + "+" : n.min_clientes === 0 ? "até " + n.max_clientes : n.min_clientes + "–" + n.max_clientes} clientes)`).join(", ")}. A subida é automática e aplica-se às comissões seguintes.` },
    { q: "Posso indicar a minha própria empresa?", a: "Não. Auto-indicações e clientes já registados na ONDAKA não geram comissão. Uma empresa gestora que já é cliente pode, no entanto, aderir ao programa e indicar outras." }
  ];
  const [faqAberta, setFaqAberta] = useState(0);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Programa de Afiliados · ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0a0a1a] text-zinc-100", style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }, children: [
      /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 border-b border-blue-900/30 bg-[#0a0a1a]/90 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-3", children: [
        /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: "/img/ondaka-logo.png", alt: "ONDAKA", className: "h-9 w-9 rounded" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold tracking-wide", children: "ONDAKA" }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-zinc-500", children: "Programa de Afiliados" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden gap-8 text-sm md:flex", children: [
          /* @__PURE__ */ jsx("a", { href: "#como", className: "text-zinc-300 hover:text-white", children: "Como funciona" }),
          /* @__PURE__ */ jsx("a", { href: "#niveis", className: "text-zinc-300 hover:text-white", children: "Comissões" }),
          /* @__PURE__ */ jsx("a", { href: "#regras", className: "text-zinc-300 hover:text-white", children: "Regras" }),
          /* @__PURE__ */ jsx("a", { href: "#faq", className: "text-zinc-300 hover:text-white", children: "Perguntas" }),
          /* @__PURE__ */ jsx(Link, { href: "/login", className: "text-zinc-300 hover:text-white", children: "Entrar" })
        ] }),
        /* @__PURE__ */ jsx("a", { href: ja_afiliado ? "/afiliado" : autenticado ? "/afiliado/aderir" : "#candidatura", className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500", children: ja_afiliado ? "O meu painel →" : "Quero ser afiliado →" })
      ] }) }),
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30" }),
        /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" }),
        /* @__PURE__ */ jsx("div", { className: "absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-200", children: [
              /* @__PURE__ */ jsx(Handshake, { className: "h-3.5 w-3.5" }),
              " Programa de Afiliados ONDAKA"
            ] }),
            /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-bold leading-tight md:text-5xl", children: [
              "Indique gestoras de condomínio. ",
              /* @__PURE__ */ jsxs("span", { className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent", children: [
                "Ganhe ",
                fmtPct(config.taxa_min_pct),
                " a ",
                fmtPct(config.taxa_max_pct)
              ] }),
              " de tudo o que pagarem."
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-5 max-w-xl text-lg text-zinc-400", children: [
              "Cada empresa gestora ou administrador independente que se registar com o seu link gera-lhe comissão em ",
              /* @__PURE__ */ jsx("strong", { className: "text-zinc-200", children: "todos os pagamentos" }),
              " que fizer à ONDAKA — subscrição, add-ons e SMS — ",
              config.duracao_meses > 0 ? `durante ${config.duracao_meses} meses` : "para sempre",
              "."
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxs("a", { href: ja_afiliado ? "/afiliado" : autenticado ? "/afiliado/aderir" : "#candidatura", className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-purple-500", children: [
                ja_afiliado ? "Abrir o meu painel" : "Candidatar-me agora",
                " ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
              ] }),
              /* @__PURE__ */ jsx("a", { href: "#como", className: "inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 hover:border-zinc-500", children: "Ver como funciona" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-8 grid grid-cols-3 gap-4 text-sm", children: [
              /* @__PURE__ */ jsx(Kpi, { v: `${fmtPct(config.taxa_min_pct)}–${fmtPct(config.taxa_max_pct)}`, l: "comissão por pagamento" }),
              /* @__PURE__ */ jsx(Kpi, { v: config.duracao_meses > 0 ? `${config.duracao_meses} meses` : "Vitalício", l: "por cliente indicado" }),
              /* @__PURE__ */ jsx(Kpi, { v: `${config.carencia_dias} dias`, l: "de carência, depois é pago" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-zinc-500", children: "Exemplo real" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-lg font-semibold", children: [
              "Um cliente com ",
              exemplo.imoveis,
              " imóveis, durante ",
              exemplo.meses,
              " meses"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2 text-sm", children: [
              /* @__PURE__ */ jsx(Row, { k: `${exemplo.imoveis} imóveis × ${fmtKz(exemplo.preco_imovel_mes, 0)}/mês × ${exemplo.meses} meses`, v: /* @__PURE__ */ jsx("span", { className: "font-mono", children: fmtKz(exemplo.base_kz, 0) }) }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: "valor sem imposto, sem descontos de período" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-5 grid grid-cols-3 gap-3", children: config.niveis.map((n) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-black/30 p-3 text-center", children: [
              /* @__PURE__ */ jsx(NivelBadge, { nivel: n.nivel }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 text-xs text-zinc-500", children: fmtPct(n.taxa_pct) }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-lg font-bold text-emerald-300", children: fmtKz(exemplo.comissoes[n.nivel], 0) })
            ] }, n.nivel)) }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 text-xs text-zinc-500", children: "A sua comissão por esse cliente, num ano. Add-ons e pacotes SMS que o cliente compre somam-se." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("section", { id: "como", className: "border-t border-blue-900/30 py-16", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Como funciona" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-zinc-400", children: "Três passos. Sem custos, sem quotas mínimas." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-6 md:grid-cols-3", children: [
          /* @__PURE__ */ jsx(Passo, { n: "1", icon: Link2, titulo: "Recebe o seu link", texto: `Depois de aprovado, tem um código e um link únicos no seu painel. Partilhe por WhatsApp, email, SMS ou em pessoa. Quem clicar fica ligado a si durante ${config.cookie_dias} dias.` }),
          /* @__PURE__ */ jsx(Passo, { n: "2", icon: Building2, titulo: "O cliente regista-se e usa a ONDAKA", texto: "A empresa gestora ou o administrador independente cria conta com 30 dias grátis. Depois subscreve, activa add-ons e compra SMS — tudo pago à ONDAKA." }),
          /* @__PURE__ */ jsx(Passo, { n: "3", icon: Wallet, titulo: "Recebe comissão em cada pagamento", texto: `Cada pagamento gera uma comissão sobre o valor sem imposto. Passados ${config.carencia_dias} dias fica aprovada; quando atinge ${fmtKz(config.pagamento_minimo_kz, 0)}, recebe por transferência.` })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "niveis", className: "border-t border-blue-900/30 py-16", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Comissões que sobem consigo" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-zinc-400", children: "O nível depende de quantos clientes indicados já pagaram pelo menos uma vez. Sobe automaticamente." }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-6 md:grid-cols-3", children: config.niveis.map((n) => /* @__PURE__ */ jsxs("div", { className: `rounded-2xl border p-6 ${n.nivel === "ouro" ? "border-yellow-400/40 bg-gradient-to-br from-yellow-500/10 to-transparent" : n.nivel === "prata" ? "border-zinc-400/30 bg-zinc-900/60" : "border-amber-700/40 bg-zinc-900/60"}`, children: [
          /* @__PURE__ */ jsx(NivelBadge, { nivel: n.nivel }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-5xl font-bold", children: fmtPct(n.taxa_pct) }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-zinc-400", children: n.max_clientes === null ? `${n.min_clientes} ou mais clientes pagantes` : n.min_clientes === 0 ? `Até ${n.max_clientes} clientes pagantes` : `${n.min_clientes} a ${n.max_clientes} clientes pagantes` }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-1.5 text-sm text-zinc-300", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }),
              " Subscrições"
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }),
              " Add-ons da loja"
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }),
              " Pacotes de SMS"
            ] })
          ] })
        ] }, n.nivel)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsx(Conta, { icon: Receipt, t: "Subscrição da plataforma", d: "Mensal, semestral ou anual, por imóvel gerido." }),
          /* @__PURE__ */ jsx(Conta, { icon: Smartphone, t: "Add-ons", d: "Marketplace, reservas, portaria, BI, domínio próprio, etc." }),
          /* @__PURE__ */ jsx(Conta, { icon: MessageSquare, t: "SMS", d: "Pacotes de SMS e Sender ID personalizado." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "regras", className: "border-t border-blue-900/30 py-16", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Regras do programa" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsx(Regra, { icon: ShieldCheck, t: "Base sem imposto", d: "A comissão calcula-se sobre o valor sem IVA/IPC de cada pagamento efectivamente recebido pela ONDAKA." }),
          /* @__PURE__ */ jsx(Regra, { icon: Clock, t: `Carência de ${config.carencia_dias} dias`, d: "Protege contra estornos. Se o pagamento for anulado, a comissão é anulada." }),
          /* @__PURE__ */ jsx(Regra, { icon: Wallet, t: `Pagamento a partir de ${fmtKz(config.pagamento_minimo_kz, 0)}`, d: `Por transferência bancária para o IBAN do afiliado${Number(config.retencao_pct) > 0 ? `, com retenção na fonte de ${fmtPct(config.retencao_pct)}` : ""}. Comprovativo no painel.` }),
          /* @__PURE__ */ jsx(Regra, { icon: Link2, t: `Link memorizado ${config.cookie_dias} dias`, d: "O último link clicado ganha. Um cliente só pode estar ligado a um afiliado." }),
          /* @__PURE__ */ jsx(Regra, { icon: Building2, t: config.duracao_meses > 0 ? `${config.duracao_meses} meses por cliente` : "Indicação vitalícia", d: "Enquanto a indicação estiver activa, todos os pagamentos do cliente contam." }),
          /* @__PURE__ */ jsx(Regra, { icon: Handshake, t: "Sem auto-indicação", d: "Não pode indicar a sua própria empresa nem clientes já registados. A ONDAKA pode suspender contas com actividade fraudulenta." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "faq", className: "border-t border-blue-900/30 py-16", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Perguntas frequentes" }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-3 md:grid-cols-2", children: faqs.map((f, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/50", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setFaqAberta(faqAberta === i ? null : i), className: "flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-medium", children: [
            f.q,
            /* @__PURE__ */ jsx(ChevronDown, { className: `h-4 w-4 shrink-0 transition ${faqAberta === i ? "rotate-180" : ""}` })
          ] }),
          faqAberta === i && /* @__PURE__ */ jsx("div", { className: "px-5 pb-4 text-sm leading-relaxed text-zinc-400", children: f.a })
        ] }, i)) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "candidatura", className: "border-t border-blue-900/30 py-16", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 md:items-start", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: ja_afiliado ? "Já é afiliado" : autenticado ? "Já tem conta ONDAKA" : "Candidatura" }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-zinc-400", children: ja_afiliado ? "Aceda ao seu painel para ver o link, os clientes indicados e as comissões." : autenticado ? "Adira ao programa a partir da sua conta — o código fica ligado ao seu utilizador." : config.aprovacao_automatica ? "Crie a sua conta de afiliado. Fica activa de imediato e recebe o seu link por email." : "Crie a sua conta de afiliado. A ONDAKA analisa a candidatura e avisa por email quando estiver aprovada — normalmente em 1 a 2 dias úteis." }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-6 space-y-2 text-sm text-zinc-300", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }),
              " Sem custos de adesão"
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }),
              " Painel com cliques, registos, comissões e pagamentos"
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }),
              " Materiais prontos para WhatsApp, email e SMS"
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400" }),
              " Aberto a particulares e empresas em Angola"
            ] })
          ] }),
          (ja_afiliado || autenticado) && /* @__PURE__ */ jsxs(Link, { href: ja_afiliado ? "/afiliado" : "/afiliado/aderir", className: "mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg", children: [
            ja_afiliado ? "Abrir o meu painel" : "Aderir ao programa",
            " ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        ] }),
        !autenticado && /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          post("/afiliados/candidatar");
        }, className: "rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur", children: [
          !config.programa_activo && /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200", children: "O programa não está a aceitar candidaturas de momento." }),
          /* @__PURE__ */ jsx("div", { className: "mb-4 grid grid-cols-2 gap-2", children: ["particular", "empresa"].map((t) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setData("tipo", t), className: `rounded-lg border px-3 py-2 text-sm ${data.tipo === t ? "border-blue-500 bg-blue-500/15 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`, children: t === "particular" ? "Sou particular" : "Sou uma empresa" }, t)) }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
            /* @__PURE__ */ jsx(F, { label: data.tipo === "empresa" ? "Nome da empresa" : "Nome completo", erro: errors.nome, full: true, children: /* @__PURE__ */ jsx("input", { name: "nome", className: "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none", value: data.nome, onChange: (e) => setData("nome", e.target.value), required: true }) }),
            /* @__PURE__ */ jsx(F, { label: "Email", erro: errors.email, children: /* @__PURE__ */ jsx("input", { type: "email", className: "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none", value: data.email, onChange: (e) => setData("email", e.target.value), required: true }) }),
            /* @__PURE__ */ jsx(F, { label: "Telefone", erro: errors.telefone, children: /* @__PURE__ */ jsx("input", { className: "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none", value: data.telefone, onChange: (e) => setData("telefone", e.target.value), placeholder: "+244 9xx xxx xxx", required: true }) }),
            /* @__PURE__ */ jsx(F, { label: "NIF (opcional agora)", erro: errors.nif, children: /* @__PURE__ */ jsx("input", { className: "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none", value: data.nif, onChange: (e) => setData("nif", e.target.value) }) }),
            /* @__PURE__ */ jsx(F, { label: "Password", erro: errors.password, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("input", { type: showPassword ? "text" : "password", className: "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none", value: data.password, onChange: (e) => setData("password", e.target.value), required: true, minLength: 8 }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500", children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
            ] }) }),
            /* @__PURE__ */ jsx(F, { label: "Confirmar password", erro: errors.password_confirmation, full: true, children: /* @__PURE__ */ jsx("input", { type: showPassword ? "text" : "password", className: "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none", value: data.password_confirmation, onChange: (e) => setData("password_confirmation", e.target.value), required: true }) }),
            /* @__PURE__ */ jsx(F, { label: "Como pretende divulgar a ONDAKA? (opcional)", erro: errors.como_divulga, full: true, children: /* @__PURE__ */ jsx("textarea", { className: "min-h-[80px] w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none", value: data.como_divulga, onChange: (e) => setData("como_divulga", e.target.value), placeholder: "Ex.: trabalho com gestoras em Luanda; tenho uma página de imobiliário; sou contabilista de condomínios…" }) })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "mt-4 flex items-start gap-2 text-xs text-zinc-400", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-0.5", checked: data.aceita_termos, onChange: (e) => setData("aceita_termos", e.target.checked) }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Li e aceito as ",
              /* @__PURE__ */ jsx("a", { href: "#regras", className: "text-blue-400 underline", children: "regras do programa" }),
              " e os ",
              /* @__PURE__ */ jsx(Link, { href: "/termos", className: "text-blue-400 underline", children: "termos" }),
              " e ",
              /* @__PURE__ */ jsx(Link, { href: "/privacidade", className: "text-blue-400 underline", children: "política de privacidade" }),
              " da ONDAKA."
            ] })
          ] }),
          errors.aceita_termos && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: errors.aceita_termos }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing || !config.programa_activo, className: "mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(Handshake, { className: "h-4 w-4" }),
            " ",
            config.aprovacao_automatica ? "Criar conta de afiliado" : "Enviar candidatura"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-3 text-center text-xs text-zinc-500", children: [
            "Já tem conta ONDAKA? ",
            /* @__PURE__ */ jsx(Link, { href: "/login", className: "text-blue-400 underline", children: "Entre" }),
            " e adira a partir do painel."
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("footer", { className: "border-t border-blue-900/30 py-10", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 md:flex-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: "/img/ondaka-logo.png", alt: "ONDAKA", className: "h-8 w-8 rounded" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-zinc-300", children: "ONDAKA" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
              "© ",
              (/* @__PURE__ */ new Date()).getFullYear(),
              " Soluções Simples, Lda"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-6 text-xs", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", className: "hover:text-white", children: "Início" }),
          /* @__PURE__ */ jsx(Link, { href: "/catalogo", className: "hover:text-white", children: "Catálogo" }),
          /* @__PURE__ */ jsx(Link, { href: "/loja", className: "hover:text-white", children: "Loja" }),
          /* @__PURE__ */ jsx(Link, { href: "/termos", className: "hover:text-white", children: "Termos" }),
          /* @__PURE__ */ jsx(Link, { href: "/privacidade", className: "hover:text-white", children: "Privacidade" })
        ] })
      ] }) })
    ] })
  ] });
}
function Kpi({ v, l }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/50 p-3", children: [
    /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-white", children: v }),
    /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: l })
  ] });
}
function Row({ k, v }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: k }),
    /* @__PURE__ */ jsx("span", { className: "text-white", children: v })
  ] });
}
function Passo({ n, icon: Icon, titulo, texto }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white", children: n }),
      /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-blue-400" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 text-lg font-semibold", children: titulo }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm leading-relaxed text-zinc-400", children: texto })
  ] });
}
function Conta({ icon: Icon, t, d }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4", children: [
    /* @__PURE__ */ jsx(Icon, { className: "mt-0.5 h-5 w-5 text-emerald-400" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium", children: t }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: d })
    ] })
  ] });
}
function Regra({ icon: Icon, t, d }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/40 p-5", children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-purple-400" }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 font-semibold", children: t }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-zinc-400", children: d })
  ] });
}
function F({ label, erro, children, full }) {
  return /* @__PURE__ */ jsxs("div", { className: full ? "md:col-span-2" : "", children: [
    /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-zinc-400", children: label }),
    children,
    erro && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: erro })
  ] });
}
export {
  Landing as default
};
