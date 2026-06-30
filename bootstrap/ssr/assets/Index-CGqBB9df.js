import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { ShieldCheck, ArrowLeftRight, Plus, Building2, Star, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, X, Check } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const formatKz = (valor) => {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};
const formatData = (data) => {
  const d = new Date(data);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
};
const ORIGEM_LABELS = {
  manual: { label: "Manual", color: "rgba(255,255,255,0.6)" },
  proxypay: { label: "ProxyPay", color: "#67E8F9" },
  pagamento_aprovado: { label: "Pag. aprov.", color: "#C4B5FD" },
  despesa: { label: "Despesa", color: "#FCA5A5" },
  transferencia: { label: "Transfer.", color: "#7DD3FC" },
  fundo_reserva: { label: "Fundo res.", color: "#86EFAC" }
};
function Index({ condominio, condominios, contas, contaSeleccionadaId, movimentos }) {
  var _a;
  const [modalNovaConta, setModalNovaConta] = useState(false);
  const [modalTransferir, setModalTransferir] = useState(false);
  const [modalReservar, setModalReservar] = useState(false);
  const [editandoConta, setEditandoConta] = useState(null);
  const contaActual = contas.find((c) => c.id === contaSeleccionadaId);
  const formCriar = useForm({
    nome: "",
    banco: "",
    iban: "",
    tipo: "corrente",
    moeda: "AOA",
    saldo_inicial: "",
    principal: contas.length === 0,
    e_fundo_reserva: false,
    aceita_proxypay: true,
    aceita_manual: true,
    instrucoes_pagamento: ""
  });
  const formMovimento = useForm({
    data: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    tipo: "entrada",
    descricao: "",
    valor: ""
  });
  const formTransferir = useForm({
    conta_origem_id: contaSeleccionadaId ?? (((_a = contas[0]) == null ? void 0 : _a.id) ?? null),
    conta_destino_id: null,
    data: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    descricao: "",
    valor: ""
  });
  const formEditar = useForm({
    nome: "",
    banco: "",
    iban: "",
    tipo: "corrente",
    moeda: "AOA",
    saldo_inicial: "",
    principal: false,
    e_fundo_reserva: false,
    aceita_proxypay: true,
    aceita_manual: true,
    instrucoes_pagamento: ""
  });
  const formReservar = useForm({
    conta_origem_id: null,
    data: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    descricao: "",
    valor: ""
  });
  useEffect(() => {
    if (editandoConta !== null) {
      const conta = contas.find((c) => c.id === editandoConta);
      if (conta) {
        formEditar.setData({
          nome: conta.nome,
          banco: conta.banco,
          iban: conta.iban || "",
          tipo: conta.tipo,
          moeda: conta.moeda,
          saldo_inicial: conta.saldo_inicial,
          principal: conta.principal,
          e_fundo_reserva: conta.e_fundo_reserva,
          aceita_proxypay: conta.aceita_proxypay,
          aceita_manual: conta.aceita_manual,
          instrucoes_pagamento: conta.instrucoes_pagamento || ""
        });
      }
    }
  }, [editandoConta]);
  const fecharModalEditar = () => {
    setEditandoConta(null);
    formEditar.reset();
  };
  const submitEditar = (e) => {
    e.preventDefault();
    if (editandoConta === null) return;
    formEditar.put(`/financas/contas-bancarias/${editandoConta}`, {
      preserveScroll: true,
      onSuccess: () => fecharModalEditar()
    });
  };
  const submitCriar = (e) => {
    e.preventDefault();
    formCriar.post("/financas/contas-bancarias", {
      onSuccess: () => {
        setModalNovaConta(false);
        formCriar.reset();
      }
    });
  };
  const submitMovimento = (e) => {
    e.preventDefault();
    if (!contaActual) return;
    formMovimento.post(`/financas/contas-bancarias/${contaActual.id}/movimentos`, {
      preserveScroll: true,
      onSuccess: () => formMovimento.reset("descricao", "valor")
    });
  };
  const submitTransferir = (e) => {
    e.preventDefault();
    formTransferir.post("/financas/contas-bancarias/transferir", {
      preserveScroll: true,
      onSuccess: () => {
        setModalTransferir(false);
        formTransferir.reset("descricao", "valor", "conta_destino_id");
      }
    });
  };
  const contaFundo = contas.find((c) => c.e_fundo_reserva);
  const submitReservar = (e) => {
    e.preventDefault();
    formReservar.post("/financas/contas-bancarias/reservar-fundo", {
      preserveScroll: true,
      onSuccess: () => {
        setModalReservar(false);
        formReservar.reset("descricao", "valor");
      }
    });
  };
  const seleccionarConta = (id) => {
    router.visit(`/financas/contas-bancarias?conta_id=${id}`, { preserveState: false });
  };
  const marcarPrincipal = (conta) => {
    router.patch(`/financas/contas-bancarias/${conta.id}/marcar-principal`, {}, { preserveScroll: true });
  };
  const apagarConta = (conta) => {
    if (!confirm(`Apagar a conta "${conta.nome}"? Todos os movimentos serão eliminados.`)) return;
    router.delete(`/financas/contas-bancarias/${conta.id}`);
  };
  const apagarMovimento = (movId) => {
    if (!confirm("Apagar este movimento? Os saldos serão recalculados.")) return;
    router.delete(`/financas/contas-bancarias/movimentos/${movId}`, { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Contas Bancárias · ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-medium", children: /* @__PURE__ */ jsx("span", { style: { background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }, children: "Contas Bancárias" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1.5", children: [
          /* @__PURE__ */ jsx(
            "select",
            {
              value: condominio.id,
              onChange: (e) => router.post("/financas/contas-bancarias/trocar-condominio", { condominio_id: Number(e.target.value) }, { preserveScroll: true }),
              className: "bg-white/[0.04] border border-white/10 rounded-md text-sm text-white px-3 py-1.5 focus:outline-none focus:border-purple-400/50",
              children: condominios.map((cond) => /* @__PURE__ */ jsx("option", { value: cond.id, className: "bg-[#16163A]", children: cond.nome }, cond.id))
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-white/50", children: [
            "· ",
            contas.length,
            " ",
            contas.length === 1 ? "conta registada" : "contas registadas"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        contaFundo && contas.length >= 2 && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalReservar(true),
            className: "px-4 py-2.5 rounded-md text-white text-sm font-medium bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30",
            children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
              " Reservar fundo"
            ]
          }
        ),
        contas.length >= 2 && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalTransferir(true),
            className: "px-4 py-2.5 rounded-md text-white text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/10",
            children: [
              /* @__PURE__ */ jsx(ArrowLeftRight, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
              " Transferir"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModalNovaConta(true),
            className: "px-5 py-2.5 rounded-md text-white text-sm font-medium",
            style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" },
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
              " Nova conta"
            ]
          }
        )
      ] })
    ] }),
    contas.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-purple-500/15 rounded-xl p-8 text-center", children: [
      /* @__PURE__ */ jsx(Building2, { className: "h-12 w-12 text-purple-400/40 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("div", { className: "text-white font-medium mb-1", children: "Ainda não tens contas bancárias" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mb-4", children: 'Clica em "Nova conta" para registar a primeira conta do condomínio.' })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3 mb-6", children: contas.map((conta) => {
        const isSelected = conta.id === contaSeleccionadaId;
        const saldo = parseFloat(conta.saldo_actual);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => seleccionarConta(conta.id),
            className: "cursor-pointer rounded-xl p-4 transition-all",
            style: {
              background: isSelected ? "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(168,85,247,0.08))" : "rgba(255,255,255,0.03)",
              border: isSelected ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.08)",
              borderLeft: conta.principal ? "3px solid #00D4FF" : void 0
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  conta.principal ? /* @__PURE__ */ jsx("span", { className: "text-[9px] font-medium tracking-wider px-2 py-0.5 rounded-full text-white", style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" }, children: "PRINCIPAL" }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/40 uppercase tracking-wider", children: "Secundária" }),
                  conta.e_fundo_reserva && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-medium tracking-wider px-2 py-0.5 rounded-full text-emerald-200 bg-emerald-500/20 border border-emerald-500/30", children: "FUNDO RESERVA" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
                  !conta.principal && /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        marcarPrincipal(conta);
                      },
                      className: "text-white/40 hover:text-cyan-300 p-0.5",
                      title: "Tornar principal",
                      children: /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        setEditandoConta(conta.id);
                      },
                      className: "text-white/40 hover:text-white p-0.5",
                      title: "Editar",
                      children: /* @__PURE__ */ jsx(Edit, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        apagarConta(conta);
                      },
                      className: "text-white/40 hover:text-red-300 p-0.5",
                      title: "Apagar",
                      children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-white font-medium text-sm", children: [
                conta.banco,
                " · ",
                conta.tipo === "corrente" ? "Corrente" : "Poupança"
              ] }),
              conta.iban && /* @__PURE__ */ jsx("div", { className: "text-[11px] font-mono text-white/40 mt-0.5", children: conta.iban }),
              /* @__PURE__ */ jsxs("div", { className: "text-base font-medium mt-2 mb-2", style: { color: saldo >= 0 ? "#6EE7B7" : "#FCA5A5" }, children: [
                formatKz(conta.saldo_actual),
                " ",
                conta.moeda === "AOA" ? "Kz" : conta.moeda
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-1 flex-wrap", children: [
                /* @__PURE__ */ jsx("span", { className: `text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium ${conta.aceita_proxypay ? "text-cyan-300 bg-cyan-500/15 border border-cyan-500/30" : "text-white/40 bg-white/5 border border-white/10"}`, children: conta.aceita_proxypay ? "ProxyPay" : "ProxyPay off" }),
                /* @__PURE__ */ jsx("span", { className: `text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium ${conta.aceita_manual ? "text-purple-200 bg-purple-500/15 border border-purple-500/30" : "text-white/40 bg-white/5 border border-white/10"}`, children: conta.aceita_manual ? "Manual" : "Manual off" })
              ] })
            ]
          },
          conta.id
        );
      }) }),
      contaActual && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white/[0.02] border border-dashed border-white/10 rounded-lg p-3 mb-5", children: /* @__PURE__ */ jsxs("form", { onSubmit: submitMovimento, children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/70 font-medium mb-2.5", children: [
            /* @__PURE__ */ jsx(Plus, { className: "inline h-3 w-3 mr-1 -mt-0.5" }),
            " Adicionar movimento à conta ",
            /* @__PURE__ */ jsx("span", { className: "text-cyan-300", children: contaActual.banco })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "120px 110px 1fr 130px 100px", gap: "8px" }, children: [
            /* @__PURE__ */ jsx("input", { type: "date", className: "bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white", value: formMovimento.data.data, onChange: (e) => formMovimento.setData("data", e.target.value), required: true, max: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] }),
            /* @__PURE__ */ jsxs("select", { className: "bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white", value: formMovimento.data.tipo, onChange: (e) => formMovimento.setData("tipo", e.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "entrada", children: "Entrada" }),
              /* @__PURE__ */ jsx("option", { value: "saida", children: "Saída" })
            ] }),
            /* @__PURE__ */ jsx("input", { className: "bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white", placeholder: "Descrição (ex: Quota Maio · Fracção 12)", value: formMovimento.data.descricao, onChange: (e) => formMovimento.setData("descricao", e.target.value), required: true }),
            /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", min: "0.01", className: "bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white", placeholder: "Valor (Kz)", value: formMovimento.data.valor, onChange: (e) => formMovimento.setData("valor", e.target.value), required: true }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: formMovimento.processing, className: "rounded-md text-white text-xs font-medium", style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" }, children: formMovimento.processing ? "..." : "Adicionar" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-white text-sm font-medium", children: [
            "Movimentos · ",
            contaActual.banco
          ] }),
          movimentos && /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-white/40", children: [
            movimentos.data.length,
            " de ",
            movimentos.total
          ] })
        ] }),
        !movimentos || movimentos.data.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-white/40 text-sm bg-[#0F0F23] border border-white/5 rounded-lg", children: "Nenhum movimento ainda. Adiciona o primeiro acima." }) : /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-purple-500/15 rounded-xl p-3", children: [
          /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-white/40 text-[10px] uppercase tracking-wider", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left p-2 border-b border-white/10 font-normal", children: "Data" }),
              /* @__PURE__ */ jsx("th", { className: "text-left p-2 border-b border-white/10 font-normal", children: "Tipo" }),
              /* @__PURE__ */ jsx("th", { className: "text-left p-2 border-b border-white/10 font-normal", children: "Descrição" }),
              /* @__PURE__ */ jsx("th", { className: "text-left p-2 border-b border-white/10 font-normal", children: "Origem" }),
              /* @__PURE__ */ jsx("th", { className: "text-right p-2 border-b border-white/10 font-normal", children: "Valor" }),
              /* @__PURE__ */ jsx("th", { className: "text-right p-2 border-b border-white/10 font-normal", children: "Saldo" }),
              /* @__PURE__ */ jsx("th", { className: "border-b border-white/10" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: movimentos.data.map((mov) => {
              const origem = ORIGEM_LABELS[mov.origem_tipo] ?? ORIGEM_LABELS.manual;
              return /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/[0.04]", children: [
                /* @__PURE__ */ jsx("td", { className: "p-2 text-white/75", children: formatData(mov.data) }),
                /* @__PURE__ */ jsx("td", { className: "p-2", children: mov.tipo === "entrada" ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", style: { background: "rgba(34,197,94,0.15)", color: "#86EFAC" }, children: [
                  /* @__PURE__ */ jsx(ArrowDownCircle, { className: "h-3 w-3" }),
                  " ENTRADA"
                ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", style: { background: "rgba(239,68,68,0.15)", color: "#FCA5A5" }, children: [
                  /* @__PURE__ */ jsx(ArrowUpCircle, { className: "h-3 w-3" }),
                  " SAÍDA"
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-white/85", children: mov.descricao }),
                /* @__PURE__ */ jsx("td", { className: "p-2", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider", style: { color: origem.color }, children: origem.label }) }),
                /* @__PURE__ */ jsxs("td", { className: "p-2 text-right font-medium", style: { color: mov.tipo === "entrada" ? "#6EE7B7" : "#FCA5A5" }, children: [
                  mov.tipo === "entrada" ? "+" : "−",
                  formatKz(mov.valor)
                ] }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right text-white/85", children: formatKz(mov.saldo_apos) }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: mov.origem_tipo === "manual" && /* @__PURE__ */ jsx("button", { onClick: () => apagarMovimento(mov.id), className: "px-1.5 py-0.5 rounded text-white/40 hover:text-red-300 hover:bg-red-500/10", title: "Apagar movimento", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) }) })
              ] }, mov.id);
            }) })
          ] }),
          movimentos.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-1 mt-4", children: movimentos.links.map((link, i) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => link.url && router.visit(link.url, { preserveScroll: true }),
              disabled: !link.url,
              className: `px-2 py-1 text-xs rounded ${link.active ? "bg-purple-500/20 text-white" : "text-white/60 hover:text-white hover:bg-white/5"} ${!link.url && "opacity-30 cursor-not-allowed"}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            i
          )) })
        ] })
      ] })
    ] }),
    modalTransferir && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-semibold", children: "Transferir entre contas" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setModalTransferir(false), className: "text-white/40 hover:text-white p-1", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitTransferir, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Conta de origem" }),
          /* @__PURE__ */ jsx("select", { value: formTransferir.data.conta_origem_id ?? "", onChange: (e) => formTransferir.setData("conta_origem_id", e.target.value ? parseInt(e.target.value) : null), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white", children: contas.map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
            c.nome,
            " — ",
            formatKz(c.saldo_actual),
            " ",
            c.moeda
          ] }, c.id)) }),
          formTransferir.errors.conta_origem_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: formTransferir.errors.conta_origem_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Conta de destino" }),
          /* @__PURE__ */ jsxs("select", { value: formTransferir.data.conta_destino_id ?? "", onChange: (e) => formTransferir.setData("conta_destino_id", e.target.value ? parseInt(e.target.value) : null), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white", children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "— Escolher —" }),
            contas.filter((c) => c.id !== formTransferir.data.conta_origem_id).map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
              c.nome,
              " — ",
              formatKz(c.saldo_actual),
              " ",
              c.moeda
            ] }, c.id))
          ] }),
          formTransferir.errors.conta_destino_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: formTransferir.errors.conta_destino_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Valor" }),
            /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", min: "0.01", value: formTransferir.data.valor, onChange: (e) => formTransferir.setData("valor", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" }),
            formTransferir.errors.valor && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: formTransferir.errors.valor })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Data" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: formTransferir.data.data, onChange: (e) => formTransferir.setData("data", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Descrição (opcional)" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: formTransferir.data.descricao, onChange: (e) => formTransferir.setData("descricao", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white", placeholder: "Ex: Reforço do fundo de reserva" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModalTransferir(false), className: "px-4 py-2 rounded text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: formTransferir.processing, className: "px-5 py-2 rounded text-white text-sm font-medium disabled:opacity-50", style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" }, children: [
            /* @__PURE__ */ jsx(ArrowLeftRight, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
            " ",
            formTransferir.processing ? "A transferir..." : "Transferir"
          ] })
        ] })
      ] })
    ] }) }),
    modalReservar && contaFundo && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-emerald-500/30 rounded-xl p-5 w-full max-w-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-semibold", children: "Reservar para o Fundo de Reserva" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setModalReservar(false), className: "text-white/40 hover:text-white p-1", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50 mb-3", children: [
        "Move um valor para a conta do fundo de reserva: ",
        /* @__PURE__ */ jsx("strong", { className: "text-emerald-300", children: contaFundo.nome }),
        "."
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitReservar, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Conta de origem" }),
          /* @__PURE__ */ jsxs("select", { value: formReservar.data.conta_origem_id ?? "", onChange: (e) => formReservar.setData("conta_origem_id", e.target.value ? parseInt(e.target.value) : null), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white", children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "— Escolher —" }),
            contas.filter((c) => c.id !== contaFundo.id).map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
              c.nome,
              " — ",
              formatKz(c.saldo_actual),
              " ",
              c.moeda
            ] }, c.id))
          ] }),
          formReservar.errors.conta_origem_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: formReservar.errors.conta_origem_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Valor" }),
            /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", min: "0.01", value: formReservar.data.valor, onChange: (e) => formReservar.setData("valor", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" }),
            formReservar.errors.valor && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: formReservar.errors.valor })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Data" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: formReservar.data.data, onChange: (e) => formReservar.setData("data", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-1", children: "Descrição (opcional)" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: formReservar.data.descricao, onChange: (e) => formReservar.setData("descricao", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white", placeholder: "Ex: Reserva de Junho" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModalReservar(false), className: "px-4 py-2 rounded text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: formReservar.processing, className: "px-5 py-2 rounded text-white text-sm font-medium disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
            " ",
            formReservar.processing ? "A reservar..." : "Reservar"
          ] })
        ] })
      ] })
    ] }) }),
    modalNovaConta && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-white text-base font-medium", children: "Nova conta bancária" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setModalNovaConta(false), className: "text-white/40 hover:text-white p-1", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitCriar, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-white/60 block mb-1", children: "Nome" }),
            /* @__PURE__ */ jsx("input", { className: "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white", placeholder: "ex: Conta Principal BAI", value: formCriar.data.nome, onChange: (e) => formCriar.setData("nome", e.target.value), required: true }),
            formCriar.errors.nome && /* @__PURE__ */ jsx("span", { className: "text-red-400 text-xs", children: formCriar.errors.nome })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-white/60 block mb-1", children: "Banco" }),
            /* @__PURE__ */ jsx("input", { className: "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white", placeholder: "BAI, BFA, BIC...", value: formCriar.data.banco, onChange: (e) => formCriar.setData("banco", e.target.value), required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-white/60 block mb-1", children: "IBAN (opcional)" }),
            /* @__PURE__ */ jsx("input", { className: "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white font-mono", placeholder: "AO06 ...", value: formCriar.data.iban, onChange: (e) => formCriar.setData("iban", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-white/60 block mb-1", children: "Tipo" }),
            /* @__PURE__ */ jsxs("select", { className: "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white", value: formCriar.data.tipo, onChange: (e) => formCriar.setData("tipo", e.target.value), children: [
              /* @__PURE__ */ jsx("option", { value: "corrente", children: "Corrente" }),
              /* @__PURE__ */ jsx("option", { value: "poupanca", children: "Poupança" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-white/60 block mb-1", children: "Moeda" }),
            /* @__PURE__ */ jsx("input", { className: "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white", value: formCriar.data.moeda, onChange: (e) => formCriar.setData("moeda", e.target.value), maxLength: 3 })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-white/60 block mb-1", children: "Saldo inicial (Kz)" }),
            /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", className: "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white", placeholder: "0,00", value: formCriar.data.saldo_inicial, onChange: (e) => formCriar.setData("saldo_inicial", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/[0.02] border border-purple-500/20 rounded-lg p-3", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-white/70 mb-2 font-medium", children: "Configuração de pagamentos" }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80 mb-2 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: formCriar.data.principal, onChange: (e) => formCriar.setData("principal", e.target.checked), className: "accent-purple-500" }),
            "Marcar como conta principal"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80 mb-2 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: formCriar.data.e_fundo_reserva, onChange: (e) => formCriar.setData("e_fundo_reserva", e.target.checked), className: "accent-emerald-500" }),
            "Conta do Fundo de Reserva"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80 mb-2 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: formCriar.data.aceita_proxypay, onChange: (e) => formCriar.setData("aceita_proxypay", e.target.checked), className: "accent-purple-500" }),
            "Recebe pagamentos ProxyPay"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80 mb-3 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: formCriar.data.aceita_manual, onChange: (e) => formCriar.setData("aceita_manual", e.target.checked), className: "accent-purple-500" }),
            "Aceita transferências/depósitos manuais"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider text-white/60 block mb-1", children: "Instruções aos condóminos (opcional)" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white",
                rows: 2,
                placeholder: "ex: Faça transferência para AO06... e envie comprovativo na app",
                value: formCriar.data.instrucoes_pagamento,
                onChange: (e) => formCriar.setData("instrucoes_pagamento", e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setModalNovaConta(false), className: "px-4 py-2 rounded-md text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: formCriar.processing, className: "px-5 py-2 rounded-md text-white text-sm font-medium", style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" }, children: [
            /* @__PURE__ */ jsx(Check, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
            formCriar.processing ? "A criar..." : "Criar conta"
          ] })
        ] })
      ] })
    ] }) }),
    editandoConta !== null && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center p-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0F0F23] border border-purple-500/30 rounded-xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-white text-base font-medium", children: "Editar conta bancária" }),
        /* @__PURE__ */ jsx("button", { onClick: fecharModalEditar, className: "text-white/40 hover:text-white p-1", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitEditar, className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Nome" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: formEditar.data.nome, onChange: (e) => formEditar.setData("nome", e.target.value), required: true, className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Banco" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: formEditar.data.banco, onChange: (e) => formEditar.setData("banco", e.target.value), required: true, className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "IBAN (opcional)" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: formEditar.data.iban, onChange: (e) => formEditar.setData("iban", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Tipo" }),
            /* @__PURE__ */ jsxs("select", { value: formEditar.data.tipo, onChange: (e) => formEditar.setData("tipo", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50", children: [
              /* @__PURE__ */ jsx("option", { value: "corrente", children: "Corrente" }),
              /* @__PURE__ */ jsx("option", { value: "poupanca", children: "Poupança" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Moeda" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: formEditar.data.moeda, onChange: (e) => formEditar.setData("moeda", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Saldo inicial (Kz)" }),
            /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", value: formEditar.data.saldo_inicial, onChange: (e) => formEditar.setData("saldo_inicial", e.target.value), className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-white/10 rounded-md p-3 space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/60 uppercase tracking-wider", children: "Configuração de pagamentos" }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/90", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: formEditar.data.principal, onChange: (e) => formEditar.setData("principal", e.target.checked), className: "rounded" }),
            "Marcar como conta principal"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/90", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: formEditar.data.e_fundo_reserva, onChange: (e) => formEditar.setData("e_fundo_reserva", e.target.checked), className: "rounded" }),
            "Conta do Fundo de Reserva"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/90", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: formEditar.data.aceita_proxypay, onChange: (e) => formEditar.setData("aceita_proxypay", e.target.checked), className: "rounded" }),
            "Recebe pagamentos ProxyPay"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/90", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: formEditar.data.aceita_manual, onChange: (e) => formEditar.setData("aceita_manual", e.target.checked), className: "rounded" }),
            "Aceita transferências/depósitos manuais"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-white/60 uppercase tracking-wider mb-1 block", children: "Instruções aos condóminos (opcional)" }),
          /* @__PURE__ */ jsx("textarea", { value: formEditar.data.instrucoes_pagamento, onChange: (e) => formEditar.setData("instrucoes_pagamento", e.target.value), placeholder: "ex: Faça transferência para AO06... e envie comprovativo na app", rows: 2, className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-purple-500/50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: fecharModalEditar, className: "px-4 py-2 rounded-md text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: formEditar.processing, className: "px-5 py-2 rounded-md text-white text-sm font-medium", style: { background: "linear-gradient(135deg, #00D4FF, #A855F7)" }, children: [
            /* @__PURE__ */ jsx(Check, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
            formEditar.processing ? "A guardar..." : "Guardar alterações"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Index as default
};
