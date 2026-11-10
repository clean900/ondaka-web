import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dl6-5GZa.js";
import { useForm, Head } from "@inertiajs/react";
import { Settings, ShieldCheck, Percent, Clock, Wallet, Link2 } from "lucide-react";
import { a as fmtKz, P as PageHeader, A as AdminNav, S as Seccao, N as NivelBadge, f as fmtPct } from "./ui-DXFnJoGj.js";
import "react";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Config({ valores, descricoes }) {
  const { data, setData, post, processing, errors, isDirty } = useForm({
    afiliado_programa_activo: valores.afiliado_programa_activo === "1",
    afiliado_aprovacao_automatica: valores.afiliado_aprovacao_automatica === "1",
    afiliado_taxa_e1_pct: valores.afiliado_taxa_e1_pct ?? "6",
    afiliado_taxa_e2_pct: valores.afiliado_taxa_e2_pct ?? "7",
    afiliado_vol_e2_kz: valores.afiliado_vol_e2_kz ?? "500000",
    afiliado_taxa_e3_pct: valores.afiliado_taxa_e3_pct ?? "8",
    afiliado_vol_e3_kz: valores.afiliado_vol_e3_kz ?? "1500000",
    afiliado_taxa_e4_pct: valores.afiliado_taxa_e4_pct ?? "9",
    afiliado_vol_e4_kz: valores.afiliado_vol_e4_kz ?? "3000000",
    afiliado_taxa_e5_pct: valores.afiliado_taxa_e5_pct ?? "10",
    afiliado_vol_e5_kz: valores.afiliado_vol_e5_kz ?? "6000000",
    afiliado_carencia_dias: valores.afiliado_carencia_dias ?? "15",
    afiliado_pagamento_minimo_kz: valores.afiliado_pagamento_minimo_kz ?? "10000",
    afiliado_retencao_pct: valores.afiliado_retencao_pct ?? "0",
    afiliado_cookie_dias: valores.afiliado_cookie_dias ?? "90",
    afiliado_duracao_meses: valores.afiliado_duracao_meses ?? "0"
  });
  const exemploBase = 111e4;
  const escaloes = [
    { label: "Desde o 1.º Kz", taxa: data.afiliado_taxa_e1_pct, min: "0" },
    { label: `A partir de ${fmtKz(data.afiliado_vol_e2_kz, 0)}`, taxa: data.afiliado_taxa_e2_pct, min: data.afiliado_vol_e2_kz },
    { label: `A partir de ${fmtKz(data.afiliado_vol_e3_kz, 0)}`, taxa: data.afiliado_taxa_e3_pct, min: data.afiliado_vol_e3_kz },
    { label: `A partir de ${fmtKz(data.afiliado_vol_e4_kz, 0)}`, taxa: data.afiliado_taxa_e4_pct, min: data.afiliado_vol_e4_kz },
    { label: `A partir de ${fmtKz(data.afiliado_vol_e5_kz, 0)}`, taxa: data.afiliado_taxa_e5_pct, min: data.afiliado_vol_e5_kz }
  ];
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Configuração do programa de afiliados" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: Settings, titulo: "Configuração do Programa de Afiliados", subtitulo: "Escalões por volume de receita (12 meses), carência, mínimo de pagamento, duração do link e da indicação" }),
      /* @__PURE__ */ jsx(AdminNav, { activo: "/super-admin/afiliados/config" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        post("/super-admin/afiliados/config", { preserveScroll: true });
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-cyan-300" }),
            " Programa"
          ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5", children: [
            /* @__PURE__ */ jsx(Toggle, { label: "Programa activo", desc: descricoes.afiliado_programa_activo, v: data.afiliado_programa_activo, on: (v) => setData("afiliado_programa_activo", v) }),
            /* @__PURE__ */ jsx(Toggle, { label: "Aprovação automática", desc: descricoes.afiliado_aprovacao_automatica, v: data.afiliado_aprovacao_automatica, on: (v) => setData("afiliado_aprovacao_automatica", v) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40", children: "Com o programa inactivo, os links deixam de atribuir clientes e não são criadas comissões novas; as existentes mantêm-se." })
          ] }) }),
          /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Percent, { className: "h-4 w-4 text-purple-300" }),
            " Escalões de comissão por volume"
          ] }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_90px_150px] items-center gap-2 text-xs text-white/50", children: [
              /* @__PURE__ */ jsx("span", { children: "Escalão" }),
              /* @__PURE__ */ jsx("span", { children: "Taxa %" }),
              /* @__PURE__ */ jsx("span", { children: "Volume mín. (Kz)" })
            ] }),
            /* @__PURE__ */ jsx(EscalaoRow, { rotulo: "Desde o 1.º Kz", taxa: data.afiliado_taxa_e1_pct, setTaxa: (v) => setData("afiliado_taxa_e1_pct", v), erro: errors.afiliado_taxa_e1_pct }),
            /* @__PURE__ */ jsx(EscalaoRow, { rotulo: "2.º escalão", taxa: data.afiliado_taxa_e2_pct, setTaxa: (v) => setData("afiliado_taxa_e2_pct", v), vol: data.afiliado_vol_e2_kz, setVol: (v) => setData("afiliado_vol_e2_kz", v), erro: errors.afiliado_taxa_e2_pct || errors.afiliado_vol_e2_kz }),
            /* @__PURE__ */ jsx(EscalaoRow, { rotulo: "3.º escalão", taxa: data.afiliado_taxa_e3_pct, setTaxa: (v) => setData("afiliado_taxa_e3_pct", v), vol: data.afiliado_vol_e3_kz, setVol: (v) => setData("afiliado_vol_e3_kz", v), erro: errors.afiliado_taxa_e3_pct || errors.afiliado_vol_e3_kz }),
            /* @__PURE__ */ jsx(EscalaoRow, { rotulo: "4.º escalão", taxa: data.afiliado_taxa_e4_pct, setTaxa: (v) => setData("afiliado_taxa_e4_pct", v), vol: data.afiliado_vol_e4_kz, setVol: (v) => setData("afiliado_vol_e4_kz", v), erro: errors.afiliado_taxa_e4_pct || errors.afiliado_vol_e4_kz }),
            /* @__PURE__ */ jsx(EscalaoRow, { rotulo: "5.º escalão", taxa: data.afiliado_taxa_e5_pct, setTaxa: (v) => setData("afiliado_taxa_e5_pct", v), vol: data.afiliado_vol_e5_kz, setVol: (v) => setData("afiliado_vol_e5_kz", v), erro: errors.afiliado_taxa_e5_pct || errors.afiliado_vol_e5_kz }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40", children: "O escalão é escolhido pelo volume de receita (valor sem imposto) dos últimos 12 meses de cada afiliado. Guardar recalcula o escalão de todos os afiliados; as comissões já criadas mantêm a taxa da altura." })
          ] }) }),
          /* @__PURE__ */ jsx(Seccao, { titulo: "Pré-visualização", children: /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/50", children: [
              "Afiliado com volume de 12 meses de ",
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: fmtKz(exemploBase, 0) }),
              " (sem imposto)"
            ] }),
            /* @__PURE__ */ jsxs("table", { className: "mt-3 w-full text-sm", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40", children: [
                /* @__PURE__ */ jsx("th", { className: "py-1.5 text-left", children: "Escalão" }),
                /* @__PURE__ */ jsx("th", { className: "py-1.5 text-right", children: "Taxa" }),
                /* @__PURE__ */ jsx("th", { className: "py-1.5 text-right", children: "Comissão" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { children: escaloes.map((e) => /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsxs("td", { className: "py-2", children: [
                  /* @__PURE__ */ jsx(NivelBadge, { taxa: e.taxa }),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs text-white/60", children: e.label })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-2 text-right", children: fmtPct(e.taxa) }),
                /* @__PURE__ */ jsx("td", { className: "py-2 text-right font-mono text-emerald-300", children: fmtKz(exemploBase * (Number(e.taxa) || 0) / 100, 0) })
              ] }, e.label)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-1 text-xs text-white/50", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                "Carência: ",
                /* @__PURE__ */ jsxs("strong", { className: "text-white", children: [
                  data.afiliado_carencia_dias,
                  " dias"
                ] }),
                " · Mínimo: ",
                /* @__PURE__ */ jsx("strong", { className: "text-white", children: fmtKz(data.afiliado_pagamento_minimo_kz, 0) }),
                " · Retenção: ",
                /* @__PURE__ */ jsx("strong", { className: "text-white", children: fmtPct(data.afiliado_retencao_pct) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "Link memorizado: ",
                /* @__PURE__ */ jsxs("strong", { className: "text-white", children: [
                  data.afiliado_cookie_dias,
                  " dias"
                ] }),
                " · Indicação: ",
                /* @__PURE__ */ jsx("strong", { className: "text-white", children: Number(data.afiliado_duracao_meses) > 0 ? `${data.afiliado_duracao_meses} meses` : "vitalícia" })
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-amber-300" }),
            " Carência"
          ] }), children: /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsx(Num, { label: "Dias de carência por comissão", desc: descricoes.afiliado_carencia_dias, v: data.afiliado_carencia_dias, on: (v) => setData("afiliado_carencia_dias", v), erro: errors.afiliado_carencia_dias, min: 0 }) }) }),
          /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 text-emerald-300" }),
            " Pagamento"
          ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 p-5 md:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Num, { label: "Mínimo para pagar (Kz)", desc: descricoes.afiliado_pagamento_minimo_kz, v: data.afiliado_pagamento_minimo_kz, on: (v) => setData("afiliado_pagamento_minimo_kz", v), erro: errors.afiliado_pagamento_minimo_kz, min: 0, step: "100" }),
            /* @__PURE__ */ jsx(Num, { label: "Retenção na fonte por defeito (%)", desc: descricoes.afiliado_retencao_pct, v: data.afiliado_retencao_pct, on: (v) => setData("afiliado_retencao_pct", v), erro: errors.afiliado_retencao_pct, min: 0, max: 100, step: "0.5" })
          ] }) }),
          /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Link2, { className: "h-4 w-4 text-cyan-300" }),
            " Atribuição"
          ] }), children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 p-5 md:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Num, { label: "Link memorizado (dias)", desc: descricoes.afiliado_cookie_dias, v: data.afiliado_cookie_dias, on: (v) => setData("afiliado_cookie_dias", v), erro: errors.afiliado_cookie_dias, min: 1 }),
            /* @__PURE__ */ jsx(Num, { label: "Duração da indicação (meses, 0 = vitalícia)", desc: descricoes.afiliado_duracao_meses, v: data.afiliado_duracao_meses, on: (v) => setData("afiliado_duracao_meses", v), erro: errors.afiliado_duracao_meses, min: 0 })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: isDirty ? "Há alterações por guardar." : "Sem alterações." }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing || !isDirty, className: "btn-primary", children: "Guardar configuração" })
        ] })
      ] })
    ] })
  ] });
}
function Toggle({ label, desc, v, on }) {
  return /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white", children: label }),
      desc && /* @__PURE__ */ jsx("div", { className: "text-xs text-white/40", children: desc })
    ] }),
    /* @__PURE__ */ jsx("button", { type: "button", role: "switch", "aria-checked": v, onClick: () => on(!v), className: `relative h-6 w-11 shrink-0 rounded-full transition ${v ? "bg-gradient-to-r from-cyan-400 to-purple-500" : "bg-white/10"}`, children: /* @__PURE__ */ jsx("span", { className: `absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${v ? "left-[22px]" : "left-0.5"}` }) })
  ] });
}
function Num({ label, desc, v, on, erro, min, max, step }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: label }),
    /* @__PURE__ */ jsx("input", { type: "number", className: "input", value: v, onChange: (e) => on(e.target.value), min, max, step: step ?? "1" }),
    desc && /* @__PURE__ */ jsx("div", { className: "mt-1 text-[11px] text-white/40", children: desc }),
    erro && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: erro })
  ] });
}
function EscalaoRow({ rotulo, taxa, setTaxa, vol, setVol, erro }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_90px_150px] items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm text-white/70", children: rotulo }),
      /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 100, step: "0.5", className: "input", value: taxa, onChange: (e) => setTaxa(e.target.value) }),
      setVol ? /* @__PURE__ */ jsx("input", { type: "number", min: 0, step: "1000", className: "input", value: vol, onChange: (e) => setVol(e.target.value) }) : /* @__PURE__ */ jsx("span", { className: "text-center text-xs text-white/40", children: "—" })
    ] }),
    erro && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: erro })
  ] });
}
export {
  Config as default
};
