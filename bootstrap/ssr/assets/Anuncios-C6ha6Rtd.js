import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-DgYf1ZPG.js";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function AdminMarketplaceAnuncios({ anuncios, filtros }) {
  const [q, setQ] = useState(filtros.q);
  const pesquisar = () => {
    router.get("/admin/marketplace/anuncios", q ? { q } : {}, { preserveState: false });
  };
  const filtrarEstado = (estado) => {
    router.get("/admin/marketplace/anuncios", estado ? { estado_moderacao: estado } : {}, {
      preserveState: false
    });
  };
  const remover = (id) => {
    if (confirm("Remover este anúncio?")) {
      router.patch(`/admin/marketplace/anuncio/${id}/remover`);
    }
  };
  const reactivar = (id) => {
    router.patch(`/admin/marketplace/anuncio/${id}/reactivar`);
  };
  const preco = (v) => v == null ? "A combinar" : `${v.toLocaleString("pt-PT")} Kz`;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Anúncios — Marketplace" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white mb-1", children: "Todos os anúncios" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-6", children: "Listagem completa para auditoria. Inclui os dados reais de quem publicou." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            value: q,
            onChange: (e) => setQ(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && pesquisar(),
            placeholder: "Pesquisar título ou nome...",
            className: "flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          }
        ),
        /* @__PURE__ */ jsx("button", { onClick: pesquisar, className: "px-4 py-2 text-sm rounded-lg bg-[#00D4FF]/15 text-[#8FE7FF] hover:bg-[#00D4FF]/25", children: "Pesquisar" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filtros.estado_moderacao,
            onChange: (e) => filtrarEstado(e.target.value),
            className: "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Todos os estados" }),
              /* @__PURE__ */ jsx("option", { value: "activo", children: "Activos" }),
              /* @__PURE__ */ jsx("option", { value: "removido", children: "Removidos" })
            ]
          }
        )
      ] }),
      anuncios.data.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 rounded-xl bg-white/[0.03] border border-white/10 text-center text-white/50", children: "Sem anúncios." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: anuncios.data.map((a) => /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: a.titulo }),
            a.estado_moderacao === "removido" && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-300", children: "removido" }),
            a.denuncias_count > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300", children: [
              a.denuncias_count,
              " denúncia(s)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60", children: [
            a.categoria,
            " · ",
            preco(a.preco),
            " · ",
            a.tipo,
            " · ",
            a.visibilidade,
            " · ",
            a.created_at
          ] }),
          a.autor && /* @__PURE__ */ jsxs("div", { className: "mt-2 p-2 rounded-lg bg-white/[0.04]", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/40", children: [
              "Anunciante real (alcunha: ",
              a.nome_exibicao ?? "—",
              ")"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/80", children: [
              a.autor.nome,
              " · ",
              a.autor.email
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60", children: [
              a.autor.telefone ?? "Sem telefone",
              a.autor.condominio ? ` · ${a.autor.condominio}` : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "shrink-0", children: a.estado_moderacao !== "removido" ? /* @__PURE__ */ jsx("button", { onClick: () => remover(a.id), className: "px-3 py-1.5 text-sm rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25", children: "Remover" }) : /* @__PURE__ */ jsx("button", { onClick: () => reactivar(a.id), className: "px-3 py-1.5 text-sm rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25", children: "Reactivar" }) })
      ] }) }, a.id)) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-6", children: anuncios.links.map((link, i) => /* @__PURE__ */ jsx(
        "button",
        {
          disabled: !link.url,
          onClick: () => link.url && router.visit(link.url),
          className: `px-3 py-1.5 text-sm rounded-lg ${link.active ? "bg-[#00D4FF]/20 text-[#8FE7FF]" : "bg-white/5 text-white/60 hover:bg-white/10"} disabled:opacity-30`,
          dangerouslySetInnerHTML: { __html: link.label }
        },
        i
      )) })
    ] })
  ] });
}
export {
  AdminMarketplaceAnuncios as default
};
