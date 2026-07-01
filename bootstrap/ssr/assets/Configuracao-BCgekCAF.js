import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { useForm, Head } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function AdminNpsConfiguracao({ config }) {
  const { data, setData, post, processing, recentlySuccessful } = useForm({
    activo: config.activo,
    periodicidade_dias: config.periodicidade_dias,
    pergunta: config.pergunta,
    seguimento: config.seguimento ?? ""
  });
  const submit = (e) => {
    e.preventDefault();
    post("/admin/nps/configuracao", { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Configurar NPS — Plataforma" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white mb-1", children: "Configurar NPS da Plataforma" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-6", children: "Define como e com que frequência os utilizadores avaliam a plataforma ONDAKA." }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white font-medium", children: "Inquérito activo" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50", children: "Se desligado, não se pede avaliação." })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: data.activo,
              onChange: (e) => setData("activo", e.target.checked),
              className: "w-5 h-5 accent-cyan-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Periodicidade (dias)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              max: 3650,
              value: data.periodicidade_dias,
              onChange: (e) => setData("periodicidade_dias", parseInt(e.target.value || "0", 10)),
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 mt-1", children: "De quantos em quantos dias se volta a pedir." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Pergunta principal" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.pergunta,
              onChange: (e) => setData("pergunta", e.target.value),
              rows: 2,
              maxLength: 255,
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Pergunta de seguimento (opcional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.seguimento,
              onChange: (e) => setData("seguimento", e.target.value),
              rows: 2,
              maxLength: 255,
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: submit,
              disabled: processing,
              className: "px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50 text-sm font-medium",
              children: processing ? "A guardar..." : "Guardar configuração"
            }
          ),
          recentlySuccessful && /* @__PURE__ */ jsx("span", { className: "text-sm text-emerald-300", children: "Guardado!" })
        ] })
      ] })
    ] })
  ] });
}
export {
  AdminNpsConfiguracao as default
};
