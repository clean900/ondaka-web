import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BlNlf6II.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Home, Ruler, DollarSign, Shield, Settings, Save } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Form({ fraccao, edificio, tipos_fraccao }) {
  var _a;
  const editar = !!fraccao;
  const { data, setData, post, put, processing, errors } = useForm({
    edificio_id: edificio.id,
    tipo_fraccao_id: (fraccao == null ? void 0 : fraccao.tipo_fraccao_id) ?? ((_a = tipos_fraccao[0]) == null ? void 0 : _a.id) ?? 0,
    identificador: (fraccao == null ? void 0 : fraccao.identificador) ?? "",
    piso: (fraccao == null ? void 0 : fraccao.piso) ?? 0,
    letra: (fraccao == null ? void 0 : fraccao.letra) ?? "",
    area_privativa_m2: (fraccao == null ? void 0 : fraccao.area_privativa_m2) ?? 0,
    permilagem: (fraccao == null ? void 0 : fraccao.permilagem) ?? 0,
    quota_mensal_base: (fraccao == null ? void 0 : fraccao.quota_mensal_base) ?? 0,
    quota_mensal_fundo_reserva: (fraccao == null ? void 0 : fraccao.quota_mensal_fundo_reserva) ?? 0,
    numero_quartos: (fraccao == null ? void 0 : fraccao.numero_quartos) ?? "",
    numero_casas_banho: (fraccao == null ? void 0 : fraccao.numero_casas_banho) ?? "",
    tem_lugar_garagem: (fraccao == null ? void 0 : fraccao.tem_lugar_garagem) ?? false,
    numero_lugares_garagem: (fraccao == null ? void 0 : fraccao.numero_lugares_garagem) ?? 0,
    tem_arrecadacao: (fraccao == null ? void 0 : fraccao.tem_arrecadacao) ?? false,
    estado: (fraccao == null ? void 0 : fraccao.estado) ?? "vaga",
    observacoes: (fraccao == null ? void 0 : fraccao.observacoes) ?? ""
  });
  const submeter = (e) => {
    e.preventDefault();
    if (editar) {
      put(`/fraccoes/${fraccao.id}`);
    } else {
      post(`/edificios/${edificio.id}/fraccoes`);
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: editar ? `Editar ${fraccao.identificador}` : "Nova fracção" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/edificios/${edificio.id}`,
          className: "inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Voltar a ",
            edificio.nome
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            style: {
              background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
              border: "0.5px solid rgba(236, 72, 153, 0.3)"
            },
            children: /* @__PURE__ */ jsx(Home, { className: "w-6 h-6 text-[#EC4899]" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: editar ? `Editar ${fraccao.identificador}` : `Nova fracção em ${edificio.nome}` }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: editar ? "Actualize os dados." : "Preencha os dados da nova fracção." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-5", children: [
        /* @__PURE__ */ jsx(Seccao, { icon: Home, iconColor: "#EC4899", titulo: "Identificação", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Tipo", erro: errors.tipo_fraccao_id, obrigatorio: true, children: /* @__PURE__ */ jsx(
            "select",
            {
              value: data.tipo_fraccao_id,
              onChange: (e) => setData("tipo_fraccao_id", parseInt(e.target.value)),
              className: "input",
              children: tipos_fraccao.map((t) => /* @__PURE__ */ jsx("option", { value: t.id, className: "bg-[#16163A]", children: t.nome }, t.id))
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Identificador", erro: errors.identificador, obrigatorio: true, ajuda: "Ex: 3ºB, R/C Esq", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.identificador,
              onChange: (e) => setData("identificador", e.target.value),
              className: "input",
              placeholder: "3ºB"
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Piso", erro: errors.piso, obrigatorio: true, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: data.piso,
              onChange: (e) => setData("piso", parseInt(e.target.value)),
              className: "input"
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsx(Seccao, { icon: Ruler, iconColor: "#00D4FF", titulo: "Área e permilagem", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Área privativa (m²)", erro: errors.area_privativa_m2, obrigatorio: true, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0",
              value: data.area_privativa_m2,
              onChange: (e) => setData("area_privativa_m2", parseFloat(e.target.value)),
              className: "input"
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Permilagem (‰)", erro: errors.permilagem, obrigatorio: true, ajuda: "Percentagem em milésimas do edifício", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.0001",
              min: "0",
              value: data.permilagem,
              onChange: (e) => setData("permilagem", parseFloat(e.target.value)),
              className: "input"
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsxs(Seccao, { icon: DollarSign, iconColor: "#A855F7", titulo: "Quotas mensais (Kz)", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Quota base", erro: errors.quota_mensal_base, obrigatorio: true, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: data.quota_mensal_base,
                onChange: (e) => setData("quota_mensal_base", parseFloat(e.target.value)),
                className: "input"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "Fundo de reserva", erro: errors.quota_mensal_fundo_reserva, obrigatorio: true, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: data.quota_mensal_fundo_reserva,
                onChange: (e) => setData("quota_mensal_fundo_reserva", parseFloat(e.target.value)),
                className: "input"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-start gap-3 p-4 rounded-lg",
              style: {
                background: "rgba(0, 212, 255, 0.05)",
                border: "0.5px solid rgba(0, 212, 255, 0.2)"
              },
              children: [
                /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4 text-[#00D4FF] flex-shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/70 leading-relaxed", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: "DP 141/15 Art. 22:" }),
                  " a quota mensal total não deve exceder 6 UCF × área privativa."
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Seccao, { icon: Settings, iconColor: "#10B981", titulo: "Características", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Nº quartos", erro: errors.numero_quartos, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                value: data.numero_quartos,
                onChange: (e) => setData("numero_quartos", e.target.value),
                className: "input"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "Nº casas de banho", erro: errors.numero_casas_banho, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                value: data.numero_casas_banho,
                onChange: (e) => setData("numero_casas_banho", e.target.value),
                className: "input"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer select-none py-1", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.tem_lugar_garagem,
                onChange: (e) => setData("tem_lugar_garagem", e.target.checked),
                className: "rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Tem lugar de garagem" })
          ] }),
          data.tem_lugar_garagem && /* @__PURE__ */ jsx(Campo, { label: "Nº lugares garagem", erro: errors.numero_lugares_garagem, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              value: data.numero_lugares_garagem,
              onChange: (e) => setData("numero_lugares_garagem", parseInt(e.target.value)),
              className: "input sm:w-32"
            }
          ) }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer select-none py-1", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.tem_arrecadacao,
                onChange: (e) => setData("tem_arrecadacao", e.target.checked),
                className: "rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Tem arrecadação" })
          ] }),
          /* @__PURE__ */ jsx(Campo, { label: "Estado actual", erro: errors.estado, obrigatorio: true, children: /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.estado,
              onChange: (e) => setData("estado", e.target.value),
              className: "input sm:w-48",
              children: [
                /* @__PURE__ */ jsx("option", { value: "vaga", className: "bg-[#16163A]", children: "Vaga" }),
                /* @__PURE__ */ jsx("option", { value: "ocupada", className: "bg-[#16163A]", children: "Ocupada" }),
                /* @__PURE__ */ jsx("option", { value: "arrendada", className: "bg-[#16163A]", children: "Arrendada" }),
                /* @__PURE__ */ jsx("option", { value: "obras", className: "bg-[#16163A]", children: "Em obras" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Observações", erro: errors.observacoes, children: /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.observacoes,
              onChange: (e) => setData("observacoes", e.target.value),
              rows: 3,
              className: "input resize-none"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-end gap-3 pt-5 mt-6",
            style: { borderTop: "0.5px solid rgba(255, 255, 255, 0.05)" },
            children: [
              /* @__PURE__ */ jsx(Link, { href: `/edificios/${edificio.id}`, className: "btn-secondary", children: "Cancelar" }),
              /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing, className: "btn-primary", children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                processing ? "A guardar..." : editar ? "Guardar alterações" : "Criar fracção"
              ] })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Seccao({
  icon: Icon,
  iconColor,
  titulo,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-5 pb-4 border-b border-white/5", children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: iconColor } }),
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: titulo })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children })
  ] });
}
function Campo({
  label,
  erro,
  obrigatorio,
  ajuda,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { className: "block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider", children: [
      label,
      " ",
      obrigatorio && /* @__PURE__ */ jsx("span", { className: "text-[#EC4899]", children: "*" })
    ] }),
    children,
    ajuda && !erro && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[11px] text-white/40", children: ajuda }),
    erro && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-red-400", children: erro })
  ] });
}
export {
  Form as default
};
