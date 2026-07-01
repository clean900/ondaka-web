import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout, c as cn } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Home, FileText, Briefcase, Calendar, UserCircle, Save } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Form({ condomino, fraccaoId, fraccoes, proprietarios }) {
  const { data, setData, post, processing, errors } = useForm({
    fraccao_id: fraccaoId ?? "",
    tipo: "proprietario",
    percentagem_propriedade: 100,
    data_inicio: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    data_fim: "",
    numero_contrato: "",
    data_contrato: "",
    valor_renda_mensal: "",
    proprietario_id: "",
    responsavel_facturacao: false,
    recebe_comunicacoes: true,
    observacoes: "",
    estado: "activo"
  });
  const submeter = (e) => {
    e.preventDefault();
    post(`/condominos/${condomino.id}/contratos`);
  };
  const ehProprietario = data.tipo === "proprietario";
  const ehInquilino = data.tipo === "inquilino";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Associar fracção" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs(Link, { href: `/condominos/${condomino.id}`, className: "inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Voltar a ",
        condomino.nome_completo
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            style: {
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
              border: "0.5px solid rgba(0, 212, 255, 0.3)"
            },
            children: /* @__PURE__ */ jsx(Home, { className: "w-6 h-6 text-[#00D4FF]" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: "Associar fracção" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60 mt-1", children: [
            "Adicionar uma fracção ao condómino ",
            /* @__PURE__ */ jsx("span", { className: "text-white", children: condomino.nome_completo }),
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-5", children: [
        /* @__PURE__ */ jsx(Seccao, { icon: FileText, iconColor: "#A855F7", titulo: "Tipo de ocupação", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: [
          /* @__PURE__ */ jsx(
            TipoCard,
            {
              tipo: "proprietario",
              activo: data.tipo === "proprietario",
              icon: Home,
              label: "Proprietário",
              cor: "#A855F7",
              onClick: () => setData("tipo", "proprietario")
            }
          ),
          /* @__PURE__ */ jsx(
            TipoCard,
            {
              tipo: "inquilino",
              activo: data.tipo === "inquilino",
              icon: Briefcase,
              label: "Inquilino",
              cor: "#00D4FF",
              onClick: () => setData("tipo", "inquilino")
            }
          ),
          /* @__PURE__ */ jsx(
            TipoCard,
            {
              tipo: "usufructo",
              activo: data.tipo === "usufructo",
              icon: FileText,
              label: "Usufruto",
              cor: "#F59E0B",
              onClick: () => setData("tipo", "usufructo")
            }
          ),
          /* @__PURE__ */ jsx(
            TipoCard,
            {
              tipo: "cedencia",
              activo: data.tipo === "cedencia",
              icon: FileText,
              label: "Cedência",
              cor: "#64748B",
              onClick: () => setData("tipo", "cedencia")
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(Seccao, { icon: Home, iconColor: "#00D4FF", titulo: "Fracção", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Selecione a fracção", erro: errors.fraccao_id, obrigatorio: true, children: /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.fraccao_id,
              onChange: (e) => setData("fraccao_id", e.target.value),
              className: "input",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "— Escolha uma fracção —" }),
                fraccoes.map((f) => /* @__PURE__ */ jsxs("option", { value: f.id, className: "bg-[#16163A]", children: [
                  f.condominio_nome,
                  " / ",
                  f.edificio_nome,
                  " / ",
                  f.identificador,
                  " (",
                  f.area_privativa_m2,
                  " m²)"
                ] }, f.id))
              ]
            }
          ) }),
          ehProprietario && /* @__PURE__ */ jsx(Campo, { label: "Percentagem de propriedade (%)", erro: errors.percentagem_propriedade, ajuda: "Use 100% se é dono único. Em caso de comproprietários, ajuste.", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0.01",
              max: "100",
              value: data.percentagem_propriedade,
              onChange: (e) => setData("percentagem_propriedade", parseFloat(e.target.value)),
              className: "input sm:w-40"
            }
          ) }),
          ehInquilino && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Campo, { label: "Valor da renda mensal (Kz)", erro: errors.valor_renda_mensal, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: data.valor_renda_mensal,
                onChange: (e) => setData("valor_renda_mensal", e.target.value),
                className: "input",
                placeholder: "0.00"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "Proprietário (senhorio)", erro: errors.proprietario_id, ajuda: "Opcional — quem recebe a renda", children: /* @__PURE__ */ jsxs(
              "select",
              {
                value: data.proprietario_id,
                onChange: (e) => setData("proprietario_id", e.target.value),
                className: "input",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "—" }),
                  proprietarios.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, className: "bg-[#16163A]", children: p.nome }, p.id))
                ]
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Seccao, { icon: Calendar, iconColor: "#EC4899", titulo: "Vigência", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Data de início", erro: errors.data_inicio, obrigatorio: true, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: data.data_inicio,
              onChange: (e) => setData("data_inicio", e.target.value),
              className: "input"
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Data de fim", erro: errors.data_fim, ajuda: "Deixe em branco se for por tempo indeterminado", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: data.data_fim,
              onChange: (e) => setData("data_fim", e.target.value),
              className: "input"
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsx(Seccao, { icon: FileText, iconColor: "#64748B", titulo: "Dados do contrato (opcional)", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Nº contrato", erro: errors.numero_contrato, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.numero_contrato,
              onChange: (e) => setData("numero_contrato", e.target.value),
              className: "input"
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Data contrato", erro: errors.data_contrato, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: data.data_contrato,
              onChange: (e) => setData("data_contrato", e.target.value),
              className: "input"
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsxs(Seccao, { icon: UserCircle, iconColor: "#10B981", titulo: "Configurações", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer select-none py-1", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.responsavel_facturacao,
                onChange: (e) => setData("responsavel_facturacao", e.target.checked),
                className: "rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-white", children: "Responsável pela facturação do condomínio" }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50 mt-0.5", children: ehInquilino ? "O inquilino paga as quotas do condomínio em vez do proprietário" : "Este condómino recebe as facturas do condomínio" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer select-none py-1", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.recebe_comunicacoes,
                onChange: (e) => setData("recebe_comunicacoes", e.target.checked),
                className: "rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-white", children: "Recebe comunicações do condomínio" }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/50 mt-0.5", children: "Avisos, chat, votações e outros" })
            ] })
          ] }),
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
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 pt-5 mt-6", style: { borderTop: "0.5px solid rgba(255,255,255,0.05)" }, children: [
          /* @__PURE__ */ jsx(Link, { href: `/condominos/${condomino.id}`, className: "btn-secondary", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing, className: "btn-primary", children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            processing ? "A guardar..." : "Criar contrato"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function TipoCard({
  tipo,
  activo,
  icon: Icon,
  label,
  cor,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "p-3 rounded-lg transition-all flex flex-col items-center gap-2",
        activo ? "text-white" : "text-white/60 hover:text-white"
      ),
      style: {
        background: activo ? `${cor}15` : "rgba(255,255,255,0.02)",
        border: `0.5px solid ${activo ? cor : "rgba(255,255,255,0.1)"}`,
        boxShadow: activo ? `0 0 20px ${cor}20` : "none"
      },
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: activo ? cor : void 0 } }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: label })
      ]
    }
  );
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
