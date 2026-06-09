import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head } from "@inertiajs/react";
import { useState, useCallback, useEffect } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function kz(v) {
  return new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(v) + " Kz";
}
const ABAS = [
  { id: "receitas", label: "Receitas vs Despesas" },
  { id: "cobranca", label: "Cobrança" },
  { id: "despesas", label: "Despesas" },
  { id: "saude", label: "Saúde financeira" },
  { id: "preditivo", label: "Preditivo" },
  { id: "multi", label: "Multi-condomínio" },
  { id: "operacional", label: "Operacional" }
];
function BiDashboard({ condominios }) {
  const [aba, setAba] = useState("receitas");
  const [condominioId, setCondominioId] = useState("");
  const [meses, setMeses] = useState("12");
  const [dados, setDados] = useState({});
  const [aCarregar, setACarregar] = useState(false);
  const carregar = useCallback(async () => {
    setACarregar(true);
    const p = new URLSearchParams();
    if (condominioId) p.set("condominio_id", condominioId);
    p.set("meses", meses);
    try {
      const res = await fetch(`/bi/dados/${aba}?${p.toString()}`, { headers: { Accept: "application/json" } });
      const json = await res.json();
      setDados((prev) => ({ ...prev, [aba + condominioId + meses]: json }));
    } catch {
    }
    setACarregar(false);
  }, [aba, condominioId, meses]);
  useEffect(() => {
    carregar();
  }, [carregar]);
  const d = dados[aba + condominioId + meses];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard BI" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white", children: "Dashboard BI" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200", children: "PREMIUM" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-5", children: "Análises financeiras do seu condomínio." }),
      /* @__PURE__ */ jsx(BannerAlertas, { condominioId }),
      /* @__PURE__ */ jsxs("div", { className: "mb-5 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: condominioId,
            onChange: (e) => setCondominioId(e.target.value),
            className: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
              condominios.map((co) => /* @__PURE__ */ jsx("option", { value: co.id, children: co.nome }, co.id))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: meses,
            onChange: (e) => setMeses(e.target.value),
            className: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
            children: [
              /* @__PURE__ */ jsx("option", { value: "3", children: "Últimos 3 meses" }),
              /* @__PURE__ */ jsx("option", { value: "6", children: "Últimos 6 meses" }),
              /* @__PURE__ */ jsx("option", { value: "12", children: "Últimos 12 meses" }),
              /* @__PURE__ */ jsx("option", { value: "24", children: "Últimos 24 meses" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 ml-auto", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/bi/exportar/csv" + (condominioId ? "?condominio_id=" + condominioId : ""),
              className: "text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10",
              children: "Exportar CSV"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/bi/exportar/pdf" + (condominioId ? "?condominio_id=" + condominioId : ""),
              className: "text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30",
              children: "Relatório PDF"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1 border-b border-white/10 mb-6 overflow-x-auto", children: ABAS.map((a) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setAba(a.id),
          className: `text-sm px-4 py-2 whitespace-nowrap border-b-2 transition-colors ${aba === a.id ? "border-cyan-400 text-white" : "border-transparent text-white/50 hover:text-white/80"}`,
          children: a.label
        },
        a.id
      )) }),
      aCarregar && !d ? /* @__PURE__ */ jsx("div", { className: "p-10 text-center text-white/40 text-sm", children: "A carregar..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        aba === "receitas" && d && /* @__PURE__ */ jsx(AreaReceitas, { d }),
        aba === "cobranca" && d && /* @__PURE__ */ jsx(AreaCobranca, { d, condominioId }),
        aba === "despesas" && d && /* @__PURE__ */ jsx(AreaDespesas, { d, condominioId, meses }),
        aba === "saude" && d && /* @__PURE__ */ jsx(AreaSaude, { d }),
        aba === "preditivo" && d && /* @__PURE__ */ jsx(AreaPreditivo, { d }),
        aba === "multi" && d && /* @__PURE__ */ jsx(AreaMulti, { d }),
        aba === "operacional" && d && /* @__PURE__ */ jsx(AreaOperacional, { d })
      ] })
    ] })
  ] });
}
function AreaReceitas({ d }) {
  var _a, _b, _c;
  const t = d.totais;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(Cartao, { label: "Receita total", valor: kz(t.receita), cor: "text-emerald-400", variacao: (_a = d.comparacao) == null ? void 0 : _a.receita }),
      /* @__PURE__ */ jsx(Cartao, { label: "Despesa total", valor: kz(t.despesa), cor: "text-red-400", variacao: (_b = d.comparacao) == null ? void 0 : _b.despesa }),
      /* @__PURE__ */ jsx(Cartao, { label: "Saldo", valor: kz(t.saldo), cor: t.saldo >= 0 ? "text-cyan-400" : "text-red-400", variacao: (_c = d.comparacao) == null ? void 0 : _c.saldo })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Evolução mensal" }),
      /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 320 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: d.meses, margin: { top: 8, right: 8, left: 8, bottom: 8 }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "label", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 12 } }),
        /* @__PURE__ */ jsx(YAxis, { tick: { fill: "rgba(255,255,255,0.5)", fontSize: 12 }, tickFormatter: (v) => new Intl.NumberFormat("pt-AO", { notation: "compact" }).format(v) }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => kz(v), contentStyle: { background: "#141428", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" } }),
        /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 12 } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "receita", name: "Receita", fill: "#10B981", radius: [4, 4, 0, 0] }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "despesa", name: "Despesa", fill: "#EF4444", radius: [4, 4, 0, 0] })
      ] }) }) })
    ] })
  ] });
}
function AreaCobranca({ d, condominioId }) {
  const dsoLabel = d.dso == null ? "n/d" : d.dso < 0 ? `${Math.abs(d.dso)}d adiantado` : `${d.dso}d`;
  const aging = [
    { faixa: "Até 30 dias", valor: d.aging.ate_30 },
    { faixa: "31-60 dias", valor: d.aging.d31_60 },
    { faixa: "61-90 dias", valor: d.aging.d61_90 },
    { faixa: "+90 dias", valor: d.aging.mais_90 },
    { faixa: "Sem venc.", valor: d.aging.sem_venc }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(Cartao, { label: "Taxa de cobrança", valor: `${d.taxa_cobranca}%`, cor: "text-amber-400" }),
      /* @__PURE__ */ jsx(Cartao, { label: "Dívida total", valor: kz(d.divida_total), cor: "text-red-400" }),
      /* @__PURE__ */ jsx(Cartao, { label: "DSO (prazo médio)", valor: dsoLabel, cor: "text-cyan-400" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10 mb-6", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Antiguidade da dívida (aging)" }),
      /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 280 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: aging, margin: { top: 8, right: 8, left: 8, bottom: 8 }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "faixa", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 12 } }),
        /* @__PURE__ */ jsx(YAxis, { tick: { fill: "rgba(255,255,255,0.5)", fontSize: 12 }, tickFormatter: (v) => new Intl.NumberFormat("pt-AO", { notation: "compact" }).format(v) }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => kz(v), contentStyle: { background: "#141428", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "valor", name: "Dívida", fill: "#F59E0B", radius: [4, 4, 0, 0] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(DevedoresDetalhados, { condominioId })
  ] });
}
function AreaDespesas({ d, condominioId, meses }) {
  const CORES = ["#A855F7", "#00D4FF", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"];
  const csvHref = "/bi/exportar/despesas/csv?" + new URLSearchParams({
    ...condominioId ? { condominio_id: condominioId } : {},
    meses
  }).toString();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-3", children: /* @__PURE__ */ jsx("a", { href: csvHref, className: "text-xs px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-200 hover:bg-cyan-500/25", children: "Exportar CSV" }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(Cartao, { label: "Despesa total (pagas)", valor: kz(d.total), cor: "text-red-400" }),
      /* @__PURE__ */ jsx(Cartao, { label: "Categorias com despesa", valor: String(d.por_categoria.length), cor: "text-cyan-400" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Por categoria" }),
        d.por_categoria.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-white/40", children: "Sem despesas pagas." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: d.por_categoria.map((cat, i) => {
          const pct = d.total > 0 ? cat.total / d.total * 100 : 0;
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-white/80", children: cat.categoria }),
              /* @__PURE__ */ jsx("span", { className: "text-white/60", children: kz(cat.total) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full", style: { width: `${pct}%`, background: CORES[i % CORES.length] } }) })
          ] }, cat.categoria);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Evolução mensal" }),
        /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 260 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: d.meses, margin: { top: 8, right: 8, left: 8, bottom: 8 }, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "label", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 } }),
          /* @__PURE__ */ jsx(YAxis, { tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 }, tickFormatter: (v) => new Intl.NumberFormat("pt-AO", { notation: "compact" }).format(v) }),
          /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => kz(v), contentStyle: { background: "#141428", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "total", name: "Despesa", fill: "#EF4444", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] })
    ] })
  ] });
}
function AreaSaude({ d }) {
  const fr = d.fundo_reserva;
  const lq = d.liquidez;
  const pctBar = Math.min(100, fr.pct / Math.max(fr.min_legal * 2, fr.pct) * 100);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70", children: "Fundo de reserva (DP 141/15)" }),
        /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${fr.cumpre ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`, children: fr.cumpre ? "Cumpre" : "Abaixo do mínimo" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mb-3", children: [
        /* @__PURE__ */ jsxs("span", { className: `text-3xl font-bold ${fr.cumpre ? "text-emerald-400" : "text-red-400"}`, children: [
          fr.pct,
          "%"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-white/50", children: [
          "das contribuições (mínimo legal ",
          fr.min_legal,
          "%)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative h-3 rounded-full bg-white/5 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: `h-full rounded-full ${fr.cumpre ? "bg-emerald-500" : "bg-red-500"}`, style: { width: `${pctBar}%` } }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 bottom-0 w-0.5 bg-white/60", style: { left: `${Math.min(100, fr.min_legal / Math.max(fr.min_legal * 2, fr.pct) * 100)}%` }, title: `Mínimo legal ${fr.min_legal}%` })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/40 mt-2", children: [
        "Fundo cobrado: ",
        kz(fr.cobrado),
        " de ",
        kz(fr.contribuicoes),
        " em contribuições."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(Cartao, { label: "Saldo disponível", valor: kz(lq.saldo_disponivel), cor: "text-cyan-400" }),
      /* @__PURE__ */ jsx(Cartao, { label: "Dívida em aberto", valor: kz(lq.divida_aberto), cor: "text-red-400" }),
      /* @__PURE__ */ jsx(Cartao, { label: "Cobertura (saldo/dívida)", valor: lq.cobertura == null ? "n/d" : lq.cobertura + "x", cor: lq.cobertura != null && lq.cobertura >= 1 ? "text-emerald-400" : "text-amber-400" })
    ] })
  ] });
}
function AreaPreditivo({ d }) {
  const ipc = d.sugestao_ipc;
  const ano = d.anomalias;
  const bench = d.benchmarking;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10 mb-6", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Sugestão de quota (ajuste ao IPC)" }),
      ipc.disponivel ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50 mb-3", children: [
          "Com base na inflação de ",
          ipc.ipc_pct,
          "%, sugestão para o próximo período:"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-white/5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50", children: "Quota base" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/70 mt-1", children: [
              kz(ipc.base_actual),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "→" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-cyan-400", children: kz(ipc.base_sugerida) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-white/5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50", children: "Fundo reserva" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/70 mt-1", children: [
              kz(ipc.fundo_actual),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "→" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-cyan-400", children: kz(ipc.fundo_sugerido) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50", children: "Total" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/70 mt-1", children: [
              kz(ipc.total_actual),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "→" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-cyan-300", children: kz(ipc.total_sugerido) })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-white/40", children: ipc.motivo })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Detecção de anomalias" }),
        ano.disponivel ? /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60", children: [
            "Média mensal: ",
            kz(ano.media_mensal)
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60", children: [
            "Último mês: ",
            kz(ano.ultimo_mes)
          ] }),
          /* @__PURE__ */ jsxs("p", { className: `text-lg font-bold mt-2 ${ano.anomalia ? "text-amber-400" : "text-emerald-400"}`, children: [
            ano.desvio_pct > 0 ? "+" : "",
            ano.desvio_pct,
            "% ",
            ano.anomalia ? "⚠ anomalia" : "normal"
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/40", children: [
          /* @__PURE__ */ jsx("p", { children: ano.motivo }),
          /* @__PURE__ */ jsx("p", { className: "text-xs mt-2 text-white/30", children: "Disponível assim que houver mais histórico." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Benchmarking entre condomínios" }),
        bench.disponivel ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50 mb-2", children: [
            "Média: ",
            kz(bench.media)
          ] }),
          bench.itens.map((it) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-white/70", children: [
              "Condomínio #",
              it.condominio_id
            ] }),
            /* @__PURE__ */ jsxs("span", { className: it.vs_media_pct > 0 ? "text-amber-300" : "text-emerald-300", children: [
              kz(it.total),
              " (",
              it.vs_media_pct > 0 ? "+" : "",
              it.vs_media_pct,
              "%)"
            ] })
          ] }, it.condominio_id))
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-sm text-white/40", children: [
          /* @__PURE__ */ jsx("p", { children: bench.motivo }),
          /* @__PURE__ */ jsx("p", { className: "text-xs mt-2 text-white/30", children: "Disponível com mais condomínios com dados." })
        ] })
      ] })
    ] })
  ] });
}
function AreaMulti({ d }) {
  const itens = d.itens || [];
  const grafico = itens.map((it) => ({ nome: it.nome.length > 14 ? it.nome.slice(0, 13) + "…" : it.nome, Receita: it.receita, Dívida: it.divida }));
  const corScore = (s) => s >= 70 ? "text-emerald-400" : s >= 45 ? "text-amber-400" : "text-red-400";
  const medalha = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-4", children: "Ranking de saúde financeira dos seus condomínios." }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3 mb-6", children: itens.map((it, i) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-white", children: [
          medalha(i),
          " ",
          it.nome
        ] }),
        /* @__PURE__ */ jsxs("span", { className: `text-lg font-bold ${corScore(it.score_saude)}`, children: [
          it.score_saude,
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: "/100" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Receita" }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-emerald-300", children: kz(it.receita) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Dívida" }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-red-300", children: kz(it.divida) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Cobrança" }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsxs("span", { className: "text-white/80", children: [
            it.taxa_cobranca,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Fundo" }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsxs("span", { className: it.fundo_cumpre ? "text-emerald-300" : "text-red-300", children: [
            it.fundo_pct,
            "%"
          ] })
        ] })
      ] })
    ] }, it.condominio_id)) }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Receita vs Dívida por condomínio" }),
      /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 300 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: grafico, margin: { top: 8, right: 8, left: 8, bottom: 8 }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "nome", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 } }),
        /* @__PURE__ */ jsx(YAxis, { tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 }, tickFormatter: (v) => new Intl.NumberFormat("pt-AO", { notation: "compact" }).format(v) }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => kz(v), contentStyle: { background: "#141428", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" } }),
        /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 12 } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "Receita", fill: "#10B981", radius: [4, 4, 0, 0] }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "Dívida", fill: "#EF4444", radius: [4, 4, 0, 0] })
      ] }) }) })
    ] })
  ] });
}
function AreaOperacional({ d }) {
  const cat = (d.por_categoria || []).map((c) => ({ nome: c.categoria, Pedidos: c.n }));
  const estados = Object.entries(d.por_estado || {}).map(([k, v]) => ({ k, v }));
  const prio = d.por_prioridade || {};
  const tr = d.tempo_resolucao;
  const corEstado = (e) => e === "resolvido" || e === "fechado" ? "text-emerald-300" : e === "cancelado" ? "text-white/40" : "text-amber-300";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(Cartao, { label: "Total de pedidos", valor: String(d.total), cor: "text-cyan-400" }),
      /* @__PURE__ */ jsx(Cartao, { label: "Urgentes", valor: String(prio.urgente || 0), cor: "text-red-400" }),
      /* @__PURE__ */ jsx(Cartao, { label: "Tempo médio resolução", valor: tr.disponivel ? tr.dias_medio + "d" : "n/d", cor: "text-emerald-400" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Por estado" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: estados.map((e) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: corEstado(e.k), children: e.k.replace("_", " ") }),
          /* @__PURE__ */ jsx("span", { className: "text-white/70", children: e.v })
        ] }, e.k)) }),
        !tr.disponivel && /* @__PURE__ */ jsx("p", { className: "text-xs text-white/30 mt-4", children: tr.motivo })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Por categoria" }),
        /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 220 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: cat, layout: "vertical", margin: { top: 4, right: 8, left: 8, bottom: 4 }, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }),
          /* @__PURE__ */ jsx(XAxis, { type: "number", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "nome", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 }, width: 90 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "#141428", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "Pedidos", fill: "#A855F7", radius: [0, 4, 4, 0] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Pedidos abertos por mês" }),
      /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 240 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: d.meses, margin: { top: 8, right: 8, left: 8, bottom: 8 }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "label", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 } }),
        /* @__PURE__ */ jsx(YAxis, { tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 }, allowDecimals: false }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "#141428", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "n", name: "Pedidos", fill: "#00D4FF", radius: [4, 4, 0, 0] })
      ] }) }) })
    ] })
  ] });
}
function DevedoresDetalhados({ condominioId }) {
  const [lista, setLista] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [lancs, setLancs] = useState({});
  const [antiguidade, setAntiguidade] = useState("todos");
  const [tipo, setTipo] = useState("todos");
  const [ordenar, setOrdenar] = useState("divida");
  useEffect(() => {
    setLista(null);
    const params = new URLSearchParams();
    if (condominioId) params.set("condominio_id", condominioId);
    params.set("antiguidade", antiguidade);
    params.set("tipo", tipo);
    params.set("ordenar", ordenar);
    fetch("/bi/dados/devedores?" + params.toString(), { headers: { Accept: "application/json" } }).then((r) => r.json()).then((j) => setLista(j.devedores || [])).catch(() => setLista([]));
  }, [antiguidade, tipo, ordenar, condominioId]);
  const toggle = async (fraccaoId) => {
    if (expandido === fraccaoId) {
      setExpandido(null);
      return;
    }
    setExpandido(fraccaoId);
    if (!lancs[fraccaoId]) {
      try {
        const r = await fetch(`/bi/dados/fraccao/${fraccaoId}/lancamentos`, { headers: { Accept: "application/json" } });
        const j = await r.json();
        setLancs((prev) => ({ ...prev, [fraccaoId]: j.lancamentos || [] }));
      } catch {
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70", children: "Imóveis em dívida" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxs("select", { value: antiguidade, onChange: (e) => setAntiguidade(e.target.value), className: "text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80", children: [
          /* @__PURE__ */ jsx("option", { value: "todos", children: "Toda a antiguidade" }),
          /* @__PURE__ */ jsx("option", { value: "30", children: "Vencido +30 dias" }),
          /* @__PURE__ */ jsx("option", { value: "60", children: "Vencido +60 dias" }),
          /* @__PURE__ */ jsx("option", { value: "90", children: "Vencido +90 dias" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: tipo, onChange: (e) => setTipo(e.target.value), className: "text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80", children: [
          /* @__PURE__ */ jsx("option", { value: "todos", children: "Todos os tipos" }),
          /* @__PURE__ */ jsx("option", { value: "quota_base", children: "Quota base" }),
          /* @__PURE__ */ jsx("option", { value: "fundo_reserva", children: "Fundo reserva" }),
          /* @__PURE__ */ jsx("option", { value: "despesa_extra", children: "Despesa extra" }),
          /* @__PURE__ */ jsx("option", { value: "multa", children: "Multa" }),
          /* @__PURE__ */ jsx("option", { value: "juros", children: "Juros" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: ordenar, onChange: (e) => setOrdenar(e.target.value), className: "text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80", children: [
          /* @__PURE__ */ jsx("option", { value: "divida", children: "Ordenar: dívida" }),
          /* @__PURE__ */ jsx("option", { value: "meses", children: "Ordenar: meses" }),
          /* @__PURE__ */ jsx("option", { value: "facturas", children: "Ordenar: facturas" })
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/bi/exportar/cobranca/csv?" + new URLSearchParams({
              ...condominioId ? { condominio_id: condominioId } : {},
              antiguidade,
              tipo,
              ordenar
            }).toString(),
            className: "text-xs px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-200 hover:bg-cyan-500/25",
            children: "Exportar CSV"
          }
        )
      ] })
    ] }),
    lista === null ? /* @__PURE__ */ jsx("p", { className: "text-sm text-white/40", children: "A carregar..." }) : lista.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-white/40", children: "Sem dívidas em aberto." }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "hidden sm:grid grid-cols-12 gap-2 text-xs text-white/40 px-2 pb-1", children: [
        /* @__PURE__ */ jsx("span", { className: "col-span-3", children: "Imóvel" }),
        /* @__PURE__ */ jsx("span", { className: "col-span-4", children: "Condómino" }),
        /* @__PURE__ */ jsx("span", { className: "col-span-2 text-center", children: "Facturas" }),
        /* @__PURE__ */ jsx("span", { className: "col-span-3 text-right", children: "Dívida" })
      ] }),
      lista.map((dev) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/[0.02] border border-white/5", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => toggle(dev.fraccao_id),
            className: "w-full grid grid-cols-12 gap-2 items-center px-2 py-2 text-sm hover:bg-white/[0.03] text-left",
            children: [
              /* @__PURE__ */ jsx("span", { className: "col-span-3 text-white/90 font-medium", children: dev.imovel }),
              /* @__PURE__ */ jsx("span", { className: "col-span-4 text-white/60 truncate", children: dev.condomino }),
              /* @__PURE__ */ jsxs("span", { className: "col-span-2 text-center text-white/60", children: [
                dev.facturas,
                dev.meses > 0 ? ` · ${dev.meses}m` : ""
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "col-span-3 text-right font-medium text-red-300", children: [
                kz(dev.divida),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-white/30", children: expandido === dev.fraccao_id ? "▾" : "▸" })
              ] })
            ]
          }
        ),
        expandido === dev.fraccao_id && /* @__PURE__ */ jsx("div", { className: "px-3 pb-3 pt-1 border-t border-white/5", children: !lancs[dev.fraccao_id] ? /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 py-2", children: "A carregar lançamentos..." }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: lancs[dev.fraccao_id].map((l) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-white/60 py-1", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            l.tipo.replace("_", " "),
            " — ",
            l.descricao
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-white/50", children: [
            l.data_vencimento,
            " · ",
            /* @__PURE__ */ jsx("span", { className: "text-red-300", children: kz(l.divida) })
          ] })
        ] }, l.id)) }) })
      ] }, dev.fraccao_id))
    ] })
  ] });
}
function BannerAlertas({ condominioId }) {
  const [alertas, setAlertas] = useState([]);
  const [versao, setVersao] = useState(0);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams();
    if (condominioId) params.set("condominio_id", condominioId);
    fetch("/bi/dados/alertas?" + params.toString(), { headers: { Accept: "application/json" } }).then((r) => r.json()).then((j) => setAlertas(j.alertas || [])).catch(() => setAlertas([]));
  }, [condominioId, versao]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    alertas.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-2", children: /* @__PURE__ */ jsx("button", { onClick: () => setMostrarConfig(true), className: "text-xs text-white/40 hover:text-white/70", title: "Configurar limites dos alertas", children: "⚙ Limites dos alertas" }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: alertas.map((a, i) => {
        const critico = a.nivel === "critico";
        return /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-3 p-3 rounded-lg border ${critico ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"}`, children: [
          /* @__PURE__ */ jsx("span", { className: `text-sm mt-0.5 ${critico ? "text-red-400" : "text-amber-400"}`, children: critico ? "⚠" : "!" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${critico ? "text-red-200" : "text-amber-200"}`, children: a.titulo }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 mt-0.5", children: a.detalhe })
          ] })
        ] }, i);
      }) })
    ] }),
    mostrarConfig && /* @__PURE__ */ jsx(ConfigAlertasModal, { onFechar: () => setMostrarConfig(false), onGuardado: () => {
      setMostrarConfig(false);
      setVersao((v) => v + 1);
    } })
  ] });
}
function ConfigAlertasModal({ onFechar, onGuardado }) {
  const [taxa, setTaxa] = useState("50");
  const [divida, setDivida] = useState("100000");
  const [carregado, setCarregado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  useEffect(() => {
    fetch("/bi/alertas/config", { headers: { Accept: "application/json" } }).then((r) => r.json()).then((j) => {
      if (j.taxa_cobranca_min !== void 0) setTaxa(String(j.taxa_cobranca_min));
      if (j.divida_imovel_limite !== void 0) setDivida(String(j.divida_imovel_limite));
    }).catch(() => {
    }).finally(() => setCarregado(true));
  }, []);
  const guardar = async () => {
    setGuardando(true);
    try {
      const axios = window.axios;
      if (axios) {
        await axios.post("/bi/alertas/config", {
          taxa_cobranca_min: parseFloat(taxa) || 0,
          divida_imovel_limite: parseFloat(divida) || 0
        });
        onGuardado();
      } else {
        const xsrf = decodeURIComponent((document.cookie.split("; ").find((c) => c.startsWith("XSRF-TOKEN=")) || "").split("=")[1] || "");
        const r = await fetch("/bi/alertas/config", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", Accept: "application/json", "X-XSRF-TOKEN": xsrf },
          body: JSON.stringify({ taxa_cobranca_min: parseFloat(taxa) || 0, divida_imovel_limite: parseFloat(divida) || 0 })
        });
        if (r.ok) onGuardado();
        else alert("Erro ao guardar (HTTP " + r.status + ").");
      }
    } catch (err) {
      alert("Erro ao guardar: " + ((err == null ? void 0 : err.message) || "desconhecido"));
    } finally {
      setGuardando(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4", onClick: onFechar, children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md p-6 rounded-2xl bg-[#141428] border border-white/10", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-white mb-1", children: "Limites dos alertas" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mb-5", children: "Configure os valores que disparam os alertas no Dashboard BI." }),
    !carregado ? /* @__PURE__ */ jsx("p", { className: "text-sm text-white/40", children: "A carregar..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("label", { className: "block mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Taxa de cobrança mínima (%)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "0",
            max: "100",
            step: "1",
            value: taxa,
            onChange: (e) => setTaxa(e.target.value),
            className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/30", children: "Avisa quando a taxa real fica abaixo deste valor. Default: 50%." })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "block mb-5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Dívida elevada por imóvel (Kz)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "0",
            step: "1000",
            value: divida,
            onChange: (e) => setDivida(e.target.value),
            className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/30", children: "Avisa quando um ou mais imóveis ultrapassam este valor. Default: 100.000 Kz." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: onFechar, className: "text-sm px-3 py-2 rounded-lg text-white/70 hover:bg-white/5", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { onClick: guardar, disabled: guardando, className: "text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50", children: guardando ? "A guardar..." : "Guardar" })
      ] })
    ] })
  ] }) });
}
function Cartao({ label, valor, cor, variacao }) {
  const temVar = variacao !== void 0;
  const novo = variacao === null;
  const subiu = typeof variacao === "number" && variacao > 0;
  return /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: label }),
      temVar && (novo ? /* @__PURE__ */ jsx("span", { className: "text-xs text-white/30", children: "novo" }) : variacao === 0 ? /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: "—" }) : /* @__PURE__ */ jsxs("span", { className: `text-xs font-medium ${subiu ? "text-emerald-400" : "text-red-400"}`, children: [
        subiu ? "▲" : "▼",
        " ",
        Math.abs(variacao),
        "%"
      ] }))
    ] }),
    /* @__PURE__ */ jsx("p", { className: `text-2xl font-bold ${cor}`, children: valor })
  ] });
}
export {
  BiDashboard as default
};
