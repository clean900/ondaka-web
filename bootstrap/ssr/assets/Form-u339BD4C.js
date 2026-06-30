import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout, c as cn } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { Grid3x3, Briefcase, Store, Home, Building2, ArrowLeft, Layers, Save } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const TIPOS_BLOCO_DISPONIVEIS = {
  vertical: ["torre", "comercial", "empresarial"],
  horizontal: ["conjunto", "comercial"],
  misto: ["torre", "conjunto", "comercial", "empresarial"],
  loteamento: ["loteamento", "comercial"]
};
const TIPO_BLOCO_CONFIG = {
  torre: {
    label: "Torre/Edifício",
    descricao: "Prédio com apartamentos",
    icon: Building2,
    cor: "#00D4FF"
  },
  conjunto: {
    label: "Conjunto de Vivendas",
    descricao: "Agrupamento de moradias",
    icon: Home,
    cor: "#A855F7"
  },
  comercial: {
    label: "Galeria Comercial",
    descricao: "Lojas agrupadas",
    icon: Store,
    cor: "#EC4899"
  },
  empresarial: {
    label: "Bloco Empresarial",
    descricao: "Escritórios",
    icon: Briefcase,
    cor: "#F59E0B"
  },
  loteamento: {
    label: "Fase de Loteamento",
    descricao: "Agrupamento de lotes",
    icon: Grid3x3,
    cor: "#10B981"
  }
};
function Form({ edificio, condominio }) {
  const editar = !!edificio;
  const tiposDisponiveis = TIPOS_BLOCO_DISPONIVEIS[condominio.tipo] ?? ["torre"];
  const tipoInicial = (edificio == null ? void 0 : edificio.tipo_bloco) ?? tiposDisponiveis[0];
  const { data, setData, post, put, processing, errors } = useForm({
    condominio_id: condominio.id,
    nome: (edificio == null ? void 0 : edificio.nome) ?? "",
    codigo: (edificio == null ? void 0 : edificio.codigo) ?? "",
    tipo_bloco: tipoInicial,
    numero_pisos: (edificio == null ? void 0 : edificio.numero_pisos) ?? 1,
    pisos_subsolo: (edificio == null ? void 0 : edificio.pisos_subsolo) ?? 0,
    tem_elevador: (edificio == null ? void 0 : edificio.tem_elevador) ?? false,
    numero_elevadores: (edificio == null ? void 0 : edificio.numero_elevadores) ?? 0,
    descricao: (edificio == null ? void 0 : edificio.descricao) ?? ""
  });
  const submeter = (e) => {
    e.preventDefault();
    if (editar) {
      put(`/edificios/${edificio.id}`);
    } else {
      post(`/condominios/${condominio.id}/edificios`);
    }
  };
  const config = TIPO_BLOCO_CONFIG[data.tipo_bloco] ?? TIPO_BLOCO_CONFIG.torre;
  const mostrarPisos = data.tipo_bloco === "torre" || data.tipo_bloco === "empresarial";
  const labelHeader = tituloFormulario(condominio.tipo, editar, edificio == null ? void 0 : edificio.nome);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: labelHeader }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/condominios/${condominio.id}`,
          className: "inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Voltar a ",
            condominio.nome
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            style: {
              background: `linear-gradient(135deg, ${config.cor}25 0%, ${config.cor}10 100%)`,
              border: `0.5px solid ${config.cor}50`
            },
            children: /* @__PURE__ */ jsx(config.icon, { className: "w-6 h-6", style: { color: config.cor } })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: labelHeader }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: editar ? "Actualize os dados." : `Adicione um novo ${condominio.tipo === "horizontal" ? "conjunto" : "bloco"} ao condomínio.` })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-5", children: [
        !editar && tiposDisponiveis.length > 1 && /* @__PURE__ */ jsxs(Seccao, { icon: Grid3x3, iconColor: "#A855F7", titulo: "Tipo de bloco", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mb-3", children: "Escolha o tipo de bloco adequado a este condomínio." }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: tiposDisponiveis.map((tipo) => {
            const cfg = TIPO_BLOCO_CONFIG[tipo];
            return /* @__PURE__ */ jsx(
              TipoBlocoCard,
              {
                activo: data.tipo_bloco === tipo,
                icon: cfg.icon,
                label: cfg.label,
                descricao: cfg.descricao,
                cor: cfg.cor,
                onClick: () => setData("tipo_bloco", tipo)
              },
              tipo
            );
          }) })
        ] }),
        /* @__PURE__ */ jsx(Seccao, { icon: config.icon, iconColor: config.cor, titulo: "Identificação", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Nome", erro: errors.nome, obrigatorio: true, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.nome,
              onChange: (e) => setData("nome", e.target.value),
              className: "input",
              placeholder: placeholderNome(data.tipo_bloco)
            }
          ) }),
          /* @__PURE__ */ jsx(Campo, { label: "Código", erro: errors.codigo, obrigatorio: true, ajuda: "Ex: A, B, T1, Fase1", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.codigo,
              onChange: (e) => setData("codigo", e.target.value.toUpperCase()),
              className: "input font-mono",
              placeholder: "A"
            }
          ) })
        ] }) }),
        mostrarPisos && /* @__PURE__ */ jsxs(Seccao, { icon: Layers, iconColor: "#00D4FF", titulo: "Estrutura", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Nº de pisos", erro: errors.numero_pisos, obrigatorio: true, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                value: data.numero_pisos ?? 1,
                onChange: (e) => setData("numero_pisos", parseInt(e.target.value)),
                className: "input"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "Pisos subsolo", erro: errors.pisos_subsolo, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                value: data.pisos_subsolo ?? 0,
                onChange: (e) => setData("pisos_subsolo", parseInt(e.target.value)),
                className: "input"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer select-none py-1", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.tem_elevador,
                onChange: (e) => setData("tem_elevador", e.target.checked),
                className: "rounded border-white/20 bg-white/5 text-[#00D4FF] focus:ring-[#00D4FF]/30 focus:ring-offset-0"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-white", children: "Tem elevador" })
          ] }),
          data.tem_elevador && /* @__PURE__ */ jsx(Campo, { label: "Nº de elevadores", erro: errors.numero_elevadores, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              value: data.numero_elevadores,
              onChange: (e) => setData("numero_elevadores", parseInt(e.target.value)),
              className: "input sm:w-32"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(Seccao, { icon: config.icon, iconColor: config.cor, titulo: "Informações adicionais", children: /* @__PURE__ */ jsx(Campo, { label: "Descrição", erro: errors.descricao, children: /* @__PURE__ */ jsx(
          "textarea",
          {
            value: data.descricao,
            onChange: (e) => setData("descricao", e.target.value),
            rows: 3,
            className: "input resize-none",
            placeholder: "Notas, referências, características especiais..."
          }
        ) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 pt-5 mt-6", style: { borderTop: "0.5px solid rgba(255, 255, 255, 0.05)" }, children: [
          /* @__PURE__ */ jsx(Link, { href: `/condominios/${condominio.id}`, className: "btn-secondary", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing, className: "btn-primary", children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            processing ? "A guardar..." : editar ? "Guardar alterações" : `Criar ${labelAcao(data.tipo_bloco)}`
          ] })
        ] })
      ] })
    ] })
  ] });
}
function tituloFormulario(tipoCondominio, editar, nome) {
  if (editar) return `Editar ${nome}`;
  const labels = {
    vertical: "Novo edifício",
    horizontal: "Novo conjunto",
    misto: "Novo bloco",
    loteamento: "Nova fase"
  };
  return labels[tipoCondominio] ?? "Novo bloco";
}
function placeholderNome(tipoBloco) {
  const placeholders = {
    torre: "Torre A, Bloco Norte",
    conjunto: "Vivendas Fase 1, Conjunto Principal",
    comercial: "Galeria Entrada, Centro Comercial",
    empresarial: "Torre Empresarial A",
    loteamento: "Fase 1, Expansão Oeste"
  };
  return placeholders[tipoBloco] ?? "Nome";
}
function labelAcao(tipoBloco) {
  const labels = {
    torre: "edifício",
    conjunto: "conjunto",
    comercial: "galeria",
    empresarial: "bloco",
    loteamento: "fase"
  };
  return labels[tipoBloco] ?? "bloco";
}
function TipoBlocoCard({
  activo,
  icon: Icon,
  label,
  descricao,
  cor,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "text-left p-3 rounded-xl transition-all flex items-start gap-3",
        activo ? "text-white" : "text-white/60 hover:text-white"
      ),
      style: {
        background: activo ? `${cor}12` : "rgba(255,255,255,0.02)",
        border: `0.5px solid ${activo ? cor + "60" : "rgba(255,255,255,0.1)"}`,
        boxShadow: activo ? `0 0 15px ${cor}20` : "none"
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            style: { background: `${cor}15`, border: `0.5px solid ${cor}35` },
            children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: cor } })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", style: { color: activo ? cor : void 0 }, children: label }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-white/60 mt-0.5", children: descricao })
        ] })
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
