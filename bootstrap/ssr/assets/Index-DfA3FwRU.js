import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dfn1r3bR.js";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Shield, Plus, Search, Lock, Check, X } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Index({ matriz }) {
  const [busca, setBusca] = useState("");
  const [modalCriar, setModalCriar] = useState(false);
  const permissionsFiltradas = useMemo(() => {
    if (!busca) return matriz.permissions;
    const t = busca.toLowerCase();
    return matriz.permissions.filter((p) => p.name.toLowerCase().includes(t));
  }, [busca, matriz.permissions]);
  const grupos = useMemo(() => {
    const g = {};
    permissionsFiltradas.forEach((p) => {
      if (!g[p.grupo]) g[p.grupo] = [];
      g[p.grupo].push(p);
    });
    return g;
  }, [permissionsFiltradas]);
  const toggle = (roleId, permissionId, atribuir) => {
    router.post(route("super-admin.permissoes.toggle"), {
      role_id: roleId,
      permission_id: permissionId,
      atribuir
    }, { preserveScroll: true, preserveState: true });
  };
  const temPermissao = (role, permId) => role.permissions.includes(permId);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Permissões" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-white tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Shield, { className: "w-6 h-6 text-[#A855F7]" }),
          "Permissões e Funções"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Configurar o que cada função pode fazer no sistema." })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setModalCriar(true), className: "btn-primary", children: [
        /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
        "Nova permissão"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "card-elevated mb-4", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Pesquisar permissão...",
          value: busca,
          onChange: (e) => setBusca(e.target.value),
          className: "input pl-10"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "card-elevated overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/10", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left p-3 text-[10px] uppercase tracking-wider text-white/50 font-medium sticky left-0 bg-[#16163A] z-10", children: "Permissão" }),
        matriz.roles.map((r) => /* @__PURE__ */ jsx("th", { className: "text-center p-3 text-[10px] uppercase tracking-wider text-white/50 font-medium", children: r.name.replace(/-/g, " ") }, r.id))
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        Object.entries(grupos).map(([grupo, perms]) => /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("tr", { className: "border-b border-white/5 bg-white/[0.02]", children: /* @__PURE__ */ jsx("td", { colSpan: matriz.roles.length + 1, className: "px-3 py-2 text-[10px] uppercase tracking-wider text-[#00D4FF] font-semibold", children: grupo }) }, grupo),
          perms.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 hover:bg-white/[0.02]", children: [
            /* @__PURE__ */ jsx("td", { className: "p-3 text-white/80 sticky left-0 bg-[#16163A]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3 text-white/30" }),
              p.name
            ] }) }),
            matriz.roles.map((r) => {
              const tem = temPermissao(r, p.id);
              return /* @__PURE__ */ jsx("td", { className: "p-3 text-center", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => toggle(r.id, p.id, !tem),
                  className: `w-7 h-7 rounded-md inline-flex items-center justify-center transition ${tem ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25" : "bg-white/[0.02] border border-white/10 text-white/30 hover:bg-white/[0.05] hover:text-white/60"}`,
                  title: tem ? "Clica para remover" : "Clica para atribuir",
                  children: tem && /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" })
                }
              ) }, r.id);
            })
          ] }, p.id))
        ] })),
        permissionsFiltradas.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: matriz.roles.length + 1, className: "p-8 text-center text-white/40", children: "Nenhuma permissão encontrada." }) })
      ] })
    ] }) }),
    modalCriar && /* @__PURE__ */ jsx(ModalCriarPermissao, { onClose: () => setModalCriar(false) })
  ] });
}
function ModalCriarPermissao({ onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({ nome: "" });
  const submit = (e) => {
    e.preventDefault();
    post(route("super-admin.permissoes.criar"), {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm py-8 px-4", onClick: onClose, children: /* @__PURE__ */ jsx("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-md mx-auto", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Nova permissão" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide font-medium block mb-1.5", children: "Nome técnico *" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          required: true,
          placeholder: "ex: condominios.edit",
          className: "input",
          value: data.nome,
          onChange: (e) => setData("nome", e.target.value)
        }
      ),
      errors.nome && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400 mt-1", children: errors.nome }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40", children: "Use formato `recurso.acao` (ex: condominios.create, users.edit, facturacao.view)." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "btn-ghost", children: "Cancelar" }),
      /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing, className: "btn-primary", children: [
        /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
        processing ? "A criar..." : "Criar"
      ] })
    ] })
  ] }) }) });
}
export {
  Index as default
};
