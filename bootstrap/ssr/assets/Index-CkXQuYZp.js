import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { Head, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import { FileBarChart, LayoutGrid, Plus, GripVertical, X, Download, Check, FileText, Mail, Clock, Trash2 } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const PERIODOS = [
  { v: 3, label: "3 meses" },
  { v: 6, label: "6 meses" },
  { v: 12, label: "12 meses" },
  { v: 24, label: "24 meses" }
];
function Index({ condominios, seccoes, blocos, agendados }) {
  var _a;
  const [titulo, setTitulo] = useState("");
  const [condominioId, setCondominioId] = useState("");
  const [meses, setMeses] = useState(12);
  const [selecionadas, setSelecionadas] = useState(seccoes.map((s) => s.slug));
  const [destinatarios, setDestinatarios] = useState("");
  const [frequencia, setFrequencia] = useState("mensal");
  const [dia, setDia] = useState(1);
  const toggle = (slug) => setSelecionadas((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  const podeGerar = selecionadas.length > 0;
  const gerar = () => {
    const params = new URLSearchParams();
    if (titulo) params.set("titulo", titulo);
    if (condominioId) params.set("condominio_id", condominioId);
    params.set("meses", String(meses));
    selecionadas.forEach((s) => params.append("seccoes[]", s));
    window.open(`/relatorios/gerar?${params.toString()}`, "_blank");
  };
  const agendar = () => {
    if (!podeGerar || !destinatarios.trim()) return;
    router.post("/relatorios/agendar", {
      titulo,
      condominio_id: condominioId || null,
      meses,
      seccoes: selecionadas,
      frequencia,
      dia,
      destinatarios
    }, { preserveScroll: true, onSuccess: () => setDestinatarios("") });
  };
  const removerAgendamento = (id) => {
    if (!confirm("Remover este agendamento?")) return;
    router.delete(`/relatorios/agendar/${id}`, { preserveScroll: true });
  };
  const nomeCond = (id) => {
    var _a2;
    return id ? ((_a2 = condominios.find((c) => c.id === id)) == null ? void 0 : _a2.nome) ?? "—" : "Todos";
  };
  const [tituloGeral, setTituloGeral] = useState("");
  const [layout, setLayout] = useState([]);
  const [aGerar, setAGerar] = useState(false);
  const keyRef = useRef(1);
  const dragIndex = useRef(null);
  const addBloco = (tipo) => setLayout((l) => [...l, { key: keyRef.current++, tipo, titulo: tipo === "titulo" ? "Nova secção" : void 0 }]);
  const removerBloco = (key) => setLayout((l) => l.filter((b) => b.key !== key));
  const setTituloBloco = (key, v) => setLayout((l) => l.map((b) => b.key === key ? { ...b, titulo: v } : b));
  const onDragStart = (i) => {
    dragIndex.current = i;
  };
  const onDragOverItem = (e, i) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) return;
    setLayout((l) => {
      const copy = [...l];
      const [moved] = copy.splice(from, 1);
      copy.splice(i, 0, moved);
      return copy;
    });
    dragIndex.current = i;
  };
  const nomeBloco = (tipo) => {
    var _a2;
    return ((_a2 = blocos.find((b) => b.slug === tipo)) == null ? void 0 : _a2.nome) ?? tipo;
  };
  const gerarConstrutor = async () => {
    var _a2;
    if (layout.length === 0 || aGerar) return;
    setAGerar(true);
    try {
      const cookie = (_a2 = document.cookie.split("; ").find((r) => r.startsWith("XSRF-TOKEN="))) == null ? void 0 : _a2.split("=")[1];
      const res = await fetch("/relatorios/construtor", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/pdf",
          "X-XSRF-TOKEN": cookie ? decodeURIComponent(cookie) : ""
        },
        body: JSON.stringify({
          titulo: tituloGeral || null,
          condominio_id: condominioId || null,
          meses,
          blocos: JSON.stringify(layout.map((b) => ({ tipo: b.tipo, titulo: b.titulo ?? null })))
        })
      });
      if (!res.ok) throw new Error("falhou");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Não foi possível gerar o relatório.");
    } finally {
      setAGerar(false);
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Relatórios Personalizados" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-11 h-11 rounded-xl flex items-center justify-center",
          style: { background: "rgba(168,85,247,0.12)", border: "0.5px solid rgba(168,85,247,0.3)" },
          children: /* @__PURE__ */ jsx(FileBarChart, { className: "w-5 h-5 text-[#A855F7]" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white tracking-tight", children: "Relatórios Personalizados" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Escolha as secções, o período e o condomínio, e gere um relatório PDF à medida." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsx(LayoutGrid, { className: "w-4 h-4 text-[#A855F7]" }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wider", children: "Construtor visual" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50 mb-4", children: [
        "Adicione blocos (clique na paleta) e ",
        /* @__PURE__ */ jsx("strong", { children: "arraste para reordenar" }),
        ". Usa o período e o condomínio escolhidos abaixo."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/40 uppercase tracking-wider mb-2", children: "Blocos disponíveis" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: blocos.map((b) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => addBloco(b.slug),
              className: "w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-left transition",
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: b.nome }),
                /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5 text-white/40" })
              ]
            },
            b.slug
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-white/40 uppercase tracking-wider", children: [
              "Layout do relatório (",
              layout.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: tituloGeral,
                onChange: (e) => setTituloGeral(e.target.value),
                placeholder: "Título do relatório",
                className: "input !py-1 !text-xs max-w-[200px]"
              }
            )
          ] }),
          layout.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed border-white/15 p-8 text-center text-white/40 text-sm", children: "Adicione blocos da paleta para montar o relatório." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: layout.map((b, i) => /* @__PURE__ */ jsxs(
            "div",
            {
              draggable: true,
              onDragStart: () => onDragStart(i),
              onDragOver: (e) => onDragOverItem(e, i),
              onDragEnd: () => {
                dragIndex.current = null;
              },
              className: "flex items-center gap-2 p-2.5 rounded-lg border border-white/10 bg-white/[0.04] cursor-move",
              children: [
                /* @__PURE__ */ jsx(GripVertical, { className: "w-4 h-4 text-white/30 flex-shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] text-white/40 w-5", children: i + 1 }),
                b.tipo === "titulo" ? /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: b.titulo ?? "",
                    onChange: (e) => setTituloBloco(b.key, e.target.value),
                    onDragStart: (e) => e.preventDefault(),
                    placeholder: "Texto do título",
                    className: "flex-1 bg-transparent border-b border-white/10 text-sm text-white focus:outline-none focus:border-[#A855F7]"
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm text-white", children: nomeBloco(b.tipo) }),
                /* @__PURE__ */ jsx("button", { onClick: () => removerBloco(b.key), className: "text-white/40 hover:text-red-400 flex-shrink-0", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
              ]
            },
            b.key
          )) }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: gerarConstrutor,
              disabled: layout.length === 0 || aGerar,
              className: "mt-4 inline-flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed",
              style: { background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)" },
              children: [
                /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
                aGerar ? "A gerar..." : "Gerar PDF do construtor"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 card", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wider mb-4", children: "Secções a incluir" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6", children: seccoes.map((s) => {
          const on = selecionadas.includes(s.slug);
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => toggle(s.slug),
              className: `flex items-center gap-2.5 p-3 rounded-lg border text-left transition ${on ? "border-[#A855F7]/50 bg-[#A855F7]/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`,
              children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${on ? "bg-[#A855F7]" : "bg-white/10"}`,
                    children: on && /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-white" })
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: s.nome })
              ]
            },
            s.slug
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "Título (opcional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: titulo,
                onChange: (e) => setTitulo(e.target.value),
                placeholder: "Relatório Personalizado",
                className: "input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "Condomínio" }),
            /* @__PURE__ */ jsxs("select", { value: condominioId, onChange: (e) => setCondominioId(e.target.value), className: "input", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
              condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "Período" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: PERIODOS.map((p) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setMeses(p.v),
              className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${meses === p.v ? "bg-gradient-to-r from-[#00D4FF] to-[#A855F7] text-white" : "bg-white/5 text-white/60 hover:text-white"}`,
              children: p.label
            },
            p.v
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-white/60" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white/80", children: "Resumo" })
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "text-sm text-white/60 space-y-1.5 mb-4 flex-1", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "Secções: ",
            /* @__PURE__ */ jsx("span", { className: "text-white", children: selecionadas.length })
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Período: ",
            /* @__PURE__ */ jsxs("span", { className: "text-white", children: [
              "últimos ",
              meses,
              " meses"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Âmbito: ",
            /* @__PURE__ */ jsx("span", { className: "text-white", children: condominioId ? (_a = condominios.find((c) => String(c.id) === condominioId)) == null ? void 0 : _a.nome : "Todos os condomínios" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: gerar,
            disabled: !podeGerar,
            className: "inline-flex items-center justify-center gap-2 text-sm py-2.5 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed",
            style: { background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)" },
            children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              "Gerar PDF"
            ]
          }
        ),
        !podeGerar && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-white/40 mt-2 text-center", children: "Escolha pelo menos uma secção." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card mt-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-[#00D4FF]" }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white/80 uppercase tracking-wider", children: "Agendar envio por email" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mb-4", children: "Usa as secções, período, condomínio e título escolhidos acima. O relatório é gerado e enviado automaticamente na frequência definida." }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "Destinatários (emails, separados por vírgula)" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: destinatarios, onChange: (e) => setDestinatarios(e.target.value), placeholder: "gestor@empresa.ao, admin@empresa.ao", className: "input" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: "Frequência" }),
          /* @__PURE__ */ jsxs("select", { value: frequencia, onChange: (e) => setFrequencia(e.target.value), className: "input", children: [
            /* @__PURE__ */ jsx("option", { value: "mensal", children: "Mensal" }),
            /* @__PURE__ */ jsx("option", { value: "semanal", children: "Semanal" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/50 mb-1.5 uppercase tracking-wider", children: frequencia === "semanal" ? "Dia da semana (1=Seg)" : "Dia do mês" }),
          /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: frequencia === "semanal" ? 7 : 28, value: dia, onChange: (e) => setDia(parseInt(e.target.value) || 1), className: "input" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: agendar,
          disabled: !podeGerar || !destinatarios.trim(),
          className: "mt-4 inline-flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-lg font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed bg-white/10 hover:bg-white/15",
          children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
            "Criar agendamento"
          ]
        }
      ),
      agendados.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-5 border-t border-white/10 pt-4 space-y-2", children: agendados.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-white truncate", children: a.titulo }),
          /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-white/50 truncate", children: [
            a.frequencia === "semanal" ? `Semanal · dia ${a.dia}` : `Mensal · dia ${a.dia}`,
            " · ",
            nomeCond(a.condominio_id),
            " · ",
            a.meses,
            "m · ",
            a.destinatarios
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => removerAgendamento(a.id), className: "text-red-400 hover:text-red-300 flex-shrink-0", title: "Remover", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
      ] }, a.id)) })
    ] })
  ] });
}
export {
  Index as default
};
