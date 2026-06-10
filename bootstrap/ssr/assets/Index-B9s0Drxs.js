import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BxaWWjLC.js";
import { Head, Link, router } from "@inertiajs/react";
import "react";
import "sonner";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const ESTADO_COR = {
  pendente: "text-amber-300",
  aprovada: "text-cyan-300",
  aguarda_caucao: "text-amber-300",
  confirmada: "text-emerald-300",
  recusada: "text-white/40",
  cancelada: "text-white/40"
};
const ESTADO_LABEL = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  aguarda_caucao: "Aguarda caução",
  confirmada: "Confirmada",
  recusada: "Recusada",
  cancelada: "Cancelada"
};
function kz(v) {
  const n = typeof v === "number" ? v : parseFloat(v || "0");
  return n.toLocaleString("pt-PT", { maximumFractionDigits: 0 }) + " Kz";
}
function ReservasIndex({ espacos, reservas }) {
  const aprovar = (id) => {
    if (confirm("Aprovar esta reserva?")) router.post(`/reservas/${id}/aprovar`);
  };
  const recusar = (id) => {
    const motivo = prompt("Motivo da recusa (opcional):");
    if (motivo !== null) router.post(`/reservas/${id}/recusar`, { motivo });
  };
  const confirmarCaucao = (id) => {
    if (confirm("Confirmar que a caução foi recebida?")) router.post(`/reservas/${id}/confirmar-caucao`);
  };
  const apagarEspaco = (id) => {
    if (confirm("Apagar este espaço? As reservas associadas também serão removidas.")) router.delete(`/reservas/espacos/${id}`);
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Reservas" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 py-6 space-y-8", children: [
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-white", children: "Espaços reserváveis" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Salões, churrasqueiras e outras áreas comuns." })
          ] }),
          /* @__PURE__ */ jsx(Link, { href: "/reservas/espacos/novo", className: "text-sm px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30", children: "Novo espaço" })
        ] }),
        espacos.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 rounded-xl bg-white/[0.03] border border-white/10 border-dashed text-center", children: /* @__PURE__ */ jsx("p", { className: "text-white/40 text-sm", children: 'Ainda não há espaços. Crie o primeiro com "Novo espaço".' }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: espacos.map((e) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-white", children: [
              e.nome,
              !e.activo && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs text-white/40", children: "(inactivo)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx(Link, { href: `/reservas/espacos/${e.id}/editar`, className: "text-xs px-2 py-1 rounded text-white/70 hover:bg-white/5", children: "Editar" }),
              /* @__PURE__ */ jsx("button", { onClick: () => apagarEspaco(e.id), className: "text-xs px-2 py-1 rounded text-red-300 hover:bg-red-500/10", children: "Apagar" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50", children: [
            e.reservas_count,
            " reserva(s) ",
            e.tem_caucao && " · caução " + kz(e.valor_caucao)
          ] })
        ] }, e.id)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-white", children: "Reservas" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Últimas 50 reservas. Pendentes precisam da sua aprovação." })
        ] }),
        reservas.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 rounded-xl bg-white/[0.03] border border-white/10 border-dashed text-center", children: /* @__PURE__ */ jsx("p", { className: "text-white/40 text-sm", children: "Ainda não há reservas. As reservas dos condóminos aparecem aqui." }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: reservas.map((r) => {
          var _a;
          return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl bg-white/[0.03] border border-white/10", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-white", children: [
                ((_a = r.espaco) == null ? void 0 : _a.nome) || `Espaço #${r.espaco_id}`,
                /* @__PURE__ */ jsx("span", { className: `ml-3 text-xs font-medium ${ESTADO_COR[r.estado] || "text-white/60"}`, children: ESTADO_LABEL[r.estado] || r.estado })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/60 mt-1", children: [
                r.user_nome,
                " · ",
                new Date(r.data).toLocaleDateString("pt-PT"),
                " · ",
                r.hora_inicio.slice(0, 5),
                "–",
                r.hora_fim.slice(0, 5)
              ] }),
              r.motivo && /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/40 mt-1 italic", children: [
                '"',
                r.motivo,
                '"'
              ] }),
              r.comprovativo_caucao && /* @__PURE__ */ jsx(
                "a",
                {
                  href: `/ficheiros/${r.comprovativo_caucao}`,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "inline-block text-xs text-cyan-300 hover:underline mt-1",
                  children: "Ver comprovativo de caução"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              r.estado === "pendente" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("button", { onClick: () => aprovar(r.id), className: "text-xs px-3 py-1.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/25", children: "Aprovar" }),
                /* @__PURE__ */ jsx("button", { onClick: () => recusar(r.id), className: "text-xs px-3 py-1.5 rounded bg-red-500/15 border border-red-500/25 text-red-200 hover:bg-red-500/25", children: "Recusar" })
              ] }),
              r.estado === "aguarda_caucao" && /* @__PURE__ */ jsx("button", { onClick: () => confirmarCaucao(r.id), className: "text-xs px-3 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/25 text-cyan-200 hover:bg-cyan-500/25", children: "Confirmar caução" })
            ] })
          ] }) }, r.id);
        }) })
      ] })
    ] })
  ] });
}
export {
  ReservasIndex as default
};
