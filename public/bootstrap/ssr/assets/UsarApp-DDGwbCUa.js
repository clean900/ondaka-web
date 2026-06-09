import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, router } from "@inertiajs/react";
import { Sparkles, Smartphone, LogOut } from "lucide-react";
function UsarApp() {
  const sair = () => router.post("/logout");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Use o app móvel" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "min-h-screen flex items-center justify-center px-4 py-12",
        style: { background: "radial-gradient(at top, #1a0b2e 0%, #0a0a0a 50%)" },
        children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-8", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-cyan-400" }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-2xl font-bold tracking-wider bg-clip-text text-transparent",
                style: {
                  backgroundImage: "linear-gradient(90deg, #00D4FF, #A855F7, #EC4899)"
                },
                children: "ONDAKA"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "rounded-2xl border border-white/10 p-8",
              style: {
                background: "rgba(20, 20, 40, 0.6)",
                backdropFilter: "blur(10px)"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center",
                    style: {
                      background: "linear-gradient(135deg, #00D4FF20, #A855F720)"
                    },
                    children: /* @__PURE__ */ jsx(Smartphone, { className: "w-8 h-8 text-cyan-400" })
                  }
                ),
                /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white mb-3", children: "Use o app móvel ONDAKA" }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60 leading-relaxed mb-6", children: [
                  "A plataforma web ondaka.ao é para gestores. ",
                  /* @__PURE__ */ jsx("br", {}),
                  "Como condómino, guarda ou prestador, ",
                  /* @__PURE__ */ jsx("br", {}),
                  "tem uma experiência optimizada no app móvel."
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6", children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      disabled: true,
                      className: "rounded-xl border border-white/10 px-4 py-3 text-sm text-white/40 cursor-not-allowed text-left",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "text-xs text-white/30", children: "Em breve" }),
                        /* @__PURE__ */ jsx("div", { className: "font-medium", children: "Google Play" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      disabled: true,
                      className: "rounded-xl border border-white/10 px-4 py-3 text-sm text-white/40 cursor-not-allowed text-left",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "text-xs text-white/30", children: "Em breve" }),
                        /* @__PURE__ */ jsx("div", { className: "font-medium", children: "App Store" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: sair,
                    className: "text-sm text-white/60 hover:text-white inline-flex items-center gap-2 transition",
                    children: [
                      /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
                      "Sair"
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 mt-6", children: "© ONDAKA · Soluções Simples, Lda" })
        ] })
      }
    )
  ] });
}
export {
  UsarApp as default
};
