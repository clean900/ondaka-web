import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { useForm, Head } from "@inertiajs/react";
import { Wrench, CalendarClock, CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const TIPOS = [
  ["elevador", "Elevador"],
  ["avac", "AVAC (climatização)"],
  ["gerador", "Gerador"],
  ["bomba", "Bomba de água"],
  ["incendio", "Combate a incêndio"],
  ["portao", "Portão / cancela"],
  ["outro", "Outro"]
];
function corDias(dias) {
  if (dias < 0) return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  if (dias <= 7) return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  if (dias <= 15) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (dias <= 30) return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
  return "bg-zinc-700/40 text-zinc-400 border-zinc-700";
}
function ManutencaoIndex({ equipamentos, proximas, condominios }) {
  var _a, _b;
  const [intervencaoPlano, setIntervencaoPlano] = useState(null);
  const eqForm = useForm({ condominio_id: ((_a = condominios[0]) == null ? void 0 : _a.id) ?? 0, nome: "", tipo: "elevador", localizacao: "", marca: "", modelo: "" });
  const planoForm = useForm({ equipamento_id: ((_b = equipamentos[0]) == null ? void 0 : _b.id) ?? 0, titulo: "", descricao: "", periodicidade_dias: 180, proxima_data: "" });
  const intForm = useForm({
    data_realizada: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    descricao: "",
    custo: "",
    realizado_por: "",
    relatorio: null
  });
  const addEquipamento = (e) => {
    e.preventDefault();
    eqForm.post(route("manutencao.equipamentos.store"), { preserveScroll: true, onSuccess: () => eqForm.reset("nome", "localizacao", "marca", "modelo") });
  };
  const addPlano = (e) => {
    e.preventDefault();
    planoForm.post(route("manutencao.planos.store"), { preserveScroll: true, onSuccess: () => planoForm.reset("titulo", "descricao") });
  };
  const submitIntervencao = (e) => {
    e.preventDefault();
    if (!intervencaoPlano) return;
    intForm.post(route("manutencao.planos.intervencao", intervencaoPlano.id), {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        setIntervencaoPlano(null);
        intForm.reset();
      }
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Manutenção Preventiva" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Wrench, { className: "h-5 w-5 text-cyan-400" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-zinc-100", children: "Manutenção Preventiva" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Elevadores, AVAC, geradores, bombas… com alertas 30/15/7 dias antes." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(CalendarClock, { className: "h-4 w-4" }),
          " Próximas manutenções"
        ] }),
        proximas.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Sem manutenções agendadas. Adicione um equipamento e um plano abaixo." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: proximas.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800", children: [
          /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-1 rounded border font-semibold ${corDias(p.dias)}`, children: p.dias < 0 ? `Em atraso ${Math.abs(p.dias)}d` : `${p.dias} dias` }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200 font-medium truncate", children: p.titulo }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
              p.equipamento,
              " · ",
              p.tipo_label,
              " · ",
              p.proxima_data
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIntervencaoPlano(p),
              className: "inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white",
              children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                " Registar"
              ]
            }
          )
        ] }, p.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: addEquipamento, className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500", children: "Novo equipamento" }),
          /* @__PURE__ */ jsx("select", { value: eqForm.data.condominio_id, onChange: (e) => eqForm.setData("condominio_id", Number(e.target.value)), className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2", children: condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id)) }),
          /* @__PURE__ */ jsx("input", { value: eqForm.data.nome, onChange: (e) => eqForm.setData("nome", e.target.value), placeholder: "Nome (ex.: Elevador Bloco A)", className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx("select", { value: eqForm.data.tipo, onChange: (e) => eqForm.setData("tipo", e.target.value), className: "rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2", children: TIPOS.map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v)) }),
            /* @__PURE__ */ jsx("input", { value: eqForm.data.localizacao, onChange: (e) => eqForm.setData("localizacao", e.target.value), placeholder: "Localização", className: "rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" })
          ] }),
          /* @__PURE__ */ jsxs("button", { disabled: eqForm.processing, className: "inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 hover:bg-cyan-500 text-white text-sm px-4 py-2 disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Adicionar equipamento"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: addPlano, className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500", children: "Novo plano de manutenção" }),
          /* @__PURE__ */ jsx("select", { value: planoForm.data.equipamento_id, onChange: (e) => planoForm.setData("equipamento_id", Number(e.target.value)), className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2", children: equipamentos.length === 0 ? /* @__PURE__ */ jsx("option", { value: 0, children: "— adicione um equipamento primeiro —" }) : equipamentos.map((eq) => /* @__PURE__ */ jsx("option", { value: eq.id, children: eq.nome }, eq.id)) }),
          /* @__PURE__ */ jsx("input", { value: planoForm.data.titulo, onChange: (e) => planoForm.setData("titulo", e.target.value), placeholder: "Título (ex.: Revisão semestral)", className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Periodicidade (dias)" }),
              /* @__PURE__ */ jsx("input", { type: "number", min: 1, value: planoForm.data.periodicidade_dias, onChange: (e) => planoForm.setData("periodicidade_dias", Number(e.target.value)), className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Próxima data" }),
              /* @__PURE__ */ jsx("input", { type: "date", value: planoForm.data.proxima_data, onChange: (e) => planoForm.setData("proxima_data", e.target.value), className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("button", { disabled: planoForm.processing || equipamentos.length === 0, className: "inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 hover:bg-cyan-500 text-white text-sm px-4 py-2 disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Criar plano"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-4", children: [
          "Equipamentos (",
          equipamentos.length,
          ")"
        ] }),
        equipamentos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Nenhum equipamento." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: equipamentos.map((eq) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-zinc-950/40 border border-zinc-800", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-100 font-medium", children: eq.nome }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500", children: [
            eq.tipo_label,
            eq.localizacao ? ` · ${eq.localizacao}` : ""
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-cyan-400/80 mt-1", children: [
            eq.planos_count,
            " plano(s)"
          ] })
        ] }, eq.id)) })
      ] })
    ] }),
    intervencaoPlano && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4", onClick: () => setIntervencaoPlano(null), children: /* @__PURE__ */ jsxs("form", { onClick: (e) => e.stopPropagation(), onSubmit: submitIntervencao, className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-zinc-100", children: "Registar intervenção" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
        intervencaoPlano.titulo,
        " · ",
        intervencaoPlano.equipamento
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Data realizada" }),
        /* @__PURE__ */ jsx("input", { type: "date", value: intForm.data.data_realizada, onChange: (e) => intForm.setData("data_realizada", e.target.value), className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" })
      ] }),
      /* @__PURE__ */ jsx("textarea", { value: intForm.data.descricao, onChange: (e) => intForm.setData("descricao", e.target.value), placeholder: "Descrição do que foi feito", rows: 3, className: "w-full rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx("input", { value: intForm.data.custo, onChange: (e) => intForm.setData("custo", e.target.value), placeholder: "Custo (Kz)", className: "rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" }),
        /* @__PURE__ */ jsx("input", { value: intForm.data.realizado_por, onChange: (e) => intForm.setData("realizado_por", e.target.value), placeholder: "Realizado por", className: "rounded-lg bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-200 px-3 py-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Relatório (PDF/foto, opcional)" }),
        /* @__PURE__ */ jsx("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => {
          var _a2;
          return intForm.setData("relatorio", ((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null);
        }, className: "w-full text-xs text-zinc-400" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setIntervencaoPlano(null), className: "text-sm text-zinc-400 px-4 py-2", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: intForm.processing, className: "rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm px-4 py-2 disabled:opacity-50", children: intForm.processing ? "A guardar…" : "Registar e avançar data" })
      ] })
    ] }) })
  ] });
}
export {
  ManutencaoIndex as default
};
