import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-ChtKe8ca.js";
import { Head } from "@inertiajs/react";
import { Users, UserCog, Briefcase, Shield, Wrench, Building2, Phone } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const CATEGORIAS = [
  {
    titulo: "Administração",
    descricao: "Quem lidera e administra",
    icon: UserCog,
    iconColor: "text-cyan-400",
    gradient: "from-cyan-400 to-purple-500",
    roles: ["admin-empresa", "administrador-condominio"]
  },
  {
    titulo: "Gestão",
    descricao: "Equipa de gestão diária",
    icon: Briefcase,
    iconColor: "text-purple-400",
    gradient: "from-purple-500 to-pink-500",
    roles: ["gestor"]
  },
  {
    titulo: "Segurança",
    descricao: "Vigilância e portaria",
    icon: Shield,
    iconColor: "text-emerald-400",
    gradient: "from-emerald-400 to-cyan-500",
    roles: ["guarda"]
  },
  {
    titulo: "Funcionários",
    descricao: "Limpeza, manutenção e operações",
    icon: Wrench,
    iconColor: "text-amber-400",
    gradient: "from-amber-400 to-orange-500",
    roles: ["funcionario"]
  },
  {
    titulo: "Empresas Prestadoras",
    descricao: "Serviços externos contratados",
    icon: Building2,
    iconColor: "text-orange-400",
    gradient: "from-orange-500 to-red-500",
    roles: ["empresa-prestadora"]
  }
];
function Equipa({ equipa }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Equipa — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "A nossa equipa" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "Conheça quem cuida do seu condomínio" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-zinc-600 mb-8", children: [
        equipa.length,
        " ",
        equipa.length === 1 ? "membro" : "membros",
        " disponíveis"
      ] }),
      equipa.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-12 text-center", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-zinc-500", children: "Ainda não há membros da equipa registados." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-10", children: CATEGORIAS.map((cat) => {
        const membros = equipa.filter((m) => cat.roles.includes(m.role_slug));
        if (membros.length === 0) return null;
        const CatIcon = cat.icon;
        return /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800/60", children: [
            /* @__PURE__ */ jsx(CatIcon, { className: `h-5 w-5 ${cat.iconColor}` }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-zinc-100", children: cat.titulo }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: cat.descricao })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-md border border-zinc-800", children: [
              membros.length,
              " ",
              membros.length === 1 ? "membro" : "membros"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: membros.map((m) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 hover:border-zinc-700 transition", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: `h-16 w-16 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`, children: m.tipo === "empresa" ? /* @__PURE__ */ jsx(Building2, { className: "h-7 w-7 text-white" }) : /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-white", children: m.inicial }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-zinc-100 truncate", children: m.nome }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mt-0.5 truncate", children: m.cargo })
              ] })
            ] }),
            m.telefone && /* @__PURE__ */ jsxs(
              "a",
              {
                href: `tel:${m.telefone}`,
                className: "mt-4 flex items-center gap-2 text-sm text-zinc-300 hover:text-cyan-300 transition",
                children: [
                  /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
                  m.telefone
                ]
              }
            ),
            !m.telefone && /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-zinc-600", children: "Sem contacto disponível" })
          ] }, `${m.tipo}-${m.id}`)) })
        ] }, cat.titulo);
      }) })
    ] })
  ] });
}
export {
  Equipa as default
};
