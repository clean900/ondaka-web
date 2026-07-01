import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, router } from "@inertiajs/react";
import { IdCard, Palette, FileText, Check, X } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO = {
  pendente: { label: "Pendente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  aprovado: { label: "Aprovado", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  recusado: { label: "Recusado", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  expirada: { label: "Expirado", cls: "bg-zinc-700/40 text-zinc-400 border-zinc-700" }
};
const TIPO = { prestador: "Prestador", trabalhador: "Trabalhador", outro: "Outro" };
const TEMAS = {
  1: { card: "#0a0a1a", cardT: "#fff", head: "#7c3aed", headT: "#fff", accent: "#c4b5fd" },
  2: { card: "#fff", cardT: "#0f172a", head: "#1e3a8a", headT: "#fff", accent: "#1e3a8a" },
  3: { card: "#111", cardT: "#f5e6c8", head: "#1a1a1a", headT: "#d4af37", accent: "#d4af37" },
  4: { card: "#fff", cardT: "#14532d", head: "#166534", headT: "#fff", accent: "#166534" },
  5: { card: "#9333ea", cardT: "#fff", head: "#db2777", headT: "#fff", accent: "#fff" },
  6: { card: "#0ea5e9", cardT: "#fff", head: "#1e40af", headT: "#fff", accent: "#e0f2fe" },
  7: { card: "#1a0c0c", cardT: "#fff", head: "#b91c1c", headT: "#fff", accent: "#fca5a5" },
  8: { card: "#fafafa", cardT: "#18181b", head: "#18181b", headT: "#fff", accent: "#18181b" },
  9: { card: "#ea580c", cardT: "#fff", head: "#db2777", headT: "#fff", accent: "#fff" },
  10: { card: "#0a0f0d", cardT: "#d1fae5", head: "#06120e", headT: "#34d399", accent: "#6ee7b7" },
  11: { card: "#fff", cardT: "#0f3d3a", head: "#0d9488", headT: "#fff", accent: "#0f766e" },
  12: { card: "#0f172a", cardT: "#e2e8f0", head: "#1e293b", headT: "#fbbf24", accent: "#fcd34d" }
};
function MiniPasse({ modelo, nome }) {
  const t = TEMAS[modelo] ?? TEMAS[1];
  return /* @__PURE__ */ jsxs("div", { style: { width: 128, borderRadius: 12, overflow: "hidden", background: t.card, color: t.cardT, flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx("div", { style: { background: t.head, color: t.headT, padding: "7px 9px", fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: nome.toUpperCase() }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "10px 8px", textAlign: "center" }, children: [
      /* @__PURE__ */ jsx("div", { style: { width: 40, height: 40, borderRadius: 8, background: "rgba(125,125,125,.25)", margin: "0 auto 6px" } }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 11, fontWeight: 700 }, children: "João Silva" }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 8, opacity: 0.7 }, children: "PRESTADOR" }),
      /* @__PURE__ */ jsx("div", { style: { marginTop: 6, padding: "3px", border: `1px solid ${t.accent}`, borderRadius: 5, fontSize: 8, color: t.accent }, children: "Válido até 21/09" }),
      /* @__PURE__ */ jsx("div", { style: { width: 30, height: 30, background: "#fff", margin: "6px auto 0", borderRadius: 4 } })
    ] })
  ] });
}
function Passes({ passes, condominios }) {
  const aprovar = (id) => router.post(route("visitantes.passes.aprovar", id), {}, { preserveScroll: true });
  const recusar = (id) => {
    const motivo = prompt("Motivo da recusa (opcional):") ?? "";
    router.post(route("visitantes.passes.recusar", id), { motivo }, { preserveScroll: true });
  };
  const [modelos, setModelos] = useState(
    Object.fromEntries(condominios.map((c) => [c.id, c.modelo_passe]))
  );
  const setModelo = (condId, modelo) => {
    setModelos((m) => ({ ...m, [condId]: modelo }));
    router.patch(route("visitantes.passes.modelo", condId), { modelo_passe: modelo }, { preserveScroll: true, preserveState: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Passes de Visitante" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(IdCard, { className: "h-5 w-5 text-cyan-400" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-zinc-100", children: "Passes de Visitante" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Aprove os passes de prestadores e trabalhadores e escolha o modelo de cada condomínio." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Palette, { className: "h-4 w-4" }),
          " Modelo do passe por condomínio"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: condominios.map((c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800", children: [
          /* @__PURE__ */ jsx(MiniPasse, { modelo: modelos[c.id] ?? c.modelo_passe, nome: c.nome }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200 mb-2 truncate", children: c.nome }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: modelos[c.id] ?? c.modelo_passe,
                onChange: (e) => setModelo(c.id, Number(e.target.value)),
                className: "w-full rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 px-3 py-1.5",
                children: Array.from({ length: 12 }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsxs("option", { value: m, children: [
                  "Modelo ",
                  m
                ] }, m))
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: "Pré-visualização ao lado" })
          ] })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-zinc-800", children: /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500", children: [
          "Passes (",
          passes.length,
          ")"
        ] }) }),
        passes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-10 text-center text-zinc-500", children: "Sem passes. Os condóminos solicitam pela app." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800/70", children: passes.map((p) => {
          var _a;
          const e = ESTADO[p.estado] ?? { label: p.estado, cls: "bg-zinc-700/40 text-zinc-400 border-zinc-700" };
          return /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-100 font-medium", children: p.nome_visitante }),
                /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400", children: TIPO[p.tipo_acesso] ?? p.tipo_acesso })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-0.5", children: [
                p.motivo ? /* @__PURE__ */ jsxs("span", { className: "text-cyan-400", children: [
                  p.motivo,
                  " · "
                ] }) : null,
                p.condomino ?? "—",
                " · ",
                ((_a = p.tipo_documento) == null ? void 0 : _a.toUpperCase()) ?? "—",
                " ",
                p.numero_documento ?? "",
                " · ",
                p.valida_desde ?? "—",
                " → ",
                p.valida_ate ?? "—"
              ] })
            ] }),
            p.documento_anexo && /* @__PURE__ */ jsx("a", { href: p.documento_anexo, target: "_blank", rel: "noreferrer", className: "text-zinc-400 hover:text-cyan-400", title: "Ver documento", children: /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-1 rounded border ${e.cls}`, children: e.label }),
            p.estado === "pendente" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => aprovar(p.id), className: "inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white", children: [
                /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }),
                " Aprovar"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => recusar(p.id), className: "inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/80 text-zinc-300 hover:text-white", children: [
                /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
                " Recusar"
              ] })
            ] })
          ] }, p.id);
        }) })
      ] })
    ] })
  ] });
}
export {
  Passes as default
};
