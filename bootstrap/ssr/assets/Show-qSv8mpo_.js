import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout, f as formatDate, i as iniciais, g as gradientDeNome } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Building2, MapPin, FileText, Users, CreditCard, Edit, Trash2, Hash, User, Calendar, Landmark, DollarSign, Shield, Plus, ChevronRight } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Show({ condominio, estatisticas }) {
  var _a;
  const eliminar = () => {
    if (confirm(`Tem a certeza que quer arquivar «${condominio.nome}»?`)) {
      router.delete(`/condominios/${condominio.id}`);
    }
  };
  const percentagemOcupacao = estatisticas.total_fraccoes > 0 ? Math.round(estatisticas.fraccoes_ocupadas / estatisticas.total_fraccoes * 100) : 0;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: condominio.nome }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
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
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
              style: {
                background: "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
                border: "0.5px solid rgba(0, 212, 255, 0.3)"
              },
              children: /* @__PURE__ */ jsx(Building2, { className: "w-7 h-7 text-[#00D4FF]" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: condominio.nome }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 mt-2 text-sm text-white/60", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10", children: condominio.codigo }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5 text-[#A855F7]" }),
                condominio.municipio,
                condominio.bairro && ` · ${condominio.bairro}`
              ] }),
              /* @__PURE__ */ jsx(EstadoBadge, { estado: condominio.estado })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(Link, { href: `/condominios/${condominio.id}/regulamento`, className: "btn-secondary", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
            "Regulamento"
          ] }),
          /* @__PURE__ */ jsxs(Link, { href: `/condominios/${condominio.id}/comissao`, className: "btn-secondary", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
            "Comissão"
          ] }),
          /* @__PURE__ */ jsxs(Link, { href: `/condominios/${condominio.id}/facturacao`, className: "btn-secondary", children: [
            /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
            "Facturação"
          ] }),
          /* @__PURE__ */ jsxs(Link, { href: `/condominios/${condominio.id}/edit`, className: "btn-secondary", children: [
            /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
            "Editar"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: eliminar, className: "btn-danger", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-8", children: [
      /* @__PURE__ */ jsx(
        StatBox,
        {
          label: labelBlocos(condominio.tipo),
          valor: estatisticas.total_edificios,
          icon: Building2,
          cor: "#00D4FF"
        }
      ),
      /* @__PURE__ */ jsx(
        StatBox,
        {
          label: labelFraccoes(condominio.tipo),
          valor: estatisticas.total_fraccoes,
          icon: Hash,
          cor: "#A855F7"
        }
      ),
      /* @__PURE__ */ jsx(
        StatBox,
        {
          label: "Ocupadas",
          valor: estatisticas.fraccoes_ocupadas,
          icon: User,
          cor: "#10B981",
          subtitulo: `${percentagemOcupacao}% do total`
        }
      ),
      /* @__PURE__ */ jsx(
        StatBox,
        {
          label: "Vagas",
          valor: estatisticas.fraccoes_vagas,
          icon: FileText,
          cor: "#F59E0B"
        }
      )
    ] }),
    estatisticas.total_fraccoes > 0 && /* @__PURE__ */ jsxs("div", { className: "card mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-white", children: "Taxa de ocupação" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50 mt-0.5", children: [
            estatisticas.fraccoes_ocupadas,
            " de ",
            estatisticas.total_fraccoes,
            " fracções ocupadas"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold text-white", children: [
          percentagemOcupacao,
          /* @__PURE__ */ jsx("span", { className: "text-sm text-white/50", children: "%" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full transition-all duration-700",
          style: {
            width: `${percentagemOcupacao}%`,
            background: "linear-gradient(90deg, #00D4FF 0%, #A855F7 60%, #EC4899 100%)",
            boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)"
          }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-[#A855F7]" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Dados legais" })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(InfoLine, { label: "NIF", value: condominio.nif, icon: Hash }),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              label: "Data constituição",
              value: condominio.data_constituicao ? formatDate(condominio.data_constituicao) : null,
              icon: Calendar
            }
          ),
          /* @__PURE__ */ jsx(InfoLine, { label: "Matrícula", value: condominio.numero_matricula, icon: FileText }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Conservatória", value: condominio.conservatoria, icon: Landmark })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4 text-[#00D4FF]" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Financeiro" })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(InfoLine, { label: "Banco", value: condominio.banco, icon: Landmark }),
          /* @__PURE__ */ jsx(InfoLine, { label: "IBAN", value: condominio.iban, icon: CreditCard, mono: true }),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              label: "UCF actual",
              value: condominio.ucf_valor_actual ? `${Number(condominio.ucf_valor_actual).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz` : null,
              icon: DollarSign
            }
          ),
          /* @__PURE__ */ jsx(
            InfoLine,
            {
              label: "Fundo reserva",
              value: `${condominio.percentagem_fundo_reserva}%`,
              icon: Shield,
              destaque: parseFloat(((_a = condominio.percentagem_fundo_reserva) == null ? void 0 : _a.toString()) ?? "0") >= 10
            }
          )
        ] })
      ] })
    ] }),
    condominio.administrador && /* @__PURE__ */ jsxs("div", { className: "card mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-[#EC4899]" }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Administrador do condomínio" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0",
            style: { background: gradientDeNome(condominio.administrador.name) },
            children: iniciais(condominio.administrador.name)
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-white text-sm", children: condominio.administrador.name }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/50 mt-0.5", children: [
            condominio.administrador.email,
            condominio.administrador.telefone && ` · ${condominio.administrador.telefone}`
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: labelBlocos(condominio.tipo) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50 mt-0.5", children: [
          condominio.edificios.length,
          " ",
          condominio.edificios.length === 1 ? labelBloco(condominio.tipo).toLowerCase() : labelBlocos(condominio.tipo).toLowerCase(),
          " registados"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/condominios/${condominio.id}/edificios/create`,
          className: "btn-primary",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Adicionar ",
            labelBloco(condominio.tipo).toLowerCase()
          ]
        }
      )
    ] }),
    condominio.edificios.length === 0 ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: "text-center py-16 rounded-xl",
        style: {
          background: "rgba(255,255,255,0.02)",
          border: "0.5px dashed rgba(168, 85, 247, 0.2)"
        },
        children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-12 w-12 text-white/20 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/50 text-sm", children: "Nenhum edifício registado." }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: `/condominios/${condominio.id}/edificios/create`,
              className: "inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] text-sm font-medium transition",
              children: [
                "Adicionar o primeiro edifício",
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3" })
              ]
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: condominio.edificios.map((e) => /* @__PURE__ */ jsxs(
      Link,
      {
        href: `/edificios/${e.id}`,
        className: "card group hover:-translate-y-0.5 transition-all",
        style: { cursor: "pointer" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-9 h-9 rounded-lg flex items-center justify-center",
                style: {
                  background: "rgba(168, 85, 247, 0.1)",
                  border: "0.5px solid rgba(168, 85, 247, 0.25)"
                },
                children: /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-[#A855F7]" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5 border border-white/5", children: e.codigo })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-white text-sm group-hover:text-[#00D4FF] transition", children: e.nome }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50 mt-1", children: [
            e.numero_pisos,
            " pisos",
            e.tem_elevador && " · c/ elevador"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-3 border-t border-white/5 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-white/60", children: [
              e.fraccoes_count ?? 0,
              " fracções"
            ] }),
            /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition" })
          ] })
        ]
      },
      e.id
    )) })
  ] });
}
function StatBox({
  label,
  valor,
  icon: Icon,
  cor,
  subtitulo
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl p-4 transition-all",
      style: {
        background: `linear-gradient(135deg, ${cor}15 0%, ${cor}05 100%)`,
        border: `0.5px solid ${cor}35`
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between mb-2", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-8 h-8 rounded-lg flex items-center justify-center",
            style: { background: `${cor}20`, border: `0.5px solid ${cor}40` },
            children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: cor } })
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-[1px] font-medium mb-0.5", children: label }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-white tracking-tight", children: valor }),
        subtitulo && /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40 mt-1", children: subtitulo })
      ]
    }
  );
}
function InfoLine({
  label,
  value,
  icon: Icon,
  mono,
  destaque
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 py-1.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-white/50 text-xs flex-shrink-0", children: [
      Icon && /* @__PURE__ */ jsx(Icon, { className: "w-3 h-3" }),
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: `text-right text-sm ${mono ? "font-mono text-xs" : ""} ${value ? destaque ? "text-emerald-400 font-medium" : "text-white" : "text-white/30"}`, children: value || "—" })
  ] });
}
function EstadoBadge({ estado }) {
  const variants = {
    activo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    inactivo: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    arquivado: "bg-white/5 text-white/50 border-white/10"
  };
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${variants[estado] ?? variants.arquivado}`,
      children: [
        /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-current" }),
        estado
      ]
    }
  );
}
function labelBlocos(tipo) {
  const map = {
    vertical: "Edifícios",
    horizontal: "Conjuntos",
    misto: "Blocos",
    loteamento: "Fases"
  };
  return map[tipo] ?? "Blocos";
}
function labelBloco(tipo) {
  const map = {
    vertical: "Edifício",
    horizontal: "Conjunto",
    misto: "Bloco",
    loteamento: "Fase"
  };
  return map[tipo] ?? "Bloco";
}
function labelFraccoes(tipo) {
  const map = {
    vertical: "Apartamentos",
    horizontal: "Vivendas",
    misto: "Fracções",
    loteamento: "Lotes"
  };
  return map[tipo] ?? "Fracções";
}
export {
  Show as default
};
