import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-mD2wK_DI.js";
import { useForm, Head, router, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Handshake, CheckCircle2, Ban, Play, Percent, UserPlus, Wallet, ArrowLeft, MousePointerClick, Building2, Users, Clock, Mail, Phone, Landmark, StickyNote, Trash2, ExternalLink, FileText } from "lucide-react";
import { P as PageHeader, a as fmtKz, j as EstadoAfiliadoBadge, N as NivelBadge, l as fmtDataHora, c as StatCard, d as fmtNum, S as Seccao, C as CopiarBotao, g as fmtData, k as ProgressoNivel, B as BarrasMensais, V as Vazio, T as Th, e as Td, h as SubscricaoBadge, f as fmtPct, E as EstadoComissaoBadge, M as Modal } from "./ui-BNWuS-9O.js";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Show({ afiliado, resumo, clientes, comissoes, comissoes_aprovadas, pagamentos, empresas_disponiveis, config }) {
  var _a;
  const [modal, setModal] = useState(null);
  const [comissaoAnular, setComissaoAnular] = useState(null);
  const base = `/super-admin/afiliados/${afiliado.id}`;
  const fMotivo = useForm({ motivo: "" });
  const fTaxa = useForm({ taxa_manual_pct: afiliado.taxa_manual_pct ?? "" });
  const fNotas = useForm({ notas_admin: afiliado.notas_admin ?? "" });
  const fAtribuir = useForm({ empresa_id: "", notificar: true });
  const fAnular = useForm({ motivo: "" });
  const fPagar = useForm({
    comissoes: comissoes_aprovadas.map((c) => c.id),
    retencao_pct: config.retencao_pct,
    metodo: "transferencia_bancaria",
    referencia_bancaria: "",
    iban_destino: afiliado.iban ?? "",
    pago_em: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    notas: "",
    comprovativo: null
  });
  const totalSel = useMemo(() => comissoes_aprovadas.filter((c) => fPagar.data.comissoes.includes(c.id)).reduce((s, c) => s + Number(c.valor_comissao_kz), 0), [fPagar.data.comissoes, comissoes_aprovadas]);
  const retSel = Math.round(totalSel * (Number(fPagar.data.retencao_pct) || 0)) / 100;
  const liqSel = totalSel - retSel;
  const abrir = (m) => {
    fMotivo.reset();
    fAnular.reset();
    setModal(m);
  };
  const postMotivo = (accao) => fMotivo.post(`${base}/${accao}`, { preserveScroll: true, onSuccess: () => setModal(null) });
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Afiliado: ${afiliado.nome}` }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          icon: Handshake,
          titulo: afiliado.nome,
          subtitulo: /* @__PURE__ */ jsxs("span", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxs(Link, { href: "/super-admin/afiliados", className: "inline-flex items-center gap-1 text-cyan-300 hover:underline", children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
              " Afiliados"
            ] }),
            " · ",
            /* @__PURE__ */ jsx(EstadoAfiliadoBadge, { estado: afiliado.estado }),
            " ",
            /* @__PURE__ */ jsx(NivelBadge, { nivel: afiliado.nivel, taxa: afiliado.taxa_actual_pct }),
            " ",
            afiliado.taxa_manual_pct !== null && /* @__PURE__ */ jsx("span", { className: "text-xs text-purple-300", children: "taxa manual" }),
            " · código ",
            /* @__PURE__ */ jsx("span", { className: "font-mono text-white", children: afiliado.codigo })
          ] }),
          accoes: /* @__PURE__ */ jsxs(Fragment, { children: [
            afiliado.estado === "pendente" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                if (confirm(`Aprovar ${afiliado.nome}?`)) router.post(`${base}/aprovar`, {}, { preserveScroll: true });
              }, className: "btn-primary", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
                " Aprovar"
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => abrir("recusar"), className: "btn-danger", children: [
                /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }),
                " Recusar"
              ] })
            ] }),
            afiliado.estado === "activo" && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => abrir("suspender"), className: "btn-danger", children: [
              /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }),
              " Suspender"
            ] }),
            (afiliado.estado === "suspenso" || afiliado.estado === "recusado") && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
              if (confirm("Reactivar este afiliado?")) router.post(`${base}/reactivar`, {}, { preserveScroll: true });
            }, className: "btn-primary", children: [
              /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
              " Reactivar"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => abrir("taxa"), className: "btn-secondary", children: [
              /* @__PURE__ */ jsx(Percent, { className: "h-4 w-4" }),
              " Taxa"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => abrir("atribuir"), className: "btn-secondary", children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
              " Atribuir cliente"
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => abrir("pagar"), disabled: comissoes_aprovadas.length === 0, className: "btn-primary", children: [
              /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4" }),
              " Registar pagamento",
              comissoes_aprovadas.length > 0 && ` (${fmtKz(resumo.aprovada_kz, 0)})`
            ] })
          ] })
        }
      ),
      afiliado.estado === "suspenso" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200", children: [
        /* @__PURE__ */ jsx("strong", { children: "Suspenso" }),
        " a ",
        fmtDataHora(afiliado.suspenso_em),
        ": ",
        afiliado.motivo_suspensao
      ] }),
      afiliado.estado === "recusado" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200", children: [
        /* @__PURE__ */ jsx("strong", { children: "Recusado:" }),
        " ",
        afiliado.motivo_recusa
      ] }),
      afiliado.estado === "activo" && !afiliado.dados_pagamento_completos && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200", children: [
        /* @__PURE__ */ jsx("strong", { children: "Sem IBAN." }),
        " O afiliado ainda não preencheu os dados bancários — não é possível pagar."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Cliques", valor: fmtNum(resumo.cliques), icon: MousePointerClick, tom: "neutro" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Registos", valor: fmtNum(resumo.registos), icon: Building2, tom: "ciano", sub: `${resumo.registos_mes} este mês` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Clientes pagantes", valor: fmtNum(resumo.clientes_pagantes), icon: Users, tom: "roxo", sub: `${resumo.clientes_activos} activos` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Base gerada", valor: fmtKz(resumo.base_gerada_kz, 0), icon: Building2, tom: "neutro", sub: "sem imposto" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Em carência", valor: fmtKz(resumo.pendente_kz, 0), icon: Clock, tom: "amber", sub: `${resumo.pendente_n}` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Aprovado a pagar", valor: fmtKz(resumo.aprovada_kz, 0), icon: CheckCircle2, tom: resumo.atinge_minimo ? "verde" : "ciano", sub: resumo.atinge_minimo ? "≥ mínimo" : `mínimo ${fmtKz(resumo.pagamento_minimo_kz, 0)}` }),
        /* @__PURE__ */ jsx(StatCard, { label: "Pago (líquido)", valor: fmtKz(resumo.total_pago_liquido_kz, 0), icon: Wallet, tom: "verde", sub: `${pagamentos.length} pagamento(s)` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Seccao, { titulo: "Perfil", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-5 text-sm", children: [
          /* @__PURE__ */ jsx(L, { k: "Tipo", v: afiliado.tipo === "empresa" ? "Empresa" : "Particular" }),
          /* @__PURE__ */ jsx(L, { k: "Email", v: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 text-white/40" }),
            " ",
            afiliado.email
          ] }) }),
          /* @__PURE__ */ jsx(L, { k: "Telefone", v: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5 text-white/40" }),
            " ",
            afiliado.telefone ?? "—"
          ] }) }),
          /* @__PURE__ */ jsx(L, { k: "NIF", v: afiliado.nif ?? "—" }),
          /* @__PURE__ */ jsx(L, { k: "Utilizador", v: afiliado.user ? `${afiliado.user.name} (#${afiliado.user.id})` : "—" }),
          /* @__PURE__ */ jsx(L, { k: "Empresa cliente ligada", v: afiliado.empresa_gestora ? /* @__PURE__ */ jsx(Link, { href: `/super-admin/clientes/${afiliado.empresa_gestora.id}`, className: "text-cyan-300 hover:underline", children: afiliado.empresa_gestora.nome }) : "—" }),
          /* @__PURE__ */ jsx(L, { k: "Candidatura", v: fmtDataHora(afiliado.created_at) }),
          /* @__PURE__ */ jsx(L, { k: "Aprovado", v: afiliado.aprovado_em ? `${fmtDataHora(afiliado.aprovado_em)}${afiliado.aprovado_por ? ` por ${afiliado.aprovado_por}` : ""}` : "—" }),
          /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/40", children: "Link" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("code", { className: "flex-1 truncate rounded bg-black/30 px-2 py-1 text-xs text-cyan-200", children: afiliado.link }),
              /* @__PURE__ */ jsx(CopiarBotao, { texto: afiliado.link, label: "", className: "px-2 py-1" })
            ] })
          ] }),
          afiliado.como_divulga && /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/40", children: "Como divulga" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs leading-relaxed text-white/70", children: afiliado.como_divulga })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Landmark, { className: "h-4 w-4 text-emerald-300" }),
          " Dados de pagamento"
        ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-5 text-sm", children: [
          /* @__PURE__ */ jsx(L, { k: "IBAN", v: /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: afiliado.iban ?? "—" }) }),
          /* @__PURE__ */ jsx(L, { k: "Banco", v: afiliado.banco ?? "—" }),
          /* @__PURE__ */ jsx(L, { k: "Titular", v: afiliado.titular_conta ?? "—" }),
          /* @__PURE__ */ jsx(L, { k: "Último pagamento", v: resumo.ultimo_pagamento ? `${resumo.ultimo_pagamento.numero} · ${fmtKz(resumo.ultimo_pagamento.valor_liquido_kz)} · ${fmtData(resumo.ultimo_pagamento.pago_em)}` : "—" }),
          /* @__PURE__ */ jsx("div", { className: "pt-3", children: /* @__PURE__ */ jsx(ProgressoNivel, { clientes: resumo.clientes_pagantes, nivel: resumo.nivel, proximo: resumo.proximo_nivel }) })
        ] }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(StickyNote, { className: "h-4 w-4 text-amber-300" }),
          " Notas internas"
        ] }), children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          fNotas.patch(`${base}/notas`, { preserveScroll: true });
        }, className: "space-y-3 p-5", children: [
          /* @__PURE__ */ jsx("textarea", { className: "input min-h-[140px]", value: fNotas.data.notas_admin, onChange: (e) => fNotas.setData("notas_admin", e.target.value), placeholder: "Só visível ao super-admin. Ex.: contacto feito por telefone, acordo especial…" }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: fNotas.processing || !fNotas.isDirty, className: "btn-secondary", children: "Guardar notas" }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(Seccao, { titulo: "Comissões nos últimos 12 meses", children: /* @__PURE__ */ jsx("div", { className: "p-5", children: Number(resumo.total_gerado_kz) > 0 ? /* @__PURE__ */ jsx(BarrasMensais, { serie: resumo.serie_12m, altura: 120 }) : /* @__PURE__ */ jsx(Vazio, { titulo: "Sem comissões ainda" }) }) }),
      /* @__PURE__ */ jsx(Seccao, { titulo: `Clientes indicados (${clientes.length})`, children: clientes.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Sem clientes indicados", texto: "Use «Atribuir cliente» para ligar manualmente um cliente existente (indicação feita fora do link)." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Th, { children: "Cliente" }),
          /* @__PURE__ */ jsx(Th, { children: "Registado" }),
          /* @__PURE__ */ jsx(Th, { children: "Origem" }),
          /* @__PURE__ */ jsx(Th, { children: "Subscrição" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Imóveis" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Pagamentos" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Base" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Comissão" }),
          /* @__PURE__ */ jsx(Th, { children: "Indicação" }),
          /* @__PURE__ */ jsx(Th, {})
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: clientes.map((c) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
          /* @__PURE__ */ jsxs(Td, { children: [
            /* @__PURE__ */ jsx(Link, { href: `/super-admin/clientes/${c.id}`, className: "font-medium text-white hover:text-cyan-300", children: c.nome }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/40", children: [
              c.tipo_cliente === "admin_independente" ? "Admin. independente" : "Empresa gestora",
              " · ",
              [c.municipio, c.provincia].filter(Boolean).join(", ")
            ] })
          ] }),
          /* @__PURE__ */ jsx(Td, { children: fmtData(c.atribuido_em ?? c.registado_em) }),
          /* @__PURE__ */ jsx(Td, { children: c.origem === "manual" ? /* @__PURE__ */ jsx("span", { className: "badge bg-white/5 text-white/60 border border-white/10", children: "Manual" }) : /* @__PURE__ */ jsx("span", { className: "badge-info", children: "Link" }) }),
          /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(SubscricaoBadge, { estado: c.subscricao_estado }) }),
          /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: c.num_imoveis }),
          /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: c.n_pagamentos }),
          /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(c.base_kz) }),
          /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: /* @__PURE__ */ jsx("span", { className: "text-emerald-300", children: fmtKz(c.comissao_kz) }) }),
          /* @__PURE__ */ jsx(Td, { children: c.atribuicao_activa ? /* @__PURE__ */ jsx("span", { className: "badge-success", children: c.expira_em ? `até ${fmtData(c.expira_em)}` : "vitalícia" }) : /* @__PURE__ */ jsx("span", { className: "badge-danger", children: "expirou" }) }),
          /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
            if (confirm(`Remover a atribuição de ${c.nome}? As comissões já geradas mantêm-se.`)) router.post(`${base}/remover-cliente`, { empresa_id: c.id }, { preserveScroll: true });
          }, className: "btn-ghost px-2 py-1 text-xs text-red-300", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
        ] }, c.id)) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Seccao, { titulo: `Comissões (${comissoes.length}${comissoes.length >= 100 ? " mais recentes" : ""})`, accoes: /* @__PURE__ */ jsxs(Link, { href: `/super-admin/afiliados/comissoes?afiliado_id=${afiliado.id}`, className: "btn-ghost text-xs", children: [
        "Livro-razão completo ",
        /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" })
      ] }), children: comissoes.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Sem comissões" }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Th, { children: "Data" }),
          /* @__PURE__ */ jsx(Th, { children: "Cliente" }),
          /* @__PURE__ */ jsx(Th, { children: "Documento" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Pago c/ imp." }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Base" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Taxa" }),
          /* @__PURE__ */ jsx(Th, { right: true, children: "Comissão" }),
          /* @__PURE__ */ jsx(Th, { children: "Estado" }),
          /* @__PURE__ */ jsx(Th, { children: "Detalhe" }),
          /* @__PURE__ */ jsx(Th, {})
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: comissoes.map((c) => {
          var _a2, _b;
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
            /* @__PURE__ */ jsx(Td, { children: fmtData(c.pago_pelo_cliente_em ?? c.created_at) }),
            /* @__PURE__ */ jsx(Td, { children: ((_a2 = c.empresa) == null ? void 0 : _a2.nome) ?? "—" }),
            /* @__PURE__ */ jsxs(Td, { children: [
              /* @__PURE__ */ jsx("div", { className: "font-mono text-xs text-white", children: c.origem_numero ?? "—" }),
              /* @__PURE__ */ jsx("div", { className: "line-clamp-1 max-w-[280px] text-xs text-white/50", children: c.descricao })
            ] }),
            /* @__PURE__ */ jsx(Td, { right: true, mono: true, children: fmtKz(c.valor_pago_total_kz) }),
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
              c.estado === "anulada" && /* @__PURE__ */ jsx(Fragment, { children: c.motivo_anulacao })
            ] }) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
              c.estado === "pendente" && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                if (confirm("Aprovar antes do fim da carência?")) router.post(`/super-admin/afiliados/comissoes/${c.id}/aprovar`, {}, { preserveScroll: true });
              }, className: "btn-ghost px-2 py-1 text-xs", children: "Aprovar" }),
              (c.estado === "pendente" || c.estado === "aprovada") && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                setComissaoAnular(c);
                abrir("anular");
              }, className: "btn-ghost px-2 py-1 text-xs text-red-300", children: "Anular" })
            ] }) })
          ] }, c.id);
        }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Seccao, { titulo: `Pagamentos (${pagamentos.length})`, children: pagamentos.length === 0 ? /* @__PURE__ */ jsx(Vazio, { titulo: "Ainda sem pagamentos", texto: "Quando houver comissões aprovadas, use «Registar pagamento»." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
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
          /* @__PURE__ */ jsx(Th, { children: "Registado por" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: pagamentos.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx("span", { className: "font-mono text-white", children: p.numero }) }),
          /* @__PURE__ */ jsx(Td, { children: fmtData(p.pago_em) }),
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
          ] }) : "—" }),
          /* @__PURE__ */ jsxs(Td, { children: [
            p.registado_por ?? "—",
            p.notas && /* @__PURE__ */ jsx("div", { className: "text-xs text-white/40", children: p.notas })
          ] })
        ] }, p.id)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(Modal, { aberto: modal === "recusar", onClose: () => setModal(null), titulo: "Recusar candidatura", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      postMotivo("recusar");
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "O afiliado recebe um email com o motivo." }),
      /* @__PURE__ */ jsx("input", { className: "input", value: fMotivo.data.motivo, onChange: (e) => fMotivo.setData("motivo", e.target.value), placeholder: "Motivo", required: true, minLength: 3 }),
      fMotivo.errors.motivo && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400", children: fMotivo.errors.motivo }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModal(null), className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: fMotivo.processing, className: "btn-danger", children: "Recusar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { aberto: modal === "suspender", onClose: () => setModal(null), titulo: "Suspender afiliado", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      postMotivo("suspender");
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Enquanto suspenso, o link não atribui clientes e não são criadas comissões. As comissões existentes mantêm-se." }),
      /* @__PURE__ */ jsx("input", { className: "input", value: fMotivo.data.motivo, onChange: (e) => fMotivo.setData("motivo", e.target.value), placeholder: "Motivo (visível ao afiliado)", required: true, minLength: 3 }),
      fMotivo.errors.motivo && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400", children: fMotivo.errors.motivo }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModal(null), className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: fMotivo.processing, className: "btn-danger", children: "Suspender" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { aberto: modal === "taxa", onClose: () => setModal(null), titulo: "Taxa de comissão", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      fTaxa.patch(`${base}/taxa`, { preserveScroll: true, onSuccess: () => setModal(null) });
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/[0.03] p-3 text-sm text-white/70", children: [
        "Nível automático actual: ",
        /* @__PURE__ */ jsx(NivelBadge, { nivel: resumo.nivel }),
        " com ",
        resumo.clientes_pagantes,
        " cliente(s) pagante(s) → ",
        fmtPct(((_a = config.niveis.find((n) => n.nivel === resumo.nivel)) == null ? void 0 : _a.taxa_pct) ?? 0),
        ". Uma taxa manual substitui o nível (deixe vazio para voltar ao automático)."
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Taxa manual (%)" }),
        /* @__PURE__ */ jsx("input", { type: "number", step: "0.5", min: 0, max: 100, className: "input", value: fTaxa.data.taxa_manual_pct, onChange: (e) => fTaxa.setData("taxa_manual_pct", e.target.value), placeholder: "Ex.: 12" }),
        fTaxa.errors.taxa_manual_pct && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: fTaxa.errors.taxa_manual_pct })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModal(null), className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: fTaxa.processing, className: "btn-primary", children: "Guardar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { aberto: modal === "atribuir", onClose: () => setModal(null), titulo: "Atribuir cliente existente", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      fAtribuir.post(`${base}/atribuir-cliente`, { preserveScroll: true, onSuccess: () => {
        setModal(null);
        fAtribuir.reset();
      } });
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Para indicações feitas fora do link (contacto directo, evento). Só aparecem clientes ainda sem afiliado. A partir daqui, os pagamentos deste cliente geram comissão." }),
      /* @__PURE__ */ jsxs("select", { className: "input", value: fAtribuir.data.empresa_id, onChange: (e) => fAtribuir.setData("empresa_id", e.target.value), required: true, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Seleccionar cliente…" }),
        empresas_disponiveis.map((e) => /* @__PURE__ */ jsxs("option", { value: e.id, children: [
          e.nome,
          e.nif ? ` · ${e.nif}` : "",
          " (",
          e.tipo_cliente === "admin_independente" ? "Admin. indep." : "Empresa",
          ")"
        ] }, e.id))
      ] }),
      fAtribuir.errors.empresa_id && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400", children: fAtribuir.errors.empresa_id }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/70", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: fAtribuir.data.notificar, onChange: (e) => fAtribuir.setData("notificar", e.target.checked) }),
        " Notificar o afiliado por email"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModal(null), className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: fAtribuir.processing || !fAtribuir.data.empresa_id, className: "btn-primary", children: "Atribuir" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { aberto: modal === "anular", onClose: () => setModal(null), titulo: "Anular comissão", children: comissaoAnular && /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      fAnular.post(`/super-admin/afiliados/comissoes/${comissaoAnular.id}/anular`, { preserveScroll: true, onSuccess: () => setModal(null) });
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-white/[0.03] p-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "text-white", children: comissaoAnular.descricao }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-white/50", children: fmtKz(comissaoAnular.valor_comissao_kz) })
      ] }),
      /* @__PURE__ */ jsx("input", { className: "input", value: fAnular.data.motivo, onChange: (e) => fAnular.setData("motivo", e.target.value), placeholder: "Motivo (visível ao afiliado)", required: true, minLength: 3 }),
      fAnular.errors.motivo && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400", children: fAnular.errors.motivo }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModal(null), className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: fAnular.processing, className: "btn-danger", children: "Anular" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { aberto: modal === "pagar", onClose: () => setModal(null), titulo: `Registar pagamento a ${afiliado.nome}`, largura: "max-w-3xl", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      fPagar.post(`${base}/pagamentos`, { preserveScroll: true, forceFormData: true, onSuccess: () => setModal(null) });
    }, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs text-white/60", children: [
          /* @__PURE__ */ jsx("span", { children: "Comissões aprovadas a incluir" }),
          /* @__PURE__ */ jsxs("span", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => fPagar.setData("comissoes", comissoes_aprovadas.map((c) => c.id)), className: "text-cyan-300 hover:underline", children: "todas" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => fPagar.setData("comissoes", []), className: "text-cyan-300 hover:underline", children: "nenhuma" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-56 overflow-y-auto rounded-lg border border-white/10", children: comissoes_aprovadas.map((c) => /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-3 border-b border-white/5 px-3 py-2 text-sm last:border-0 hover:bg-white/[0.03]", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: fPagar.data.comissoes.includes(c.id), onChange: (e) => fPagar.setData("comissoes", e.target.checked ? [...fPagar.data.comissoes, c.id] : fPagar.data.comissoes.filter((id) => id !== c.id)) }),
          /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1 truncate text-white/80", children: [
            c.origem_numero && /* @__PURE__ */ jsxs("span", { className: "font-mono text-white", children: [
              c.origem_numero,
              " · "
            ] }),
            c.empresa,
            " — ",
            c.descricao
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: fmtData(c.aprovada_em) }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-emerald-300", children: fmtKz(c.valor_comissao_kz) })
        ] }, c.id)) }),
        fPagar.errors.comissoes && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: fPagar.errors.comissoes })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Retenção na fonte (%)" }),
          /* @__PURE__ */ jsx("input", { type: "number", step: "0.5", min: 0, max: 100, className: "input", value: fPagar.data.retencao_pct, onChange: (e) => fPagar.setData("retencao_pct", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Método" }),
          /* @__PURE__ */ jsxs("select", { className: "input", value: fPagar.data.metodo, onChange: (e) => fPagar.setData("metodo", e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "transferencia_bancaria", children: "Transferência bancária" }),
            /* @__PURE__ */ jsx("option", { value: "deposito", children: "Depósito" }),
            /* @__PURE__ */ jsx("option", { value: "multicaixa_express", children: "Multicaixa Express" }),
            /* @__PURE__ */ jsx("option", { value: "outro", children: "Outro" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Data do pagamento" }),
          /* @__PURE__ */ jsx("input", { type: "date", className: "input", value: fPagar.data.pago_em, onChange: (e) => fPagar.setData("pago_em", e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Referência bancária" }),
          /* @__PURE__ */ jsx("input", { className: "input", value: fPagar.data.referencia_bancaria, onChange: (e) => fPagar.setData("referencia_bancaria", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "IBAN de destino" }),
          /* @__PURE__ */ jsx("input", { className: "input font-mono", value: fPagar.data.iban_destino, onChange: (e) => fPagar.setData("iban_destino", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Comprovativo (PDF/imagem)" }),
          /* @__PURE__ */ jsx("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png,.webp", className: "input text-xs", onChange: (e) => {
            var _a2;
            return fPagar.setData("comprovativo", ((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null);
          } }),
          fPagar.errors.comprovativo && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: fPagar.errors.comprovativo })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-3", children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Notas" }),
          /* @__PURE__ */ jsx("input", { className: "input", value: fPagar.data.notas, onChange: (e) => fPagar.setData("notas", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 rounded-lg bg-white/[0.03] p-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/40", children: [
            "Bruto (",
            fPagar.data.comissoes.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "font-mono text-white", children: fmtKz(totalSel) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-white/40", children: "Retenção" }),
          /* @__PURE__ */ jsxs("div", { className: "font-mono text-amber-300", children: [
            "- ",
            fmtKz(retSel)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-white/40", children: "Líquido a pagar" }),
          /* @__PURE__ */ jsx("div", { className: "font-mono text-lg font-bold text-emerald-300", children: fmtKz(liqSel) })
        ] })
      ] }),
      totalSel > 0 && totalSel < Number(config.pagamento_minimo_kz) && /* @__PURE__ */ jsxs("div", { className: "text-xs text-amber-300", children: [
        "Abaixo do mínimo configurado (",
        fmtKz(config.pagamento_minimo_kz, 0),
        "). Pode registar na mesma."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModal(null), className: "btn-ghost", children: "Cancelar" }),
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: fPagar.processing || fPagar.data.comissoes.length === 0, className: "btn-primary", children: [
          /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4" }),
          " Registar pagamento"
        ] })
      ] })
    ] }) })
  ] });
}
function L({ k, v }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0", children: [
    /* @__PURE__ */ jsx("span", { className: "text-white/50", children: k }),
    /* @__PURE__ */ jsx("span", { className: "text-right text-white", children: v })
  ] });
}
export {
  Show as default
};
