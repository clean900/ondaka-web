import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BevyWQSg.js";
import { Head } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function ReservasUpgrade() {
  const beneficios = [
    "Espaços comuns reserváveis (salão, churrasqueira, ginásio...)",
    "Calendário e verificação automática de conflitos",
    "Regras configuráveis (horário, antecedência, duração)",
    "Aprovação pelo gestor antes da confirmação",
    "Caução opcional com comprovativo de pagamento",
    "Os condóminos reservam diretamente no telemóvel"
  ];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Reservas de Áreas Comuns" }),
    /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto px-4 py-10", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-8 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 font-medium mb-4", children: "ADD-ON PREMIUM" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white mb-2", children: "Reservas de Áreas Comuns" }),
      /* @__PURE__ */ jsx("p", { className: "text-white/70 mb-6", children: "Permita que os condóminos reservem áreas comuns directamente na app, com regras claras e aprovação centralizada." }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2 mb-8", children: beneficios.map((b, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-sm text-white/80", children: [
        /* @__PURE__ */ jsx("span", { className: "text-cyan-400 mt-0.5", children: "✓" }),
        /* @__PURE__ */ jsx("span", { children: b })
      ] }, i)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-white/5 mb-6", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-white/60", children: "Subscrição mensal" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-cyan-300", children: "5.000 Kz" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50", children: "Para activar este add-on, contacte a equipa ONDAKA ou aceda à Loja de funcionalidades." })
    ] }) })
  ] });
}
export {
  ReservasUpgrade as default
};
