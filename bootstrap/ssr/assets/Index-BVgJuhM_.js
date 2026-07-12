import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout, i as iniciais, g as gradientDeNome } from "./AuthenticatedLayout-BX6gg7g7.js";
import { Head, Link, router } from "@inertiajs/react";
import { Plus, Users, UserCircle, Building, Home, Search, ChevronRight, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Index({ condominos, filtros, condominios, contagens }) {
  const [pesquisa, setPesquisa] = useState(filtros.pesquisa ?? "");
  const [tipo, setTipo] = useState(filtros.tipo ?? "");
  const [estado, setEstado] = useState(filtros.estado ?? "");
  const [condominio, setCondominio] = useState(filtros.condominio ?? "");
  const submeter = (e) => {
    e.preventDefault();
    router.get("/condominos", { pesquisa, tipo, estado, condominio }, { preserveState: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Condóminos" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white tracking-tight", children: "Condóminos" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1.5", children: "Pessoas e empresas registadas na plataforma." })
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: "/condominos/create", className: "btn-primary", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "Novo condómino"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [
      /* @__PURE__ */ jsx(StatPill, { label: "Total", valor: contagens.total, icon: Users, cor: "#00D4FF" }),
      /* @__PURE__ */ jsx(StatPill, { label: "Singulares", valor: contagens.singulares, icon: UserCircle, cor: "#A855F7" }),
      /* @__PURE__ */ jsx(StatPill, { label: "Empresas", valor: contagens.empresas, icon: Building, cor: "#EC4899" }),
      /* @__PURE__ */ jsx(StatPill, { label: "Activos", valor: contagens.activos, icon: Home, cor: "#10B981" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "mb-6 flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: pesquisa,
            onChange: (e) => setPesquisa(e.target.value),
            placeholder: "Pesquisar por nome, BI, NIF, email ou telefone...",
            className: "input pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("select", { value: tipo, onChange: (e) => setTipo(e.target.value), className: "input sm:w-40", children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Todos os tipos" }),
        /* @__PURE__ */ jsx("option", { value: "singular", children: "Singular" }),
        /* @__PURE__ */ jsx("option", { value: "empresa", children: "Empresa" })
      ] }),
      /* @__PURE__ */ jsxs("select", { value: estado, onChange: (e) => setEstado(e.target.value), className: "input sm:w-40", children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "Todos os estados" }),
        /* @__PURE__ */ jsx("option", { value: "activo", children: "Activo" }),
        /* @__PURE__ */ jsx("option", { value: "inactivo", children: "Inactivo" }),
        /* @__PURE__ */ jsx("option", { value: "arquivado", children: "Arquivado" })
      ] }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: condominio,
          onChange: (e) => {
            const v = e.target.value;
            setCondominio(v);
            router.get("/condominos", { pesquisa, tipo, estado, condominio: v }, { preserveState: true });
          },
          className: "input sm:w-48",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Todos os condomínios" }),
            condominios.map((cond) => /* @__PURE__ */ jsx("option", { value: cond.id, children: cond.nome }, cond.id))
          ]
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-secondary", children: "Filtrar" })
    ] }),
    condominos.data.length === 0 ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: "text-center py-16 rounded-xl",
        style: {
          background: "rgba(255,255,255,0.02)",
          border: "0.5px dashed rgba(168, 85, 247, 0.2)"
        },
        children: [
          /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 text-white/20 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/50", children: "Ainda não há condóminos registados." }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/condominos/create",
              className: "inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] font-medium text-sm transition",
              children: [
                "Registar o primeiro condómino",
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3" })
              ]
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: condominos.data.map((c) => /* @__PURE__ */ jsx(CondominoCard, { condomino: c }, c.id)) }),
    condominos.data.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/50", children: [
        "A mostrar ",
        /* @__PURE__ */ jsxs("span", { className: "text-white font-medium", children: [
          condominos.from,
          "–",
          condominos.to
        ] }),
        " de",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: condominos.total })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: condominos.links.map((link, i) => /* @__PURE__ */ jsx(
        "button",
        {
          disabled: !link.url,
          onClick: () => link.url && router.get(link.url),
          className: `min-w-[34px] px-3 py-1.5 rounded-lg text-xs transition ${link.active ? "text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"}`,
          style: link.active ? {
            background: "linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)"
          } : void 0,
          dangerouslySetInnerHTML: {
            __html: link.label.replace("pagination.previous", "Anterior").replace("pagination.next", "Seguinte").replace("&laquo;", "‹").replace("&raquo;", "›")
          }
        },
        i
      )) })
    ] })
  ] });
}
function StatPill({
  label,
  valor,
  icon: Icon,
  cor
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl p-4 flex items-center gap-3",
      style: {
        background: `linear-gradient(135deg, ${cor}12 0%, ${cor}04 100%)`,
        border: `0.5px solid ${cor}30`
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            style: { background: `${cor}20`, border: `0.5px solid ${cor}40` },
            children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: cor } })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-wider font-medium", children: label }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold text-white", children: valor })
        ] })
      ]
    }
  );
}
function CondominoCard({ condomino }) {
  var _a;
  const nomeExibicao = condomino.tipo === "empresa" && condomino.nome_comercial ? condomino.nome_comercial : condomino.nome_completo;
  const documento = condomino.tipo === "empresa" ? { label: "NIF", valor: condomino.nif } : { label: "BI", valor: condomino.numero_bi };
  const totalFraccoes = (condomino.propriedades_count ?? 0) + (condomino.arrendamentos_count ?? 0);
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/condominos/${condomino.id}`,
      className: "card group hover:-translate-y-0.5 transition-all block",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 mb-3", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0",
              style: { background: gradientDeNome(condomino.nome_completo) },
              children: iniciais(condomino.nome_completo)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium text-white text-sm truncate group-hover:text-[#00D4FF] transition", children: nomeExibicao }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
              /* @__PURE__ */ jsx(TipoBadge, { tipo: condomino.tipo }),
              /* @__PURE__ */ jsx(EstadoDot, { estado: condomino.estado })
            ] }),
            condomino.condominio_nome && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 max-w-full", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-2.5 h-2.5 flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: condomino.condominio_nome }),
              (((_a = condomino.condominios_nomes) == null ? void 0 : _a.length) ?? 0) > 1 && /* @__PURE__ */ jsxs("span", { className: "text-[#00D4FF]/70", children: [
                "+",
                condomino.condominios_nomes.length - 1
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-xs", children: [
          documento.valor && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-white/50", children: documento.label }),
            /* @__PURE__ */ jsx("span", { className: "text-white/80 font-mono text-[11px]", children: documento.valor })
          ] }),
          condomino.telefone_principal && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-white/60", children: [
            /* @__PURE__ */ jsx(Phone, { className: "w-3 h-3 text-white/40" }),
            /* @__PURE__ */ jsx("span", { className: "truncate", children: condomino.telefone_principal })
          ] }),
          condomino.email && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-white/60", children: [
            /* @__PURE__ */ jsx(Mail, { className: "w-3 h-3 text-white/40" }),
            /* @__PURE__ */ jsx("span", { className: "truncate", children: condomino.email })
          ] })
        ] }),
        totalFraccoes > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-white/60", children: [
            /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: totalFraccoes }),
            " ",
            totalFraccoes === 1 ? "fracção" : "fracções"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 text-[10px] text-white/40", children: [
            (condomino.propriedades_count ?? 0) > 0 && /* @__PURE__ */ jsxs("span", { children: [
              condomino.propriedades_count,
              " prop."
            ] }),
            (condomino.arrendamentos_count ?? 0) > 0 && /* @__PURE__ */ jsxs("span", { children: [
              condomino.arrendamentos_count,
              " arrend."
            ] })
          ] })
        ] })
      ]
    }
  );
}
function TipoBadge({ tipo }) {
  if (tipo === "empresa") {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20", children: [
      /* @__PURE__ */ jsx(Building, { className: "w-2.5 h-2.5" }),
      "Empresa"
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20", children: [
    /* @__PURE__ */ jsx(UserCircle, { className: "w-2.5 h-2.5" }),
    "Singular"
  ] });
}
function EstadoDot({ estado }) {
  const cor = estado === "activo" ? "#10B981" : estado === "inactivo" ? "#F59E0B" : "#64748B";
  return /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full", style: { background: cor } });
}
export {
  Index as default
};
