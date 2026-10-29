import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-mD2wK_DI.js";
import { Head, Link } from "@inertiajs/react";
import { Handshake, Clock, AlertTriangle, Landmark, MousePointerClick, Building2, Users, CheckCircle2, Wallet, MessageCircle, Link2, TrendingUp, Mail, Smartphone, ArrowRight } from "lucide-react";
import { P as PageHeader, N as NivelBadge, b as PortalNav, c as StatCard, d as fmtNum, a as fmtKz, g as fmtData, S as Seccao, C as CopiarBotao, k as ProgressoNivel, f as fmtPct, B as BarrasMensais, V as Vazio, T as Th, e as Td, E as EstadoComissaoBadge, h as SubscricaoBadge } from "./ui-BNWuS-9O.js";
import "react";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Index({ afiliado, resumo, config, ultimas_comissoes, clientes_recentes, materiais }) {
  const activo = afiliado.estado === "activo";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Painel de afiliado" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          icon: Handshake,
          titulo: "Painel de afiliado",
          subtitulo: /* @__PURE__ */ jsxs("span", { children: [
            "Código ",
            /* @__PURE__ */ jsx("strong", { className: "text-white", children: afiliado.codigo }),
            " · ",
            /* @__PURE__ */ jsx(NivelBadge, { nivel: afiliado.nivel, taxa: afiliado.taxa_actual_pct }),
            " ",
            afiliado.taxa_manual_pct !== null && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs text-purple-300", children: "(taxa definida pela ONDAKA)" })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(PortalNav, { activo: "/afiliado" }),
      afiliado.estado === "pendente" && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200", children: [
        /* @__PURE__ */ jsx(Clock, { className: "mt-0.5 h-5 w-5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Candidatura em análise." }),
          " O seu link só começa a atribuir clientes depois da aprovação pela ONDAKA. Avisamos por email. Entretanto pode preencher os ",
          /* @__PURE__ */ jsx(Link, { href: "/afiliado/dados", className: "underline", children: "dados de pagamento" }),
          "."
        ] })
      ] }),
      afiliado.estado === "suspenso" && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-5 w-5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Conta suspensa." }),
          " ",
          afiliado.motivo_suspensao || "Contacte a ONDAKA para mais informações.",
          " Enquanto suspensa, o link não atribui clientes nem gera comissões."
        ] })
      ] }),
      afiliado.estado === "recusado" && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-5 w-5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Candidatura não aprovada." }),
          " ",
          afiliado.motivo_recusa || "Contacte a ONDAKA para mais informações."
        ] })
      ] }),
      activo && !afiliado.dados_pagamento_completos && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100", children: [
        /* @__PURE__ */ jsx(Landmark, { className: "mt-0.5 h-5 w-5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Falta o IBAN." }),
          " Para receber as comissões preencha os ",
          /* @__PURE__ */ jsx(Link, { href: "/afiliado/dados", className: "underline", children: "dados de pagamento" }),
          " (IBAN, banco e titular)."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Cliques no link", valor: fmtNum(resumo.cliques), icon: MousePointerClick, tom: "neutro", sub: "1 por visitante/dia" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Registos", valor: fmtNum(resumo.registos), icon: Building2, tom: "ciano", sub: `${resumo.registos_mes} este mês` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Clientes pagantes", valor: fmtNum(resumo.clientes_pagantes), icon: Users, tom: "roxo", sub: `${resumo.clientes_activos} com subscrição activa` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Em carência", valor: fmtKz(resumo.pendente_kz, 0), icon: Clock, tom: "amber", sub: `${resumo.pendente_n} comissão(ões) · ${resumo.carencia_dias} dias` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Aprovado (a pagar)", valor: fmtKz(resumo.aprovada_kz, 0), icon: CheckCircle2, tom: "verde", sub: resumo.atinge_minimo ? "Atinge o mínimo de pagamento" : `Mínimo: ${fmtKz(resumo.pagamento_minimo_kz, 0)}` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Já pago", valor: fmtKz(resumo.paga_kz, 0), icon: Wallet, tom: "verde", sub: resumo.ultimo_pagamento ? `Último: ${fmtData(resumo.ultimo_pagamento.pago_em)}` : "Sem pagamentos ainda" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Link2, { className: "h-4 w-4 text-cyan-300" }),
          " O seu link de indicação"
        ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-cyan-200 break-all", children: materiais.link }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx(CopiarBotao, { texto: materiais.link, label: "Copiar link" }),
            /* @__PURE__ */ jsxs("a", { href: materiais.whatsapp_url, target: "_blank", rel: "noopener noreferrer", className: "btn-primary", children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
              " Partilhar no WhatsApp"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/[0.03] p-3", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/40", children: "Código" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-lg font-bold tracking-widest text-white", children: afiliado.codigo })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/[0.03] p-3", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/40", children: "Memorizado" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-lg font-bold text-white", children: [
                config.cookie_dias,
                " dias"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/40", children: "após o clique" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50", children: [
            "O cliente pode também indicar o seu código no registo. Qualquer página pública do ONDAKA com ",
            /* @__PURE__ */ jsxs("code", { className: "text-cyan-200", children: [
              "?ref=",
              afiliado.codigo
            ] }),
            " funciona."
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-purple-300" }),
          " Nível e taxa de comissão"
        ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5", children: [
          /* @__PURE__ */ jsx(ProgressoNivel, { clientes: resumo.clientes_pagantes, nivel: resumo.nivel, proximo: resumo.proximo_nivel }),
          /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40", children: [
              /* @__PURE__ */ jsx("th", { className: "py-1.5 text-left", children: "Nível" }),
              /* @__PURE__ */ jsx("th", { className: "py-1.5 text-left", children: "Clientes pagantes" }),
              /* @__PURE__ */ jsx("th", { className: "py-1.5 text-right", children: "Comissão" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: config.niveis.map((n) => /* @__PURE__ */ jsxs("tr", { className: n.nivel === resumo.nivel ? "bg-white/[0.04]" : "", children: [
              /* @__PURE__ */ jsx("td", { className: "py-2", children: /* @__PURE__ */ jsx(NivelBadge, { nivel: n.nivel }) }),
              /* @__PURE__ */ jsx("td", { className: "py-2 text-white/70", children: n.max_clientes === null ? `${n.min_clientes}+` : n.min_clientes === 0 ? `até ${n.max_clientes}` : `${n.min_clientes} a ${n.max_clientes}` }),
              /* @__PURE__ */ jsx("td", { className: "py-2 text-right font-semibold text-white", children: fmtPct(n.taxa_pct) })
            ] }, n.nivel)) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50", children: [
            "A comissão aplica-se a ",
            /* @__PURE__ */ jsx("strong", { className: "text-white/80", children: "todos os pagamentos" }),
            " dos seus clientes à ONDAKA (subscrição, add-ons, pacotes SMS), sobre o valor ",
            /* @__PURE__ */ jsx("strong", { className: "text-white/80", children: "sem imposto" }),
            "."
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 text-emerald-300" }),
          " Pagamento das comissões"
        ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-5 text-sm", children: [
          /* @__PURE__ */ jsx(Linha, { k: "Carência", v: `${resumo.carencia_dias} dias após o pagamento do cliente` }),
          /* @__PURE__ */ jsx(Linha, { k: "Mínimo para pagamento", v: fmtKz(resumo.pagamento_minimo_kz, 0) }),
          /* @__PURE__ */ jsx(Linha, { k: "Aprovado neste momento", v: /* @__PURE__ */ jsx("span", { className: resumo.atinge_minimo ? "text-emerald-300 font-semibold" : "text-white", children: fmtKz(resumo.aprovada_kz) }) }),
          /* @__PURE__ */ jsx(Linha, { k: "Total gerado", v: fmtKz(resumo.total_gerado_kz) }),
          /* @__PURE__ */ jsx(Linha, { k: "Total recebido (líquido)", v: fmtKz(resumo.total_pago_liquido_kz) }),
          /* @__PURE__ */ jsx(Linha, { k: "Último pagamento", v: resumo.ultimo_pagamento ? `${resumo.ultimo_pagamento.numero} · ${fmtKz(resumo.ultimo_pagamento.valor_liquido_kz)} · ${fmtData(resumo.ultimo_pagamento.pago_em)}` : "—" }),
          /* @__PURE__ */ jsx(Linha, { k: "IBAN", v: afiliado.iban ? /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: afiliado.iban }) : /* @__PURE__ */ jsx(Link, { href: "/afiliado/dados", className: "text-cyan-300 underline", children: "preencher" }) }),
          config.duracao_meses > 0 && /* @__PURE__ */ jsx(Linha, { k: "Duração da indicação", v: `${config.duracao_meses} meses por cliente` })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Seccao, { className: "lg:col-span-2", titulo: "Comissões geradas nos últimos 12 meses", accoes: /* @__PURE__ */ jsxs("span", { className: "text-xs text-white/50", children: [
          "Este mês: ",
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: fmtKz(resumo.mes_actual_kz) })
        ] }), children: /* @__PURE__ */ jsx("div", { className: "p-5", children: Number(resumo.total_gerado_kz) > 0 ? /* @__PURE__ */ jsx(BarrasMensais, { serie: resumo.serie_12m, altura: 180 }) : /* @__PURE__ */ jsx(Vazio, { titulo: "Ainda sem comissões", texto: "Partilhe o seu link. Quando um cliente indicado pagar à ONDAKA, a comissão aparece aqui." }) }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: "Materiais de divulgação", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5", children: [
          /* @__PURE__ */ jsx(Material, { icon: MessageCircle, titulo: "Mensagem WhatsApp", texto: materiais.whatsapp, accao: /* @__PURE__ */ jsx("a", { href: materiais.whatsapp_url, target: "_blank", rel: "noopener noreferrer", className: "btn-ghost text-xs", children: "Abrir" }) }),
          /* @__PURE__ */ jsx(Material, { icon: Mail, titulo: "Email", texto: `${materiais.email_assunto}

${materiais.email_corpo}`, accao: /* @__PURE__ */ jsx("a", { href: materiais.email_url, className: "btn-ghost text-xs", children: "Abrir" }) }),
          /* @__PURE__ */ jsx(Material, { icon: Smartphone, titulo: "SMS", texto: materiais.sms })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 xl:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Seccao, { titulo: "Últimas comissões", accoes: /* @__PURE__ */ jsxs(Link, { href: "/afiliado/comissoes", className: "btn-ghost text-xs", children: [
          "Ver todas ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] }), children: ultimas_comissoes.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Sem comissões", texto: "As comissões aparecem quando um cliente indicado paga." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Th, { children: "Data" }),
            /* @__PURE__ */ jsx(Th, { children: "Cliente" }),
            /* @__PURE__ */ jsx(Th, { children: "Descrição" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Base" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Taxa" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Comissão" }),
            /* @__PURE__ */ jsx(Th, { children: "Estado" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: ultimas_comissoes.map((c) => {
            var _a;
            return /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx(Td, { children: fmtData(c.created_at) }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: ((_a = c.empresa) == null ? void 0 : _a.nome) ?? "—" }) }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "line-clamp-2 text-xs text-white/60", children: c.descricao }) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(c.valor_base_kz) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtPct(c.taxa_pct) }),
              /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-emerald-300", children: fmtKz(c.valor_comissao_kz) }) }),
              /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(EstadoComissaoBadge, { estado: c.estado }) })
            ] }, c.id);
          }) })
        ] }) }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: "Clientes indicados recentes", accoes: /* @__PURE__ */ jsxs(Link, { href: "/afiliado/clientes", className: "btn-ghost text-xs", children: [
          "Ver todos ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] }), children: clientes_recentes.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Ainda sem clientes", texto: "Quando alguém se registar com o seu link, aparece aqui." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Th, { children: "Cliente" }),
            /* @__PURE__ */ jsx(Th, { children: "Registado" }),
            /* @__PURE__ */ jsx(Th, { children: "Subscrição" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Pagamentos" }),
            /* @__PURE__ */ jsx(Th, { right: true, children: "Comissão gerada" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: clientes_recentes.map((c) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs(Td, { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-white", children: c.nome }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/40", children: [
                c.tipo_cliente === "admin_independente" ? "Admin. independente" : "Empresa gestora",
                " · ",
                c.provincia ?? "—"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Td, { children: fmtData(c.atribuido_em ?? c.registado_em) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(SubscricaoBadge, { estado: c.subscricao_estado }) }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: c.n_pagamentos }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-emerald-300", children: fmtKz(c.comissao_kz) }) })
          ] }, c.id)) })
        ] }) }) })
      ] })
    ] })
  ] });
}
function Linha({ k, v }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0", children: [
    /* @__PURE__ */ jsx("span", { className: "text-white/50", children: k }),
    /* @__PURE__ */ jsx("span", { className: "text-right text-white", children: v })
  ] });
}
function Material({ icon: Icon, titulo, texto, accao }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-white/10 bg-white/[0.02] p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-white", children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-cyan-300" }),
        " ",
        titulo
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        accao,
        /* @__PURE__ */ jsx(CopiarBotao, { texto, label: "Copiar", className: "px-2.5 py-1.5 text-xs" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap font-sans text-xs leading-relaxed text-white/60", children: texto })
  ] });
}
export {
  Index as default
};
