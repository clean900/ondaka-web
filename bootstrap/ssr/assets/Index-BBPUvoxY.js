import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Calculator, FileSpreadsheet, Wallet, Receipt, Download } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ICONES = {
  pagamentos: Receipt,
  lancamentos: Wallet,
  despesas: FileSpreadsheet
};
const CORES = {
  pagamentos: "#10B981",
  lancamentos: "#00D4FF",
  despesas: "#EC4899"
};
function Index({ condominios, tipos }) {
  const hoje = /* @__PURE__ */ new Date();
  const inicioAno = `${hoje.getFullYear()}-01-01`;
  const hojeStr = hoje.toISOString().slice(0, 10);
  const [condominioId, setCondominioId] = useState("");
  const [de, setDe] = useState(inicioAno);
  const [ate, setAte] = useState(hojeStr);
  const hrefExport = (tipo) => {
    const params = new URLSearchParams();
    if (condominioId) params.set("condominio_id", condominioId);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    return `/contabilidade/exportar/${tipo}?${params.toString()}`;
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Integração Contabilidade" }),
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-11 h-11 rounded-xl flex items-center justify-center",
          style: { background: "rgba(0,212,255,0.12)", border: "0.5px solid rgba(0,212,255,0.3)" },
          children: /* @__PURE__ */ jsx(Calculator, { className: "w-5 h-5 text-[#00D4FF]" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white tracking-tight", children: "Integração Contabilidade" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Exporte os movimentos financeiros em CSV para importar no PHC, Primavera ou outro ERP." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "card mb-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "Condomínio" }),
        /* @__PURE__ */ jsxs("select", { value: condominioId, onChange: (e) => setCondominioId(e.target.value), className: "input", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
          condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "De" }),
        /* @__PURE__ */ jsx("input", { type: "date", value: de, onChange: (e) => setDe(e.target.value), className: "input" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "Até" }),
        /* @__PURE__ */ jsx("input", { type: "date", value: ate, onChange: (e) => setAte(e.target.value), className: "input" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: tipos.map((t) => {
      const Icon = ICONES[t.slug] ?? Download;
      const cor = CORES[t.slug] ?? "#A855F7";
      return /* @__PURE__ */ jsxs("div", { className: "card flex flex-col", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
            style: { background: `${cor}18`, border: `0.5px solid ${cor}33` },
            children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5", style: { color: cor } })
          }
        ),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-white", children: t.nome }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/55 mt-1 mb-4 flex-1", children: t.descricao }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: hrefExport(t.slug),
            className: "inline-flex items-center justify-center gap-2 text-sm py-2 rounded-lg font-medium text-white transition hover:opacity-90",
            style: { background: `linear-gradient(135deg, ${cor} 0%, #A855F7 100%)` },
            children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              t.slug === "saft" ? "Exportar XML" : "Exportar CSV"
            ]
          }
        )
      ] }, t.slug);
    }) }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/40 mt-6 max-w-2xl", children: [
      "Os ficheiros usam codificação UTF-8 e separador ",
      /* @__PURE__ */ jsx("code", { className: "text-white/60", children: ";" }),
      " — abrem directamente no Excel e importam no PHC/Primavera. Exporta-se: pagamentos confirmados, taxas/lançamentos não cancelados e despesas não canceladas no período escolhido."
    ] })
  ] });
}
export {
  Index as default
};
