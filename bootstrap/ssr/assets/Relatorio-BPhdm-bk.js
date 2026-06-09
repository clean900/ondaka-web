import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, router } from "@inertiajs/react";
import { FileBarChart, Clock, Users } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Relatorio({ registos, por_user, mes, is_admin }) {
  const totalHoras = por_user.reduce((s, u) => s + u.total_horas, 0);
  const totalRegistos = registos.length;
  const mudarMes = (offset) => {
    const [a, m] = mes.split("-").map(Number);
    const d = new Date(a, m - 1 + offset, 1);
    const novo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    router.get("/turnos/relatorio", { mes: novo }, { preserveState: false });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Relatório de Horas — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(FileBarChart, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Relatório de Horas" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: mes })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => mudarMes(-1), className: "px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm text-zinc-300", children: "‹ Mês anterior" }),
          /* @__PURE__ */ jsx("button", { onClick: () => mudarMes(1), className: "px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm text-zinc-300", children: "Mês seguinte ›" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/5 border border-emerald-500/25 p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
            "Total de horas"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-3xl font-bold text-emerald-300 mt-1", children: [
            totalHoras.toFixed(2),
            "h"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/5 border border-cyan-500/25 p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
            is_admin ? "Pessoas" : "Os meus"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-cyan-300 mt-1", children: por_user.length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/5 border border-purple-500/25 p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(FileBarChart, { className: "h-3 w-3" }),
            "Registos"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-purple-300 mt-1", children: totalRegistos })
        ] })
      ] }),
      is_admin && por_user.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-zinc-100 mb-3", children: "Sumário por colaborador" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: por_user.sort((a, b) => b.total_horas - a.total_horas).map((u) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2 border-b border-zinc-800/40 last:border-0", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200 font-medium", children: u.user_nome }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
              u.total_registos,
              " ",
              u.total_registos === 1 ? "registo" : "registos"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-emerald-300", children: [
            u.total_horas.toFixed(2),
            "h"
          ] })
        ] }, u.user_id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-zinc-100 p-4 border-b border-zinc-800", children: "Detalhe dos registos" }),
        registos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-zinc-500 py-8", children: "Sem registos para este mês." }) : /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase text-zinc-400", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2", children: "Data" }),
            is_admin && /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2", children: "Colaborador" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 hidden md:table-cell", children: "Local" }),
            /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-2", children: "Horário" }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-2", children: "Horas" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: registos.map((r) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-zinc-800/40 last:border-0", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-zinc-300", children: r.data_label }),
            is_admin && /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-zinc-300", children: r.user_nome }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-zinc-500 text-xs hidden md:table-cell", children: r.condominio_nome ?? "—" }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-2 text-center text-xs font-mono text-zinc-400", children: [
              r.hora_checkin,
              r.hora_checkout && ` – ${r.hora_checkout}`
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-2 text-right text-emerald-300 font-semibold", children: [
              r.horas_trabalhadas.toFixed(2),
              "h"
            ] })
          ] }, r.id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  Relatorio as default
};
