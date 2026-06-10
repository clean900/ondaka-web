import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { PieChart, FileText, Users, ShieldCheck, Smartphone, CreditCard, MessageSquare, DoorOpen, TrendingUp, Wrench, Bell, Globe2 } from "lucide-react";
const fmt = (v) => new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
function Landing({ pricing }) {
  const [periodo, setPeriodo] = useState("mensal");
  const [numImoveis, setNumImoveis] = useState(1);
  const { escaloes, config } = pricing;
  const precoUnitParaPeriodo = (e) => {
    return periodo === "mensal" ? e.preco_unit_mensal_kz : periodo === "semestral" ? e.preco_unit_semestral_kz : e.preco_unit_anual_kz;
  };
  const mesesPeriodo = periodo === "mensal" ? 1 : periodo === "semestral" ? 6 : 12;
  const escalaoAplicavel = useMemo(() => {
    return escaloes.find((e) => {
      const max = e.imoveis_max ?? 999999;
      return numImoveis >= e.imoveis_min && numImoveis <= max;
    }) ?? escaloes[0];
  }, [numImoveis, escaloes]);
  const precoUnit = precoUnitParaPeriodo(escalaoAplicavel);
  const subtotal = precoUnit * numImoveis * mesesPeriodo;
  const totalComImposto = config.imposto_aplicavel ? subtotal * (1 + config.imposto_taxa_pct / 100) : subtotal;
  const heroBenefits = [
    { Icon: PieChart, label: "Dashboard completo" },
    { Icon: FileText, label: "Controle financeiro elevado" },
    { Icon: Users, label: "Comunicação integrada" },
    { Icon: ShieldCheck, label: "Segurança e conformidade" },
    { Icon: Smartphone, label: "Acesso fácil e mobile" }
  ];
  const moreFeatures = [
    { Icon: CreditCard, label: "Multicaixa Express" },
    { Icon: MessageSquare, label: "Chatbot inteligente" },
    { Icon: DoorOpen, label: "Visitantes & QR" },
    { Icon: TrendingUp, label: "Analytics" },
    { Icon: Wrench, label: "Manutenção" },
    { Icon: FileText, label: "Documentos" },
    { Icon: Bell, label: "Notificações" },
    { Icon: Globe2, label: "Glossário PT-AO" }
  ];
  const features = [
    { Icon: PieChart, titulo: "Dashboard completo", desc: "Visão clara de receitas, despesas e indicadores em tempo real." },
    { Icon: FileText, titulo: "Controle financeiro", desc: "Pagamentos via Multicaixa Express, taxas, multas e fundo de reserva." },
    { Icon: Users, titulo: "Comunicação integrada", desc: "Chat tempo real, avisos, assembleias digitais e chatbot inteligente." },
    { Icon: ShieldCheck, titulo: "Segurança e conformidade", desc: "2FA por SMS, encriptação E2E, RGPD e DP 141/15." },
    { Icon: Smartphone, titulo: "Acesso fácil e mobile", desc: "App iOS e Android para condóminos e gestores. Tudo na palma da mão." },
    { Icon: Globe2, titulo: "Feito para Angola", desc: "Kwanzas, IVA/IPC configurável, glossário PT-AO, 100% local." }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "ONDAKA · Gestão inteligente para o seu condomínio" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0a0a1a] text-zinc-100", style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }, children: [
      /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 border-b border-blue-900/30 bg-[#0a0a1a]/90 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: "/img/ondaka-logo.png", alt: "ONDAKA", className: "h-9 w-9 rounded" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold tracking-wide", children: "ONDAKA" }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-zinc-500", children: "Soluções Simples, Lda" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden gap-8 text-sm md:flex", children: [
          /* @__PURE__ */ jsx("a", { href: "#features", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Funcionalidades" }),
          /* @__PURE__ */ jsx(Link, { href: "/catalogo", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Catálogo" }),
          /* @__PURE__ */ jsx(Link, { href: "/loja", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Loja" }),
          /* @__PURE__ */ jsx("a", { href: "#pricing", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Preços" }),
          /* @__PURE__ */ jsx(Link, { href: "/login", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent transition hover:opacity-80", children: "Entrar" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/registo",
            className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500",
            children: [
              "Trial ",
              config.trial_dias,
              " dias →"
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 bg-cover bg-center",
            style: {
              backgroundImage: 'url("/img/ondaka-hero-bg.png")'
            }
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-l from-[#0a0a1a]/85 via-[#0a0a1a]/40 to-transparent" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 bg-[#0a0a1a]" }),
        /* @__PURE__ */ jsx("div", { className: "relative mx-auto max-w-7xl px-6 py-24 lg:py-32", children: /* @__PURE__ */ jsxs("div", { className: "ml-auto max-w-2xl text-right", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center justify-end gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold tracking-wider text-white drop-shadow-2xl", children: "ONDAKA" }),
            /* @__PURE__ */ jsx("img", { src: "/img/ondaka-logo.png", alt: "ONDAKA", className: "h-14 w-14 rounded-lg shadow-lg shadow-blue-500/40" })
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "mb-5 text-5xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl md:text-6xl", children: [
            "Gestão",
            " ",
            /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent", children: "inteligente" }),
            /* @__PURE__ */ jsx("br", {}),
            "para o seu condomínio"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-2 text-lg text-zinc-100 drop-shadow-lg md:text-xl", children: "Mais eficiência, transparência e controle" }),
          /* @__PURE__ */ jsx("p", { className: "mb-6 text-lg text-zinc-100 drop-shadow-lg md:text-xl", children: "na palma da sua mão." }),
          /* @__PURE__ */ jsx("div", { className: "mb-8 ml-auto h-1 w-48 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-3", children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#features",
                className: "rounded-lg border border-blue-500/40 bg-blue-500/10 px-7 py-3.5 font-semibold backdrop-blur-sm transition hover:border-blue-400 hover:bg-blue-500/20",
                children: "Ver funcionalidades"
              }
            ),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/registo",
                className: "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-7 py-3.5 font-semibold shadow-xl shadow-blue-500/40 transition hover:from-blue-400 hover:to-purple-500",
                children: [
                  "Trial de ",
                  config.trial_dias,
                  " dias →"
                ]
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "relative border-t border-blue-900/30 bg-[#0a0a1a]/80 backdrop-blur-md", children: /* @__PURE__ */ jsx("div", { className: "mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-6 py-10 md:grid-cols-5 md:divide-x md:divide-blue-900/30", children: heroBenefits.map((b) => {
          const Icon = b.Icon;
          return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center px-4 text-center", children: [
            /* @__PURE__ */ jsx(Icon, { className: "mb-3 h-9 w-9 text-blue-400", strokeWidth: 1.3 }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium leading-tight text-zinc-200", children: b.label })
          ] }, b.label);
        }) }) }),
        /* @__PURE__ */ jsx("div", { className: "relative border-t border-blue-900/30 bg-[#0a0a1a]/60 backdrop-blur", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-6 py-8", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-x-3 gap-y-5 md:grid-cols-8", children: moreFeatures.map((b) => {
          const Icon = b.Icon;
          return /* @__PURE__ */ jsxs("div", { className: "group flex flex-col items-center text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2 ring-1 ring-blue-500/20 transition group-hover:from-blue-500/20 group-hover:to-purple-500/20", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-blue-400", strokeWidth: 1.5 }) }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] font-medium leading-tight text-zinc-400", children: b.label })
          ] }, b.label);
        }) }) }) })
      ] }),
      /* @__PURE__ */ jsx("section", { id: "features", className: "border-y border-zinc-800 bg-zinc-900/30 py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-12 text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-3 text-3xl font-bold md:text-4xl", children: "Tudo que precisa para gerir condomínios" }),
          /* @__PURE__ */ jsx("p", { className: "text-zinc-400", children: "Desde a primeira taxa cobrada à última acta assinada" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: features.map((f) => {
          const Icon = f.Icon;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: "group relative rounded-xl border border-blue-900/30 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10",
              children: [
                /* @__PURE__ */ jsx("div", { className: "mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-blue-500/20", children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-blue-400", strokeWidth: 1.5 }) }),
                /* @__PURE__ */ jsx("h3", { className: "mb-2 font-semibold", children: f.titulo }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: f.desc })
              ]
            },
            f.titulo
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-12 text-center", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/catalogo",
              className: "inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-6 py-3 font-semibold transition hover:border-blue-400 hover:bg-blue-500/10",
              children: [
                "Ver catálogo completo",
                /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: "→" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-zinc-500", children: "Mais de 60 funcionalidades — em produção, em breve e no roadmap" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "pricing", className: "border-b border-zinc-800 py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-12 text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-3 text-3xl font-bold md:text-4xl", children: "Calcule a sua subscrição" }),
          /* @__PURE__ */ jsx("p", { className: "text-zinc-400", children: "Diga-nos quantos imóveis gere e qual o período. Veja o preço em tempo real." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-10 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-8", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-semibold text-zinc-300", children: "Quantos imóveis gere?" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: 1,
                    max: 2e3,
                    value: numImoveis,
                    onChange: (e) => setNumImoveis(Math.max(1, Math.min(2e3, parseInt(e.target.value) || 1))),
                    className: "w-28 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-2xl font-bold text-white focus:border-blue-500 focus:outline-none"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-zinc-500", children: "imóveis" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                min: 1,
                max: 1e3,
                value: numImoveis,
                onChange: (e) => setNumImoveis(parseInt(e.target.value)),
                className: "mb-3 w-full accent-blue-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "mb-6 flex justify-between text-[10px] text-zinc-500", children: [
              /* @__PURE__ */ jsx("span", { children: "1" }),
              /* @__PURE__ */ jsx("span", { children: "250" }),
              /* @__PURE__ */ jsx("span", { children: "500" }),
              /* @__PURE__ */ jsx("span", { children: "750" }),
              /* @__PURE__ */ jsx("span", { children: "1000+" })
            ] }),
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-semibold text-zinc-300", children: "Período de pagamento" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-lg bg-zinc-900 p-1 ring-1 ring-zinc-800", children: ["mensal", "semestral", "anual"].map((p) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setPeriodo(p),
                className: `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${periodo === p ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`,
                children: [
                  p.charAt(0).toUpperCase() + p.slice(1),
                  p === "semestral" && config.desconto_semestral_pct > 0 && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-[10px]", children: [
                    "-",
                    config.desconto_semestral_pct,
                    "%"
                  ] }),
                  p === "anual" && config.desconto_anual_pct > 0 && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-[10px]", children: [
                    "-",
                    config.desconto_anual_pct,
                    "%"
                  ] })
                ]
              },
              p
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 ring-1 ring-blue-500/20", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-1 text-[10px] uppercase tracking-widest text-zinc-500", children: "Escalão aplicável" }),
            /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-blue-300", children: escalaoAplicavel.nome }),
              escalaoAplicavel.desconto_qtd_pct > 0 && /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300", children: [
                "-",
                escalaoAplicavel.desconto_qtd_pct,
                "% qtd"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-5 text-xs text-zinc-500", children: [
              escalaoAplicavel.imoveis_min,
              escalaoAplicavel.imoveis_max ? `-${escalaoAplicavel.imoveis_max}` : "+",
              " imóveis · ",
              fmt(precoUnit),
              " Kz por imóvel/mês"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-2 text-[10px] uppercase tracking-widest text-zinc-500", children: [
              "Total ",
              periodo,
              " (",
              mesesPeriodo,
              " ",
              mesesPeriodo === 1 ? "mês" : "meses",
              ")"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-1 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl", children: [
              fmt(totalComImposto),
              " Kz"
            ] }),
            config.imposto_aplicavel && /* @__PURE__ */ jsxs("div", { className: "text-xs text-zinc-500", children: [
              "Subtotal: ",
              fmt(subtotal),
              " Kz · ",
              config.imposto_tipo,
              " ",
              config.imposto_taxa_pct,
              "%: ",
              fmt(totalComImposto - subtotal),
              " Kz"
            ] }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/registo",
                className: "mt-5 block rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-center font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-purple-500",
                children: [
                  "Começar trial de ",
                  config.trial_dias,
                  " dias →"
                ]
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-zinc-300", children: "Todos os escalões disponíveis" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
            "Preço por imóvel/mês · Período ",
            periodo
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3 lg:grid-cols-5", children: escaloes.map((e) => {
          const isActive = escalaoAplicavel.slug === e.slug;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `relative rounded-2xl border p-5 transition ${isActive ? "border-blue-500 bg-gradient-to-br from-blue-500/15 to-purple-500/10 shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/40" : e.destaque ? "border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5" : "border-zinc-800 bg-zinc-900/50"}`,
              children: [
                isActive && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white", children: "✓ O seu plano" }),
                !isActive && e.destaque && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-800 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300", children: "⭐ Popular" }),
                /* @__PURE__ */ jsx("div", { className: "mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400", children: e.nome }),
                /* @__PURE__ */ jsxs("div", { className: "mb-3 text-xs text-zinc-500", children: [
                  e.imoveis_min,
                  e.imoveis_max ? `-${e.imoveis_max}` : "+",
                  " imóveis"
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
                    fmt(precoUnitParaPeriodo(e)),
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500", children: "Kz" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] text-zinc-500", children: "por imóvel/mês" }),
                  e.desconto_qtd_pct > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-[10px] text-blue-400", children: [
                    "-",
                    e.desconto_qtd_pct,
                    "% qtd"
                  ] })
                ] })
              ]
            },
            e.slug
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 text-center text-xs text-zinc-500", children: [
          "Trial de ",
          config.trial_dias,
          " dias 100% grátis",
          config.imposto_aplicavel && ` · ${config.imposto_tipo} ${config.imposto_taxa_pct}% aplicável`
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden py-24", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-4xl px-6 text-center", children: [
          /* @__PURE__ */ jsxs("h2", { className: "mb-4 text-3xl font-bold md:text-5xl", children: [
            "Pronto para simplificar a sua",
            " ",
            /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent", children: "gestão?" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-8 text-zinc-400", children: [
            config.trial_dias,
            " dias 100% grátis. Sem compromisso, cancele quando quiser."
          ] }),
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
          /* @__PURE__ */ jsx("a", { href: "#features", className: "hover:text-white", children: "Funcionalidades" }),
          /* @__PURE__ */ jsx(Link, { href: "/catalogo", className: "hover:text-white", children: "Catálogo" }),
          /* @__PURE__ */ jsx(Link, { href: "/loja", className: "hover:text-white", children: "Loja" }),
          /* @__PURE__ */ jsx("a", { href: "#pricing", className: "hover:text-white", children: "Preços" }),
          /* @__PURE__ */ jsx(Link, { href: "/login", className: "hover:text-white", children: "Entrar" })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  Landing as default
};
