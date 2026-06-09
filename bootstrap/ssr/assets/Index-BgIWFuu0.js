import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, Link, router } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const TIPO_LABEL = {
  ronda: "Ronda",
  inspeccao: "Inspecção",
  limpeza: "Limpeza",
  manutencao: "Manutenção",
  outro: "Outro"
};
function ChecklistIndex({ modelos }) {
  const apagar = (id) => {
    if (confirm("Apagar este modelo?")) {
      router.delete(`/checklist/${id}`);
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Checklists" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white", children: "Checklists" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Modelos para rondas, inspecções e verificações." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: "/checklist/execucoes", className: "text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10", children: "Execuções" }),
          /* @__PURE__ */ jsx(Link, { href: "/checklist/novo", className: "text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30", children: "Novo modelo" })
        ] })
      ] }),
      modelos.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-10 rounded-xl bg-white/[0.03] border border-white/10 border-dashed text-center", children: /* @__PURE__ */ jsx("p", { className: "text-white/40 text-sm", children: 'Ainda não há modelos. Crie o primeiro com "Novo modelo".' }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: modelos.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-white", children: [
            m.nome,
            !m.activo && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs text-white/40", children: "(inactivo)" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50", children: [
            TIPO_LABEL[m.tipo] || m.tipo,
            " · ",
            m.itens_count,
            " itens"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: `/checklist/${m.id}/editar`, className: "text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10", children: "Editar" }),
          /* @__PURE__ */ jsx("button", { onClick: () => apagar(m.id), className: "text-xs px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-300 hover:bg-red-500/25", children: "Apagar" })
        ] })
      ] }, m.id)) })
    ] })
  ] });
}
export {
  ChecklistIndex as default
};
