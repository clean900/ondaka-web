import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useForm, Head, router } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { Shield, MessageSquare, ArrowLeft } from "lucide-react";
function DoisFactores({ telefoneMascarado }) {
  const { data, setData, post, processing, errors } = useForm({
    codigo: ""
  });
  const [contadorReenvio, setContadorReenvio] = useState(30);
  const [digitos, setDigitos] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  useEffect(() => {
    if (contadorReenvio <= 0) return;
    const timer = setInterval(() => setContadorReenvio((c) => c - 1), 1e3);
    return () => clearInterval(timer);
  }, [contadorReenvio]);
  useEffect(() => {
    setData("codigo", digitos.join(""));
  }, [digitos]);
  const handleChange = (index, valor) => {
    var _a;
    const digit = valor.replace(/\D/g, "").slice(-1);
    const novos = [...digitos];
    novos[index] = digit;
    setDigitos(novos);
    if (digit && index < 5) {
      (_a = inputsRef.current[index + 1]) == null ? void 0 : _a.focus();
    }
  };
  const handleKeyDown = (index, e) => {
    var _a, _b, _c;
    if (e.key === "Backspace" && !digitos[index] && index > 0) {
      (_a = inputsRef.current[index - 1]) == null ? void 0 : _a.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      (_b = inputsRef.current[index - 1]) == null ? void 0 : _b.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      (_c = inputsRef.current[index + 1]) == null ? void 0 : _c.focus();
    }
  };
  const handlePaste = (e) => {
    var _a;
    e.preventDefault();
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (texto.length === 0) return;
    const novos = texto.padEnd(6, "").split("").slice(0, 6);
    setDigitos(novos);
    (_a = inputsRef.current[Math.min(texto.length, 5)]) == null ? void 0 : _a.focus();
  };
  const submeter = (e) => {
    e.preventDefault();
    post("/2fa/verificar");
  };
  const reenviar = () => {
    router.post(
      "/2fa/reenviar",
      {},
      {
        onSuccess: () => {
          var _a;
          setContadorReenvio(60);
          setDigitos(["", "", "", "", "", ""]);
          (_a = inputsRef.current[0]) == null ? void 0 : _a.focus();
        }
      }
    );
  };
  const codigoCompleto = digitos.every((d) => d !== "");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Verificação de Segurança" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen relative flex items-center justify-center p-6 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 mesh-bg" }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl",
          style: { background: "radial-gradient(circle, #A855F7 0%, transparent 70%)" }
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-4 text-xl font-extrabold tracking-[0.15em] gradient-ondaka-text", children: "ONDAKA" }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative animate-pulse-glow",
              style: {
                background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)"
              },
              children: /* @__PURE__ */ jsx(Shield, { className: "w-7 h-7 text-white" })
            }
          ),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white tracking-tight", children: "Verificação em 2 passos" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mt-1.5", children: "Confirme que é você para continuar" })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-2xl p-7 backdrop-blur-xl",
            style: {
              background: "rgba(22, 22, 58, 0.6)",
              border: "0.5px solid rgba(168, 85, 247, 0.2)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
            },
            children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-start gap-3 p-4 rounded-lg mb-6",
                  style: {
                    background: "rgba(0, 212, 255, 0.06)",
                    border: "0.5px solid rgba(0, 212, 255, 0.25)"
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        style: { background: "rgba(0, 212, 255, 0.15)" },
                        children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-[#00D4FF]" })
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
                      /* @__PURE__ */ jsxs("div", { className: "text-white leading-relaxed", children: [
                        "Enviámos um código para",
                        " ",
                        /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold text-[#00D4FF]", children: telefoneMascarado })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-xs text-white/50 mt-0.5", children: "Válido por 5 minutos" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-5", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider", children: "Código de verificação" }),
                  /* @__PURE__ */ jsx("div", { className: "flex gap-2 justify-between", children: digitos.map((digito, i) => /* @__PURE__ */ jsx(
                    "input",
                    {
                      ref: (el) => {
                        inputsRef.current[i] = el;
                      },
                      type: "text",
                      inputMode: "numeric",
                      maxLength: 1,
                      value: digito,
                      onChange: (e) => handleChange(i, e.target.value),
                      onKeyDown: (e) => handleKeyDown(i, e),
                      onPaste: handlePaste,
                      autoComplete: i === 0 ? "one-time-code" : "off",
                      className: "w-12 h-14 text-center text-xl font-bold text-white rounded-lg transition-all",
                      style: {
                        background: digito ? "rgba(168, 85, 247, 0.08)" : "rgba(255, 255, 255, 0.04)",
                        border: `0.5px solid ${digito ? "rgba(0, 212, 255, 0.4)" : "rgba(255, 255, 255, 0.1)"}`,
                        outline: "none",
                        boxShadow: digito ? "0 0 15px rgba(0, 212, 255, 0.15)" : "none"
                      },
                      onFocus: (e) => {
                        e.currentTarget.style.border = "0.5px solid rgba(0, 212, 255, 0.6)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 212, 255, 0.25)";
                      },
                      onBlur: (e) => {
                        e.currentTarget.style.border = `0.5px solid ${digito ? "rgba(0, 212, 255, 0.4)" : "rgba(255, 255, 255, 0.1)"}`;
                        e.currentTarget.style.boxShadow = digito ? "0 0 15px rgba(0, 212, 255, 0.15)" : "none";
                      }
                    },
                    i
                  )) }),
                  errors.codigo && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-400", children: errors.codigo })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: processing || !codigoCompleto,
                    className: "btn-primary w-full",
                    children: processing ? "A verificar..." : "Verificar e entrar"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: reenviar,
                  disabled: contadorReenvio > 0,
                  className: "text-sm text-[#00D4FF] hover:text-[#A855F7] disabled:text-white/30 disabled:cursor-not-allowed transition font-medium",
                  children: contadorReenvio > 0 ? `Reenviar código em ${contadorReenvio}s` : "Reenviar código"
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "text-center mt-6", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => router.post("/logout"),
            className: "inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3 h-3" }),
              "Voltar ao login"
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-[11px] text-white/30 mt-4", children: "Não recebeu o SMS? Verifique o número no seu perfil." })
      ] })
    ] })
  ] });
}
export {
  DoisFactores as default
};
