import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
function Invalido() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Convite inválido - ONDAKA" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "min-h-screen flex items-center justify-center p-4",
        style: {
          background: "radial-gradient(ellipse at top, rgba(239,68,68,0.12) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(168,85,247,0.08) 0%, transparent 50%), #0A0A1F"
        },
        children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
          /* @__PURE__ */ jsx("div", { className: "text-center mb-8", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-[#00D4FF]" }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold gradient-ondaka-text", children: "ONDAKA" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5",
                style: { background: "rgba(239,68,68,0.12)", border: "0.5px solid rgba(239,68,68,0.3)" },
                children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8 text-red-400" })
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-white mb-2", children: "Convite inválido" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 leading-relaxed mb-6", children: "Este link de convite não é válido. Pode ter expirado, sido cancelado ou já ter sido usado." }),
            /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 mb-6 text-left", children: /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/70 leading-relaxed", children: [
              /* @__PURE__ */ jsx("strong", { className: "text-amber-300", children: "O que fazer?" }),
              /* @__PURE__ */ jsx("br", {}),
              "Contacte a pessoa que o convidou para que envie um novo convite. Os convites são válidos durante 7 dias após serem enviados."
            ] }) }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "/",
                className: "btn-primary w-full justify-center",
                children: [
                  "Voltar à página inicial",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-center mt-6 text-xs text-white/40", children: "© ONDAKA · Soluções Simples, Lda" })
        ] })
      }
    )
  ] });
}
export {
  Invalido as default
};
