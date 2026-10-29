import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-mD2wK_DI.js";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Wallet, Receipt, Percent, Landmark, FileText } from "lucide-react";
import { P as PageHeader, A as AdminNav, c as StatCard, d as fmtNum, a as fmtKz, S as Seccao, V as Vazio, T as Th, e as Td, g as fmtData, f as fmtPct, i as Paginacao } from "./ui-BNWuS-9O.js";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Pagamentos({ pagamentos, totais, filtros, afiliados }) {
  var _a;
  const [f, setF] = useState({ afiliado_id: filtros.afiliado_id ?? "", de: filtros.de ?? "", ate: filtros.ate ?? "" });
  const aplicar = (over = {}) => {
    const p = { ...f, ...over };
    Object.keys(p).forEach((k) => {
      if (!p[k]) delete p[k];
    });
    router.get("/super-admin/afiliados/pagamentos", p, { preserveState: true, replace: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Pagamentos a afiliados" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: Wallet, titulo: "Pagamentos a afiliados", subtitulo: "Cada pagamento liquida um lote de comissões aprovadas. Registam-se na ficha do afiliado." }),
      /* @__PURE__ */ jsx(AdminNav, { activo: "/super-admin/afiliados/pagamentos" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-5", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Pagamentos", valor: fmtNum(totais.n), icon: Receipt, tom: "neutro", sub: `${totais.comissoes} comissão(ões) liquidadas` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Bruto", valor: fmtKz(totais.bruto_kz, 0), icon: Wallet, tom: "ciano" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Retenção na fonte", valor: fmtKz(totais.retencao_kz, 0), icon: Percent, tom: "amber" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Líquido pago", valor: fmtKz(totais.liquido_kz, 0), icon: Landmark, tom: "verde" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Filtro", valor: /* @__PURE__ */ jsx("span", { className: "text-base", children: f.afiliado_id ? ((_a = afiliados.find((a) => String(a.id) === String(f.afiliado_id))) == null ? void 0 : _a.nome) ?? "—" : "Todos os afiliados" }), tom: "roxo", sub: f.de || f.ate ? `${f.de || "…"} → ${f.ate || "…"}` : "todo o período" })
      ] }),
      /* @__PURE__ */ jsx(Seccao, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        aplicar();
      }, className: "grid gap-3 p-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxs("select", { className: "input md:col-span-2", value: f.afiliado_id, onChange: (e) => {
          setF({ ...f, afiliado_id: e.target.value });
          aplicar({ afiliado_id: e.target.value });
        }, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os afiliados" }),
          afiliados.map((a) => /* @__PURE__ */ jsxs("option", { value: a.id, children: [
            a.nome,
            " (",
            a.codigo,
            ")"
          ] }, a.id))
        ] }),
        /* @__PURE__ */ jsx("input", { type: "date", className: "input", value: f.de, onChange: (e) => setF({ ...f, de: e.target.value }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("input", { type: "date", className: "input", value: f.ate, onChange: (e) => setF({ ...f, ate: e.target.value }) }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-secondary shrink-0", children: "Filtrar" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Seccao, { titulo: `${pagamentos.total} pagamento(s)`, children: [
        pagamentos.data.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Ainda não há pagamentos registados", texto: "Registe pagamentos na ficha de cada afiliado (botão «Registar pagamento») seleccionando as comissões aprovadas." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Th, { children: "Nº" }),
            /* @__PURE__ */ jsx(Th, { children: "Data" }),
            /* @__PURE__ */ jsx(Th, { children: "Afiliado" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Comissões" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Bruto" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Retenção" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Líquido" }),
            /* @__PURE__ */ jsx(Th, { children: "Método" }),
            /* @__PURE__ */ jsx(Th, { children: "Referência" }),
            /* @__PURE__ */ jsx(Th, { children: "IBAN" }),
            /* @__PURE__ */ jsx(Th, { children: "Comprovativo" }),
            /* @__PURE__ */ jsx(Th, { children: "Registado por" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: pagamentos.data.map((p) => {
            var _a2;
            return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-mono text-white", children: p.numero }) }),
              /* @__PURE__ */ jsx(Td, { children: fmtData(p.pago_em) }),
              /* @__PURE__ */ jsxs(Td, { children: [
                p.afiliado ? /* @__PURE__ */ jsx(Link, { href: `/super-admin/afiliados/${p.afiliado.id}`, className: "text-white hover:text-cyan-300", children: p.afiliado.nome }) : "—",
                /* @__PURE__ */ jsx("div", { className: "font-mono text-xs text-white/40", children: (_a2 = p.afiliado) == null ? void 0 : _a2.codigo })
              ] }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: p.num_comissoes }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(p.valor_bruto_kz) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "text-white/50", children: Number(p.retencao_valor_kz) > 0 ? `${fmtKz(p.retencao_valor_kz)} (${fmtPct(p.retencao_pct)})` : "—" }) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-emerald-300", children: fmtKz(p.valor_liquido_kz) }) }),
              /* @__PURE__ */ jsx(Td, { children: p.metodo_label }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: p.referencia_bancaria ?? "—" }) }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: p.iban_destino ?? "—" }) }),
              /* @__PURE__ */ jsx(Td, { children: p.tem_comprovativo ? /* @__PURE__ */ jsxs("a", { href: `/super-admin/afiliados/pagamentos/${p.id}/comprovativo`, target: "_blank", rel: "noopener noreferrer", className: "btn-ghost px-2 py-1 text-xs", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
                " Ver"
              ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-white/30", children: "—" }) }),
              /* @__PURE__ */ jsxs(Td, { children: [
                p.registado_por ?? "—",
                p.notas && /* @__PURE__ */ jsx("div", { className: "text-xs text-white/40", children: p.notas })
              ] })
            ] }, p.id);
          }) })
        ] }) }),
        /* @__PURE__ */ jsx(Paginacao, { links: pagamentos.links, from: pagamentos.from, to: pagamentos.to, total: pagamentos.total })
      ] })
    ] })
  ] });
}
export {
  Pagamentos as default
};
