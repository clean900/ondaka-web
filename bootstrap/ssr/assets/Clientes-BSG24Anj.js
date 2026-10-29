import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-mD2wK_DI.js";
import { Head } from "@inertiajs/react";
import { Building2, CheckCircle2, Users, TrendingUp, Wallet } from "lucide-react";
import { P as PageHeader, b as PortalNav, c as StatCard, d as fmtNum, a as fmtKz, S as Seccao, V as Vazio, C as CopiarBotao, T as Th, e as Td, g as fmtData, h as SubscricaoBadge } from "./ui-BNWuS-9O.js";
import "react";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Clientes({ afiliado, resumo, clientes }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Clientes indicados" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: Building2, titulo: "Clientes indicados", subtitulo: "Empresas gestoras e administradores que se registaram com o seu link ou que a ONDAKA lhe atribuiu" }),
      /* @__PURE__ */ jsx(PortalNav, { activo: "/afiliado/clientes" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-5", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Registos", valor: fmtNum(resumo.registos), icon: Building2, tom: "ciano", sub: `${resumo.registos_mes} este mês` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Subscrição activa", valor: fmtNum(resumo.clientes_activos), icon: CheckCircle2, tom: "verde" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Já pagaram", valor: fmtNum(resumo.clientes_pagantes), icon: Users, tom: "roxo", sub: "contam para o nível" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Base gerada (s/ imposto)", valor: fmtKz(resumo.base_gerada_kz, 0), icon: TrendingUp, tom: "neutro" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Comissão gerada", valor: fmtKz(resumo.total_gerado_kz, 0), icon: Wallet, tom: "verde" })
      ] }),
      /* @__PURE__ */ jsx(Seccao, { titulo: `${clientes.length} cliente(s)`, children: clientes.length === 0 ? /* @__PURE__ */ jsx(
        Vazio,
        {
          titulo: "Ainda não tem clientes indicados",
          texto: "Partilhe o seu link. Quando uma empresa gestora ou administrador independente se registar através dele, aparece aqui com o estado da subscrição e as comissões geradas.",
          accao: /* @__PURE__ */ jsx(CopiarBotao, { texto: afiliado.link, label: "Copiar o meu link" })
        }
      ) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Th, { children: "Cliente" }),
          /* @__PURE__ */ jsx(Th, { children: "Localização" }),
          /* @__PURE__ */ jsx(Th, { children: "Registado" }),
          /* @__PURE__ */ jsx(Th, { children: "Origem" }),
          /* @__PURE__ */ jsx(Th, { children: "Subscrição" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Imóveis" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Pagamentos" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Base gerada" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Comissão" }),
          /* @__PURE__ */ jsx(Th, { children: "Último pagamento" }),
          /* @__PURE__ */ jsx(Th, { children: "Indicação" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: clientes.map((c) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
          /* @__PURE__ */ jsxs(Td, { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium text-white", children: c.nome }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-white/40", children: c.tipo_cliente === "admin_independente" ? "Administrador independente" : "Empresa gestora" })
          ] }),
          /* @__PURE__ */ jsx(Td, { children: [c.municipio, c.provincia].filter(Boolean).join(", ") || "—" }),
          /* @__PURE__ */ jsx(Td, { children: fmtData(c.atribuido_em ?? c.registado_em) }),
          /* @__PURE__ */ jsx(Td, { children: c.origem === "manual" ? /* @__PURE__ */ jsx("span", { className: "badge bg-white/5 text-white/60 border border-white/10", children: "Atribuído pela ONDAKA" }) : /* @__PURE__ */ jsx("span", { className: "badge-info", children: "Link" }) }),
          /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(SubscricaoBadge, { estado: c.subscricao_estado }) }),
          /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: c.num_imoveis }),
          /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: c.n_pagamentos }),
          /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(c.base_kz) }),
          /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-emerald-300", children: fmtKz(c.comissao_kz) }) }),
          /* @__PURE__ */ jsx(Td, { children: fmtData(c.ultimo_pagamento_em) }),
          /* @__PURE__ */ jsx(Td, { children: c.atribuicao_activa ? /* @__PURE__ */ jsxs("span", { className: "badge-success", children: [
            "Activa",
            c.expira_em ? ` até ${fmtData(c.expira_em)}` : " · vitalícia"
          ] }) : /* @__PURE__ */ jsxs("span", { className: "badge-danger", children: [
            "Expirou ",
            fmtData(c.expira_em)
          ] }) })
        ] }, c.id)) })
      ] }) }) })
    ] })
  ] });
}
export {
  Clientes as default
};
