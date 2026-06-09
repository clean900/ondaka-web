import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";
function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false
  });
  const submeter = (e) => {
    e.preventDefault();
    post("/login");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Entrar" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen relative flex items-center justify-center p-6 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 mesh-bg" }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute top-0 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl",
          style: { background: "radial-gradient(circle, #00D4FF 0%, transparent 70%)" }
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute bottom-0 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl",
          style: { background: "radial-gradient(circle, #EC4899 0%, transparent 70%)" }
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl",
          style: { background: "radial-gradient(circle, #A855F7 0%, transparent 70%)" }
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-8 animate-fade-in", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative animate-pulse-glow",
              style: {
                background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)"
              },
              children: /* @__PURE__ */ jsx("span", { className: "text-white font-bold text-2xl", children: "O" })
            }
          ),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: /* @__PURE__ */ jsx("span", { className: "gradient-ondaka-text", children: "ONDAKA" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mt-1.5", children: "Gestão inteligente para o seu lar" })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-2xl p-7 backdrop-blur-xl animate-slide-up",
            style: {
              background: "rgba(22, 22, 58, 0.6)",
              border: "0.5px solid rgba(168, 85, 247, 0.2)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-white", children: "Entrar" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Introduza as suas credenciais para continuar." })
              ] }),
              /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    "label",
                    {
                      htmlFor: "email",
                      className: "block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider",
                      children: "Email"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                    /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "email",
                        type: "email",
                        value: data.email,
                        onChange: (e) => setData("email", e.target.value),
                        className: "input pl-10",
                        required: true,
                        autoFocus: true,
                        autoComplete: "email",
                        placeholder: "admin@ondaka.ao"
                      }
                    )
                  ] }),
                  errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-red-400", children: errors.email })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
                    /* @__PURE__ */ jsx(
                      "label",
                      {
                        htmlFor: "password",
                        className: "block text-xs font-medium text-white/70 uppercase tracking-wider",
                        children: "Palavra-passe"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Link,
                      {
                        href: "/recuperar-password",
                        className: "text-xs text-[#00D4FF] hover:text-[#A855F7] transition font-medium normal-case tracking-normal",
                        children: "Esqueceu?"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                    /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "password",
                        type: "password",
                        value: data.password,
                        onChange: (e) => setData("password", e.target.value),
                        className: "input pl-10",
                        required: true,
                        autoComplete: "current-password",
                        placeholder: "••••••••"
                      }
                    )
                  ] }),
                  errors.password && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-red-400", children: errors.password })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between pt-1", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: data.remember,
                      onChange: (e) => setData("remember", e.target.checked),
                      className: "rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                    }
                  ),
                  "Lembrar-me neste dispositivo"
                ] }) }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: processing,
                    className: "btn-primary w-full mt-6 group",
                    children: processing ? /* @__PURE__ */ jsx(Fragment, { children: "A entrar..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      "Entrar",
                      /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 transition group-hover:translate-x-0.5" })
                    ] })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-white/40", children: [
                /* @__PURE__ */ jsx(Shield, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: "Ligação segura · Autenticação 2FA" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-[11px] text-white/30 mt-6 leading-relaxed", children: [
          "Ao entrar, concorda com os termos de utilização.",
          /* @__PURE__ */ jsx("br", {}),
          "Conformidade com ",
          /* @__PURE__ */ jsx("span", { className: "text-white/50", children: "DP 141/15 de 29 de Junho de 2015" }),
          " (Angola)."
        ] })
      ] })
    ] })
  ] });
}
export {
  Login as default
};
