import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { Head, Link } from "@inertiajs/react";
import { BarChart3, DoorOpen, Clock, Key, AlertTriangle, Car } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar } from "recharts";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function duracao(iso) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 6e4);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return `há ${h}h${min % 60 ? ` ${min % 60}min` : ""}`;
}
function permanenciaLabel(min) {
  if (!min) return "—";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60}min`;
}
const METODO = { qr: "QR Code", otp: "Código OTP", manual: "Manual", "—": "—" };
function PortariaDashboard({ kpis, fluxo, top_fraccoes, ainda_dentro }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard de portaria — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Dashboard de portaria" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Fluxo de visitas e alertas" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [
        /* @__PURE__ */ jsx(Kpi, { icon: /* @__PURE__ */ jsx(DoorOpen, { className: "h-4 w-4" }), label: "Visitas hoje", value: kpis.total_hoje }),
        /* @__PURE__ */ jsx(
          Kpi,
          {
            icon: /* @__PURE__ */ jsx(DoorOpen, { className: "h-4 w-4" }),
            label: "Ainda dentro",
            value: kpis.dentro,
            accent: kpis.ainda_muito > 0 ? "amber" : void 0
          }
        ),
        /* @__PURE__ */ jsx(Kpi, { icon: /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }), label: "Permanência média", value: permanenciaLabel(kpis.permanencia_media_min) }),
        /* @__PURE__ */ jsx(Kpi, { icon: /* @__PURE__ */ jsx(Key, { className: "h-4 w-4" }), label: "Método mais usado", value: METODO[kpis.metodo_top] ?? kpis.metodo_top })
      ] }),
      kpis.ainda_muito > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-amber-400" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-200", children: [
          kpis.ainda_muito,
          " ",
          kpis.ainda_muito === 1 ? "visitante está" : "visitantes estão",
          " dentro há mais de 12 horas."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-zinc-400 mb-3", children: "Fluxo (últimas 24h)" }),
          /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(AreaChart, { data: fluxo, margin: { top: 8, right: 8, left: -16, bottom: 0 }, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)" }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "hora", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 }, interval: 3 }),
            /* @__PURE__ */ jsx(YAxis, { allowDecimals: false, tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 } }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "#0F0F23", border: "1px solid #27272a", borderRadius: 8 } }),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "total", name: "Visitas", stroke: "#00D4FF", fill: "#00D4FF33" })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-zinc-400 mb-3", children: "Imóveis mais visitados (30 dias)" }),
          /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: top_fraccoes, layout: "vertical", margin: { top: 4, right: 8, left: 8, bottom: 4 }, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)" }),
            /* @__PURE__ */ jsx(XAxis, { type: "number", allowDecimals: false, tick: { fill: "rgba(255,255,255,0.5)", fontSize: 11 } }),
            /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "fraccao", width: 90, tick: { fill: "rgba(255,255,255,0.6)", fontSize: 11 } }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "#0F0F23", border: "1px solid #27272a", borderRadius: 8 } }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "total", name: "Visitas", fill: "#A855F7", radius: [0, 4, 4, 0] })
          ] }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b border-zinc-800", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-medium text-zinc-200", children: [
            "Ainda dentro (",
            ainda_dentro.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx(Link, { href: "/visitantes/dentro-agora", className: "text-xs text-cyan-400 hover:text-cyan-300", children: "Gerir →" })
        ] }),
        ainda_dentro.length === 0 ? /* @__PURE__ */ jsx("p", { className: "p-8 text-center text-zinc-500 text-sm", children: "Ninguém dentro agora." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: ainda_dentro.map((v) => {
          var _a;
          const muito = Date.now() - new Date(v.entrou_em).getTime() > 12 * 3600 * 1e3;
          return /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 flex items-center justify-between gap-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-zinc-200 truncate", children: ((_a = v.visitante) == null ? void 0 : _a.nome) ?? "Visitante" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
                v.fraccao ? `Imóvel ${v.fraccao.identificador}` : "—",
                v.matricula && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 ml-2", children: [
                  /* @__PURE__ */ jsx(Car, { className: "h-3 w-3" }),
                  v.matricula
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `text-xs flex-shrink-0 ${muito ? "text-amber-400 font-medium" : "text-zinc-500"}`, children: duracao(v.entrou_em) })
          ] }, v.id);
        }) })
      ] })
    ] })
  ] });
}
function Kpi({ icon, label, value, accent }) {
  return /* @__PURE__ */ jsxs("div", { className: `rounded-xl border p-4 ${accent === "amber" ? "border-amber-500/40 bg-amber-500/5" : "border-zinc-800 bg-zinc-900/50"}`, children: [
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 flex items-center gap-1.5", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsx("p", { className: `text-2xl font-bold mt-1 ${accent === "amber" ? "text-amber-400" : "text-zinc-100"}`, children: value })
  ] });
}
export {
  PortariaDashboard as default
};
