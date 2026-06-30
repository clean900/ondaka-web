import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { Head, router } from "@inertiajs/react";
import { Briefcase, Plus, BadgeCheck, Phone, Mail, ToggleRight, ToggleLeft, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
const fmtKz = (v) => new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(v) + " Kz";
function EmpresasPrestadoras({ empresas, podeCertificar = false }) {
  const [modal, setModal] = useState(null);
  const certificar = (e) => {
    router.post(`/configuracoes/empresas-prestadoras/${e.id}/certificar`, {
      certificado: !e.certificado
    }, {
      preserveScroll: true,
      onSuccess: () => toast.success(e.certificado ? "Certificação removida." : "Prestador certificado.")
    });
  };
  const toggle = (e) => {
    router.patch(`/configuracoes/empresas-prestadoras/${e.id}`, {
      nome: e.nome,
      nif: e.nif,
      telefone: e.telefone,
      email: e.email,
      especialidades: e.especialidades,
      observacoes: e.observacoes,
      ativa: !e.ativa
    }, {
      preserveScroll: true,
      onSuccess: () => toast.success("Estado actualizado.")
    });
  };
  const eliminar = (e) => {
    if (!confirm(`Eliminar empresa "${e.nome}"?`)) return;
    router.delete(`/configuracoes/empresas-prestadoras/${e.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Empresa removida.")
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Empresas Prestadoras — ONDAKA" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Briefcase, { className: "h-6 w-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Empresas Prestadoras" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
              empresas.length,
              " empresas registadas · ",
              empresas.filter((e) => e.ativa).length,
              " activas"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setModal({ tipo: "novo" }),
            className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white px-4 py-2 text-sm font-medium shadow-lg",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Nova empresa"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-zinc-900/80 border-b border-zinc-800", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "Nome" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "NIF" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "Contactos" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "Especialidades" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-zinc-400 text-xs uppercase", children: "Activa" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-2 text-zinc-400 text-xs uppercase", children: "Acções" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          empresas.map((e) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-zinc-800/50 hover:bg-zinc-900/40", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-zinc-200 font-medium", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                e.nome,
                e.certificado && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30", children: [
                  /* @__PURE__ */ jsx(BadgeCheck, { className: "h-3 w-3" }),
                  "Certificado"
                ] })
              ] }),
              (e.intervencoes_count ?? 0) > 0 && /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-zinc-500 mt-0.5", children: [
                e.intervencoes_count,
                " intervenç",
                e.intervencoes_count === 1 ? "ão" : "ões",
                e.preco_medio != null && /* @__PURE__ */ jsxs(Fragment, { children: [
                  " · média ",
                  fmtKz(Number(e.preco_medio))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-500 text-xs", children: e.nif ?? "—" }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-xs text-zinc-400 space-y-0.5", children: [
              e.telefone && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Phone, { className: "inline h-3 w-3 mr-1" }),
                e.telefone
              ] }),
              e.email && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Mail, { className: "inline h-3 w-3 mr-1" }),
                e.email
              ] }),
              !e.telefone && !e.email && /* @__PURE__ */ jsx("span", { className: "text-zinc-600", children: "—" })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-zinc-400 text-xs max-w-xs truncate", children: e.especialidades ?? "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("button", { onClick: () => toggle(e), children: e.ativa ? /* @__PURE__ */ jsx(ToggleRight, { className: "h-5 w-5 text-emerald-400" }) : /* @__PURE__ */ jsx(ToggleLeft, { className: "h-5 w-5 text-zinc-600" }) }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right", children: [
              podeCertificar && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => certificar(e),
                  title: e.certificado ? "Remover certificação" : "Certificar prestador",
                  className: `mr-2 ${e.certificado ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-500 hover:text-emerald-400"}`,
                  children: /* @__PURE__ */ jsx(BadgeCheck, { className: "h-4 w-4 inline" })
                }
              ),
              /* @__PURE__ */ jsx("button", { onClick: () => setModal({ tipo: "editar", emp: e }), className: "text-zinc-400 hover:text-zinc-200 mr-2", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4 inline" }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => eliminar(e), className: "text-red-400 hover:text-red-300", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 inline" }) })
            ] })
          ] }, e.id)),
          empresas.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-4 py-8 text-center text-zinc-500", children: "Nenhuma empresa prestadora ainda." }) })
        ] })
      ] }) })
    ] }),
    modal && /* @__PURE__ */ jsx(ModalEmpresa, { modal, onClose: () => setModal(null) })
  ] });
}
function ModalEmpresa({ modal, onClose }) {
  const emp = modal.emp;
  const [nome, setNome] = useState((emp == null ? void 0 : emp.nome) ?? "");
  const [nif, setNif] = useState((emp == null ? void 0 : emp.nif) ?? "");
  const [telefone, setTelefone] = useState((emp == null ? void 0 : emp.telefone) ?? "");
  const [email, setEmail] = useState((emp == null ? void 0 : emp.email) ?? "");
  const [especialidades, setEspecialidades] = useState((emp == null ? void 0 : emp.especialidades) ?? "");
  const [observacoes, setObservacoes] = useState((emp == null ? void 0 : emp.observacoes) ?? "");
  const [ativa, setAtiva] = useState((emp == null ? void 0 : emp.ativa) ?? true);
  const [logo, setLogo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const submit = () => {
    if (!nome.trim()) {
      toast.error("Nome obrigatório.");
      return;
    }
    setEnviando(true);
    const base = { nome, nif, telefone, email, especialidades, observacoes, ativa };
    if (modal.tipo === "novo") {
      router.post("/configuracoes/empresas-prestadoras", logo ? { ...base, logo } : base, {
        preserveScroll: true,
        forceFormData: !!logo,
        onSuccess: () => {
          toast.success("Empresa criada.");
          onClose();
        },
        onFinish: () => setEnviando(false)
      });
    } else if (logo) {
      router.post(`/configuracoes/empresas-prestadoras/${emp.id}`, { ...base, logo, _method: "patch" }, {
        preserveScroll: true,
        forceFormData: true,
        onSuccess: () => {
          toast.success("Empresa actualizada.");
          onClose();
        },
        onFinish: () => setEnviando(false)
      });
    } else {
      router.patch(`/configuracoes/empresas-prestadoras/${emp.id}`, base, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Empresa actualizada.");
          onClose();
        },
        onFinish: () => setEnviando(false)
      });
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b border-white/5", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: modal.tipo === "novo" ? "Nova empresa prestadora" : "Editar empresa" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Nome *" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: nome, onChange: (e) => setNome(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white", placeholder: "Ex: Canalizações Lda" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "NIF" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: nif, onChange: (e) => setNif(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Telefone" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: telefone, onChange: (e) => setTelefone(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white", placeholder: "+244 ..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Email" }),
        /* @__PURE__ */ jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Especialidades" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: especialidades, onChange: (e) => setEspecialidades(e.target.value), className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white", placeholder: "Ex: Canalização, Electricidade" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Observações" }),
        /* @__PURE__ */ jsx("textarea", { value: observacoes, onChange: (e) => setObservacoes(e.target.value), rows: 2, className: "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white resize-none" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/60 uppercase tracking-wide block mb-1.5", children: "Logo da empresa (opcional)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            accept: "image/*",
            onChange: (e) => {
              var _a;
              return setLogo(((_a = e.target.files) == null ? void 0 : _a[0]) ?? null);
            },
            className: "w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
          }
        ),
        logo && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-white/40", children: [
          "Selecionado: ",
          logo.name
        ] })
      ] }),
      modal.tipo === "editar" && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: ativa, onChange: (e) => setAtiva(e.target.checked) }),
        "Activa"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-white/5 flex gap-2 justify-end", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm text-white/60 hover:text-white", children: "Cancelar" }),
      /* @__PURE__ */ jsx("button", { onClick: submit, disabled: enviando, className: "px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 text-white text-sm font-semibold disabled:opacity-50", children: enviando ? "A guardar..." : "Guardar" })
    ] })
  ] }) });
}
export {
  EmpresasPrestadoras as default
};
