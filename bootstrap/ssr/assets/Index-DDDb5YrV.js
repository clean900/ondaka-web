import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Sparkles, ShoppingBag, Search, Clock, ArrowRight } from "lucide-react";
const categoriaLabels = {
  comunicacao: "Comunicação",
  pagamentos: "Pagamentos",
  seguranca: "Segurança",
  gestao: "Gestão",
  personalizacao: "Personalização",
  outros: "Outros"
};
const categoriaColors = {
  comunicacao: "#00D4FF",
  pagamentos: "#10B981",
  seguranca: "#EF4444",
  gestao: "#A855F7",
  personalizacao: "#EC4899",
  outros: "#6B7280"
};
const modeloLabels = {
  subscription: "Mensal",
  one_time: "Pagamento único",
  consumable: "Consumível"
};
const fmt = (v) => new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
function Index({ features }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const filtradas = useMemo(() => {
    return features.filter((f) => {
      if (busca && !f.nome.toLowerCase().includes(busca.toLowerCase()) && !(f.descricao ?? "").toLowerCase().includes(busca.toLowerCase())) {
        return false;
      }
      if (categoria && f.categoria !== categoria) return false;
      return true;
    });
  }, [features, busca, categoria]);
  const categorias = Array.from(new Set(features.map((f) => f.categoria)));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Loja - ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen text-white", style: { background: "radial-gradient(ellipse at top, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(0,212,255,0.08) 0%, transparent 50%), #0A0A1F" }, children: [
      /* @__PURE__ */ jsx("header", { className: "border-b border-white/5 backdrop-blur-md sticky top-0 z-30 bg-[#0A0A1F]/80", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-[#00D4FF]" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold gradient-ondaka-text", children: "ONDAKA" })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden md:flex items-center gap-6 text-sm", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent hover:opacity-80", children: "Início" }),
          /* @__PURE__ */ jsx(Link, { href: "/catalogo", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent hover:opacity-80", children: "Catálogo" }),
          /* @__PURE__ */ jsx(Link, { href: "/loja", className: "text-white font-semibold", children: "Loja" }),
          /* @__PURE__ */ jsx(Link, { href: "/login", className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text font-semibold text-transparent hover:opacity-80", children: "Entrar" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("section", { className: "max-w-7xl mx-auto px-6 py-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/10", children: [
            /* @__PURE__ */ jsx(ShoppingBag, { className: "w-3.5 h-3.5 text-[#00D4FF]" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-white/70", children: "Loja de Add-ons" })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold mb-3 gradient-ondaka-text", children: "Estenda a sua plataforma" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/60 max-w-2xl mx-auto", children: "Funcionalidades adicionais para empresas-gestoras e administradores que querem mais. Active apenas o que precisa, quando precisa. Aplica IPC 6.5%." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3 mb-8 max-w-3xl mx-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Pesquisar funcionalidade...",
                value: busca,
                onChange: (e) => setBusca(e.target.value),
                className: "w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#00D4FF]/50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: categoria,
              onChange: (e) => setCategoria(e.target.value),
              className: "px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#00D4FF]/50 md:w-52",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Todas as categorias" }),
                categorias.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: categoriaLabels[c] ?? c }, c))
              ]
            }
          )
        ] }),
        filtradas.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-16 text-white/40", children: "Nenhuma funcionalidade encontrada." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filtradas.map((f) => {
          const cor = categoriaColors[f.categoria] ?? "#6B7280";
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: "rounded-xl p-5 bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all group",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-10 h-10 rounded-lg flex items-center justify-center",
                      style: { background: `${cor}15`, border: `0.5px solid ${cor}30` },
                      children: /* @__PURE__ */ jsx(ShoppingBag, { className: "w-5 h-5", style: { color: cor } })
                    }
                  ),
                  f.em_breve && /* @__PURE__ */ jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 inline-flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
                    " Em breve"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded inline-block mb-2",
                    style: { background: `${cor}10`, color: cor },
                    children: categoriaLabels[f.categoria] ?? f.categoria
                  }
                ),
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-white mb-1.5", children: f.nome }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 leading-relaxed line-clamp-3 mb-4 min-h-[2.5rem]", children: f.descricao ?? "—" }),
                /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-white/5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between mb-3", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide text-white/40", children: modeloLabels[f.modelo_cobranca] ?? "—" }),
                      /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-white", children: f.preco_base > 0 ? `${fmt(f.preco_base)} Kz` : "Sob consulta" })
                    ] }),
                    f.preco_activacao > 0 && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-white/50 text-right", children: [
                      "Activação:",
                      /* @__PURE__ */ jsx("br", {}),
                      /* @__PURE__ */ jsxs("strong", { className: "text-white/80", children: [
                        fmt(f.preco_activacao),
                        " Kz"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    Link,
                    {
                      href: "/registo",
                      className: `block text-center text-xs py-2 rounded-lg font-medium transition ${f.em_breve ? "bg-white/5 text-white/40 cursor-not-allowed" : "bg-gradient-to-r from-[#00D4FF] to-[#A855F7] text-white hover:opacity-90"}`,
                      children: f.em_breve ? "Aguarde lançamento" : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                        "Activar ",
                        /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5" })
                      ] })
                    }
                  )
                ] })
              ]
            },
            f.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("footer", { className: "border-t border-white/5 mt-12 py-6 text-center text-xs text-white/40", children: [
        "© ONDAKA · Soluções Simples, Lda · Luanda, Angola · ",
        /* @__PURE__ */ jsx(Link, { href: "/privacidade", className: "hover:text-white/70", children: "Privacidade" }),
        " · ",
        /* @__PURE__ */ jsx(Link, { href: "/termos", className: "hover:text-white/70", children: "Termos" })
      ] })
    ] })
  ] });
}
export {
  Index as default
};
