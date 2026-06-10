import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BhN0vln8.js";
import { usePage, Head, Link } from "@inertiajs/react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Siren, RefreshCw, AlertOctagon, Activity, Clock, CheckCircle2, MapPin, User, Camera } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const POLLING_INTERVAL = 3e4;
function SosIndex() {
  const { stats: statsInicial } = usePage().props;
  const [alertas, setAlertas] = useState([]);
  const [stats, setStats] = useState(statsInicial);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const intervalRef = useRef(null);
  const tickRef = useRef(null);
  const fetchData = useCallback(async () => {
    try {
      const r = await fetch("/sos/alertas/data", {
        headers: { Accept: "application/json" }
      });
      if (!r.ok) return;
      const json = await r.json();
      setAlertas(json.data || []);
      setStats(json.stats || stats);
      setLastUpdate(/* @__PURE__ */ new Date());
      setSecondsAgo(0);
    } catch (e) {
      console.error("Erro polling SOS:", e);
    } finally {
      setLoading(false);
    }
  }, [stats]);
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, POLLING_INTERVAL);
    tickRef.current = setInterval(() => setSecondsAgo((s) => s + 1), 1e3);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Emergências SOS" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 max-w-7xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Siren, { className: "w-6 h-6 text-red-400" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Emergências SOS" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Alertas dos condóminos em tempo real" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: fetchData,
            className: "inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition px-3 py-2 rounded-lg border border-white/10",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-3 h-3" }),
              lastUpdate ? `Há ${secondsAgo}s` : "A carregar..."
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(AlertOctagon, { className: "w-5 h-5 text-red-400" }),
            label: "Críticos abertos",
            value: stats.criticos_abertos,
            cor: "red",
            destaque: stats.criticos_abertos > 0
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(Activity, { className: "w-5 h-5 text-amber-400" }),
            label: "Total abertos",
            value: stats.abertos,
            cor: "amber"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-cyan-400" }),
            label: "Hoje",
            value: stats.hoje,
            cor: "cyan"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-400" }),
            label: "Total acumulado",
            value: stats.total,
            cor: "emerald"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wider", children: [
          "Lista (",
          alertas.length,
          ")"
        ] }),
        loading && alertas.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-white/40 text-sm", children: "A carregar alertas…" }),
        !loading && alertas.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "w-12 h-12 text-emerald-400/50 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/60 text-sm", children: "Sem alertas. Tudo calmo." })
        ] }),
        alertas.map((a) => /* @__PURE__ */ jsx(Link, { href: `/sos/alertas/${a.id}`, children: /* @__PURE__ */ jsx(AlertaCard, { alerta: a }) }, a.id))
      ] })
    ] })
  ] });
}
function StatCard({
  icon,
  label,
  value,
  cor,
  destaque = false
}) {
  const corClasses = {
    red: "bg-red-500/10 border-red-500/30",
    amber: "bg-amber-500/10 border-amber-500/30",
    cyan: "bg-cyan-500/10 border-cyan-500/30",
    emerald: "bg-emerald-500/10 border-emerald-500/30"
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `rounded-xl border p-4 ${corClasses[cor]} ${destaque ? "ring-2 ring-red-500/50 animate-pulse" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          icon,
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-white", children: value })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60", children: label })
      ]
    }
  );
}
function AlertaCard({ alerta }) {
  const gravidadeCfg = {
    critico: { cor: "border-red-500/40 bg-red-500/5", text: "text-red-300", label: "CRÍTICO" },
    alto: { cor: "border-orange-500/40 bg-orange-500/5", text: "text-orange-300", label: "ALTO" },
    medio: { cor: "border-amber-500/40 bg-amber-500/5", text: "text-amber-300", label: "MÉDIO" },
    baixo: { cor: "border-emerald-500/40 bg-emerald-500/5", text: "text-emerald-300", label: "BAIXO" }
  };
  const estadoCfg = {
    aberto: { cor: "bg-red-500/20 text-red-300", label: "A aguardar" },
    atendido: { cor: "bg-amber-500/20 text-amber-300", label: "Atendido" },
    resolvido: { cor: "bg-emerald-500/20 text-emerald-300", label: "Resolvido" },
    falso_alarme: { cor: "bg-gray-500/20 text-gray-300", label: "Falso alarme" }
  };
  const g = gravidadeCfg[alerta.gravidade] ?? gravidadeCfg.baixo;
  const e = estadoCfg[alerta.estado] ?? estadoCfg.aberto;
  const dataFormatada = new Date(alerta.created_at).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  return /* @__PURE__ */ jsx("div", { className: `rounded-xl border p-4 ${g.cor} hover:bg-white/5 transition cursor-pointer`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 items-start min-w-[88px]", children: [
      /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${g.text} bg-white/5`, children: g.label }),
      /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-[10px] ${e.cor}`, children: e.label })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: alerta.tipo_label }),
        /* @__PURE__ */ jsxs("span", { className: "text-white/40 text-xs", children: [
          "#",
          alerta.id
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-white/40 text-xs", children: [
          "· ",
          dataFormatada
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-1 text-sm", children: [
        alerta.condominio_nome && /* @__PURE__ */ jsxs("p", { className: "text-white/70 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 inline" }),
          alerta.condominio_nome,
          alerta.localizacao && /* @__PURE__ */ jsxs("span", { className: "text-white/40", children: [
            "· ",
            alerta.localizacao
          ] })
        ] }),
        alerta.autor_nome && /* @__PURE__ */ jsxs("p", { className: "text-white/50 text-xs flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(User, { className: "w-3 h-3 inline" }),
          " ",
          alerta.autor_nome
        ] }),
        alerta.descricao && /* @__PURE__ */ jsxs("p", { className: "text-white/60 text-xs italic mt-1", children: [
          '"',
          alerta.descricao,
          '"'
        ] })
      ] }),
      alerta.fotos_count > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 inline-flex items-center gap-1 text-xs text-white/50", children: [
        /* @__PURE__ */ jsx(Camera, { className: "w-3 h-3" }),
        " ",
        alerta.fotos_count,
        " foto",
        alerta.fotos_count > 1 ? "s" : ""
      ] })
    ] })
  ] }) });
}
export {
  SosIndex as default
};
