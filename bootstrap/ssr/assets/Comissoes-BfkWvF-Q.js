import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DLR7YGWj.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { DollarSign, Download, Clock, CheckCircle2, Wallet, XCircle, Search } from "lucide-react";
import { P as PageHeader, A as AdminNav, c as StatCard, a as fmtKz, S as Seccao, V as Vazio, T as Th, e as Td, g as fmtData, f as fmtPct, E as EstadoComissaoBadge, i as Paginacao, M as Modal } from "./ui-BNWuS-9O.js";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Comissoes({ comissoes, totais, filtros, afiliados, config }) {
  var _a;
  const [f, setF] = useState({ afiliado_id: filtros.afiliado_id ?? "", estado: filtros.estado ?? "todos", origem: filtros.origem ?? "todas", de: filtros.de ?? "", ate: filtros.ate ?? "", busca: filtros.busca ?? "", empresa_id: filtros.empresa_id ?? "" });
  const [anular, setAnular] = useState(null);
  const formAnular = useForm({ motivo: "" });
  const params = (over = {}) => {
    const p = { ...f, ...over };
    Object.keys(p).forEach((k) => {
      if (!p[k] || p[k] === "todos" || p[k] === "todas") delete p[k];
    });
    return p;
  };
  const aplicar = (over = {}) => router.get("/super-admin/afiliados/comissoes", params(over), { preserveState: true, replace: true });
  const urlExportar = "/super-admin/afiliados/comissoes/exportar?" + new URLSearchParams(params()).toString();
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Comissões de afiliados" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: DollarSign, titulo: "Comissões de afiliados", subtitulo: `Livro-razão: uma linha por pagamento de cliente indicado · base sem imposto · carência ${config.carencia_dias} dias`, accoes: /* @__PURE__ */ jsxs("a", { href: urlExportar, className: "btn-secondary", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        " Exportar CSV"
      ] }) }),
      /* @__PURE__ */ jsx(AdminNav, { activo: "/super-admin/afiliados/comissoes" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-5", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Em carência", valor: fmtKz(totais.pendente.total_kz, 0), icon: Clock, tom: "amber", sub: `${totais.pendente.n} · base ${fmtKz(totais.pendente.base_kz, 0)}` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Aprovadas (a pagar)", valor: fmtKz(totais.aprovada.total_kz, 0), icon: CheckCircle2, tom: "ciano", sub: `${totais.aprovada.n} · base ${fmtKz(totais.aprovada.base_kz, 0)}` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Pagas", valor: fmtKz(totais.paga.total_kz, 0), icon: Wallet, tom: "verde", sub: `${totais.paga.n} · base ${fmtKz(totais.paga.base_kz, 0)}` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Anuladas", valor: fmtKz(totais.anulada.total_kz, 0), icon: XCircle, tom: "vermelho", sub: `${totais.anulada.n}` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Total não anulado", valor: fmtKz(totais.total_nao_anulada_kz, 0), icon: DollarSign, tom: "roxo", sub: "para os filtros actuais" })
      ] }),
      /* @__PURE__ */ jsx(Seccao, { children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        aplicar();
      }, className: "grid gap-3 p-4 md:grid-cols-7", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative md:col-span-2", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" }),
          /* @__PURE__ */ jsx("input", { className: "input pl-9", placeholder: "Cliente, afiliado, documento…", value: f.busca, onChange: (e) => setF({ ...f, busca: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs("select", { className: "input", value: f.afiliado_id, onChange: (e) => {
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
        /* @__PURE__ */ jsx("input", { type: "date", className: "input", value: f.de, onChange: (e) => setF({ ...f, de: e.target.value }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("input", { type: "date", className: "input", value: f.ate, onChange: (e) => setF({ ...f, ate: e.target.value }) }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-secondary shrink-0", children: "Filtrar" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Seccao, { titulo: `${comissoes.total} comissão(ões)`, children: [
        comissoes.data.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Sem comissões para estes filtros" }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Th, { children: "Data" }),
            /* @__PURE__ */ jsx(Th, { children: "Afiliado" }),
            /* @__PURE__ */ jsx(Th, { children: "Cliente" }),
            /* @__PURE__ */ jsx(Th, { children: "Documento" }),
            /* @__PURE__ */ jsx(Th, { children: "Origem" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Pago c/ imp." }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Imposto" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Base" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Taxa" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Comissão" }),
            /* @__PURE__ */ jsx(Th, { children: "Estado" }),
            /* @__PURE__ */ jsx(Th, { children: "Detalhe" }),
            /* @__PURE__ */ jsx(Th, {})
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: comissoes.data.map((c) => {
            var _a2, _b;
            return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
              /* @__PURE__ */ jsx(Td, { children: fmtData(c.pago_pelo_cliente_em ?? c.created_at) }),
              /* @__PURE__ */ jsxs(Td, { children: [
                c.afiliado ? /* @__PURE__ */ jsx(Link, { href: `/super-admin/afiliados/${c.afiliado.id}`, className: "font-medium text-white hover:text-cyan-300", children: c.afiliado.nome }) : "—",
                /* @__PURE__ */ jsx("div", { className: "font-mono text-xs text-white/40", children: (_a2 = c.afiliado) == null ? void 0 : _a2.codigo })
              ] }),
              /* @__PURE__ */ jsx(Td, { children: c.empresa ? /* @__PURE__ */ jsx(Link, { href: `/super-admin/clientes/${c.empresa.id}`, className: "text-white hover:text-cyan-300", children: c.empresa.nome }) : "—" }),
              /* @__PURE__ */ jsxs(Td, { children: [
                /* @__PURE__ */ jsx("div", { className: "font-mono text-xs text-white", children: c.origem_numero ?? "—" }),
                /* @__PURE__ */ jsx("div", { className: "line-clamp-2 max-w-[260px] text-xs text-white/50", children: c.descricao })
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
                  "Aprova a ",
                  fmtData(c.disponivel_em)
                ] }),
                c.estado === "aprovada" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Aprovada ",
                  fmtData(c.aprovada_em)
                ] }),
                c.estado === "paga" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  (_b = c.pagamento) == null ? void 0 : _b.numero,
                  " · ",
                  fmtData(c.paga_em)
                ] }),
                c.estado === "anulada" && /* @__PURE__ */ jsxs(Fragment, { children: [
                  c.motivo_anulacao,
                  " · ",
                  fmtData(c.anulada_em)
                ] })
              ] }) }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
                c.estado === "pendente" && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                  if (confirm("Aprovar esta comissão antes do fim da carência?")) router.post(`/super-admin/afiliados/comissoes/${c.id}/aprovar`, {}, { preserveScroll: true });
                }, className: "btn-ghost px-2 py-1 text-xs", children: "Aprovar" }),
                (c.estado === "pendente" || c.estado === "aprovada") && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                  setAnular(c);
                  formAnular.reset();
                }, className: "btn-ghost px-2 py-1 text-xs text-red-300", children: "Anular" })
              ] }) })
            ] }, c.id);
          }) })
        ] }) }),
        /* @__PURE__ */ jsx(Paginacao, { links: comissoes.links, from: comissoes.from, to: comissoes.to, total: comissoes.total })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Modal, { aberto: !!anular, onClose: () => setAnular(null), titulo: "Anular comissão", children: anular && /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      formAnular.post(`/super-admin/afiliados/comissoes/${anular.id}/anular`, { preserveScroll: true, onSuccess: () => setAnular(null) });
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/[0.03] p-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "text-white", children: anular.descricao }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/50", children: [
          (_a = anular.afiliado) == null ? void 0 : _a.nome,
          " · ",
          fmtKz(anular.valor_comissao_kz)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Motivo (visível ao afiliado)" }),
        /* @__PURE__ */ jsx("input", { className: "input", value: formAnular.data.motivo, onChange: (e) => formAnular.setData("motivo", e.target.value), placeholder: "Ex.: pagamento estornado pelo banco", required: true, minLength: 3 }),
        formAnular.errors.motivo && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: formAnular.errors.motivo })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setAnular(null), className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: formAnular.processing, className: "btn-danger", children: "Anular comissão" })
      ] })
    ] }) })
  ] });
}
export {
  Comissoes as default
};
