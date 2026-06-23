import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BevyWQSg.js";
import { Head, Link, router } from "@inertiajs/react";
import { Plus, Search, Building2, ChevronRight, MapPin, Users2 } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Index({ condominios, filtros }) {
  const [pesquisa, setPesquisa] = useState(filtros.pesquisa ?? "");
  const [estado, setEstado] = useState(filtros.estado ?? "");
  const submeter = (e) => {
    e.preventDefault();
    router.get("/condominios", { pesquisa, estado }, { preserveState: true });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Condomínios" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white tracking-tight", children: "Condomínios" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1.5", children: "Gestão dos condomínios sob administração da empresa." })
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: "/condominios/create", className: "btn-primary", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "Novo condomínio"
      ] })
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
            placeholder: "Pesquisar por nome, código, bairro ou município...",
            className: "input pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: estado,
          onChange: (e) => setEstado(e.target.value),
          className: "input sm:w-48",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Todos os estados" }),
            /* @__PURE__ */ jsx("option", { value: "activo", children: "Activo" }),
            /* @__PURE__ */ jsx("option", { value: "inactivo", children: "Inactivo" }),
            /* @__PURE__ */ jsx("option", { value: "arquivado", children: "Arquivado" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-secondary", children: "Filtrar" })
    ] }),
    condominios.data.length === 0 ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: "text-center py-16 rounded-xl",
        style: {
          background: "rgba(255,255,255,0.02)",
          border: "0.5px dashed rgba(168, 85, 247, 0.2)"
        },
        children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-12 w-12 text-white/20 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/50", children: "Nenhum condomínio encontrado." }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/condominios/create",
              className: "inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] font-medium text-sm transition",
              children: [
                "Criar o primeiro condomínio",
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3" })
              ]
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: condominios.data.map((c) => /* @__PURE__ */ jsxs(
      Link,
      {
        href: `/condominios/${c.id}`,
        className: "card group hover:-translate-y-0.5 transition-all",
        style: { cursor: "pointer" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-10 h-10 rounded-lg flex items-center justify-center",
                style: {
                  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)",
                  border: "0.5px solid rgba(0, 212, 255, 0.25)"
                },
                children: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-[#00D4FF]" })
              }
            ),
            /* @__PURE__ */ jsx(EstadoBadge, { estado: c.estado })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-white group-hover:text-[#00D4FF] transition", children: c.nome }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-white/40 mt-0.5 font-mono", children: c.codigo }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-1.5 text-xs text-white/60", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-[#A855F7]" }),
            c.municipio,
            c.bairro ? ` · ${c.bairro}` : ""
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-3 border-t border-white/5 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-white/60", children: [
              /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: c.edificios_count ?? 0 }),
              " edif",
              /* @__PURE__ */ jsx("span", { className: "mx-1 text-white/30", children: "·" }),
              /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: c.fraccoes_count ?? 0 }),
              " fracções"
            ] }),
            c.administrador && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-white/50 text-[10px]", children: [
              /* @__PURE__ */ jsx(Users2, { className: "h-3 w-3" }),
              c.administrador.name.split(" ")[0]
            ] })
          ] })
        ]
      },
      c.id
    )) }),
    condominios.data.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/50", children: [
        "A mostrar ",
        /* @__PURE__ */ jsxs("span", { className: "text-white font-medium", children: [
          condominios.from,
          "–",
          condominios.to
        ] }),
        " de",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: condominios.total })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: condominios.links.map((link, i) => /* @__PURE__ */ jsx(
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
export {
  Index as default
};
