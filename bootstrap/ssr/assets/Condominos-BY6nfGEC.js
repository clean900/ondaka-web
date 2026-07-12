import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BX6gg7g7.js";
import { usePage, Head, router } from "@inertiajs/react";
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function ImportacaoCondominos({ preview }) {
  const flash = usePage().props.flash;
  const [ficheiro, setFicheiro] = useState(null);
  const [processando, setProcessando] = useState(false);
  const analisar = () => {
    if (!ficheiro) return;
    setProcessando(true);
    router.post(route("importacao.condominos.analisar"), { ficheiro }, {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => setProcessando(false)
    });
  };
  const importar = () => {
    if (!ficheiro) return;
    if (!confirm(`Importar ${preview == null ? void 0 : preview.validas} condóminos válidos? As linhas com erro são ignoradas.`)) return;
    setProcessando(true);
    router.post(route("importacao.condominos.importar"), { ficheiro }, {
      forceFormData: true,
      onFinish: () => setProcessando(false)
    });
  };
  const exemploCsv = "data:text/csv;charset=utf-8,nome,bi,nif,telefone,email%0AJoao Silva,001234LA042,5417...,923000000,joao@mail.com%0AMaria Costa,009876LA011,,924111111,";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Importação de Condóminos" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-5 w-5 text-cyan-400" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-zinc-100", children: "Importação Massiva de Condóminos" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Carregue um CSV, reveja o preview e importe — só as linhas válidas entram." })
        ] })
      ] }),
      (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsx("div", { className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg px-4 py-3 text-sm", children: flash.success }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500", children: "1. Ficheiro CSV" }),
          /* @__PURE__ */ jsxs("a", { href: exemploCsv, download: "modelo-condominos.csv", className: "inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
            " Descarregar modelo"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mb-3", children: [
          "Colunas aceites (cabeçalho): ",
          /* @__PURE__ */ jsx("code", { className: "text-zinc-300", children: "nome, bi, nif, telefone, email" }),
          ". Só ",
          /* @__PURE__ */ jsx("b", { children: "nome" }),
          " é obrigatório."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: ".csv,.txt",
              onChange: (e) => {
                var _a;
                return setFicheiro(((_a = e.target.files) == null ? void 0 : _a[0]) ?? null);
              },
              className: "text-sm text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-zinc-200"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: analisar,
              disabled: !ficheiro || processando,
              className: "inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 hover:bg-cyan-500 text-white text-sm px-4 py-2 disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
                " Analisar"
              ]
            }
          )
        ] })
      ] }),
      preview && /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500", children: "2. Preview" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-emerald-400", children: [
              preview.validas,
              " válidas"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-rose-400", children: [
              preview.total - preview.validas,
              " com erro"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-zinc-500", children: [
              preview.total,
              " total"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-auto max-h-[400px] rounded-lg border border-zinc-800", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-zinc-900 text-zinc-500 text-xs uppercase sticky top-0", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2", children: "#" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2", children: "Nome" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2", children: "BI" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2", children: "Telefone" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2", children: "Email" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2", children: "Estado" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: preview.linhas.map((l) => /* @__PURE__ */ jsxs("tr", { className: `border-t border-zinc-800/70 ${l.erros.length ? "bg-rose-500/5" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-zinc-600", children: l.linha }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-zinc-200", children: l.dados.nome_completo || "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-zinc-400", children: l.dados.numero_bi || "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-zinc-400", children: l.dados.telefone_principal || "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-zinc-400", children: l.dados.email || "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: l.erros.length === 0 ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-emerald-400", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
              " OK"
            ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-rose-400", children: [
              /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }),
              " ",
              l.erros.join(", ")
            ] }) })
          ] }, l.linha)) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: importar,
            disabled: processando || preview.validas === 0,
            className: "inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 text-sm disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
              " Importar ",
              preview.validas,
              " condóminos"
            ]
          }
        ) })
      ] })
    ] })
  ] });
}
export {
  ImportacaoCondominos as default
};
