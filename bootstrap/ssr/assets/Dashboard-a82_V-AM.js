import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { A as AuthenticatedLayout, a as formatKz, g as gradientDeNome, i as iniciais, b as formatRelativo } from "./AuthenticatedLayout-BhN0vln8.js";
import { usePage, Head, Link } from "@inertiajs/react";
import { Sparkles, Lock, Plus, Building2, Users, Receipt, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ChevronRight, BarChart3, AlertCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area } from "recharts";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function FeatureGate({
  slug,
  children,
  fallback,
  className = ""
}) {
  const { props } = usePage();
  const features = props.features ?? {};
  const isActive = features[slug] === true;
  if (isActive) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  if (fallback !== void 0) {
    return /* @__PURE__ */ jsx(Fragment, { children: fallback });
  }
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("ondaka:premium-modal", {
        detail: { slug }
      })
    );
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("ondaka:premium-modal", {
          detail: { slug }
        })
      );
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "region",
      "aria-disabled": "true",
      "aria-label": `Funcionalidade premium bloqueada: ${slug}. Clique para saber mais.`,
      tabIndex: 0,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      className: `relative cursor-pointer select-none group ${className}`,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "opacity-60 pointer-events-none transition-opacity group-hover:opacity-50",
            "aria-hidden": "true",
            children
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("span", { children: "PREMIUM" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-[1px] rounded-lg transition-all group-hover:bg-white/40 dark:group-hover:bg-black/40", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 shadow-xl border border-zinc-200 dark:border-zinc-700", children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-6 h-6 text-zinc-700 dark:text-zinc-300", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-zinc-700 dark:text-zinc-300", children: "Clique para activar" })
        ] }) })
      ]
    }
  );
}
function Dashboard({ dados }) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
  const { auth } = usePage().props;
  const nome = ((_b = (_a = auth.user) == null ? void 0 : _a.name) == null ? void 0 : _b.split(" ")[0]) ?? "";
  const horaActual = (/* @__PURE__ */ new Date()).getHours();
  const saudacao = horaActual < 12 ? "Bom dia" : horaActual < 19 ? "Boa tarde" : "Boa noite";
  const hoje = /* @__PURE__ */ new Date();
  const dataFormatada = new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(hoje);
  (dados == null ? void 0 : dados.receita_mensal) ?? [];
  const fluxoMensal = (dados == null ? void 0 : dados.fluxo_mensal) ?? [];
  const contas = (dados == null ? void 0 : dados.contas) ?? [];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Painel" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-[#00D4FF]" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60 font-medium tracking-wide", children: dataFormatada })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold text-white tracking-tight", children: [
          saudacao,
          ", ",
          /* @__PURE__ */ jsx("span", { className: "gradient-ondaka-text", children: nome })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1.5", children: "Aqui está o resumo da sua plataforma." })
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/condominios",
          className: "btn-primary",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "Novo condomínio"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: Building2,
          iconColor: "#00D4FF",
          label: "Condomínios",
          valor: String(((_d = (_c = dados == null ? void 0 : dados.kpis) == null ? void 0 : _c.condominios) == null ? void 0 : _d.valor) ?? 0),
          delta: ((_f = (_e = dados == null ? void 0 : dados.kpis) == null ? void 0 : _e.condominios) == null ? void 0 : _f.delta) ?? "—",
          deltaPositivo: true,
          variant: "ciano"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: Users,
          iconColor: "#A855F7",
          label: "Imóveis geridos",
          valor: String(((_h = (_g = dados == null ? void 0 : dados.kpis) == null ? void 0 : _g.imoveis) == null ? void 0 : _h.valor) ?? 0),
          delta: ((_j = (_i = dados == null ? void 0 : dados.kpis) == null ? void 0 : _i.imoveis) == null ? void 0 : _j.delta) ?? "—",
          variant: "roxo"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: Receipt,
          iconColor: "#EC4899",
          label: "Pendente",
          valor: formatKz(((_l = (_k = dados == null ? void 0 : dados.kpis) == null ? void 0 : _k.pendente) == null ? void 0 : _l.valor) ?? 0),
          delta: ((_n = (_m = dados == null ? void 0 : dados.kpis) == null ? void 0 : _m.pendente) == null ? void 0 : _n.delta) ?? "—",
          variant: "magenta"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: TrendingUp,
          iconColor: "#10B981",
          label: "Receita do mês",
          valor: formatKz(((_p = (_o = dados == null ? void 0 : dados.kpis) == null ? void 0 : _o.receita_mes) == null ? void 0 : _p.valor) ?? 0),
          delta: ((_r = (_q = dados == null ? void 0 : dados.kpis) == null ? void 0 : _q.receita_mes) == null ? void 0 : _r.delta) ?? "—",
          variant: "verde"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: TrendingDown,
          iconColor: "#EF4444",
          label: "Despesas do mês",
          valor: formatKz(((_t = (_s = dados == null ? void 0 : dados.kpis) == null ? void 0 : _s.despesas_mes) == null ? void 0 : _t.valor) ?? 0),
          delta: ((_v = (_u = dados == null ? void 0 : dados.kpis) == null ? void 0 : _u.despesas_mes) == null ? void 0 : _v.delta) ?? "—",
          variant: "magenta"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: Wallet,
          iconColor: "#00D4FF",
          label: "Saldo em conta",
          valor: formatKz(((_x = (_w = dados == null ? void 0 : dados.kpis) == null ? void 0 : _w.saldo_contas) == null ? void 0 : _x.valor) ?? 0),
          delta: ((_z = (_y = dados == null ? void 0 : dados.kpis) == null ? void 0 : _y.saldo_contas) == null ? void 0 : _z.delta) ?? "—",
          variant: "ciano"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 card-elevated", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-white", children: "Receita mensal" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mt-0.5", children: "Últimos 6 meses (simulação)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-emerald-400 font-medium", children: [
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3.5 h-3.5" }),
            "12.4%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-48 -mx-2", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: fluxoMensal, margin: { top: 5, right: 10, left: 10, bottom: 0 }, children: [
          /* @__PURE__ */ jsxs("defs", { children: [
            /* @__PURE__ */ jsxs("linearGradient", { id: "colorReceitas", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#10B981", stopOpacity: 0.3 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#10B981", stopOpacity: 0 })
            ] }),
            /* @__PURE__ */ jsxs("linearGradient", { id: "colorDespesas", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#EF4444", stopOpacity: 0.3 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#EF4444", stopOpacity: 0 })
            ] }),
            /* @__PURE__ */ jsxs("linearGradient", { id: "linhaReceitas", x1: "0", y1: "0", x2: "1", y2: "0", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#00D4FF" }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#EC4899" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)" }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "mes",
              stroke: "rgba(255,255,255,0.4)",
              fontSize: 11,
              tickLine: false,
              axisLine: false
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              stroke: "rgba(255,255,255,0.4)",
              fontSize: 11,
              tickLine: false,
              axisLine: false,
              tickFormatter: (v) => `${(v / 1e6).toFixed(1)}M`
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: {
                background: "#16163A",
                border: "0.5px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "8px",
                fontSize: "12px"
              },
              labelStyle: { color: "#FFFFFF" },
              formatter: (v, name) => [formatKz(v), name === "receitas" ? "Receitas" : "Despesas"]
            }
          ),
          /* @__PURE__ */ jsx(
            Legend,
            {
              wrapperStyle: { fontSize: "11px", color: "rgba(255,255,255,0.6)" },
              formatter: (value) => value === "receitas" ? "Receitas" : "Despesas"
            }
          ),
          /* @__PURE__ */ jsx(
            Area,
            {
              type: "monotone",
              dataKey: "receitas",
              stroke: "#10B981",
              strokeWidth: 2,
              fill: "url(#colorReceitas)"
            }
          ),
          /* @__PURE__ */ jsx(
            Area,
            {
              type: "monotone",
              dataKey: "despesas",
              stroke: "#EF4444",
              strokeWidth: 2,
              fill: "url(#colorDespesas)"
            }
          )
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card-elevated", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-white mb-5", children: "Actividade recente" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          ((dados == null ? void 0 : dados.actividade_recente) ?? []).length > 0 ? ((dados == null ? void 0 : dados.actividade_recente) ?? []).map((act, idx) => /* @__PURE__ */ jsx(
            ActivityItem,
            {
              nome: act.titulo,
              mensagem: act.descricao,
              tempo: new Date(act.created_at),
              tipo: "info"
            },
            idx
          )) : /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 italic", children: "Sem actividade recente" }),
          /* @__PURE__ */ jsx("div", { className: "pt-3 border-t border-white/5 mt-4", children: /* @__PURE__ */ jsxs("button", { className: "text-xs text-white/50 hover:text-white flex items-center gap-1 group", children: [
            "Ver tudo",
            /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3 transition group-hover:translate-x-0.5" })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-white", children: "Acções rápidas" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: "Atalhos para tarefas comuns" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsx(
          QuickAction,
          {
            href: "/condominios",
            icon: Building2,
            iconColor: "#00D4FF",
            titulo: "Condomínios",
            descricao: "Gerir condomínios e imóveis"
          }
        ),
        /* @__PURE__ */ jsx(
          QuickAction,
          {
            href: "/condominos",
            icon: Users,
            iconColor: "#A855F7",
            titulo: "Condóminos",
            descricao: "Gerir condóminos"
          }
        ),
        /* @__PURE__ */ jsx(
          QuickAction,
          {
            href: "/quotas",
            icon: Receipt,
            iconColor: "#EC4899",
            titulo: "Facturação",
            descricao: "Quotas, pagamentos, créditos"
          }
        ),
        /* @__PURE__ */ jsx(
          QuickAction,
          {
            href: "#",
            icon: TrendingUp,
            iconColor: "#10B981",
            titulo: "Relatórios",
            descricao: "Em breve",
            disabled: true
          }
        ),
        /* @__PURE__ */ jsx(FeatureGate, { slug: "dashboard_bi", children: /* @__PURE__ */ jsx(
          QuickAction,
          {
            href: "/funcionalidades/dashboard_bi",
            icon: BarChart3,
            iconColor: "#F59E0B",
            titulo: "Dashboard BI Avançado",
            descricao: "Análises detalhadas e relatórios"
          }
        ) })
      ] })
    ] }),
    contas.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 card-elevated", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-white", children: "Saldos por conta" }),
        /* @__PURE__ */ jsx(Link, { href: "/financas/contas-bancarias", className: "text-xs text-[#00D4FF] hover:underline", children: "Gerir contas" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-white/40 text-xs border-b border-white/5", children: [
          /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Conta" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Condomínio" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium text-right", children: "Saldo" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: contas.map((conta) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors",
            children: [
              /* @__PURE__ */ jsxs("td", { className: "py-2.5 text-white/80", children: [
                conta.nome,
                " ",
                /* @__PURE__ */ jsxs("span", { className: "text-white/40", children: [
                  "· ",
                  conta.banco
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "py-2.5 text-white/60", children: conta.condominio }),
              /* @__PURE__ */ jsxs("td", { className: "py-2.5 text-right font-medium", style: { color: conta.saldo_actual >= 0 ? "#6EE7B7" : "#FCA5A5" }, children: [
                formatKz(conta.saldo_actual),
                " Kz"
              ] })
            ]
          },
          conta.id
        )) }),
        /* @__PURE__ */ jsx("tfoot", { children: /* @__PURE__ */ jsxs("tr", { className: "border-t border-white/10", children: [
          /* @__PURE__ */ jsx("td", { className: "pt-2.5 text-white/50 text-xs", colSpan: 2, children: "Total" }),
          /* @__PURE__ */ jsxs("td", { className: "pt-2.5 text-right font-semibold text-white", children: [
            formatKz(contas.reduce((s, c) => s + c.saldo_actual, 0)),
            " Kz"
          ] })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "mt-6 rounded-xl p-4 flex items-start gap-3",
        style: {
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%)",
          border: "0.5px solid rgba(245, 158, 11, 0.25)"
        },
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-amber-400" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "text-white font-medium mb-0.5", children: "Fase 1 em desenvolvimento" }),
            /* @__PURE__ */ jsx("div", { className: "text-white/60 text-xs leading-relaxed", children: "Disponíveis: Condomínios, Edifícios e Imóveis. Próximos módulos: Condóminos, Facturação, ProxyPay, Comunicação, Documentos, Segurança." })
          ] })
        ]
      }
    )
  ] });
}
function StatCard({
  icon: Icon,
  iconColor,
  label,
  valor,
  delta,
  deltaPositivo,
  variant
}) {
  const variantClass = {
    ciano: "stat-card-ciano",
    roxo: "stat-card-roxo",
    magenta: "stat-card-magenta",
    verde: "stat-card-verde"
  }[variant];
  return /* @__PURE__ */ jsxs("div", { className: variantClass, children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between mb-3", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-9 h-9 rounded-lg flex items-center justify-center",
        style: { background: `${iconColor}15`, border: `0.5px solid ${iconColor}30` },
        children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: iconColor } })
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-[1px] font-medium mb-1", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-white tracking-tight", children: valor }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "text-[11px] mt-1.5 flex items-center gap-1",
        style: { color: deltaPositivo ? "#10B981" : iconColor },
        children: delta
      }
    )
  ] });
}
function ActivityItem({
  nome,
  mensagem,
  tempo,
  tipo
}) {
  const gradient = gradientDeNome(nome);
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-3 items-start", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0",
        style: { background: gradient },
        children: iniciais(nome)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-white truncate", children: mensagem }),
      /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-white/40 mt-0.5", children: [
        nome,
        " · ",
        formatRelativo(tempo)
      ] })
    ] })
  ] });
}
function QuickAction({
  href,
  icon: Icon,
  iconColor,
  titulo,
  descricao,
  disabled = false
}) {
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
        style: {
          background: disabled ? "rgba(255,255,255,0.03)" : `${iconColor}15`,
          border: `0.5px solid ${disabled ? "rgba(255,255,255,0.08)" : iconColor + "30"}`
        },
        children: /* @__PURE__ */ jsx(
          Icon,
          {
            className: "w-4 h-4",
            style: { color: disabled ? "rgba(255,255,255,0.3)" : iconColor }
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: `text-sm font-medium ${disabled ? "text-white/40" : "text-white"}`, children: titulo }),
      /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50", children: descricao })
    ] }),
    !disabled && /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-white/30 flex-shrink-0" })
  ] });
  const className = `flex items-center gap-3 p-3 rounded-lg transition-all ${disabled ? "bg-white/[0.01] border border-white/5 cursor-not-allowed opacity-60" : "bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-0.5 cursor-pointer"}`;
  if (disabled) {
    return /* @__PURE__ */ jsx("div", { className, children: content });
  }
  return /* @__PURE__ */ jsx(Link, { href, className, children: content });
}
export {
  Dashboard as default
};
