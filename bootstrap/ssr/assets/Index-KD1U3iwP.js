import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head, router } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function AdminMarketplaceIndex({ denuncias }) {
  const remover = (anuncioId) => {
    if (confirm("Remover este anúncio? Deixará de estar visível no marketplace.")) {
      router.patch(`/admin/marketplace/anuncio/${anuncioId}/remover`);
    }
  };
  const reactivar = (anuncioId) => {
    router.patch(`/admin/marketplace/anuncio/${anuncioId}/reactivar`);
  };
  const resolver = (denunciaId) => {
    router.patch(`/admin/marketplace/denuncia/${denunciaId}/resolver`);
  };
  const preco = (v) => v == null ? "A combinar" : `${v.toLocaleString("pt-PT")} Kz`;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Moderação — Marketplace" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white mb-1", children: "Moderação do Marketplace" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-6", children: "Denúncias de anúncios. Remova os que violem as regras ou reactive os removidos." }),
      denuncias.data.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 rounded-xl bg-white/[0.03] border border-white/10 text-center text-white/50", children: "Sem denúncias de momento." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: denuncias.data.map((d) => {
        var _a;
        return /* @__PURE__ */ jsx(
          "div",
          {
            className: "p-4 rounded-xl bg-white/[0.03] border border-white/10",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300", children: d.estado === "pendente" ? "Pendente" : "Resolvida" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: d.created_at })
                ] }),
                d.anuncio ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-white font-medium", children: [
                    d.anuncio.titulo,
                    d.anuncio.estado_moderacao === "removido" && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs text-red-400", children: "(removido)" })
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60", children: [
                    d.anuncio.categoria,
                    " · ",
                    preco(d.anuncio.preco),
                    " · por ",
                    d.anuncio.nome_exibicao ?? "—"
                  ] })
                ] }) : /* @__PURE__ */ jsx("p", { className: "text-white/50 italic", children: "Anúncio apagado" }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/80 mt-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Motivo:" }),
                  " ",
                  d.motivo
                ] }),
                d.detalhe && /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: d.detalhe }),
                ((_a = d.anuncio) == null ? void 0 : _a.autor) && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 rounded-lg bg-white/[0.04] border border-white/10", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 mb-1", children: "Dados do anunciante (auditoria)" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/80", children: [
                    d.anuncio.autor.nome,
                    " · ",
                    d.anuncio.autor.email
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60", children: [
                    d.anuncio.autor.telefone ?? "Sem telefone",
                    d.anuncio.autor.condominio ? ` · ${d.anuncio.autor.condominio}` : ""
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 shrink-0", children: [
                d.anuncio && d.anuncio.estado_moderacao !== "removido" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => remover(d.anuncio.id),
                    className: "px-3 py-1.5 text-sm rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors",
                    children: "Remover anúncio"
                  }
                ),
                d.anuncio && d.anuncio.estado_moderacao === "removido" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => reactivar(d.anuncio.id),
                    className: "px-3 py-1.5 text-sm rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors",
                    children: "Reactivar anúncio"
                  }
                ),
                d.estado === "pendente" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => resolver(d.id),
                    className: "px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors",
                    children: "Marcar resolvida"
                  }
                )
              ] })
            ] })
          },
          d.id
        );
      }) })
    ] })
  ] });
}
export {
  AdminMarketplaceIndex as default
};
