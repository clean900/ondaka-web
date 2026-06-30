import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-X_1jlzlW.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Plus, CheckCircle2, FileText, Clock, Calendar, Filter, X, Building2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const formatarKz = (valor) => {
  const n = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " Kz";
};
const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];
const estadoStyle = {
  aberta: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Aberta" },
  paga_parcial: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Paga parcial" },
  paga: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Paga" },
  cancelada: { bg: "bg-zinc-500/10", text: "text-zinc-400", label: "Cancelada" }
};
function QuotasIndex({ quotas, stats, condominios, filtros, flash }) {
  const [showGerar, setShowGerar] = useState(false);
  const [condominioFiltro, setCondominioFiltro] = useState(filtros.condominio_id || "");
  const [estadoFiltro, setEstadoFiltro] = useState(filtros.estado || "");
  const [anoFiltro, setAnoFiltro] = useState(filtros.ano || "");
  const [mesFiltro, setMesFiltro] = useState(filtros.mes || "");
  const handleFiltrar = (e) => {
    e.preventDefault();
    const params = {};
    if (condominioFiltro) params.condominio_id = condominioFiltro;
    if (estadoFiltro) params.estado = estadoFiltro;
    if (anoFiltro) params.ano = anoFiltro;
    if (mesFiltro) params.mes = mesFiltro;
    router.get(route("quotas.index"), params, { preserveState: true });
  };
  const handleLimpar = () => {
    setCondominioFiltro("");
    setEstadoFiltro("");
    setAnoFiltro("");
    setMesFiltro("");
    router.get(route("quotas.index"));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Taxas de Condomínio" }),
    /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Taxas de Condomínio" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mt-1", children: "Geração mensal automática + manual" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowGerar(true),
            className: "bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 16 }),
              " Gerar Taxas"
            ]
          }
        )
      ] }),
      (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex gap-3", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "text-emerald-400 flex-shrink-0", size: 18 }),
        /* @__PURE__ */ jsx("span", { className: "text-emerald-400 text-sm", children: flash.success })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(FileText, { size: 18 }), label: "Total", value: stats.total.toString(), color: "zinc" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Clock, { size: 18 }), label: "Abertas", value: stats.abertas.toString(), color: "amber" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Calendar, { size: 18 }), label: "Parciais", value: stats.pagas_parcial.toString(), color: "blue" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(CheckCircle2, { size: 18 }), label: "Pagas", value: stats.pagas.toString(), color: "emerald" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Calendar, { size: 18 }), label: "Mês actual", value: stats.mes_actual.toString(), color: "cyan" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleFiltrar, className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [
        /* @__PURE__ */ jsxs("select", { value: condominioFiltro, onChange: (e) => setCondominioFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
          condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: estadoFiltro, onChange: (e) => setEstadoFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os estados" }),
          /* @__PURE__ */ jsx("option", { value: "aberta", children: "Aberta" }),
          /* @__PURE__ */ jsx("option", { value: "paga_parcial", children: "Paga parcial" }),
          /* @__PURE__ */ jsx("option", { value: "paga", children: "Paga" }),
          /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Cancelada" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: anoFiltro, onChange: (e) => setAnoFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os anos" }),
          [2024, 2025, 2026, 2027].map((a) => /* @__PURE__ */ jsx("option", { value: a, children: a }, a))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: mesFiltro, onChange: (e) => setMesFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os meses" }),
          meses.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i + 1))
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 flex-1 justify-center", children: [
            /* @__PURE__ */ jsx(Filter, { size: 14 }),
            " Filtrar"
          ] }),
          (condominioFiltro || estadoFiltro || anoFiltro || mesFiltro) && /* @__PURE__ */ jsx("button", { type: "button", onClick: handleLimpar, className: "text-zinc-400 hover:text-white px-3 py-2 text-sm", children: /* @__PURE__ */ jsx(X, { size: 14 }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden", children: [
        quotas.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center text-zinc-500", children: [
          /* @__PURE__ */ jsx(FileText, { size: 48, className: "mx-auto mb-4 opacity-30" }),
          /* @__PURE__ */ jsx("p", { children: "Sem quotas com estes filtros." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: quotas.data.map((q) => {
          var _a, _b, _c, _d, _e;
          return /* @__PURE__ */ jsx(Link, { href: route("quotas.show", q.id), className: "block p-4 hover:bg-zinc-800/30 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
                  meses[q.mes - 1],
                  " ",
                  q.ano
                ] }),
                /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-[11px] font-bold ${(_a = estadoStyle[q.estado]) == null ? void 0 : _a.bg} ${(_b = estadoStyle[q.estado]) == null ? void 0 : _b.text}`, children: (_c = estadoStyle[q.estado]) == null ? void 0 : _c.label })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-zinc-400 flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Building2, { size: 12 }),
                  (_d = q.condominio) == null ? void 0 : _d.nome,
                  " · Imóvel ",
                  (_e = q.fraccao) == null ? void 0 : _e.identificador
                ] }),
                q.data_vencimento && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Calendar, { size: 12 }),
                  " Vence ",
                  new Date(q.data_vencimento).toLocaleDateString("pt-PT")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-white", children: formatarKz(q.valor_total) }),
              parseFloat(q.valor_pago) > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-emerald-400", children: [
                "Pago: ",
                formatarKz(q.valor_pago)
              ] })
            ] })
          ] }) }, q.id);
        }) }),
        quotas.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800 px-4 py-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500", children: [
            "Página ",
            quotas.current_page,
            " de ",
            quotas.last_page,
            " (",
            quotas.total,
            " taxas)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: quotas.links.map((link, i) => /* @__PURE__ */ jsx("button", { onClick: () => link.url && router.get(link.url), disabled: !link.url, className: `px-3 py-1 rounded text-xs ${link.active ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white disabled:opacity-30"}`, dangerouslySetInnerHTML: { __html: link.label } }, i)) })
        ] })
      ] })
    ] }) }),
    showGerar && /* @__PURE__ */ jsx(ModalGerar, { condominios, onClose: () => setShowGerar(false) })
  ] });
}
function ModalGerar({ condominios, onClose }) {
  var _a, _b;
  const form = useForm({
    condominio_id: ((_b = (_a = condominios[0]) == null ? void 0 : _a.id) == null ? void 0 : _b.toString()) || "",
    ano: (/* @__PURE__ */ new Date()).getFullYear().toString(),
    mes: ((/* @__PURE__ */ new Date()).getMonth() + 1).toString()
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    form.post(route("quotas.gerar"), {
      onSuccess: () => onClose(),
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white", children: "Gerar Taxas" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mb-4", children: [
      "Gera quotas para todas as fracções com contrato activo do condomínio. A operação é ",
      /* @__PURE__ */ jsx("strong", { children: "idempotente" }),
      " — não duplica quotas existentes."
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Condomínio" }),
        /* @__PURE__ */ jsx("select", { value: form.data.condominio_id, onChange: (e) => form.setData("condominio_id", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id)) }),
        form.errors.condominio_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.condominio_id })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Ano" }),
          /* @__PURE__ */ jsx("select", { value: form.data.ano, onChange: (e) => form.setData("ano", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [2024, 2025, 2026, 2027].map((a) => /* @__PURE__ */ jsx("option", { value: a, children: a }, a)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Mês" }),
          /* @__PURE__ */ jsx("select", { value: form.data.mes, onChange: (e) => form.setData("mes", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: meses.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i + 1)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-2 text-xs text-amber-300/90", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "flex-shrink-0", size: 14 }),
        /* @__PURE__ */ jsx("span", { children: "Gera 2 lançamentos por fracção: quota base + fundo reserva (Decreto 141/15)." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: form.processing, className: "flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2", children: [
          form.processing ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(Plus, { size: 16 }),
          form.processing ? "A gerar..." : "Gerar Taxas"
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2.5 text-sm text-zinc-400 hover:text-white", children: "Cancelar" })
      ] })
    ] })
  ] }) });
}
function StatCard({ icon, label, value, color }) {
  const colors = {
    zinc: "text-zinc-400 bg-zinc-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10"
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ jsx("div", { className: `p-1.5 rounded ${colors[color]}`, children: icon }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-400 font-semibold", children: label })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-white", children: value })
  ] });
}
export {
  QuotasIndex as default
};
