import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-CLWcivhb.js";
import { Head } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function corScore(s) {
  if (s == null) return "text-white/40";
  if (s < 0) return "text-red-400";
  if (s < 30) return "text-amber-400";
  if (s < 50) return "text-emerald-300";
  return "text-emerald-400";
}
function NpsDashboard({ score, recentes }) {
  const catCor = (c) => c === "promotor" ? "bg-emerald-500/15 text-emerald-300" : c === "passivo" ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-300";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "NPS do Condomínio" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white mb-1", children: "NPS do Condomínio" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-6", children: "Como os condóminos avaliam a gestão. Varia de −100 a +100." }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl bg-white/[0.03] border border-white/10 mb-6 max-w-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-2", children: "Score do seu condomínio" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: `text-5xl font-bold ${corScore(score.score)}`, children: score.score ?? "—" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: "NPS" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/40 mt-1", children: [
          score.total,
          " resposta(s)"
        ] }),
        score.total > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex h-2 rounded-full overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-emerald-500", style: { width: `${score.pct_promotores}%` } }),
            /* @__PURE__ */ jsx("div", { className: "bg-amber-500", style: { width: `${score.pct_passivos}%` } }),
            /* @__PURE__ */ jsx("div", { className: "bg-red-500", style: { width: `${score.pct_detractores}%` } })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between text-xs text-white/40", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              score.promotores,
              " prom."
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              score.passivos,
              " pass."
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              score.detractores,
              " detr."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "text-base font-medium text-white mb-3", children: "Respostas recentes" }),
      recentes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 rounded-xl bg-white/[0.03] border border-white/10 text-center text-white/50", children: "Ainda sem respostas dos seus condóminos." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: recentes.map((r) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxs("span", { className: `text-xs px-2 py-0.5 rounded-full ${catCor(r.categoria)}`, children: [
            r.nota,
            "/10"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40 ml-auto", children: r.created_at })
        ] }),
        r.comentario && /* @__PURE__ */ jsx("p", { className: "text-sm text-white/80 mt-2", children: r.comentario }),
        r.seguimento && /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60 mt-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Sugestão:" }),
          " ",
          r.seguimento
        ] })
      ] }, r.id)) })
    ] })
  ] });
}
export {
  NpsDashboard as default
};
