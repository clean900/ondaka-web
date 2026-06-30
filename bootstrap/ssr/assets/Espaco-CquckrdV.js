import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-X_1jlzlW.js";
import { useForm, Head } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function ReservasEspaco({ espaco, condominios }) {
  const editar = !!espaco;
  const { data, setData, processing, errors, post, put } = useForm({
    nome: (espaco == null ? void 0 : espaco.nome) || "",
    descricao: (espaco == null ? void 0 : espaco.descricao) || "",
    condominio_id: (espaco == null ? void 0 : espaco.condominio_id) || "",
    hora_abertura: ((espaco == null ? void 0 : espaco.hora_abertura) || "08:00").slice(0, 5),
    hora_fecho: ((espaco == null ? void 0 : espaco.hora_fecho) || "22:00").slice(0, 5),
    duracao_min_horas: (espaco == null ? void 0 : espaco.duracao_min_horas) ?? 1,
    duracao_max_horas: (espaco == null ? void 0 : espaco.duracao_max_horas) ?? 4,
    antecedencia_min_horas: (espaco == null ? void 0 : espaco.antecedencia_min_horas) ?? 48,
    antecedencia_max_dias: (espaco == null ? void 0 : espaco.antecedencia_max_dias) ?? 60,
    tem_caucao: (espaco == null ? void 0 : espaco.tem_caucao) ?? false,
    valor_caucao: espaco ? Number(espaco.valor_caucao) : 0,
    activo: (espaco == null ? void 0 : espaco.activo) ?? true
  });
  const submit = (e) => {
    e.preventDefault();
    if (editar) put(`/reservas/espacos/${espaco.id}`);
    else post("/reservas/espacos");
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: editar ? "Editar espaço" : "Novo espaço" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "max-w-3xl mx-auto px-4 py-6 space-y-5", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white", children: editar ? "Editar espaço" : "Novo espaço" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "block sm:col-span-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Nome" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: data.nome,
              onChange: (e) => setData("nome", e.target.value),
              required: true,
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          ),
          errors.nome && /* @__PURE__ */ jsx("span", { className: "text-xs text-red-400", children: errors.nome })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block sm:col-span-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Descrição" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: data.descricao,
              onChange: (e) => setData("descricao", e.target.value),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block sm:col-span-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Condomínio (opcional)" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.condominio_id,
              onChange: (e) => setData("condominio_id", e.target.value),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
                condominios.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.nome }, c.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Hora abertura" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "time",
              value: data.hora_abertura,
              onChange: (e) => setData("hora_abertura", e.target.value),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Hora fecho" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "time",
              value: data.hora_fecho,
              onChange: (e) => setData("hora_fecho", e.target.value),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Duração mín (horas)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              max: 24,
              value: data.duracao_min_horas,
              onChange: (e) => setData("duracao_min_horas", parseInt(e.target.value) || 1),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Duração máx (horas)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              max: 24,
              value: data.duracao_max_horas,
              onChange: (e) => setData("duracao_max_horas", parseInt(e.target.value) || 4),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Antecedência mínima (horas)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 0,
              max: 720,
              value: data.antecedencia_min_horas,
              onChange: (e) => setData("antecedencia_min_horas", parseInt(e.target.value) || 0),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Antecedência máxima (dias)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              max: 365,
              value: data.antecedencia_max_dias,
              onChange: (e) => setData("antecedencia_max_dias", parseInt(e.target.value) || 60),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 mt-6", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.tem_caucao, onChange: (e) => setData("tem_caucao", e.target.checked) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-white/80", children: "Exige caução" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-white/60", children: "Valor da caução (Kz)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 0,
              step: 1e3,
              disabled: !data.tem_caucao,
              value: data.valor_caucao,
              onChange: (e) => setData("valor_caucao", parseFloat(e.target.value) || 0),
              className: "w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm disabled:opacity-40"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 mt-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.activo, onChange: (e) => setData("activo", e.target.checked) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-white/80", children: "Activo (disponível para reservas)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx("a", { href: "/reservas", className: "text-sm px-3 py-2 rounded-lg text-white/70 hover:bg-white/5", children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50", children: processing ? "A guardar..." : "Guardar" })
      ] })
    ] })
  ] });
}
export {
  ReservasEspaco as default
};
