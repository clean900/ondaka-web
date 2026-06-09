import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { usePage, Head, Link, useForm } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { KeyRound, MessageSquare, ShieldCheck, ArrowLeft, Phone, ArrowRight, Lock } from "lucide-react";
function RecuperarPassword() {
  var _a, _b;
  const { props } = usePage();
  const flashFase = (_a = props.flash) == null ? void 0 : _a.fase;
  const flashStatus = (_b = props.flash) == null ? void 0 : _b.status;
  const [recuar, setRecuar] = useState(false);
  const fase = recuar ? "telefone" : flashFase ?? "telefone";
  const titulo = fase === "telefone" ? "Enviamos-lhe um código por SMS" : fase === "codigo" ? "Verifique as suas mensagens" : "Defina uma palavra-passe segura";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Recuperar palavra-passe" }),
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
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative animate-pulse-glow",
              style: { background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)" },
              children: [
                fase === "telefone" && /* @__PURE__ */ jsx(KeyRound, { className: "w-7 h-7 text-white" }),
                fase === "codigo" && /* @__PURE__ */ jsx(MessageSquare, { className: "w-7 h-7 text-white" }),
                fase === "nova" && /* @__PURE__ */ jsx(ShieldCheck, { className: "w-7 h-7 text-white" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white tracking-tight", children: "Recuperar acesso" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mt-1.5", children: titulo })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-2xl p-7 backdrop-blur-xl",
            style: { background: "rgba(22, 22, 58, 0.6)", border: "0.5px solid rgba(168, 85, 247, 0.2)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)" },
            children: [
              fase === "telefone" && /* @__PURE__ */ jsx(FaseTelefone, { status: flashStatus, onEnviado: () => setRecuar(false) }),
              fase === "codigo" && /* @__PURE__ */ jsx(FaseCodigo, { onVoltar: () => setRecuar(true) }),
              fase === "nova" && /* @__PURE__ */ jsx(FaseNova, {})
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "text-center mt-6", children: /* @__PURE__ */ jsxs(Link, { href: "/login", className: "inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3 h-3" }),
          "Voltar ao login"
        ] }) })
      ] })
    ] })
  ] });
}
function FaseTelefone({ status, onEnviado }) {
  const { data, setData, post, processing, errors } = useForm({ telefone: "" });
  const submeter = (e) => {
    e.preventDefault();
    post("/recuperar-password/enviar", { onSuccess: onEnviado });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-white", children: "Esqueceu a palavra-passe?" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Introduza o número de telemóvel associado à sua conta." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "telefone", className: "block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider", children: "Telemóvel" }),
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx(Phone, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "telefone",
              type: "tel",
              inputMode: "tel",
              value: data.telefone,
              onChange: (e) => setData("telefone", e.target.value),
              className: "input pl-10",
              required: true,
              autoFocus: true,
              placeholder: "9XX XXX XXX"
            }
          )
        ] }),
        errors.telefone && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-red-400", children: errors.telefone }),
        status && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-[#00D4FF]", children: status })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "btn-primary w-full mt-6 group", children: processing ? /* @__PURE__ */ jsx(Fragment, { children: "A enviar..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        "Enviar código",
        /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 transition group-hover:translate-x-0.5" })
      ] }) })
    ] })
  ] });
}
function FaseCodigo({ onVoltar }) {
  const { data, setData, post, processing, errors } = useForm({ codigo: "" });
  const [contadorReenvio, setContadorReenvio] = useState(30);
  const [digitos, setDigitos] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const reenvioForm = useForm({ telefone: "" });
  useEffect(() => {
    if (contadorReenvio <= 0) return;
    const t = setInterval(() => setContadorReenvio((c) => c - 1), 1e3);
    return () => clearInterval(t);
  }, [contadorReenvio]);
  useEffect(() => {
    setData("codigo", digitos.join(""));
  }, [digitos]);
  useEffect(() => {
    var _a;
    (_a = inputsRef.current[0]) == null ? void 0 : _a.focus();
  }, []);
  const handleChange = (i, v) => {
    var _a;
    const d = v.replace(/\D/g, "").slice(-1);
    const novos = [...digitos];
    novos[i] = d;
    setDigitos(novos);
    if (d && i < 5) (_a = inputsRef.current[i + 1]) == null ? void 0 : _a.focus();
  };
  const handleKeyDown = (i, e) => {
    var _a, _b, _c;
    if (e.key === "Backspace" && !digitos[i] && i > 0) (_a = inputsRef.current[i - 1]) == null ? void 0 : _a.focus();
    else if (e.key === "ArrowLeft" && i > 0) (_b = inputsRef.current[i - 1]) == null ? void 0 : _b.focus();
    else if (e.key === "ArrowRight" && i < 5) (_c = inputsRef.current[i + 1]) == null ? void 0 : _c.focus();
  };
  const handlePaste = (e) => {
    var _a;
    e.preventDefault();
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!texto) return;
    setDigitos(texto.padEnd(6, "").split("").slice(0, 6));
    (_a = inputsRef.current[Math.min(texto.length, 5)]) == null ? void 0 : _a.focus();
  };
  const submeter = (e) => {
    e.preventDefault();
    post("/recuperar-password/verificar");
  };
  const reenviar = () => {
    reenvioForm.post("/recuperar-password/enviar", {
      onSuccess: () => {
        var _a;
        setContadorReenvio(60);
        setDigitos(["", "", "", "", "", ""]);
        (_a = inputsRef.current[0]) == null ? void 0 : _a.focus();
      }
    });
  };
  const codigoCompleto = digitos.every((d) => d !== "");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-start gap-3 p-4 rounded-lg mb-6",
        style: { background: "rgba(0, 212, 255, 0.06)", border: "0.5px solid rgba(0, 212, 255, 0.25)" },
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", style: { background: "rgba(0, 212, 255, 0.15)" }, children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-[#00D4FF]" }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "text-white leading-relaxed", children: "Se existir uma conta, enviámos um código por SMS." }),
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
            }
          },
          i
        )) }),
        errors.codigo && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-400", children: errors.codigo })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing || !codigoCompleto, className: "btn-primary w-full", children: processing ? "A verificar..." : "Verificar código" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center flex items-center justify-center gap-4", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onVoltar, className: "text-xs text-white/40 hover:text-white/70 transition", children: "Mudar número" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: reenviar,
          disabled: contadorReenvio > 0,
          className: "text-sm text-[#00D4FF] hover:text-[#A855F7] disabled:text-white/30 disabled:cursor-not-allowed transition font-medium",
          children: contadorReenvio > 0 ? `Reenviar em ${contadorReenvio}s` : "Reenviar código"
        }
      )
    ] })
  ] });
}
function FaseNova() {
  const { data, setData, post, processing, errors } = useForm({ password: "", password_confirmation: "" });
  const submeter = (e) => {
    e.preventDefault();
    post("/recuperar-password/redefinir");
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider", children: "Nova palavra-passe" }),
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
            autoFocus: true,
            autoComplete: "new-password",
            placeholder: "••••••••"
          }
        )
      ] }),
      errors.password && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-red-400", children: errors.password })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "password_confirmation", className: "block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider", children: "Confirmar palavra-passe" }),
      /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
        /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#00D4FF] transition" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password_confirmation",
            type: "password",
            value: data.password_confirmation,
            onChange: (e) => setData("password_confirmation", e.target.value),
            className: "input pl-10",
            required: true,
            autoComplete: "new-password",
            placeholder: "••••••••"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "btn-primary w-full mt-6 group", children: processing ? /* @__PURE__ */ jsx(Fragment, { children: "A guardar..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      "Guardar e voltar ao login",
      /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 transition group-hover:translate-x-0.5" })
    ] }) })
  ] });
}
export {
  RecuperarPassword as default
};
