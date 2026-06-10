import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-CLWcivhb.js";
import { Head, router, useForm } from "@inertiajs/react";
import { Plus, CheckCircle2, FileText, Clock, X, Receipt, Filter, Building2, Calendar, Trash2, Minus, TrendingDown, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
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
const formatarData = (data) => {
  return new Date(data).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
};
const tipoStyle = {
  despesa_extra: { bg: "bg-red-500/10", text: "text-red-400", label: "Despesa extra", icon: /* @__PURE__ */ jsx(Receipt, { size: 12 }) },
  ajuste_debito: { bg: "bg-orange-500/10", text: "text-orange-400", label: "Ajuste débito", icon: /* @__PURE__ */ jsx(TrendingUp, { size: 12 }) },
  ajuste_credito: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Ajuste crédito", icon: /* @__PURE__ */ jsx(TrendingDown, { size: 12 }) }
};
const estadoStyle = {
  em_aberto: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Em aberto" },
  pago_parcial: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Pago parcial" },
  pago: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Pago" },
  cancelado: { bg: "bg-zinc-500/10", text: "text-zinc-400", label: "Cancelado" }
};
function LancamentosIndex({ lancamentos, stats, dashboard, condominios, fraccoesPorCondominio, filtros, flash }) {
  const [showNovo, setShowNovo] = useState(false);
  const [cancelarTarget, setCancelarTarget] = useState(null);
  const [condominioFiltro, setCondominioFiltro] = useState(filtros.condominio_id || "");
  const [tipoFiltro, setTipoFiltro] = useState(filtros.tipo || "");
  const [estadoFiltro, setEstadoFiltro] = useState(filtros.estado || "");
  const handleFiltrar = (e) => {
    e.preventDefault();
    const params = {};
    if (condominioFiltro) params.condominio_id = condominioFiltro;
    if (tipoFiltro) params.tipo = tipoFiltro;
    if (estadoFiltro) params.estado = estadoFiltro;
    router.get(route("lancamentos.index"), params, { preserveState: true });
  };
  const handleLimpar = () => {
    setCondominioFiltro("");
    setTipoFiltro("");
    setEstadoFiltro("");
    router.get(route("lancamentos.index"));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Lançamentos manuais" }),
    /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Lançamentos manuais" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mt-1", children: "Despesas extras, ajustes débito e crédito" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowNovo(true),
            className: "bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 16 }),
              " Novo lançamento"
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
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Clock, { size: 18 }), label: "Em aberto", value: stats.em_aberto.toString(), color: "amber" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(CheckCircle2, { size: 18 }), label: "Pagos", value: stats.pagos.toString(), color: "emerald" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(X, { size: 18 }), label: "Cancelados", value: stats.cancelados.toString(), color: "zinc" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Receipt, { size: 18 }), label: "Valor em aberto", value: formatarKz(stats.valor_em_aberto), color: "cyan" })
      ] }),
      dashboard && /* @__PURE__ */ jsx(DashboardDespesas, { dashboard }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 mb-6", style: { display: "none" }, children: /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(FileText, { size: 18 }), label: "placeholder", value: "0", color: "zinc" }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleFiltrar, className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxs("select", { value: condominioFiltro, onChange: (e) => setCondominioFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
          condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: tipoFiltro, onChange: (e) => setTipoFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os tipos" }),
          /* @__PURE__ */ jsx("option", { value: "despesa_extra", children: "Despesa extra" }),
          /* @__PURE__ */ jsx("option", { value: "ajuste_debito", children: "Ajuste débito" }),
          /* @__PURE__ */ jsx("option", { value: "ajuste_credito", children: "Ajuste crédito" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: estadoFiltro, onChange: (e) => setEstadoFiltro(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os estados" }),
          /* @__PURE__ */ jsx("option", { value: "em_aberto", children: "Em aberto" }),
          /* @__PURE__ */ jsx("option", { value: "pago_parcial", children: "Pago parcial" }),
          /* @__PURE__ */ jsx("option", { value: "pago", children: "Pago" }),
          /* @__PURE__ */ jsx("option", { value: "cancelado", children: "Cancelado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 flex-1 justify-center", children: [
            /* @__PURE__ */ jsx(Filter, { size: 14 }),
            " Filtrar"
          ] }),
          (condominioFiltro || tipoFiltro || estadoFiltro) && /* @__PURE__ */ jsx("button", { type: "button", onClick: handleLimpar, className: "text-zinc-400 hover:text-white px-3 py-2 text-sm", children: /* @__PURE__ */ jsx(X, { size: 14 }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden", children: [
        lancamentos.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center text-zinc-500", children: [
          /* @__PURE__ */ jsx(Receipt, { size: 48, className: "mx-auto mb-4 opacity-30" }),
          /* @__PURE__ */ jsx("p", { children: "Sem lançamentos com estes filtros." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: lancamentos.data.map((l) => {
          var _a, _b;
          const tipoEstilo = tipoStyle[l.tipo] || { bg: "bg-zinc-500/10", text: "text-zinc-400", label: l.tipo, icon: /* @__PURE__ */ jsx(Minus, { size: 12 }) };
          const estadoEstilo = estadoStyle[l.estado];
          const podeCancel = l.estado === "em_aberto";
          return /* @__PURE__ */ jsx("div", { className: "block p-4 hover:bg-zinc-800/30 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: `px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${tipoEstilo.bg} ${tipoEstilo.text}`, children: [
                  tipoEstilo.icon,
                  " ",
                  tipoEstilo.label
                ] }),
                /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-[11px] font-bold ${estadoEstilo == null ? void 0 : estadoEstilo.bg} ${estadoEstilo == null ? void 0 : estadoEstilo.text}`, children: estadoEstilo == null ? void 0 : estadoEstilo.label })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-white mb-1", children: l.descricao }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-zinc-400 flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Building2, { size: 12 }),
                  " ",
                  (_a = l.condominio) == null ? void 0 : _a.nome,
                  " · Imóvel ",
                  (_b = l.fraccao) == null ? void 0 : _b.identificador
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Calendar, { size: 12 }),
                  " ",
                  formatarData(l.data_lancamento)
                ] }),
                l.data_vencimento && /* @__PURE__ */ jsxs("span", { children: [
                  "· Vence ",
                  formatarData(l.data_vencimento)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right flex-shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-white", children: formatarKz(l.valor) }),
              parseFloat(l.valor_pago) > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-emerald-400", children: [
                "Pago: ",
                formatarKz(l.valor_pago)
              ] }),
              podeCancel && /* @__PURE__ */ jsxs("button", { onClick: () => setCancelarTarget(l), className: "mt-2 text-red-400 hover:text-red-300 text-xs flex items-center gap-1 ml-auto", children: [
                /* @__PURE__ */ jsx(Trash2, { size: 12 }),
                " Cancelar"
              ] })
            ] })
          ] }) }, l.id);
        }) }),
        lancamentos.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800 px-4 py-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500", children: [
            "Página ",
            lancamentos.current_page,
            " de ",
            lancamentos.last_page,
            " (",
            lancamentos.total,
            " lançamentos)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: lancamentos.links.map((link, i) => /* @__PURE__ */ jsx("button", { onClick: () => link.url && router.get(link.url), disabled: !link.url, className: `px-3 py-1 rounded text-xs ${link.active ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white disabled:opacity-30"}`, dangerouslySetInnerHTML: { __html: link.label } }, i)) })
        ] })
      ] })
    ] }) }),
    showNovo && /* @__PURE__ */ jsx(
      ModalNovoLancamento,
      {
        condominios,
        fraccoesPorCondominio,
        onClose: () => setShowNovo(false)
      }
    ),
    cancelarTarget && /* @__PURE__ */ jsx(
      ModalCancelar,
      {
        lancamento: cancelarTarget,
        onClose: () => setCancelarTarget(null)
      }
    )
  ] });
}
function ModalNovoLancamento({ condominios, fraccoesPorCondominio, onClose }) {
  var _a, _b;
  const form = useForm({
    condominio_id: ((_b = (_a = condominios[0]) == null ? void 0 : _a.id) == null ? void 0 : _b.toString()) || "",
    fraccao_ids: [],
    tipo: "despesa_extra",
    descricao: "",
    valor: "",
    data_vencimento: "",
    detalhes: "",
    observacoes: ""
  });
  const fraccoesDoCondominio = useMemo(() => {
    const id = parseInt(form.data.condominio_id);
    return fraccoesPorCondominio[id] || [];
  }, [form.data.condominio_id, fraccoesPorCondominio]);
  const todasSeleccionadas = fraccoesDoCondominio.length > 0 && form.data.fraccao_ids.length === fraccoesDoCondominio.length;
  const toggleTodas = () => {
    if (todasSeleccionadas) {
      form.setData("fraccao_ids", []);
    } else {
      form.setData("fraccao_ids", fraccoesDoCondominio.map((f) => f.id));
    }
  };
  const toggleFraccao = (id) => {
    const current = form.data.fraccao_ids;
    if (current.includes(id)) {
      form.setData("fraccao_ids", current.filter((x) => x !== id));
    } else {
      form.setData("fraccao_ids", [...current, id]);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    form.post(route("lancamentos.store"), {
      onSuccess: () => onClose(),
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/70", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white", children: "Novo lançamento manual" }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
      ] }),
      form.errors.store && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 text-xs text-red-400", children: form.errors.store }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Condomínio" }),
            /* @__PURE__ */ jsx("select", { value: form.data.condominio_id, onChange: (e) => {
              form.setData("condominio_id", e.target.value);
              form.setData("fraccao_ids", []);
            }, className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id)) }),
            form.errors.condominio_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.condominio_id })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Tipo" }),
            /* @__PURE__ */ jsxs("select", { value: form.data.tipo, onChange: (e) => form.setData("tipo", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500", children: [
              /* @__PURE__ */ jsx("option", { value: "despesa_extra", children: "Despesa extra" }),
              /* @__PURE__ */ jsx("option", { value: "ajuste_debito", children: "Ajuste débito (cobrança extra)" }),
              /* @__PURE__ */ jsx("option", { value: "ajuste_credito", children: "Ajuste crédito (redução de dívida)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-xs text-zinc-400 font-semibold", children: [
              "Fracções alvo (",
              form.data.fraccao_ids.length,
              " de ",
              fraccoesDoCondominio.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: toggleTodas, className: "text-xs text-cyan-400 hover:text-cyan-300 font-semibold", children: todasSeleccionadas ? "Desmarcar todas" : "Seleccionar todas" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-zinc-800 border border-zinc-700 rounded-lg p-3 max-h-40 overflow-y-auto", children: fraccoesDoCondominio.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: "Sem fracções para este condomínio." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: fraccoesDoCondominio.map((f) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: form.data.fraccao_ids.includes(f.id),
                onChange: () => toggleFraccao(f.id),
                className: "rounded bg-zinc-700 border-zinc-600 text-cyan-500"
              }
            ),
            f.identificador
          ] }, f.id)) }) }),
          form.errors.fraccao_ids && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.fraccao_ids })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Descrição" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: form.data.descricao, onChange: (e) => form.setData("descricao", e.target.value), placeholder: "Ex: Reparação portão automático", className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
          form.errors.descricao && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.descricao })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Valor (Kz) — por fracção" }),
            /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", min: "0.01", value: form.data.valor, onChange: (e) => form.setData("valor", e.target.value), placeholder: "0.00", className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }),
            form.errors.valor && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.valor })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Data de vencimento (opcional)" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: form.data.data_vencimento, onChange: (e) => form.setData("data_vencimento", e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Observações (opcional)" }),
          /* @__PURE__ */ jsx("textarea", { value: form.data.observacoes, onChange: (e) => form.setData("observacoes", e.target.value), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-2 text-xs text-amber-300/90", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "flex-shrink-0", size: 14 }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Vai criar ",
            /* @__PURE__ */ jsx("strong", { children: form.data.fraccao_ids.length }),
            " lançamento(s), um por cada fracção seleccionada com o mesmo valor."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: form.processing || form.data.fraccao_ids.length === 0, className: "flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2", children: [
            form.processing ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(Plus, { size: 16 }),
            form.processing ? "A criar..." : `Criar ${form.data.fraccao_ids.length} lançamento(s)`
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2.5 text-sm text-zinc-400 hover:text-white", children: "Cancelar" })
        ] })
      ] })
    ] })
  ] });
}
function ModalCancelar({ lancamento, onClose }) {
  const form = useForm({ motivo: "" });
  const handleSubmit = (e) => {
    e.preventDefault();
    form.post(route("lancamentos.cancelar", lancamento.id), {
      onSuccess: () => onClose(),
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-white", children: [
        "Cancelar lançamento #",
        lancamento.id
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400 mb-4", children: [
      'Vais cancelar o lançamento "',
      lancamento.descricao,
      '" no valor de ',
      formatarKz(lancamento.valor),
      "."
    ] }),
    form.errors.cancelar && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 text-xs text-red-400", children: form.errors.cancelar }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-400 mb-1.5 font-semibold", children: "Motivo (mínimo 5 caracteres)" }),
        /* @__PURE__ */ jsx("textarea", { value: form.data.motivo, onChange: (e) => form.setData("motivo", e.target.value), rows: 3, placeholder: "Ex: Erro de lançamento — valor incorrecto", className: "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" }),
        form.errors.motivo && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.motivo })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: form.processing || form.data.motivo.length < 5, className: "flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2", children: [
          form.processing ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { size: 16 }),
          "Confirmar cancelamento"
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2.5 text-sm text-zinc-400 hover:text-white", children: "Manter" })
      ] })
    ] })
  ] }) });
}
function StatCard({ icon, label, value, color }) {
  const colors = {
    zinc: "text-zinc-400 bg-zinc-500/10",
    amber: "text-amber-400 bg-amber-500/10",
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
function DashboardDespesas({ dashboard }) {
  var _a;
  parseFloat(dashboard.total_ano);
  parseFloat(dashboard.total_mes);
  const meses12 = [];
  const hoje = /* @__PURE__ */ new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-PT", { month: "short" });
    meses12.push({ mes: key, label, valor: parseFloat(dashboard.mensais[key] ?? "0") });
  }
  const maxValor = Math.max(...meses12.map((m) => m.valor), 1);
  const totalCategorias = dashboard.top_categorias.reduce((sum, c) => sum + parseFloat(c.total), 0) || 1;
  return /* @__PURE__ */ jsxs("div", { className: "mt-6 mb-6 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-zinc-100", children: "📊 Dashboard de Despesas" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500 italic", children: "Análise avançada disponível no add-on Dashboard BI" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 uppercase tracking-wide", children: "Despesas este mês" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-300 mt-1", children: formatarKz(dashboard.total_mes) }),
        /* @__PURE__ */ jsxs("p", { className: `text-xs mt-1 ${dashboard.variacao_pct >= 0 ? "text-red-400" : "text-emerald-400"}`, children: [
          dashboard.variacao_pct >= 0 ? "↑" : "↓",
          " ",
          Math.abs(dashboard.variacao_pct),
          "% vs mês anterior"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 uppercase tracking-wide", children: "Despesas no ano" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-zinc-100 mt-1", children: formatarKz(dashboard.total_ano) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-500 mt-1", children: [
          dashboard.top_lancamentos.length,
          " maiores listados abaixo"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 uppercase tracking-wide", children: "Mês anterior" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-zinc-300 mt-1", children: formatarKz(dashboard.total_mes_anterior) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 uppercase tracking-wide", children: "Top categoria" }),
        /* @__PURE__ */ jsx("p", { className: "text-base font-bold text-zinc-100 mt-1 truncate", children: ((_a = dashboard.top_categorias[0]) == null ? void 0 : _a.descricao) ?? "—" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-1", children: dashboard.top_categorias[0] ? formatarKz(dashboard.top_categorias[0].total) : "" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-zinc-100 mb-4", children: "Despesas por mês — últimos 12 meses" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-end gap-2 h-40", children: meses12.map((m) => {
        const altura = m.valor / maxValor * 100;
        return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center group", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-full bg-gradient-to-t from-red-500/40 to-orange-400/30 hover:from-red-500/70 hover:to-orange-400/60 rounded-t transition cursor-pointer relative",
              style: { height: `${altura}%`, minHeight: m.valor > 0 ? "4px" : "0" },
              children: /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 whitespace-nowrap z-10", children: formatarKz(m.valor.toString()) })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-zinc-500 mt-2", children: m.label })
        ] }, m.mes);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-zinc-100 mb-3", children: "Top 5 categorias do ano" }),
        dashboard.top_categorias.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: "Sem despesas este ano." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: dashboard.top_categorias.map((cat, idx) => {
          const pct = parseFloat(cat.total) / totalCategorias * 100;
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-zinc-200 truncate flex-1", children: cat.descricao }),
              /* @__PURE__ */ jsx("span", { className: "text-zinc-400 ml-2", children: formatarKz(cat.total) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-zinc-800 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-gradient-to-r from-red-500 to-orange-400", style: { width: `${pct}%` } }) })
          ] }, idx);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-zinc-100 mb-3", children: "Top 10 maiores do ano" }),
        dashboard.top_lancamentos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: "Sem despesas este ano." }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5 max-h-64 overflow-y-auto", children: dashboard.top_lancamentos.map((l) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/50 last:border-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 truncate pr-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-zinc-200 truncate", children: l.descricao }),
            /* @__PURE__ */ jsx("p", { className: "text-zinc-500", children: l.data_lancamento })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-zinc-100 font-medium", children: formatarKz(l.valor) })
        ] }, l.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-zinc-100", children: "Quer mais? Active o Dashboard BI Avançado" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mt-0.5", children: "Receitas vs Despesas, Cash Flow, Aging, Top devedores, Demonstração de Resultados, exportação Excel/PDF e mais..." })
      ] }),
      /* @__PURE__ */ jsx("a", { href: "/loja", className: "text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50", children: "Ver na Loja →" })
    ] })
  ] });
}
export {
  LancamentosIndex as default
};
