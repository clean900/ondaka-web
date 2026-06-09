import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout, c as cn } from "./AuthenticatedLayout-TDdsYzgz.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Building2, Grid3x3, Home, Layers, Store, MapPin, FileText, DollarSign, Shield, Save } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Form({ condominio, provincias }) {
  const editar = !!condominio;
  const { data, setData, post, put, processing, errors } = useForm({
    nome: (condominio == null ? void 0 : condominio.nome) ?? "",
    codigo: (condominio == null ? void 0 : condominio.codigo) ?? "",
    tipo: (condominio == null ? void 0 : condominio.tipo) ?? "vertical",
    numero_blocos_previsto: (condominio == null ? void 0 : condominio.numero_blocos_previsto) ?? "",
    tem_area_comercial: (condominio == null ? void 0 : condominio.tem_area_comercial) ?? false,
    nif: (condominio == null ? void 0 : condominio.nif) ?? "",
    morada: (condominio == null ? void 0 : condominio.morada) ?? "",
    provincia: (condominio == null ? void 0 : condominio.provincia) ?? "Luanda",
    municipio: (condominio == null ? void 0 : condominio.municipio) ?? "",
    distrito_urbano: (condominio == null ? void 0 : condominio.distrito_urbano) ?? "",
    bairro: (condominio == null ? void 0 : condominio.bairro) ?? "",
    data_constituicao: (condominio == null ? void 0 : condominio.data_constituicao) ?? "",
    numero_matricula: (condominio == null ? void 0 : condominio.numero_matricula) ?? "",
    conservatoria: (condominio == null ? void 0 : condominio.conservatoria) ?? "",
    iban: (condominio == null ? void 0 : condominio.iban) ?? "",
    banco: (condominio == null ? void 0 : condominio.banco) ?? "",
    moeda: (condominio == null ? void 0 : condominio.moeda) ?? "AOA",
    ucf_valor_actual: (condominio == null ? void 0 : condominio.ucf_valor_actual) ?? "",
    percentagem_fundo_reserva: (condominio == null ? void 0 : condominio.percentagem_fundo_reserva) ?? 10,
    estado: (condominio == null ? void 0 : condominio.estado) ?? "activo"
  });
  const submeter = (e) => {
    e.preventDefault();
    if (editar) {
      put(`/condominios/${condominio.id}`);
    } else {
      post("/condominios");
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: editar ? `Editar ${condominio.nome}` : "Novo Condomínio" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/condominios",
          className: "inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            style: {
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
              border: "0.5px solid rgba(0, 212, 255, 0.3)"
            },
            children: /* @__PURE__ */ jsx(Building2, { className: "w-6 h-6 text-[#00D4FF]" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: editar ? `Editar ${condominio.nome}` : "Novo condomínio" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: editar ? "Actualize os dados do condomínio." : "Preencha os dados para criar um novo condomínio." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-5", children: [
        !editar && /* @__PURE__ */ jsxs(Seccao, { icon: Grid3x3, iconColor: "#A855F7", titulo: "Tipo de empreendimento", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mb-1", children: "Seleccione o formato que melhor descreve este condomínio." }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-3", children: [
            /* @__PURE__ */ jsx(
              TipoCard,
              {
                activo: data.tipo === "vertical",
                icon: Building2,
                label: "Vertical (Prédios)",
                descricao: "Edifícios com apartamentos",
                exemplo: "Ex: Torres Atlântico, Acquaville",
                cor: "#00D4FF",
                onClick: () => setData("tipo", "vertical")
              }
            ),
            /* @__PURE__ */ jsx(
              TipoCard,
              {
                activo: data.tipo === "horizontal",
                icon: Home,
                label: "Horizontal (Vivendas)",
                descricao: "Moradias/vivendas térreas, duplex, triplex",
                exemplo: "Ex: Dolce Vita, Vale do Imbondeiro",
                cor: "#A855F7",
                onClick: () => setData("tipo", "horizontal")
              }
            ),
            /* @__PURE__ */ jsx(
              TipoCard,
              {
                activo: data.tipo === "misto",
                icon: Layers,
                label: "Misto",
                descricao: "Combina edifícios, vivendas e/ou comércio",
                exemplo: "Ex: Villa Nostra, Zenith Towers",
                cor: "#EC4899",
                onClick: () => setData("tipo", "misto")
              }
            ),
            /* @__PURE__ */ jsx(
              TipoCard,
              {
                activo: data.tipo === "loteamento",
                icon: Store,
                label: "Loteamento",
                descricao: "Lotes/terrenos para urbanização",
                exemplo: "Ex: Centralidades, Fases urbanizadas",
                cor: "#10B981",
                onClick: () => setData("tipo", "loteamento")
              }
            )
          ] }),
          errors.tipo && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-red-400", children: errors.tipo })
        ] }),
        /* @__PURE__ */ jsxs(Seccao, { icon: Building2, iconColor: "#00D4FF", titulo: "Identificação", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Nome", erro: errors.nome, obrigatorio: true, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.nome,
              onChange: (e) => setData("nome", e.target.value),
              className: "input",
              placeholder: data.tipo === "horizontal" ? "Ex: Dolce Vita Talatona" : "Ex: Torres Atlântico"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Código", erro: errors.codigo, obrigatorio: true, ajuda: "Ex: COND-LUA-001", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.codigo,
                onChange: (e) => setData("codigo", e.target.value.toUpperCase()),
                className: "input font-mono",
                placeholder: "COND-XXX-000"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "NIF", erro: errors.nif, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.nif,
                onChange: (e) => setData("nif", e.target.value),
                className: "input",
                placeholder: "5999999999"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(
              Campo,
              {
                label: labelNumeroBlocos(data.tipo),
                erro: errors.numero_blocos_previsto,
                ajuda: "Opcional — ajuda no planeamento",
                children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "1",
                    value: data.numero_blocos_previsto,
                    onChange: (e) => setData("numero_blocos_previsto", e.target.value),
                    className: "input",
                    placeholder: "Ex: 2"
                  }
                )
              }
            ),
            (data.tipo === "horizontal" || data.tipo === "loteamento" || data.tipo === "misto") && /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer select-none py-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.tem_area_comercial,
                  onChange: (e) => setData("tem_area_comercial", e.target.checked),
                  className: "rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Tem área comercial (lojas/escritórios)" })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Seccao, { icon: MapPin, iconColor: "#A855F7", titulo: "Localização", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Morada", erro: errors.morada, obrigatorio: true, children: /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.morada,
              onChange: (e) => setData("morada", e.target.value),
              rows: 2,
              className: "input resize-none",
              placeholder: "Rua / Avenida, número, complemento..."
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Província", erro: errors.provincia, obrigatorio: true, children: /* @__PURE__ */ jsx(
              "select",
              {
                value: data.provincia,
                onChange: (e) => setData("provincia", e.target.value),
                className: "input",
                children: provincias.map((p) => /* @__PURE__ */ jsx("option", { value: p, className: "bg-[#16163A]", children: p }, p))
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "Município", erro: errors.municipio, obrigatorio: true, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.municipio,
                onChange: (e) => setData("municipio", e.target.value),
                className: "input"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "Bairro", erro: errors.bairro, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.bairro,
                onChange: (e) => setData("bairro", e.target.value),
                className: "input"
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Seccao, { icon: FileText, iconColor: "#EC4899", titulo: "Dados legais (DP 141/15)", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Data de constituição", erro: errors.data_constituicao, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: typeof data.data_constituicao === "string" ? data.data_constituicao.slice(0, 10) : "",
                onChange: (e) => setData("data_constituicao", e.target.value),
                className: "input"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "Nº matrícula predial", erro: errors.numero_matricula, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.numero_matricula,
                onChange: (e) => setData("numero_matricula", e.target.value),
                className: "input",
                placeholder: "CRP-LUA-2022/0415"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx(Campo, { label: "Conservatória", erro: errors.conservatoria, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.conservatoria,
              onChange: (e) => setData("conservatoria", e.target.value),
              className: "input",
              placeholder: "Conservatória do Registo Predial de..."
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs(Seccao, { icon: DollarSign, iconColor: "#00D4FF", titulo: "Financeiro", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Banco", erro: errors.banco, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.banco,
                onChange: (e) => setData("banco", e.target.value),
                className: "input",
                placeholder: "BFA, BAI, BIC..."
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "IBAN", erro: errors.iban, ajuda: "AO06 XXXX XXXX XXXX XXXX XXXX X", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.iban,
                onChange: (e) => setData("iban", e.target.value),
                className: "input font-mono",
                placeholder: "AO06 0000 0000 0000 0000 0000 0"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Valor actual UCF (Kz)", erro: errors.ucf_valor_actual, ajuda: "Unidade de Correcção Fiscal", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: data.ucf_valor_actual,
                onChange: (e) => setData("ucf_valor_actual", e.target.value),
                className: "input",
                placeholder: "88.00"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "% Fundo de reserva", erro: errors.percentagem_fundo_reserva, obrigatorio: true, ajuda: "DP 141/15 Art. 20: mínimo 10%", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "10",
                max: "100",
                value: data.percentagem_fundo_reserva,
                onChange: (e) => setData("percentagem_fundo_reserva", parseFloat(e.target.value)),
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
                  "Conforme ",
                  /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: "Decreto Presidencial 141/15 de 29 de Junho" }),
                  ", o fundo de reserva deve corresponder a pelo menos 10% das quotas mensais e as quotas não podem exceder 6 UCF por m² de área privativa."
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 pt-5 mt-6", style: { borderTop: "0.5px solid rgba(255, 255, 255, 0.05)" }, children: [
          /* @__PURE__ */ jsx(Link, { href: "/condominios", className: "btn-secondary", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing, className: "btn-primary", children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            processing ? "A guardar..." : editar ? "Guardar alterações" : "Criar condomínio"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function labelNumeroBlocos(tipo) {
  const map = {
    vertical: "Nº de edifícios previstos",
    horizontal: "Nº de conjuntos previstos",
    misto: "Nº de blocos previstos",
    loteamento: "Nº de fases previstas"
  };
  return map[tipo] ?? "Nº de blocos";
}
function TipoCard({
  activo,
  icon: Icon,
  label,
  descricao,
  exemplo,
  cor,
  onClick
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "text-left p-4 rounded-xl transition-all",
        activo ? "text-white" : "text-white/60 hover:text-white"
      ),
      style: {
        background: activo ? `${cor}12` : "rgba(255,255,255,0.02)",
        border: `0.5px solid ${activo ? cor + "60" : "rgba(255,255,255,0.1)"}`,
        boxShadow: activo ? `0 0 20px ${cor}20` : "none"
      },
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            style: { background: `${cor}15`, border: `0.5px solid ${cor}35` },
            children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: cor } })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm mb-0.5", style: { color: activo ? cor : void 0 }, children: label }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-white/60 mb-1.5", children: descricao }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40", children: exemplo })
        ] })
      ] })
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
