import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BevyWQSg.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Building2, CheckCircle2, Landmark, CreditCard, Save, AlertCircle, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function FacturacaoConfig({ condominio, config, flash }) {
  var _a;
  const [tab, setTab] = useState("coordenadas");
  const [showToken, setShowToken] = useState(false);
  const coordForm = useForm({
    banco_nome: config.banco_nome || "",
    iban: config.iban || "",
    numero_conta: config.numero_conta || "",
    titular_conta: config.titular_conta || "",
    nif_emissor: config.nif_emissor || ""
  });
  const proxyForm = useForm({
    proxypay_entity_id: config.proxypay_entity_id || "",
    proxypay_api_token: config.proxypay_api_token || "",
    proxypay_sandbox: config.proxypay_sandbox,
    proxypay_activo: config.proxypay_activo
  });
  const handleSubmitCoord = (e) => {
    e.preventDefault();
    coordForm.patch(route("condominios.facturacao.coordenadas-bancarias", condominio.id), {
      preserveScroll: true
    });
  };
  const handleSubmitProxy = (e) => {
    e.preventDefault();
    proxyForm.patch(route("condominios.facturacao.proxypay", condominio.id), {
      preserveScroll: true
    });
  };
  const quotasForm = useForm({
    geracao_automatica: config.geracao_automatica,
    dia_geracao: config.dia_geracao,
    dia_vencimento: config.dia_vencimento,
    limitar_acesso_divida: config.limitar_acesso_divida ?? false,
    meses_limite_acesso: config.meses_limite_acesso ?? 3,
    acordo_min_prestacoes: config.acordo_min_prestacoes ?? 2,
    acordo_max_prestacoes: config.acordo_max_prestacoes ?? 6,
    acordo_entrada_minima_pct: config.acordo_entrada_minima_pct ?? "0",
    acordo_juro_pct: config.acordo_juro_pct ?? "0"
  });
  const multasForm = useForm({
    multa_activa: config.multa_activa,
    dias_tolerancia_multa: config.dias_tolerancia_multa,
    multa_tipo: config.multa_tipo,
    multa_valor_kz: config.multa_valor_kz || "",
    multa_percentagem: config.multa_percentagem || "",
    multa_percentagem_base: config.multa_percentagem_base,
    multa_recorrente: config.multa_recorrente
  });
  const submitQuotas = (e) => {
    e.preventDefault();
    quotasForm.patch(route("condominios.facturacao.quotas", condominio.id), {
      preserveScroll: true
    });
  };
  const submitMultas = (e) => {
    e.preventDefault();
    multasForm.patch(route("condominios.facturacao.multas", condominio.id), {
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Facturação — ${condominio.nome}` }),
    /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/condominios/${condominio.id}`,
          className: "inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }),
            " Voltar a ",
            condominio.nome
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Configuração de Facturação" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mt-1 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Building2, { size: 14 }),
          " ",
          condominio.nome
        ] })
      ] }),
      (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex gap-3", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "text-emerald-400 flex-shrink-0", size: 18 }),
        /* @__PURE__ */ jsx("span", { className: "text-emerald-400 text-sm font-semibold", children: flash.success })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex border-b border-zinc-800", children: [
          /* @__PURE__ */ jsx(
            TabButton,
            {
              active: tab === "coordenadas",
              onClick: () => setTab("coordenadas"),
              icon: /* @__PURE__ */ jsx(Landmark, { size: 16 }),
              label: "Coordenadas Bancárias"
            }
          ),
          /* @__PURE__ */ jsx(
            TabButton,
            {
              active: tab === "quotas",
              onClick: () => setTab("quotas"),
              label: "Taxas"
            }
          ),
          /* @__PURE__ */ jsx(
            TabButton,
            {
              active: tab === "multas",
              onClick: () => setTab("multas"),
              label: "Multas"
            }
          ),
          /* @__PURE__ */ jsx(
            TabButton,
            {
              active: tab === "proxypay",
              onClick: () => setTab("proxypay"),
              icon: /* @__PURE__ */ jsx(CreditCard, { size: 16 }),
              label: "Multicaixa Express (ProxyPay)"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          tab === "coordenadas" && /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitCoord, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mb-4", children: [
              "Estas coordenadas aparecem aos condóminos quando escolhem método de pagamento por ",
              /* @__PURE__ */ jsx("strong", { children: "transferência" }),
              " ou ",
              /* @__PURE__ */ jsx("strong", { children: "depósito bancário" }),
              "."
            ] }),
            /* @__PURE__ */ jsx(
              Field,
              {
                label: "Nome do banco",
                placeholder: "Ex: Banco BAI",
                value: coordForm.data.banco_nome,
                onChange: (v) => coordForm.setData("banco_nome", v),
                error: coordForm.errors.banco_nome
              }
            ),
            /* @__PURE__ */ jsx(
              Field,
              {
                label: "IBAN",
                placeholder: "AO06 0000 0000 0000 0000 0000 0",
                value: coordForm.data.iban,
                onChange: (v) => coordForm.setData("iban", v),
                error: coordForm.errors.iban,
                hint: "Para pagamentos por transferência bancária"
              }
            ),
            /* @__PURE__ */ jsx(
              Field,
              {
                label: "Nº de conta",
                placeholder: "00000000000000000",
                value: coordForm.data.numero_conta,
                onChange: (v) => coordForm.setData("numero_conta", v),
                error: coordForm.errors.numero_conta,
                hint: "Para pagamentos por depósito"
              }
            ),
            /* @__PURE__ */ jsx(
              Field,
              {
                label: "Beneficiário",
                placeholder: "Ex: Condomínio do Edifício X",
                value: coordForm.data.titular_conta,
                onChange: (v) => coordForm.setData("titular_conta", v),
                error: coordForm.errors.titular_conta
              }
            ),
            /* @__PURE__ */ jsx(
              Field,
              {
                label: "NIF do emissor",
                placeholder: "5417000000",
                value: coordForm.data.nif_emissor,
                onChange: (v) => coordForm.setData("nif_emissor", v),
                error: coordForm.errors.nif_emissor,
                hint: "Aparece em facturas e recibos"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: coordForm.processing,
                className: "bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(Save, { size: 16 }),
                  coordForm.processing ? "A guardar..." : "Guardar coordenadas"
                ]
              }
            ) })
          ] }),
          tab === "quotas" && /* @__PURE__ */ jsxs("form", { onSubmit: submitQuotas, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white mb-2", children: "Configuração de Taxas de Condomínio" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-4", children: "Parâmetros da geração mensal automática (Decreto 141/15)." }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: quotasForm.data.geracao_automatica, onChange: (e) => quotasForm.setData("geracao_automatica", e.target.checked), className: "rounded bg-zinc-700 border-zinc-600 text-cyan-500" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Geração automática mensal activa" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Dia de geração (1-28)" }),
                /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 28, value: quotasForm.data.dia_geracao, onChange: (e) => quotasForm.setData("dia_geracao", parseInt(e.target.value) || 1), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
                quotasForm.errors.dia_geracao && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: quotasForm.errors.dia_geracao })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Dia de vencimento (1-28)" }),
                /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 28, value: quotasForm.data.dia_vencimento, onChange: (e) => quotasForm.setData("dia_vencimento", parseInt(e.target.value) || 1), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
                quotasForm.errors.dia_vencimento && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: quotasForm.errors.dia_vencimento })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800 pt-4 mt-2", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-white mb-1", children: "Modo limitado por dívida" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-3", children: "Quando activo, condóminos com taxas em atraso ficam com acesso limitado (apenas extracto, pagamento e negociação) até regularizarem ou propor um acordo." }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer mb-3", children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: quotasForm.data.limitar_acesso_divida, onChange: (e) => quotasForm.setData("limitar_acesso_divida", e.target.checked), className: "rounded bg-zinc-700 border-zinc-600 text-cyan-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Limitar acesso de condóminos com dívida" })
              ] }),
              quotasForm.data.limitar_acesso_divida && /* @__PURE__ */ jsxs("div", { className: "max-w-xs", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "A partir de quantos meses em atraso" }),
                /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 12, value: quotasForm.data.meses_limite_acesso, onChange: (e) => quotasForm.setData("meses_limite_acesso", parseInt(e.target.value) || 3), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
                quotasForm.errors.meses_limite_acesso && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: quotasForm.errors.meses_limite_acesso })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800 pt-4 mt-4", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-white mb-1", children: "Configuração de acordos" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-3", children: "Regras para os planos de pagamento que os condóminos podem propor." }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Mínimo de prestações" }),
                    /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 36, value: quotasForm.data.acordo_min_prestacoes, onChange: (e) => quotasForm.setData("acordo_min_prestacoes", parseInt(e.target.value) || 2), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
                    quotasForm.errors.acordo_min_prestacoes && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: quotasForm.errors.acordo_min_prestacoes })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Máximo de prestações" }),
                    /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 36, value: quotasForm.data.acordo_max_prestacoes, onChange: (e) => quotasForm.setData("acordo_max_prestacoes", parseInt(e.target.value) || 6), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
                    quotasForm.errors.acordo_max_prestacoes && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: quotasForm.errors.acordo_max_prestacoes })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Entrada mínima (%)" }),
                    /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 100, step: "0.01", value: quotasForm.data.acordo_entrada_minima_pct, onChange: (e) => quotasForm.setData("acordo_entrada_minima_pct", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
                    quotasForm.errors.acordo_entrada_minima_pct && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: quotasForm.errors.acordo_entrada_minima_pct })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Juro / agravamento (%)" }),
                    /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 100, step: "0.01", value: quotasForm.data.acordo_juro_pct, onChange: (e) => quotasForm.setData("acordo_juro_pct", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
                    quotasForm.errors.acordo_juro_pct && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: quotasForm.errors.acordo_juro_pct })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: quotasForm.processing, className: "bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-bold", children: quotasForm.processing ? "A guardar..." : "Guardar configuração de Quotas" })
          ] }),
          tab === "multas" && /* @__PURE__ */ jsxs("form", { onSubmit: submitMultas, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white mb-2", children: "Configuração de Multas" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-4", children: "Aplicação automática quando lançamentos ficam em atraso." }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: multasForm.data.multa_activa, onChange: (e) => multasForm.setData("multa_activa", e.target.checked), className: "rounded bg-zinc-700 border-zinc-600 text-cyan-500" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Multas automáticas activas" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Dias de tolerância (após vencimento)" }),
                /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 90, value: multasForm.data.dias_tolerancia_multa, onChange: (e) => multasForm.setData("dias_tolerancia_multa", parseInt(e.target.value) || 0), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
                multasForm.errors.dias_tolerancia_multa && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: multasForm.errors.dias_tolerancia_multa })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Tipo de multa" }),
                /* @__PURE__ */ jsxs("select", { value: multasForm.data.multa_tipo, onChange: (e) => multasForm.setData("multa_tipo", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
                  /* @__PURE__ */ jsx("option", { value: "fixa", children: "Fixa (Kz)" }),
                  /* @__PURE__ */ jsx("option", { value: "percentagem", children: "Percentagem (%)" })
                ] })
              ] })
            ] }),
            multasForm.data.multa_tipo === "fixa" ? /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Valor fixo (Kz)" }),
              /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", min: 0, value: multasForm.data.multa_valor_kz, onChange: (e) => multasForm.setData("multa_valor_kz", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", placeholder: "Ex: 5000.00" }),
              multasForm.errors.multa_valor_kz && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: multasForm.errors.multa_valor_kz })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Percentagem (%)" }),
                /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", min: 0, max: 100, value: multasForm.data.multa_percentagem, onChange: (e) => multasForm.setData("multa_percentagem", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", placeholder: "Ex: 5.00" }),
                multasForm.errors.multa_percentagem && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: multasForm.errors.multa_percentagem })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Calculada sobre" }),
                /* @__PURE__ */ jsxs("select", { value: multasForm.data.multa_percentagem_base, onChange: (e) => multasForm.setData("multa_percentagem_base", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
                  /* @__PURE__ */ jsx("option", { value: "divida", children: "Dívida actual (recalcula)" }),
                  /* @__PURE__ */ jsx("option", { value: "original", children: "Valor original do lançamento" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: multasForm.data.multa_recorrente, onChange: (e) => multasForm.setData("multa_recorrente", e.target.checked), className: "rounded bg-zinc-700 border-zinc-600 text-cyan-500" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Multa recorrente (aplica todos os meses enquanto há dívida)" })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: multasForm.processing, className: "bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-bold", children: multasForm.processing ? "A guardar..." : "Guardar configuração de Multas" })
          ] }),
          tab === "proxypay" && /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitProxy, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-3 mb-4", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "text-amber-400 flex-shrink-0", size: 16 }),
              /* @__PURE__ */ jsxs("div", { className: "text-amber-300/90 text-xs", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold mb-1", children: "Importante" }),
                /* @__PURE__ */ jsxs("p", { children: [
                  "Cada condomínio tem suas ",
                  /* @__PURE__ */ jsx("strong", { children: "próprias credenciais" }),
                  " ProxyPay. O dinheiro pago pelos condóminos via Multicaixa Express vai ",
                  /* @__PURE__ */ jsx("strong", { children: "directamente" }),
                  " para a conta bancária deste condomínio."
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-1", children: "Pede credenciais ao teu gestor de conta no ProxyPay (entity_id e api_token)." })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              Field,
              {
                label: "Entity ID",
                placeholder: "99999",
                type: "number",
                value: ((_a = proxyForm.data.proxypay_entity_id) == null ? void 0 : _a.toString()) || "",
                onChange: (v) => proxyForm.setData("proxypay_entity_id", v ? parseInt(v) : ""),
                error: proxyForm.errors.proxypay_entity_id,
                hint: "Identificador do condomínio no ProxyPay"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "API Token" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: showToken ? "text" : "password",
                    placeholder: config.proxypay_api_token ? "Token guardado (oculto)" : "token-secreto-aqui",
                    value: proxyForm.data.proxypay_api_token,
                    onChange: (e) => proxyForm.setData("proxypay_api_token", e.target.value),
                    className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowToken(!showToken),
                    className: "absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300",
                    children: showToken ? /* @__PURE__ */ jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsx(Eye, { size: 16 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: "Deixa em branco para manter o token actual." }),
              proxyForm.errors.proxypay_api_token && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: proxyForm.errors.proxypay_api_token })
            ] }),
            /* @__PURE__ */ jsx(
              Toggle,
              {
                label: "Modo Sandbox (testes)",
                hint: "Activa para testar sem cobrar dinheiro real. Desactiva em produção.",
                checked: proxyForm.data.proxypay_sandbox,
                onChange: (v) => proxyForm.setData("proxypay_sandbox", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Toggle,
              {
                label: "ProxyPay activo",
                hint: "Permite condóminos pagarem via Multicaixa Express. Requer credenciais válidas.",
                checked: proxyForm.data.proxypay_activo,
                onChange: (v) => proxyForm.setData("proxypay_activo", v)
              }
            ),
            proxyForm.errors.proxypay_activo && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400", children: proxyForm.errors.proxypay_activo }),
            /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: proxyForm.processing,
                className: "bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(Save, { size: 16 }),
                  proxyForm.processing ? "A guardar..." : "Guardar ProxyPay"
                ]
              }
            ) })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function TabButton({
  active,
  onClick,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: `flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${active ? "text-cyan-400 border-cyan-500 bg-cyan-500/5" : "text-zinc-400 hover:text-white border-transparent"}`,
      children: [
        icon,
        label
      ]
    }
  );
}
function Field({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  type = "text"
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type,
        placeholder,
        value,
        onChange: (e) => onChange(e.target.value),
        className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
      }
    ),
    hint && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: hint }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: error })
  ] });
}
function Toggle({
  label,
  hint,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 bg-zinc-800/50 rounded-lg p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm text-white font-semibold", children: label }),
      hint && /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-0.5", children: hint })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(!checked),
        className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${checked ? "bg-cyan-500" : "bg-zinc-700"}`,
        children: /* @__PURE__ */ jsx(
          "span",
          {
            className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`
          }
        )
      }
    )
  ] });
}
export {
  FacturacaoConfig as default
};
