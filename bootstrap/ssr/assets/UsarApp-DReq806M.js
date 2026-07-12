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
                    "a",
                    {
                      href: "https://play.google.com/store/apps/details?id=ao.ondaka.ondaka_app",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 transition text-left",
                      children: [
                        /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "w-7 h-7 shrink-0", fill: "#fff", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" }) }),
                        /* @__PURE__ */ jsxs("div", { className: "leading-tight", children: [
                          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide text-white/50", children: "Disponível no" }),
                          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-white", children: "Google Play" })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: "https://apps.apple.com/app/id6782891593",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 transition text-left",
                      children: [
                        /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "w-7 h-7 shrink-0", fill: "#fff", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.036-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" }) }),
                        /* @__PURE__ */ jsxs("div", { className: "leading-tight", children: [
                          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide text-white/50", children: "Descarregar na" }),
                          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-white", children: "App Store" })
                        ] })
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
