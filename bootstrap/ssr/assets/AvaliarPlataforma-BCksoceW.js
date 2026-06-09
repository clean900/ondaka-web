import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { useForm, Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function AvaliarPlataforma({ pergunta, seguimento }) {
  const [cfg, setCfg] = useState({
    pergunta: pergunta ?? "De 0 a 10, qual a probabilidade de recomendar a ONDAKA a um colega?",
    seguimento: seguimento ?? "O que poderíamos melhorar?"
  });
  const { data, setData, post, processing, recentlySuccessful } = useForm({
    nota: null,
    comentario: "",
    seguimento: ""
  });
  useEffect(() => {
    fetch("/nps/plataforma/estado", { headers: { Accept: "application/json" } }).then((r) => r.json()).then((d) => setCfg({ pergunta: d.pergunta, seguimento: d.seguimento })).catch(() => {
    });
  }, []);
  const corNota = (n) => n <= 6 ? "bg-red-500 text-white" : n <= 8 ? "bg-amber-500 text-black" : "bg-cyan-400 text-black";
  const submit = () => {
    if (data.nota === null) return;
    post("/nps/plataforma/responder", { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Avaliar a ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white mb-1", children: "Avaliar a plataforma ONDAKA" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-6", children: "A sua opinião ajuda-nos a melhorar." }),
      recentlySuccessful ? /* @__PURE__ */ jsx("div", { className: "p-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-emerald-300 font-medium", children: "Obrigado pela sua avaliação!" }) }) : /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white", children: cfg.pergunta }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: Array.from({ length: 11 }, (_, n) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setData("nota", n),
            className: `w-11 h-11 rounded-lg text-sm font-semibold border transition-colors ${data.nota === n ? corNota(n) + " border-transparent" : "bg-white/5 text-white border-white/10 hover:bg-white/10"}`,
            children: n
          },
          n
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-white/40", children: [
          /* @__PURE__ */ jsx("span", { children: "Nada provável" }),
          /* @__PURE__ */ jsx("span", { children: "Muito provável" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Comentário (opcional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.comentario,
              onChange: (e) => setData("comentario", e.target.value),
              rows: 3,
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/70 mb-1", children: cfg.seguimento }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.seguimento,
              onChange: (e) => setData("seguimento", e.target.value),
              rows: 2,
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: submit,
            disabled: data.nota === null || processing,
            className: "px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50 text-sm font-medium",
            children: processing ? "A enviar..." : "Enviar avaliação"
          }
        )
      ] })
    ] })
  ] });
}
export {
  AvaliarPlataforma as default
};
