import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Info, Zap } from "lucide-react";
import { useMemo } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatMoeda(valor) {
  return new Intl.NumberFormat("pt-PT").format(valor) + " Kz";
}
function AdminFeaturesNova({ features, empresas, condominios }) {
  const form = useForm({
    tipo_owner: "empresa",
    owner_id: "",
    feature_id: "",
    pacote_id: "",
    quantidade: "",
    meses: 1,
    notas: ""
  });
  const featureSeleccionada = useMemo(
    () => features.find((f) => f.id === Number(form.data.feature_id)),
    [features, form.data.feature_id]
  );
  const owners = form.data.tipo_owner === "empresa" ? empresas : condominios;
  const submit = (e) => {
    e.preventDefault();
    form.post("/admin/features");
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Activar feature" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-6 pt-2", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/features",
          className: "inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white tracking-tight", children: "Activar feature manualmente" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Super-admin: activar feature para empresa ou condomínio sem passar por pagamento." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/80 mb-3", children: "Tipo de destinatário" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ["empresa", "condominio"].map((tipo) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                form.setData("tipo_owner", tipo);
                form.setData("owner_id", "");
              },
              className: `p-3 rounded-lg text-sm transition-all ${form.data.tipo_owner === tipo ? "bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-[#8FE7FF]" : "bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.06]"}`,
              children: /* @__PURE__ */ jsx("div", { className: "font-medium capitalize", children: tipo === "empresa" ? "Empresa gestora" : "Condomínio" })
            },
            tipo
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/80 mb-2", children: form.data.tipo_owner === "empresa" ? "Empresa" : "Condomínio" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.data.owner_id,
              onChange: (e) => form.setData("owner_id", e.target.value),
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
              required: true,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione..." }),
                owners.map((o) => /* @__PURE__ */ jsxs("option", { value: o.id, children: [
                  o.nome,
                  "empresa_gestora_nome" in o && o.empresa_gestora_nome ? ` (${o.empresa_gestora_nome})` : ""
                ] }, o.id))
              ]
            }
          ),
          form.errors.owner_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.owner_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/80 mb-2", children: "Feature" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.data.feature_id,
              onChange: (e) => {
                form.setData("feature_id", e.target.value);
                form.setData("pacote_id", "");
                form.setData("quantidade", "");
              },
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
              required: true,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione..." }),
                features.map((f) => /* @__PURE__ */ jsxs("option", { value: f.id, disabled: f.em_breve, children: [
                  f.nome,
                  " (",
                  f.modelo_cobranca_label,
                  ")",
                  f.em_breve ? " — em breve" : ""
                ] }, f.id))
              ]
            }
          ),
          form.errors.feature_id && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: form.errors.feature_id })
        ] }),
        (featureSeleccionada == null ? void 0 : featureSeleccionada.modelo_cobranca) === "consumable" && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/80", children: "Pacote ou quantidade customizada" }),
          featureSeleccionada.pacotes.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-2", children: "Pacote padrão" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.data.pacote_id,
                onChange: (e) => {
                  form.setData("pacote_id", e.target.value);
                  form.setData("quantidade", "");
                },
                className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Nenhum (usar quantidade custom)" }),
                  featureSeleccionada.pacotes.map((p) => /* @__PURE__ */ jsxs("option", { value: p.id, children: [
                    p.nome,
                    ": ",
                    p.quantidade,
                    " ",
                    featureSeleccionada.unidade,
                    " por",
                    " ",
                    formatMoeda(p.preco)
                  ] }, p.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-white/60 mb-2", children: "OU quantidade customizada" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                value: form.data.quantidade,
                onChange: (e) => {
                  form.setData("quantidade", e.target.value);
                  form.setData("pacote_id", "");
                },
                placeholder: `Número de ${featureSeleccionada.unidade}`,
                className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              }
            )
          ] })
        ] }),
        (featureSeleccionada == null ? void 0 : featureSeleccionada.modelo_cobranca) === "subscription" && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/80 mb-2", children: "Duração em meses" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              max: "36",
              value: form.data.meses,
              onChange: (e) => form.setData("meses", Number(e.target.value)),
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          ),
          featureSeleccionada.preco_base && /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/60 mt-2", children: [
            "Valor estimado:",
            " ",
            formatMoeda(
              featureSeleccionada.preco_base * form.data.meses + featureSeleccionada.preco_activacao
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-white/80 mb-2", children: "Notas administrativas (opcional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 3,
              value: form.data.notas,
              onChange: (e) => form.setData("notas", e.target.value),
              placeholder: "Ex: Cortesia lançamento, Demonstração comercial, Ajuste pedido cliente...",
              className: "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-[#00D4FF]/5 border border-[#00D4FF]/20 flex items-start gap-2 text-sm text-[#8FE7FF]", children: [
          /* @__PURE__ */ jsx(Info, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Esta activação manual ",
            /* @__PURE__ */ jsx("strong", { children: "não cobra" }),
            ". Use para cortesias, testes ou ajustes. Para registo fiscal com pagamento, use o sistema de ordens de compra (Fase 3)."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/admin/features",
              className: "px-4 py-2 text-sm text-white/70 hover:text-white",
              children: "Cancelar"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: form.processing,
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] text-black text-sm font-medium hover:bg-[#8FE7FF] transition-colors disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Zap, { className: "w-4 h-4" }),
                form.processing ? "A activar..." : "Activar feature"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  AdminFeaturesNova as default
};
