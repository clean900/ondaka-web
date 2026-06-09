import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head } from "@inertiajs/react";
import { FolderOpen, Construction } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Outros({ titulo, descricao }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: titulo }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-pink-500/10", children: /* @__PURE__ */ jsx(FolderOpen, { className: "w-6 h-6 text-pink-400" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white", children: titulo })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-zinc-400 mb-8", children: descricao }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-12 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 mb-4", children: /* @__PURE__ */ jsx(Construction, { className: "w-8 h-8 text-purple-400" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-white mb-2", children: "Em construção" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 max-w-md mx-auto", children: "Esta secção vai agregar outros documentos úteis: actas anteriores, manuais de equipamentos, plantas dos edifícios, e mais." })
      ] })
    ] })
  ] });
}
export {
  Outros as default
};
