import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BxaWWjLC.js";
import { Head, router } from "@inertiajs/react";
import { Users, ShieldCheck, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Comissao({ condominio, membros, condominosDisponiveis }) {
  const [seleccionado, setSeleccionado] = useState(null);
  const toggleRegra = (valor) => {
    router.patch(`/condominios/${condominio.id}/comissao/regra`, { exige_aprovacao_comissao: valor }, {
      preserveScroll: true,
      onSuccess: () => toast.success("Regra actualizada.")
    });
  };
  const adicionar = () => {
    if (!seleccionado) {
      toast.error("Escolha um condómino.");
      return;
    }
    router.post(`/condominios/${condominio.id}/comissao/membros`, { user_id: seleccionado }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Membro adicionado.");
        setSeleccionado(null);
      }
    });
  };
  const remover = (m) => {
    if (!confirm(`Remover ${m.nome} da comissão?`)) return;
    router.delete(`/condominios/${condominio.id}/comissao/membros/${m.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Membro removido.")
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Comissão de Moradores — ${condominio.nome}` }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-3xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Comissão de Moradores" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: condominio.nome })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-zinc-100 font-medium", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-cyan-400" }),
            "Exigir aprovação da comissão para despesas"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 mt-1", children: "Quando ligado, as despesas deste condomínio só podem ser aprovadas por um membro da comissão (na app). Desligado, o gestor aprova normalmente." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => toggleRegra(!condominio.exige_aprovacao_comissao),
            className: `shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${condominio.exige_aprovacao_comissao ? "bg-cyan-500" : "bg-zinc-700"}`,
            "aria-pressed": condominio.exige_aprovacao_comissao,
            children: /* @__PURE__ */ jsx("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${condominio.exige_aprovacao_comissao ? "translate-x-5" : "translate-x-1"}` })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-2", children: "Adicionar membro (condómino)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: seleccionado ?? "",
              onChange: (e) => setSeleccionado(e.target.value ? parseInt(e.target.value) : null),
              className: "flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "— Escolher condómino —" }),
                condominosDisponiveis.map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
                  c.name,
                  c.email ? ` (${c.email})` : ""
                ] }, c.id))
              ]
            }
          ),
          /* @__PURE__ */ jsxs("button", { onClick: adicionar, className: "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 text-sm font-medium", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Adicionar"
          ] })
        ] }),
        condominosDisponiveis.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 mt-2", children: "Não há condóminos disponíveis para adicionar (ou já estão todos na comissão)." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-5 py-3 border-b border-zinc-800 text-sm text-white/70 font-medium", children: [
          "Membros da comissão (",
          membros.length,
          ")"
        ] }),
        membros.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-5 py-8 text-center text-sm text-white/40", children: "Ainda sem membros na comissão." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-zinc-800", children: membros.map((m) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between px-5 py-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-zinc-100", children: m.nome }),
            m.email && /* @__PURE__ */ jsx("div", { className: "text-xs text-white/40", children: m.email })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => remover(m), className: "p-1.5 rounded text-red-400 hover:bg-red-500/10", title: "Remover", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, m.id)) })
      ] })
    ] })
  ] });
}
export {
  Comissao as default
};
