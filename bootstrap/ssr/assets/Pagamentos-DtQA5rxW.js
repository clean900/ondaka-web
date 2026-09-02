import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DLR7YGWj.js";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { Wallet, AlertTriangle, CheckCircle2, Landmark, FileText, ChevronUp, ChevronDown } from "lucide-react";
import { P as PageHeader, b as PortalNav, c as StatCard, a as fmtKz, d as fmtNum, S as Seccao, V as Vazio, T as Th, e as Td, g as fmtData, f as fmtPct } from "./ui-BNWuS-9O.js";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Pagamentos({ afiliado, resumo, pagamentos }) {
  const [aberto, setAberto] = useState(null);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Pagamentos" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: Wallet, titulo: "Pagamentos recebidos", subtitulo: "Cada pagamento agrupa comissões aprovadas. O comprovativo fica disponível aqui." }),
      /* @__PURE__ */ jsx(PortalNav, { activo: "/afiliado/pagamentos" }),
      !afiliado.dados_pagamento_completos && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-5 w-5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Sem IBAN registado." }),
          " A ONDAKA só consegue pagar quando os ",
          /* @__PURE__ */ jsx(Link, { href: "/afiliado/dados", className: "underline", children: "dados de pagamento" }),
          " estiverem completos (IBAN, banco e titular)."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Total recebido (líquido)", valor: fmtKz(resumo.total_pago_liquido_kz, 0), icon: Wallet, tom: "verde", sub: `${pagamentos.length} pagamento(s)` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Comissões pagas", valor: fmtNum(resumo.paga_n), icon: CheckCircle2, tom: "ciano", sub: fmtKz(resumo.paga_kz, 0) + " bruto" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Aprovado a aguardar", valor: fmtKz(resumo.aprovada_kz, 0), icon: Landmark, tom: resumo.atinge_minimo ? "verde" : "amber", sub: resumo.atinge_minimo ? "Atinge o mínimo — entra no próximo lote" : `Mínimo ${fmtKz(resumo.pagamento_minimo_kz, 0)}` }),
        /* @__PURE__ */ jsx(StatCard, { label: "IBAN de destino", valor: /* @__PURE__ */ jsx("span", { className: "font-mono text-sm", children: afiliado.iban ?? "—" }), icon: Landmark, tom: "neutro", sub: afiliado.banco ?? (afiliado.iban ? "" : "por preencher") })
      ] }),
      /* @__PURE__ */ jsx(Seccao, { titulo: `${pagamentos.length} pagamento(s)`, children: pagamentos.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Ainda sem pagamentos", texto: `Quando as suas comissões aprovadas atingirem ${fmtKz(resumo.pagamento_minimo_kz, 0)}, a ONDAKA paga por transferência e o registo aparece aqui com o comprovativo.` }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Th, { children: "Nº" }),
          /* @__PURE__ */ jsx(Th, { children: "Data" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Comissões" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Bruto" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Retenção" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Líquido" }),
          /* @__PURE__ */ jsx(Th, { children: "Método" }),
          /* @__PURE__ */ jsx(Th, { children: "Referência" }),
          /* @__PURE__ */ jsx(Th, { children: "IBAN" }),
          /* @__PURE__ */ jsx(Th, { children: "Comprovativo" }),
          /* @__PURE__ */ jsx(Th, {})
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: pagamentos.map((p) => /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-mono text-white", children: p.numero }) }),
            /* @__PURE__ */ jsx(Td, { children: fmtData(p.pago_em) }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: p.num_comissoes }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(p.valor_bruto_kz) }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "text-white/50", children: Number(p.retencao_valor_kz) > 0 ? `- ${fmtKz(p.retencao_valor_kz)} (${fmtPct(p.retencao_pct)})` : "—" }) }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-emerald-300", children: fmtKz(p.valor_liquido_kz) }) }),
            /* @__PURE__ */ jsx(Td, { children: p.metodo_label }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: p.referencia_bancaria ?? "—" }) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: p.iban_destino ?? "—" }) }),
            /* @__PURE__ */ jsx(Td, { children: p.tem_comprovativo ? /* @__PURE__ */ jsxs("a", { href: `/afiliado/pagamentos/${p.id}/comprovativo`, target: "_blank", rel: "noopener noreferrer", className: "btn-ghost px-2 py-1 text-xs", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
              " Ver"
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-white/30", children: "—" }) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setAberto(aberto === p.id ? null : p.id), className: "btn-ghost px-2 py-1 text-xs", children: aberto === p.id ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) }) })
          ] }, p.id),
          aberto === p.id && /* @__PURE__ */ jsx("tr", { className: "bg-white/[0.02]", children: /* @__PURE__ */ jsxs("td", { colSpan: 11, className: "px-4 py-3", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs uppercase tracking-wider text-white/40", children: "Comissões incluídas" }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-1 md:grid-cols-2 xl:grid-cols-3", children: (p.comissoes ?? []).map((c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-md bg-black/20 px-3 py-2 text-xs", children: [
              /* @__PURE__ */ jsxs("span", { className: "truncate text-white/70", children: [
                c.origem_numero ? /* @__PURE__ */ jsx("span", { className: "font-mono text-white", children: c.origem_numero }) : null,
                " ",
                c.descricao
              ] }),
              /* @__PURE__ */ jsx("span", { className: "shrink-0 font-mono text-emerald-300", children: fmtKz(c.valor_comissao_kz) })
            ] }, c.id)) }),
            p.notas && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-white/50", children: [
              "Notas: ",
              p.notas
            ] })
          ] }) }, `${p.id}-d`)
        ] })) })
      ] }) }) })
    ] })
  ] });
}
export {
  Pagamentos as default
};
