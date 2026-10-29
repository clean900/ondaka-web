import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-mD2wK_DI.js";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { DollarSign, Clock, CheckCircle2, Wallet, XCircle, Search } from "lucide-react";
import { P as PageHeader, b as PortalNav, c as StatCard, a as fmtKz, S as Seccao, V as Vazio, T as Th, e as Td, g as fmtData, f as fmtPct, E as EstadoComissaoBadge, i as Paginacao } from "./ui-BNWuS-9O.js";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Comissoes({ comissoes, totais, filtros, config }) {
  const [f, setF] = useState({ estado: filtros.estado ?? "todos", origem: filtros.origem ?? "todas", de: filtros.de ?? "", ate: filtros.ate ?? "", busca: filtros.busca ?? "" });
  const aplicar = (over = {}) => {
    const params = { ...f, ...over };
    Object.keys(params).forEach((k) => {
      if (!params[k] || params[k] === "todos" || params[k] === "todas") delete params[k];
    });
    router.get("/afiliado/comissoes", params, { preserveState: true, replace: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Comissões" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: DollarSign, titulo: "Comissões", subtitulo: `Uma linha por pagamento do cliente · calculadas sobre o valor sem imposto · carência de ${config.carencia_dias} dias` }),
      /* @__PURE__ */ jsx(PortalNav, { activo: "/afiliado/comissoes" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-5", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Em carência", valor: fmtKz(totais.pendente.total_kz, 0), icon: Clock, tom: "amber", sub: `${totais.pendente.n} comissão(ões)` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Aprovadas (a pagar)", valor: fmtKz(totais.aprovada.total_kz, 0), icon: CheckCircle2, tom: "ciano", sub: `${totais.aprovada.n} comissão(ões)` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Pagas", valor: fmtKz(totais.paga.total_kz, 0), icon: Wallet, tom: "verde", sub: `${totais.paga.n} comissão(ões)` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Anuladas", valor: fmtKz(totais.anulada.total_kz, 0), icon: XCircle, tom: "vermelho", sub: `${totais.anulada.n} comissão(ões)` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Total (não anuladas)", valor: fmtKz(totais.total_nao_anulada_kz, 0), icon: DollarSign, tom: "roxo", sub: `base: ${fmtKz(Number(totais.pendente.base_kz) + Number(totais.aprovada.base_kz) + Number(totais.paga.base_kz), 0)}` })
      ] }),
      /* @__PURE__ */ jsx(Seccao, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        aplicar();
      }, className: "grid gap-3 p-4 md:grid-cols-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative md:col-span-2", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" }),
          /* @__PURE__ */ jsx("input", { className: "input pl-9", placeholder: "Cliente, documento, descrição…", value: f.busca, onChange: (e) => setF({ ...f, busca: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("select", { className: "input", value: f.estado, onChange: (e) => {
          setF({ ...f, estado: e.target.value });
          aplicar({ estado: e.target.value });
        }, children: [
          /* @__PURE__ */ jsx("option", { value: "todos", children: "Todos os estados" }),
          /* @__PURE__ */ jsx("option", { value: "pendente", children: "Em carência" }),
          /* @__PURE__ */ jsx("option", { value: "aprovada", children: "Aprovadas" }),
          /* @__PURE__ */ jsx("option", { value: "paga", children: "Pagas" }),
          /* @__PURE__ */ jsx("option", { value: "anulada", children: "Anuladas" })
        ] }),
        /* @__PURE__ */ jsxs("select", { className: "input", value: f.origem, onChange: (e) => {
          setF({ ...f, origem: e.target.value });
          aplicar({ origem: e.target.value });
        }, children: [
          /* @__PURE__ */ jsx("option", { value: "todas", children: "Todas as origens" }),
          /* @__PURE__ */ jsx("option", { value: "plataforma_factura", children: "Subscrição" }),
          /* @__PURE__ */ jsx("option", { value: "ordem_compra", children: "Loja / add-ons / SMS" })
        ] }),
        /* @__PURE__ */ jsx("input", { type: "date", className: "input", value: f.de, onChange: (e) => setF({ ...f, de: e.target.value }), title: "De" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("input", { type: "date", className: "input", value: f.ate, onChange: (e) => setF({ ...f, ate: e.target.value }), title: "Até" }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-secondary shrink-0", children: "Filtrar" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Seccao, { titulo: `${comissoes.total} comissão(ões)`, children: [
        comissoes.data.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Sem comissões para estes filtros", texto: "As comissões são criadas automaticamente quando um cliente indicado paga uma factura de subscrição ou uma ordem da loja." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Th, { children: "Data" }),
            /* @__PURE__ */ jsx(Th, { children: "Cliente" }),
            /* @__PURE__ */ jsx(Th, { children: "Documento" }),
            /* @__PURE__ */ jsx(Th, { children: "Origem" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Pago (c/ imp.)" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Imposto" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Base (s/ imp.)" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Taxa" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Comissão" }),
            /* @__PURE__ */ jsx(Th, { children: "Estado" }),
            /* @__PURE__ */ jsx(Th, { children: "Detalhe" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: comissoes.data.map((c) => {
            var _a, _b;
            return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
              /* @__PURE__ */ jsx(Td, { children: fmtData(c.pago_pelo_cliente_em ?? c.created_at) }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: ((_a = c.empresa) == null ? void 0 : _a.nome) ?? "—" }) }),
              /* @__PURE__ */ jsxs(Td, { children: [
                /* @__PURE__ */ jsx("div", { className: "font-mono text-xs text-white", children: c.origem_numero ?? "—" }),
                /* @__PURE__ */ jsx("div", { className: "line-clamp-2 text-xs text-white/50", children: c.descricao })
              ] }),
              /* @__PURE__ */ jsx(Td, { children: c.origem_label }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(c.valor_pago_total_kz) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "text-white/50", children: fmtKz(c.valor_imposto_kz) }) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(c.valor_base_kz) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtPct(c.taxa_pct) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-emerald-300", children: fmtKz(c.valor_comissao_kz) }) }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(EstadoComissaoBadge, { estado: c.estado }) }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/50", children: [
                c.estado === "pendente" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Aprovada a ",
                  fmtData(c.disponivel_em)
                ] }),
                c.estado === "aprovada" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Aprovada ",
                  fmtData(c.aprovada_em),
                  " · aguarda pagamento"
                ] }),
                c.estado === "paga" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Pag. ",
                  ((_b = c.pagamento) == null ? void 0 : _b.numero) ?? "",
                  " · ",
                  fmtData(c.paga_em)
                ] }),
                c.estado === "anulada" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  c.motivo_anulacao ?? "Anulada",
                  " · ",
                  fmtData(c.anulada_em)
                ] })
              ] }) })
            ] }, c.id);
          }) })
        ] }) }),
        /* @__PURE__ */ jsx(Paginacao, { links: comissoes.links, from: comissoes.from, to: comissoes.to, total: comissoes.total })
      ] })
    ] })
  ] });
}
export {
  Comissoes as default
};
