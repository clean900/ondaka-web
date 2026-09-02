import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DLR7YGWj.js";
import { router, Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Handshake, AlertCircle, Building2, Users, TrendingUp, Clock, CheckCircle2, Wallet, Search, ArrowRight } from "lucide-react";
import { P as PageHeader, A as AdminNav, c as StatCard, d as fmtNum, a as fmtKz, S as Seccao, B as BarrasMensais, V as Vazio, N as NivelBadge, T as Th, e as Td, j as EstadoAfiliadoBadge, g as fmtData, i as Paginacao } from "./ui-BNWuS-9O.js";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Index({ afiliados, resumo, filtros }) {
  const [busca, setBusca] = useState(filtros.busca ?? "");
  const [estado, setEstado] = useState(filtros.estado ?? "todos");
  const [primeiro, setPrimeiro] = useState(true);
  useEffect(() => {
    if (primeiro) {
      setPrimeiro(false);
      return;
    }
    const t = setTimeout(() => {
      const params = {};
      if (busca) params.busca = busca;
      if (estado && estado !== "todos") params.estado = estado;
      router.get("/super-admin/afiliados", params, { preserveState: true, preserveScroll: true, replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [busca, estado]);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Afiliados" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: Handshake, titulo: "Programa de Afiliados", subtitulo: "Afiliados, clientes indicados e comissões da ONDAKA", accoes: /* @__PURE__ */ jsx(Link, { href: "/afiliados", className: "btn-secondary", target: "_blank", children: "Ver página pública" }) }),
      /* @__PURE__ */ jsx(AdminNav, { activo: "/super-admin/afiliados" }),
      resumo.afiliados_pendentes > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
          " ",
          /* @__PURE__ */ jsx("strong", { children: resumo.afiliados_pendentes }),
          " candidatura(s) à espera de aprovação."
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEstado("pendente"), className: "btn-secondary text-xs", children: "Ver pendentes" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Afiliados activos", valor: fmtNum(resumo.afiliados_activos), icon: Handshake, tom: "roxo", sub: `${resumo.afiliados_pendentes} pendentes · ${resumo.afiliados_suspensos} suspensos` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Clientes indicados", valor: fmtNum(resumo.clientes_indicados), icon: Building2, tom: "ciano", sub: `${resumo.mes_registos} este mês` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Clientes pagantes", valor: fmtNum(resumo.clientes_pagantes), icon: Users, tom: "ciano" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Receita base gerada", valor: fmtKz(resumo.base_gerada_kz, 0), icon: TrendingUp, tom: "neutro", sub: "sem imposto, via afiliados" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Em carência", valor: fmtKz(resumo.pendente_kz, 0), icon: Clock, tom: "amber", sub: `${resumo.pendente_n} comissão(ões)` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Aprovado a pagar", valor: fmtKz(resumo.aprovada_kz, 0), icon: CheckCircle2, tom: "verde", sub: `${resumo.afiliados_a_pagar} afiliado(s) ≥ mínimo (${fmtKz(resumo.afiliados_a_pagar_kz, 0)})` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Pago", valor: fmtKz(resumo.paga_kz, 0), icon: Wallet, tom: "verde", sub: `${resumo.paga_n} comissão(ões)` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Comissões este mês", valor: fmtKz(resumo.mes_comissoes_kz, 0), icon: TrendingUp, tom: "roxo", sub: `${resumo.anulada_n} anulada(s) no total` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Seccao, { className: "lg:col-span-2", titulo: "Comissões geradas · últimos 12 meses (todos os afiliados)", children: /* @__PURE__ */ jsx("div", { className: "p-5", children: Number(resumo.base_gerada_kz) > 0 ? /* @__PURE__ */ jsx(BarrasMensais, { serie: resumo.serie_12m, altura: 160 }) : /* @__PURE__ */ jsx(Vazio, { titulo: "Ainda sem comissões", texto: "Aparecem quando um cliente indicado paga uma factura de subscrição ou uma ordem da loja." }) }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: "Top 5 afiliados (comissão gerada)", children: resumo.top.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Sem dados" }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/5", children: resumo.top.map((t, i) => /* @__PURE__ */ jsxs(Link, { href: `/super-admin/afiliados/${t.id}`, className: "flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03]", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-white/60", children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium text-white", children: t.nome }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/40", children: [
              t.codigo,
              " · ",
              t.clientes,
              " cliente(s)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(NivelBadge, { nivel: t.nivel }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-sm text-emerald-300", children: fmtKz(t.total_kz, 0) })
        ] }, t.id)) }) })
      ] }),
      /* @__PURE__ */ jsx(Seccao, { children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3 p-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative md:col-span-3", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" }),
          /* @__PURE__ */ jsx("input", { className: "input pl-9", placeholder: "Nome, email, código ou telefone…", value: busca, onChange: (e) => setBusca(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("select", { className: "input", value: estado, onChange: (e) => setEstado(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "todos", children: "Todos os estados" }),
          /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendentes" }),
          /* @__PURE__ */ jsx("option", { value: "activo", children: "Activos" }),
          /* @__PURE__ */ jsx("option", { value: "suspenso", children: "Suspensos" }),
          /* @__PURE__ */ jsx("option", { value: "recusado", children: "Recusados" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Seccao, { titulo: `${afiliados.total} afiliado(s)`, children: [
        afiliados.data.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Nenhum afiliado encontrado", texto: "As candidaturas chegam pela página pública /afiliados ou pela adesão de gestores no painel." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Th, { children: "Afiliado" }),
            /* @__PURE__ */ jsx(Th, { children: "Tipo" }),
            /* @__PURE__ */ jsx(Th, { children: "Estado" }),
            /* @__PURE__ */ jsx(Th, { children: "Nível · taxa" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Clientes" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Cliques" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Em carência" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "A pagar" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Pago" }),
            /* @__PURE__ */ jsx(Th, { children: "Registado" }),
            /* @__PURE__ */ jsx(Th, {})
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: afiliados.data.map((a) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
            /* @__PURE__ */ jsxs(Td, { children: [
              /* @__PURE__ */ jsx(Link, { href: `/super-admin/afiliados/${a.id}`, className: "font-medium text-white hover:text-cyan-300", children: a.nome }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/40", children: [
                a.email,
                " · ",
                /* @__PURE__ */ jsx("span", { className: "font-mono", children: a.codigo }),
                a.telefone ? ` · ${a.telefone}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsx(Td, { children: a.tipo === "empresa" ? "Empresa" : "Particular" }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(EstadoAfiliadoBadge, { estado: a.estado }) }),
            /* @__PURE__ */ jsxs(Td, { children: [
              /* @__PURE__ */ jsx(NivelBadge, { nivel: a.nivel, taxa: a.taxa_pct }),
              a.taxa_manual && /* @__PURE__ */ jsx("span", { className: "ml-1 text-[10px] text-purple-300", children: "manual" })
            ] }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: a.clientes_count }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: a.cliques }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "text-amber-300", children: fmtKz(a.pendente_kz) }) }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: Number(a.aprovada_kz) >= Number(resumo.pagamento_minimo_kz) && Number(a.aprovada_kz) > 0 ? "font-semibold text-emerald-300" : "text-cyan-200", children: fmtKz(a.aprovada_kz) }) }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(a.paga_kz) }),
            /* @__PURE__ */ jsx(Td, { children: fmtData(a.created_at) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
              a.estado === "pendente" && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                if (confirm(`Aprovar ${a.nome}?`)) router.post(`/super-admin/afiliados/${a.id}/aprovar`, {}, { preserveScroll: true });
              }, className: "btn-primary px-3 py-1.5 text-xs", children: "Aprovar" }),
              /* @__PURE__ */ jsxs(Link, { href: `/super-admin/afiliados/${a.id}`, className: "btn-ghost px-2 py-1.5 text-xs", children: [
                "Ver ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
              ] })
            ] }) })
          ] }, a.id)) })
        ] }) }),
        /* @__PURE__ */ jsx(Paginacao, { links: afiliados.links, from: afiliados.from, to: afiliados.to, total: afiliados.total })
      ] })
    ] })
  ] });
}
export {
  Index as default
};
