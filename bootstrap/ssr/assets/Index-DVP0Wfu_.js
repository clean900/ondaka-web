import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BxaWWjLC.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Receipt, Plus, Filter, Eye, CheckCircle, DollarSign, Edit, Ban, Trash2, X, Check } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_COR = {
  pendente: { bg: "rgba(250,204,21,0.12)", text: "#facc15", label: "Pendente" },
  aprovada: { bg: "rgba(6,182,212,0.12)", text: "#06b6d4", label: "Aprovada" },
  paga: { bg: "rgba(34,197,94,0.12)", text: "#22c55e", label: "Paga" },
  cancelada: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", label: "Cancelada" }
};
function formatarKz(valor) {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + " Kz";
}
function formatarData(d) {
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}
function DespesasIndex({ despesas, stats, categorias, contas, condominios, filtros }) {
  var _a, _b, _c;
  const [modalNova, setModalNova] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmandoPaga, setConfirmandoPaga] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [metodoPagamento, setMetodoPagamento] = useState("transferencia");
  const [contaPagamento, setContaPagamento] = useState(null);
  const [comprovativo, setComprovativo] = useState(null);
  const abrirPagamento = (d) => {
    setContaPagamento(d.conta_bancaria_id);
    setComprovativo(null);
    setConfirmandoPaga(d);
  };
  const form = useForm({
    tipo: "condominio",
    condominio_id: null,
    categoria_id: null,
    conta_bancaria_id: ((_a = contas.find((c) => c.principal)) == null ? void 0 : _a.id) ?? ((_b = contas[0]) == null ? void 0 : _b.id) ?? null,
    data_despesa: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    valor: "",
    descricao: "",
    fornecedor: "",
    notas: ""
  });
  const formEditar = useForm({
    tipo: "condominio",
    condominio_id: null,
    categoria_id: null,
    conta_bancaria_id: null,
    data_despesa: "",
    valor: "",
    descricao: "",
    fornecedor: "",
    notas: ""
  });
  const submitNova = (e) => {
    e.preventDefault();
    form.post("/despesas", {
      preserveScroll: true,
      onSuccess: () => {
        form.reset();
        setModalNova(false);
      }
    });
  };
  const abrirEditar = (d) => {
    formEditar.setData({
      tipo: d.tipo,
      condominio_id: d.condominio_id,
      categoria_id: d.categoria_id,
      conta_bancaria_id: d.conta_bancaria_id,
      data_despesa: d.data_despesa.split("T")[0],
      valor: d.valor,
      descricao: d.descricao,
      fornecedor: d.fornecedor ?? "",
      notas: d.notas ?? ""
    });
    setEditandoId(d.id);
  };
  const submitEditar = (e) => {
    e.preventDefault();
    if (editandoId === null) return;
    formEditar.put(`/despesas/${editandoId}`, {
      preserveScroll: true,
      onSuccess: () => {
        setEditandoId(null);
        formEditar.reset();
      }
    });
  };
  const aprovar = (id) => {
    router.post(`/despesas/${id}/aprovar`, {}, { preserveScroll: true });
  };
  const marcarPaga = () => {
    if (!confirmandoPaga) return;
    router.post(`/despesas/${confirmandoPaga.id}/pagar`, {
      metodo_pagamento: metodoPagamento,
      conta_bancaria_id: contaPagamento,
      ...comprovativo ? { comprovativo } : {}
    }, {
      preserveScroll: true,
      forceFormData: !!comprovativo,
      onSuccess: () => setConfirmandoPaga(null)
    });
  };
  const cancelar = (id) => {
    const motivo = window.prompt("Motivo do cancelamento (opcional):") ?? "";
    router.post(`/despesas/${id}/cancelar`, { motivo }, { preserveScroll: true });
  };
  const eliminar = (id) => {
    if (!window.confirm("Eliminar esta despesa? Esta acção não pode ser desfeita.")) return;
    router.delete(`/despesas/${id}`, { preserveScroll: true });
  };
  const aplicarFiltro = (campo, valor) => {
    router.get("/despesas", { ...filtros, [campo]: valor || void 0 }, { preserveState: true, preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Despesas" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto py-6 px-4 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-medium text-white flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Receipt, { className: "h-6 w-6 text-purple-400" }),
            "Despesas"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mt-1", children: "Registo e gestão de despesas do condomínio e da empresa" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/despesas/categorias",
              className: "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/70 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10",
              children: "Gerir categorias"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setModalNova(true),
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium",
              style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" },
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                " Nova despesa"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-4 border border-white/10 bg-white/5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-wider mb-1", children: "Total" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-medium text-white", children: stats.total })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-4 border border-yellow-500/20 bg-yellow-500/5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-yellow-300 uppercase tracking-wider mb-1", children: "Pendentes" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-medium text-yellow-200", children: stats.pendentes })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-4 border border-cyan-500/20 bg-cyan-500/5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-cyan-300 uppercase tracking-wider mb-1", children: "Aprovadas" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-medium text-cyan-200", children: stats.aprovadas })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-4 border border-green-500/20 bg-green-500/5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-green-300 uppercase tracking-wider mb-1", children: "Pagas este mês" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-medium text-green-200", children: formatarKz(stats.pagas_mes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-3 border border-white/10 bg-white/5 flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 text-white/40" }),
        /* @__PURE__ */ jsxs("select", { value: filtros.estado ?? "", onChange: (e) => aplicarFiltro("estado", e.target.value), className: "px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os estados" }),
          /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendentes" }),
          /* @__PURE__ */ jsx("option", { value: "aprovada", children: "Aprovadas" }),
          /* @__PURE__ */ jsx("option", { value: "paga", children: "Pagas" }),
          /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Canceladas" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filtros.tipo ?? "", onChange: (e) => aplicarFiltro("tipo", e.target.value), className: "px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os tipos" }),
          /* @__PURE__ */ jsx("option", { value: "condominio", children: "Condomínio" }),
          /* @__PURE__ */ jsx("option", { value: "empresa", children: "Empresa" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filtros.categoria_id ?? "", onChange: (e) => aplicarFiltro("categoria_id", e.target.value), className: "px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todas as categorias" }),
          categorias.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filtros.condominio_id ?? "", onChange: (e) => aplicarFiltro("condominio_id", e.target.value), className: "px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
          condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-white/10 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-white/5 border-b border-white/10", children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-[10px] uppercase tracking-wider text-white/50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Data" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Descrição" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Categoria" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Tipo" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Conta" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right", children: "Valor" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5", children: "Estado" }),
          /* @__PURE__ */ jsx("th", { className: "px-3 py-2.5 text-right", children: "Acções" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          despesas.data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-3 py-12 text-center text-white/40 text-sm", children: "Sem despesas registadas." }) }),
          despesas.data.map((d) => {
            var _a2, _b2, _c2, _d, _e;
            const cor = ESTADO_COR[d.estado];
            return /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 hover:bg-white/[0.02]", children: [
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-white/80 text-xs", children: formatarData(d.data_despesa) }),
              /* @__PURE__ */ jsxs("td", { className: "px-3 py-2.5", children: [
                /* @__PURE__ */ jsx("div", { className: "text-white text-sm", children: d.descricao }),
                d.fornecedor && /* @__PURE__ */ jsxs("div", { className: "text-white/40 text-[11px]", children: [
                  "Fornecedor: ",
                  d.fornecedor
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5", children: d.categoria ? /* @__PURE__ */ jsx("span", { className: "inline-block px-1.5 py-0.5 rounded text-[10px]", style: { background: (d.categoria.cor ?? "#a855f7") + "22", color: d.categoria.cor ?? "#a855f7" }, children: d.categoria.nome }) : /* @__PURE__ */ jsx("span", { className: "text-white/30 text-xs", children: "—" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-white/70 text-xs", children: d.tipo === "condominio" ? ((_a2 = d.condominio) == null ? void 0 : _a2.nome) ?? "Condomínio" : "Empresa" }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-white/60 text-xs", children: ((_b2 = d.conta_bancaria) == null ? void 0 : _b2.nome) ?? "—" }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-right text-white text-sm font-medium", children: formatarKz(d.valor) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsx("span", { className: "inline-block px-2 py-0.5 rounded text-[10px] font-medium", style: { background: cor.bg, color: cor.text }, children: cor.label }) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => setDetalhe(d), title: "Ver detalhe", className: "p-1.5 rounded text-white/50 hover:bg-white/10 hover:text-white", children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }),
                d.estado === "pendente" && !((_c2 = d.condominio) == null ? void 0 : _c2.exige_aprovacao_comissao) && /* @__PURE__ */ jsx("button", { onClick: () => aprovar(d.id), title: "Aprovar", className: "p-1.5 rounded text-cyan-300 hover:bg-cyan-500/10", children: /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }) }),
                d.estado === "pendente" && ((_d = d.condominio) == null ? void 0 : _d.exige_aprovacao_comissao) && /* @__PURE__ */ jsx("span", { title: "Aguarda aprovação da comissão (na app)", className: "p-1.5 text-amber-300/70 text-[10px] uppercase tracking-wide", children: "Comissão" }),
                (d.estado === "aprovada" || d.estado === "pendente" && !((_e = d.condominio) == null ? void 0 : _e.exige_aprovacao_comissao)) && /* @__PURE__ */ jsx("button", { onClick: () => abrirPagamento(d), title: "Marcar paga", className: "p-1.5 rounded text-green-300 hover:bg-green-500/10", children: /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4" }) }),
                (d.estado === "pendente" || d.estado === "aprovada") && /* @__PURE__ */ jsx("button", { onClick: () => abrirEditar(d), title: "Editar", className: "p-1.5 rounded text-white/50 hover:bg-white/10 hover:text-white", children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) }),
                (d.estado === "pendente" || d.estado === "aprovada") && /* @__PURE__ */ jsx("button", { onClick: () => cancelar(d.id), title: "Cancelar", className: "p-1.5 rounded text-orange-300 hover:bg-orange-500/10", children: /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }) }),
                d.estado !== "paga" && /* @__PURE__ */ jsx("button", { onClick: () => eliminar(d.id), title: "Eliminar", className: "p-1.5 rounded text-red-300 hover:bg-red-500/10", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
              ] }) })
            ] }, d.id);
          })
        ] })
      ] }) }),
      despesas.links && despesas.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-1 flex-wrap", children: despesas.links.map((link, i) => /* @__PURE__ */ jsx(
        "button",
        {
          disabled: !link.url,
          onClick: () => link.url && router.visit(link.url, { preserveScroll: true }),
          className: `px-3 py-1 text-xs rounded ${link.active ? "bg-purple-500/20 text-purple-200" : "text-white/60 hover:text-white"} ${!link.url ? "opacity-30 cursor-not-allowed" : ""}`,
          dangerouslySetInnerHTML: { __html: link.label }
        },
        i
      )) })
    ] }),
    modalNova && /* @__PURE__ */ jsx(
      ModalDespesa,
      {
        titulo: "Nova despesa",
        form,
        onSubmit: submitNova,
        onClose: () => setModalNova(false),
        categorias,
        contas,
        condominios,
        submitLabel: "Registar"
      }
    ),
    editandoId !== null && /* @__PURE__ */ jsx(
      ModalDespesa,
      {
        titulo: "Editar despesa",
        form: formEditar,
        onSubmit: submitEditar,
        onClose: () => {
          setEditandoId(null);
          formEditar.reset();
        },
        categorias,
        contas,
        condominios,
        submitLabel: "Guardar"
      }
    ),
    confirmandoPaga && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-green-500/30 rounded-xl p-5 w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-white text-base font-medium", children: "Confirmar pagamento" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setConfirmandoPaga(null), className: "text-white/40 hover:text-white p-1", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/70 mb-3", children: [
        "Vai marcar esta despesa como paga. Isto cria um movimento de ",
        /* @__PURE__ */ jsx("strong", { className: "text-green-300", children: "saída" }),
        " de ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: formatarKz(confirmandoPaga.valor) }),
        " na conta escolhida abaixo."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 mb-4", children: "O saldo da conta será actualizado automaticamente." }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Conta bancária" }),
        /* @__PURE__ */ jsx("select", { value: contaPagamento ?? "", onChange: (e) => setContaPagamento(e.target.value ? parseInt(e.target.value) : null), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white", children: contas.filter((c) => confirmandoPaga.condominio_id == null || c.condominio_id === confirmandoPaga.condominio_id).map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
          c.nome,
          c.principal ? " (principal)" : "",
          " — ",
          c.banco
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Método de pagamento" }),
        /* @__PURE__ */ jsxs("select", { value: metodoPagamento, onChange: (e) => setMetodoPagamento(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white", children: [
          /* @__PURE__ */ jsx("option", { value: "transferencia", children: "Transferência" }),
          /* @__PURE__ */ jsx("option", { value: "deposito", children: "Depósito" }),
          /* @__PURE__ */ jsx("option", { value: "numerario", children: "Numerário" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Comprovativo de pagamento (opcional)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            accept: "image/*,application/pdf",
            onChange: (e) => {
              var _a2;
              return setComprovativo(((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null);
            },
            className: "w-full text-sm text-white/70 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
          }
        ),
        comprovativo && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-white/40", children: comprovativo.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setConfirmandoPaga(null), className: "px-4 py-2 rounded text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10", children: "Cancelar" }),
        /* @__PURE__ */ jsxs("button", { onClick: marcarPaga, className: "px-5 py-2 rounded text-white text-sm font-medium", style: { background: "linear-gradient(135deg, #22c55e, #16a34a)" }, children: [
          /* @__PURE__ */ jsx(Check, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
          " Confirmar pagamento"
        ] })
      ] })
    ] }) }),
    detalhe && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto", onClick: () => setDetalhe(null), children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Detalhe da despesa" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setDetalhe(null), className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-2.5 text-sm", children: [
        /* @__PURE__ */ jsx(Linha, { label: "Descrição", valor: detalhe.descricao }),
        /* @__PURE__ */ jsx(Linha, { label: "Valor", valor: formatarKz(detalhe.valor) }),
        detalhe.fornecedor && /* @__PURE__ */ jsx(Linha, { label: "Fornecedor", valor: detalhe.fornecedor }),
        detalhe.categoria && /* @__PURE__ */ jsx(Linha, { label: "Categoria", valor: detalhe.categoria.nome }),
        detalhe.condominio && /* @__PURE__ */ jsx(Linha, { label: "Condomínio", valor: detalhe.condominio.nome }),
        /* @__PURE__ */ jsx(Linha, { label: "Conta", valor: ((_c = detalhe.conta_bancaria) == null ? void 0 : _c.nome) ?? "—" }),
        /* @__PURE__ */ jsx(Linha, { label: "Data", valor: detalhe.data_despesa }),
        detalhe.criada_por && /* @__PURE__ */ jsx(Linha, { label: "Criada por", valor: detalhe.criada_por.name }),
        detalhe.aprovada_por && /* @__PURE__ */ jsx(Linha, { label: "Aprovada por", valor: `${detalhe.aprovada_por.name}${detalhe.aprovada_em ? " · " + detalhe.aprovada_em : ""}` }),
        detalhe.paga_por && /* @__PURE__ */ jsx(Linha, { label: "Paga por", valor: `${detalhe.paga_por.name}${detalhe.paga_em ? " · " + detalhe.paga_em : ""}` }),
        detalhe.metodo_pagamento && /* @__PURE__ */ jsx(Linha, { label: "Método", valor: detalhe.metodo_pagamento }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pt-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white/50", children: "Comprovativo" }),
          detalhe.comprovativo_path ? /* @__PURE__ */ jsxs("a", { href: `/ficheiros/${detalhe.comprovativo_path}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-cyan-300 hover:underline", children: [
            /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4" }),
            " Abrir comprovativo"
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Sem comprovativo" })
        ] })
      ] })
    ] }) })
  ] });
}
function Linha({ label, valor }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
    /* @__PURE__ */ jsx("span", { className: "text-white/50 shrink-0", children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-white text-right", children: valor })
  ] });
}
function ModalDespesa({ titulo, form, onSubmit, onClose, categorias, contas, condominios, submitLabel }) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-white text-base font-medium", children: titulo }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white p-1", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Tipo" }),
          /* @__PURE__ */ jsxs("select", { value: form.data.tipo, onChange: (e) => form.setData("tipo", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm", children: [
            /* @__PURE__ */ jsx("option", { value: "condominio", children: "Condomínio" }),
            /* @__PURE__ */ jsx("option", { value: "empresa", children: "Empresa" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Data" }),
          /* @__PURE__ */ jsx("input", { type: "date", required: true, value: form.data.data_despesa, onChange: (e) => form.setData("data_despesa", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" })
        ] })
      ] }),
      form.data.tipo === "condominio" && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Condomínio" }),
        /* @__PURE__ */ jsxs("select", { required: true, value: form.data.condominio_id ?? "", onChange: (e) => form.setData("condominio_id", e.target.value ? parseInt(e.target.value) : null), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— escolher —" }),
          condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Categoria" }),
        /* @__PURE__ */ jsxs("select", { required: true, value: form.data.categoria_id ?? "", onChange: (e) => form.setData("categoria_id", e.target.value ? parseInt(e.target.value) : null), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— escolher —" }),
          categorias.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Conta bancária (saída)" }),
        /* @__PURE__ */ jsxs("select", { required: true, value: form.data.conta_bancaria_id ?? "", onChange: (e) => form.setData("conta_bancaria_id", e.target.value ? parseInt(e.target.value) : null), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "— escolher —" }),
          contas.map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
            c.nome,
            c.principal ? " (principal)" : "",
            " — ",
            c.banco
          ] }, c.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Valor (Kz)" }),
        /* @__PURE__ */ jsx("input", { type: "number", required: true, step: "0.01", min: "0", value: form.data.valor, onChange: (e) => form.setData("valor", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Descrição" }),
        /* @__PURE__ */ jsx("input", { type: "text", required: true, maxLength: 500, value: form.data.descricao, onChange: (e) => form.setData("descricao", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Fornecedor (opcional)" }),
        /* @__PURE__ */ jsx("input", { type: "text", maxLength: 200, value: form.data.fornecedor, onChange: (e) => form.setData("fornecedor", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Notas (opcional)" }),
        /* @__PURE__ */ jsx("textarea", { rows: 2, value: form.data.notas, onChange: (e) => form.setData("notas", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 rounded-md text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10", children: "Cancelar" }),
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: form.processing, className: "px-5 py-2 rounded-md text-white text-sm font-medium", style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" }, children: [
          /* @__PURE__ */ jsx(Check, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
          " ",
          form.processing ? "A guardar..." : submitLabel
        ] })
      ] })
    ] })
  ] }) });
}
export {
  DespesasIndex as default
};
