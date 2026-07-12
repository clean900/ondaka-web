import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BX6gg7g7.js";
import { Head, Link, router } from "@inertiajs/react";
import { Clock, Users, Filter, Search, User, Home, LogIn, LogOut, Car, Package, AlertTriangle, Key } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const METODO_CONFIG = {
  qr: { label: "QR", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  otp: { label: "OTP", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  manual: { label: "Manual", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" }
};
function Historico({ visitas, filtros }) {
  const [form, setForm] = useState(filtros);
  const aplicarFiltros = () => {
    const params = {};
    if (form.desde) params.desde = form.desde;
    if (form.ate) params.ate = form.ate;
    if (form.nome) params.nome = form.nome;
    if (form.metodo) params.metodo = form.metodo;
    router.get("/visitantes/historico", params, { preserveState: true, preserveScroll: true });
  };
  const limparFiltros = () => {
    setForm({ desde: "", ate: "", nome: "", metodo: "" });
    router.get("/visitantes/historico", {}, { preserveState: true, preserveScroll: true });
  };
  const formatarDataHora = (iso) => {
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const ano = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  };
  const calcularDuracao = (entrou, saiu) => {
    const inicio = new Date(entrou);
    const fim = new Date(saiu);
    const minutos = Math.floor((fim.getTime() - inicio.getTime()) / 6e4);
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Histórico de visitas — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Histórico de visitas" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              visitas.total,
              " registos encontrados"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/visitantes/dentro-agora",
            className: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 px-4 py-2 text-sm font-medium",
            children: [
              /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
              "Dentro agora"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 text-zinc-400 text-sm", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
          "Filtros"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Desde" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: form.desde,
                onChange: (e) => setForm({ ...form, desde: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Até" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: form.ate,
                onChange: (e) => setForm({ ...form, ate: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Nome do visitante" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: form.nome,
                  onChange: (e) => setForm({ ...form, nome: e.target.value }),
                  onKeyDown: (e) => e.key === "Enter" && aplicarFiltros(),
                  placeholder: "Pesquisar...",
                  className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs text-zinc-500 mb-1", children: "Método" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.metodo,
                onChange: (e) => setForm({ ...form, metodo: e.target.value }),
                className: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Todos" }),
                  /* @__PURE__ */ jsx("option", { value: "qr", children: "QR Code" }),
                  /* @__PURE__ */ jsx("option", { value: "otp", children: "Código OTP" }),
                  /* @__PURE__ */ jsx("option", { value: "manual", children: "Manual" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: aplicarFiltros,
                className: "flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white rounded-lg px-3 py-2 text-sm font-medium",
                children: "Filtrar"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: limparFiltros,
                className: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-sm",
                children: "Limpar"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: [
        visitas.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-12 w-12 text-zinc-700 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-zinc-400 font-medium", children: "Nenhuma visita encontrada" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-600 mt-1", children: "Ajuste os filtros ou espere por novas visitas." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-zinc-800", children: visitas.data.map((v) => {
          var _a;
          const metodoConfig = METODO_CONFIG[v.metodo_validacao];
          const aindaDentro = v.saiu_em === null;
          return /* @__PURE__ */ jsx("div", { className: "p-4 md:p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1", children: [
              v.foto_entrada_path ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: `/ficheiros/${v.foto_entrada_path}`,
                  alt: "Visitante",
                  className: "h-10 w-10 rounded-lg object-cover flex-shrink-0"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-cyan-400" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-zinc-100", children: ((_a = v.visitante) == null ? void 0 : _a.nome) ?? "Visitante" }),
                v.fraccao && /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500 flex items-center gap-1 mt-0.5", children: [
                  /* @__PURE__ */ jsx(Home, { className: "h-3.5 w-3.5" }),
                  "Fracção ",
                  v.fraccao.identificador,
                  v.fraccao.piso !== null && ` (Piso ${v.fraccao.piso})`
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(LogIn, { className: "h-3 w-3 text-emerald-400" }),
                    "Entrou: ",
                    formatarDataHora(v.entrou_em)
                  ] }),
                  v.saiu_em ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(LogOut, { className: "h-3 w-3 text-red-400" }),
                      "Saiu: ",
                      formatarDataHora(v.saiu_em)
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "text-zinc-600", children: [
                      "Duração: ",
                      calcularDuracao(v.entrou_em, v.saiu_em)
                    ] })
                  ] }) : /* @__PURE__ */ jsx("span", { className: "text-emerald-400 font-medium", children: "AINDA DENTRO" }),
                  v.matricula && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-zinc-400", children: [
                    /* @__PURE__ */ jsx(Car, { className: "h-3 w-3" }),
                    v.matricula
                  ] })
                ] }),
                v.itens && v.itens.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: v.itens.map((it) => /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: `inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${it.estado === "saiu" ? "text-emerald-400 bg-emerald-500/10" : it.estado === "ficou" ? "text-amber-400 bg-amber-500/10" : "text-cyan-400 bg-cyan-500/10"}`,
                    children: [
                      /* @__PURE__ */ jsx(Package, { className: "h-3 w-3" }),
                      it.quantidade > 1 ? `${it.quantidade}× ` : "",
                      it.descricao,
                      !it.registado_na_entrada && /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3 text-amber-400" })
                    ]
                  },
                  it.id
                )) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1", children: [
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: `inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${metodoConfig.color}`,
                  children: [
                    /* @__PURE__ */ jsx(Key, { className: "h-3 w-3" }),
                    metodoConfig.label
                  ]
                }
              ),
              aindaDentro && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30", children: "Activa" })
            ] })
          ] }) }, v.id);
        }) }),
        visitas.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-zinc-800 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
            "Página ",
            visitas.current_page,
            " de ",
            visitas.last_page
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: visitas.links.map((link, i) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url ?? "#",
              preserveState: true,
              preserveScroll: true,
              className: `px-3 py-1 text-sm rounded-md ${link.active ? "bg-cyan-500 text-zinc-950 font-medium" : link.url ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "text-zinc-700 cursor-not-allowed"}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            i
          )) })
        ] })
      ] })
    ] })
  ] });
}
export {
  Historico as default
};
