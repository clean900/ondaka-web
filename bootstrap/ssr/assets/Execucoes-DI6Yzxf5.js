import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, Link } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_COR = {
  em_curso: "text-amber-300",
  concluida: "text-emerald-300",
  cancelada: "text-white/40"
};
function ChecklistExecucoes({ execucoes }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Execuções de checklists" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white", children: "Execuções de checklists" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Últimas 50 execuções." })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: "/checklist", className: "text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10", children: "← Modelos" })
      ] }),
      execucoes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-10 rounded-xl bg-white/[0.03] border border-white/10 border-dashed text-center", children: /* @__PURE__ */ jsx("p", { className: "text-white/40 text-sm", children: "Ainda não há execuções." }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: execucoes.map((e) => {
        var _a;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: ((_a = e.modelo) == null ? void 0 : _a.nome) || `Modelo #${e.modelo_id}` }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50", children: [
              e.user_nome,
              " · ",
              new Date(e.iniciada_em).toLocaleString("pt-PT")
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `text-xs font-medium ${ESTADO_COR[e.estado] || "text-white/60"}`, children: e.estado.replace("_", " ") })
        ] }, e.id);
      }) })
    ] })
  ] });
}
export {
  ChecklistExecucoes as default
};
