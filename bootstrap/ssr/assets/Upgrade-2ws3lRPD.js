import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-C7SEgtpD.js";
import { Head } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function BiUpgrade() {
  const beneficios = [
    "Receitas vs Despesas mensal, trimestral e anual",
    "Demonstração de resultados e cash flow projectado",
    "Aging report de cobrança e top devedores",
    "Fundo de reserva (DP 141/15) e indicadores de liquidez",
    "Relatórios executivos em PDF e exportação Excel",
    "Detecção de anomalias e benchmarking entre condomínios"
  ];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard BI Avançado" }),
    /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto px-4 py-10", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-8 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 font-medium mb-4", children: "ADD-ON PREMIUM" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white mb-2", children: "Dashboard BI Avançado" }),
      /* @__PURE__ */ jsx("p", { className: "text-white/70 mb-6", children: "Transforme os dados do seu condomínio em decisões. Análises financeiras profissionais, relatórios prontos para auditoria e visão consolidada." }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2 mb-8", children: beneficios.map((b, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-sm text-white/80", children: [
        /* @__PURE__ */ jsx("span", { className: "text-cyan-400 mt-0.5", children: "✓" }),
        /* @__PURE__ */ jsx("span", { children: b })
      ] }, i)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-white/5 mb-6", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-white/60", children: "Subscrição mensal" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-cyan-300", children: "10.000 Kz" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50", children: "Para activar este add-on, contacte a equipa ONDAKA ou aceda à Loja de funcionalidades." })
    ] }) })
  ] });
}
export {
  BiUpgrade as default
};
