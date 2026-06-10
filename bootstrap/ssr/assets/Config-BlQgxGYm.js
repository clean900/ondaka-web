import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-CLWcivhb.js";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { DollarSign, Layers, Calendar, Clock, Settings, Save, Plus, Pencil, Trash2, Receipt, X } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Config({ config, escaloes: initialEscaloes }) {
  var _a;
  const [tab, setTab] = useState("preco_base");
  const [escaloes, setEscaloes] = useState(initialEscaloes);
  const [editingEscalao, setEditingEscalao] = useState(null);
  const [showEscalaoModal, setShowEscalaoModal] = useState(false);
  const [savingMessage, setSavingMessage] = useState(null);
  const getCsrf = () => {
    var _a2;
    return ((_a2 = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a2.content) || "";
  };
  const updateConfig = async (chave, valor) => {
    try {
      const r = await fetch(`/super-admin/subscricoes-config/config/${chave}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf()
        },
        credentials: "same-origin",
        body: JSON.stringify({ valor })
      });
      if (r.ok) {
        setSavingMessage("Guardado ✓");
        setTimeout(() => setSavingMessage(null), 2e3);
      } else {
        setSavingMessage("Erro ao guardar");
        setTimeout(() => setSavingMessage(null), 3e3);
      }
    } catch {
      setSavingMessage("Erro de ligação");
      setTimeout(() => setSavingMessage(null), 3e3);
    }
  };
  const eliminarEscalao = async (escalao) => {
    if (!confirm(`Eliminar escalão "${escalao.nome}"?`)) return;
    try {
      const r = await fetch(`/super-admin/subscricoes-config/escaloes/${escalao.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf()
        },
        credentials: "same-origin"
      });
      if (r.ok) {
        setEscaloes(escaloes.filter((e) => e.id !== escalao.id));
      }
    } catch {
      alert("Erro ao eliminar.");
    }
  };
  return /* @__PURE__ */ jsxs(
    AuthenticatedLayout,
    {
      header: /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold leading-tight text-zinc-100", children: [
        /* @__PURE__ */ jsx(Settings, { className: "mr-2 inline h-5 w-5" }),
        "Configuração de Subscrições"
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Subscrições - Configuração" }),
        /* @__PURE__ */ jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex gap-2 border-b border-zinc-800", children: [
            /* @__PURE__ */ jsx(TabButton, { active: tab === "preco_base", onClick: () => setTab("preco_base"), icon: /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4" }), children: "Preço Base" }),
            /* @__PURE__ */ jsx(TabButton, { active: tab === "escaloes", onClick: () => setTab("escaloes"), icon: /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4" }), children: "Descontos por Quantidade" }),
            /* @__PURE__ */ jsx(TabButton, { active: tab === "periodos", onClick: () => setTab("periodos"), icon: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }), children: "Descontos por Período" }),
            /* @__PURE__ */ jsx(TabButton, { active: tab === "trial_imposto", onClick: () => setTab("trial_imposto"), icon: /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }), children: "Trial e Imposto" })
          ] }),
          savingMessage && /* @__PURE__ */ jsx("div", { className: "mb-4 rounded bg-cyan-500/10 px-3 py-2 text-sm text-cyan-400", children: savingMessage }),
          tab === "preco_base" && /* @__PURE__ */ jsx(TabPrecoBase, { config, onUpdate: updateConfig }),
          tab === "escaloes" && /* @__PURE__ */ jsx(
            TabEscaloes,
            {
              escaloes,
              precoBase: parseFloat(((_a = config.preco_base_imovel_mes) == null ? void 0 : _a.valor) || "0"),
              onEdit: (esc) => {
                setEditingEscalao(esc);
                setShowEscalaoModal(true);
              },
              onNew: () => {
                setEditingEscalao(null);
                setShowEscalaoModal(true);
              },
              onDelete: eliminarEscalao
            }
          ),
          tab === "periodos" && /* @__PURE__ */ jsx(TabPeriodos, { config, onUpdate: updateConfig }),
          tab === "trial_imposto" && /* @__PURE__ */ jsx(TabTrialImposto, { config, onUpdate: updateConfig })
        ] }) }),
        showEscalaoModal && /* @__PURE__ */ jsx(
          EscalaoModal,
          {
            escalao: editingEscalao,
            onClose: () => {
              setShowEscalaoModal(false);
              setEditingEscalao(null);
            },
            onSaved: (novo) => {
              if (editingEscalao) {
                setEscaloes(escaloes.map((e) => e.id === novo.id ? novo : e));
              } else {
                setEscaloes([...escaloes, novo].sort((a, b) => a.ordem - b.ordem));
              }
              setShowEscalaoModal(false);
              setEditingEscalao(null);
            }
          }
        )
      ]
    }
  );
}
function TabButton({ active, onClick, icon, children }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: `flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${active ? "border-cyan-500 text-cyan-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`,
      children: [
        icon,
        children
      ]
    }
  );
}
function TabPrecoBase({ config, onUpdate }) {
  var _a;
  const [valor, setValor] = useState(((_a = config.preco_base_imovel_mes) == null ? void 0 : _a.valor) || "0");
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
    /* @__PURE__ */ jsxs("h3", { className: "mb-4 flex items-center gap-2 text-lg font-medium text-zinc-100", children: [
      /* @__PURE__ */ jsx(DollarSign, { className: "h-5 w-5 text-cyan-400" }),
      "Preço Base"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-zinc-400", children: "Este é o ponto de partida. Os descontos são aplicados sobre este valor." }),
    /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-zinc-200", children: "Preço por imóvel / mês (Kz)" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          value: valor,
          onChange: (e) => setValor(e.target.value),
          className: "w-48 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white",
          step: "0.01"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onUpdate("preco_base_imovel_mes", valor),
          className: "flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500",
          children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            "Guardar"
          ]
        }
      )
    ] })
  ] });
}
function TabEscaloes({ escaloes, precoBase, onEdit, onNew, onDelete }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-lg font-medium text-zinc-100", children: [
          /* @__PURE__ */ jsx(Layers, { className: "h-5 w-5 text-purple-400" }),
          "Descontos por Quantidade de Imóveis"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-zinc-400", children: [
          "Cada escalão aplica um desconto % sobre o preço base (",
          precoBase,
          " Kz/imóvel)."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: onNew, className: "flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "Novo escalão"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "border-b border-zinc-800", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400", children: "Nome" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400", children: "Imóveis" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400", children: "Desconto" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400", children: "Preço final" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400", children: "Estado" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-2" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-zinc-800", children: escaloes.map((e) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-zinc-850", children: [
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-3 text-sm text-zinc-100", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium", children: e.nome }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-500", children: e.slug })
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-3 text-sm text-zinc-300", children: [
          e.min_fraccoes,
          " - ",
          e.max_fraccoes ?? "∞"
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-3 text-sm text-cyan-400", children: [
          e.desconto_pct,
          "%"
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-3 text-sm text-zinc-300", children: [
          (precoBase * (1 - e.desconto_pct / 100)).toFixed(2),
          " Kz"
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-sm", children: e.activo ? /* @__PURE__ */ jsx("span", { className: "rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400", children: "Activo" }) : /* @__PURE__ */ jsx("span", { className: "rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400", children: "Inactivo" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => onEdit(e), className: "rounded p-1.5 text-cyan-400 hover:bg-cyan-500/10", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => onDelete(e), className: "rounded p-1.5 text-red-400 hover:bg-red-500/10", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }) })
      ] }, e.id)) })
    ] })
  ] });
}
function TabPeriodos({ config, onUpdate }) {
  var _a, _b, _c;
  const [mensal, setMensal] = useState(((_a = config.desconto_periodo_mensal_pct) == null ? void 0 : _a.valor) || "0");
  const [semestral, setSemestral] = useState(((_b = config.desconto_periodo_semestral_pct) == null ? void 0 : _b.valor) || "0");
  const [anual, setAnual] = useState(((_c = config.desconto_periodo_anual_pct) == null ? void 0 : _c.valor) || "0");
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
    /* @__PURE__ */ jsxs("h3", { className: "mb-2 flex items-center gap-2 text-lg font-medium text-zinc-100", children: [
      /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5 text-blue-400" }),
      "Descontos por Período"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-zinc-400", children: "% de desconto aplicado ao subtotal conforme periodicidade escolhida." }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx(PercentInput, { label: "Mensal (1 mês)", value: mensal, onChange: setMensal, onSave: () => onUpdate("desconto_periodo_mensal_pct", mensal) }),
      /* @__PURE__ */ jsx(PercentInput, { label: "Semestral (6 meses)", value: semestral, onChange: setSemestral, onSave: () => onUpdate("desconto_periodo_semestral_pct", semestral) }),
      /* @__PURE__ */ jsx(PercentInput, { label: "Anual (12 meses)", value: anual, onChange: setAnual, onSave: () => onUpdate("desconto_periodo_anual_pct", anual) })
    ] })
  ] });
}
function TabTrialImposto({ config, onUpdate }) {
  var _a, _b, _c, _d;
  const [trialDias, setTrialDias] = useState(((_a = config.trial_duracao_dias) == null ? void 0 : _a.valor) || "14");
  const [impostoTipo, setImpostoTipo] = useState(((_b = config.imposto_tipo) == null ? void 0 : _b.valor) || "IVA");
  const [impostoTaxa, setImpostoTaxa] = useState(((_c = config.imposto_taxa_pct) == null ? void 0 : _c.valor) || "14");
  const [impostoAplicavel, setImpostoAplicavel] = useState(((_d = config.imposto_aplicavel) == null ? void 0 : _d.valor) === "1");
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "mb-4 flex items-center gap-2 text-lg font-medium text-zinc-100", children: [
        /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-orange-400" }),
        "Período de Trial"
      ] }),
      /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm text-zinc-200", children: "Duração do trial (dias)" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: trialDias,
            onChange: (e) => setTrialDias(e.target.value),
            className: "w-32 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white",
            min: "1"
          }
        ),
        /* @__PURE__ */ jsxs("button", { onClick: () => onUpdate("trial_duracao_dias", trialDias), className: "flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500", children: [
          /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
          "Guardar"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-zinc-500", children: "Após este período, sem pagamento o cliente entra em modo limitado (extracto + pagar)." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "mb-4 flex items-center gap-2 text-lg font-medium text-zinc-100", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5 text-green-400" }),
        "Imposto sobre subscrições"
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "mb-2 flex cursor-pointer items-center gap-2 text-sm text-zinc-200", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: impostoAplicavel,
            onChange: (e) => {
              setImpostoAplicavel(e.target.checked);
              onUpdate("imposto_aplicavel", e.target.checked ? "1" : "0");
            },
            className: "rounded border-zinc-600 bg-zinc-900 text-cyan-500"
          }
        ),
        "Aplicar imposto às facturas"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm text-zinc-200", children: "Tipo de imposto" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: impostoTipo,
                onChange: (e) => setImpostoTipo(e.target.value),
                placeholder: "IVA, IPC, etc.",
                className: "flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white",
                maxLength: 10
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: () => onUpdate("imposto_tipo", impostoTipo), className: "flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white hover:bg-cyan-500", children: /* @__PURE__ */ jsx(Save, { className: "h-3 w-3" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm text-zinc-200", children: "Taxa (%)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: impostoTaxa,
                onChange: (e) => setImpostoTaxa(e.target.value),
                className: "flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white",
                step: "0.01",
                min: "0",
                max: "100"
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: () => onUpdate("imposto_taxa_pct", impostoTaxa), className: "flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white hover:bg-cyan-500", children: /* @__PURE__ */ jsx(Save, { className: "h-3 w-3" }) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function PercentInput({ label, value, onChange, onSave }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3", children: [
    /* @__PURE__ */ jsx("label", { className: "flex-1 text-sm text-zinc-200", children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "number",
        value,
        onChange: (e) => onChange(e.target.value),
        className: "w-24 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-right text-white",
        step: "0.01",
        min: "0",
        max: "100"
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-400", children: "%" }),
    /* @__PURE__ */ jsxs("button", { onClick: onSave, className: "flex items-center gap-1 rounded bg-cyan-600 px-3 py-1 text-xs text-white hover:bg-cyan-500", children: [
      /* @__PURE__ */ jsx(Save, { className: "h-3 w-3" }),
      "Guardar"
    ] })
  ] });
}
function EscalaoModal({ escalao, onClose, onSaved }) {
  var _a, _b, _c, _d;
  const [slug, setSlug] = useState((escalao == null ? void 0 : escalao.slug) || "");
  const [nome, setNome] = useState((escalao == null ? void 0 : escalao.nome) || "");
  const [descricao, setDescricao] = useState((escalao == null ? void 0 : escalao.descricao) || "");
  const [minFraccoes, setMinFraccoes] = useState(((_a = escalao == null ? void 0 : escalao.min_fraccoes) == null ? void 0 : _a.toString()) || "1");
  const [maxFraccoes, setMaxFraccoes] = useState(((_b = escalao == null ? void 0 : escalao.max_fraccoes) == null ? void 0 : _b.toString()) || "");
  const [descontoPct, setDescontoPct] = useState(((_c = escalao == null ? void 0 : escalao.desconto_pct) == null ? void 0 : _c.toString()) || "0");
  const [corBadge, setCorBadge] = useState((escalao == null ? void 0 : escalao.cor_badge) || "c-blue");
  const [ordem, setOrdem] = useState(((_d = escalao == null ? void 0 : escalao.ordem) == null ? void 0 : _d.toString()) || "1");
  const [activo, setActivo] = useState((escalao == null ? void 0 : escalao.activo) ?? true);
  const [saving, setSaving] = useState(false);
  const getCsrf = () => {
    var _a2;
    return ((_a2 = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a2.content) || "";
  };
  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = escalao ? `/super-admin/subscricoes-config/escaloes/${escalao.id}` : `/super-admin/subscricoes-config/escaloes`;
      const method = escalao ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf()
        },
        credentials: "same-origin",
        body: JSON.stringify({
          slug,
          nome,
          descricao: descricao || null,
          min_fraccoes: parseInt(minFraccoes),
          max_fraccoes: maxFraccoes ? parseInt(maxFraccoes) : null,
          desconto_pct: parseFloat(descontoPct),
          cor_badge: corBadge,
          ordem: parseInt(ordem),
          activo
        })
      });
      const data = await r.json();
      if (r.ok && data.success) {
        onSaved(data.escalao);
      } else {
        alert(data.message || "Erro ao guardar.");
      }
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { onClick: onClose, className: "fixed inset-0 z-40 bg-black/60" }),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl", children: [
      /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between border-b border-zinc-800 px-6 py-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white", children: escalao ? "Editar Escalão" : "Novo Escalão" }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: guardar, className: "space-y-4 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-zinc-200", children: "Slug *" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: slug, onChange: (e) => setSlug(e.target.value), required: true, maxLength: 50, className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-zinc-200", children: "Nome *" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: nome, onChange: (e) => setNome(e.target.value), required: true, maxLength: 100, className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-zinc-200", children: "Descrição" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: descricao, onChange: (e) => setDescricao(e.target.value), className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-zinc-200", children: "Min imóveis *" }),
            /* @__PURE__ */ jsx("input", { type: "number", value: minFraccoes, onChange: (e) => setMinFraccoes(e.target.value), required: true, min: "1", className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-zinc-200", children: "Max (vazio = ∞)" }),
            /* @__PURE__ */ jsx("input", { type: "number", value: maxFraccoes, onChange: (e) => setMaxFraccoes(e.target.value), min: "1", className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-zinc-200", children: "Desconto %" }),
            /* @__PURE__ */ jsx("input", { type: "number", value: descontoPct, onChange: (e) => setDescontoPct(e.target.value), required: true, min: "0", max: "100", step: "0.01", className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-zinc-200", children: "Cor badge" }),
            /* @__PURE__ */ jsxs("select", { value: corBadge, onChange: (e) => setCorBadge(e.target.value), className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white", children: [
              /* @__PURE__ */ jsx("option", { value: "c-teal", children: "Teal" }),
              /* @__PURE__ */ jsx("option", { value: "c-blue", children: "Azul" }),
              /* @__PURE__ */ jsx("option", { value: "c-purple", children: "Púrpura" }),
              /* @__PURE__ */ jsx("option", { value: "c-amber", children: "Âmbar" }),
              /* @__PURE__ */ jsx("option", { value: "c-pink", children: "Rosa" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm text-zinc-200", children: "Ordem" }),
            /* @__PURE__ */ jsx("input", { type: "number", value: ordem, onChange: (e) => setOrdem(e.target.value), required: true, min: "0", className: "w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm text-zinc-200", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: activo, onChange: (e) => setActivo(e.target.checked), className: "rounded border-zinc-600 bg-zinc-900 text-cyan-500" }),
            "Activo"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 border-t border-zinc-800 pt-4", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: saving, className: "flex items-center gap-2 rounded bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500 disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            saving ? "A guardar..." : "Guardar"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Config as default
};
