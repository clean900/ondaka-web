import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-ChtKe8ca.js";
import { Head, router } from "@inertiajs/react";
import { ExternalLink, Save, Smartphone } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Regulamento({ condominio, html, urlVer }) {
  const editorRef = useRef(null);
  const [mobile, setMobile] = useState(condominio.regulamento_mobile);
  const [guardando, setGuardando] = useState(false);
  const guardar = () => {
    var _a;
    const conteudo = ((_a = editorRef.current) == null ? void 0 : _a.innerHTML) ?? "";
    setGuardando(true);
    router.patch(`/condominios/${condominio.id}/regulamento`, { html: conteudo, regulamento_mobile: mobile }, {
      preserveScroll: true,
      onSuccess: () => toast.success("Regulamento guardado."),
      onFinish: () => setGuardando(false)
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Regulamento — ${condominio.nome}` }),
    /* @__PURE__ */ jsx("style", { children: `.reg-edit h1{font-size:24px;text-align:center;margin:14px 0 4px;color:#111827}.reg-edit h3{font-size:17px;margin:22px 0 6px;padding-bottom:5px;border-bottom:1px solid #e5e7eb;color:#111827}.reg-edit p{font-size:14px;line-height:1.7;color:#374151;margin:6px 0}.reg-edit .art{font-weight:600;color:#111827}` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto py-6 px-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-zinc-100", children: "Regulamento do condomínio" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500", children: [
            condominio.nome,
            " · edite o texto diretamente abaixo"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("a", { href: urlVer, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
            " Ver / imprimir"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: guardar, disabled: guardando, className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            " ",
            guardando ? "A guardar..." : "Guardar"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-white/80 mb-4 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: mobile, onChange: (e) => setMobile(e.target.checked), className: "accent-emerald-500" }),
        /* @__PURE__ */ jsx(Smartphone, { className: "h-4 w-4 text-emerald-300" }),
        "Publicar no mobile (visível aos condóminos)"
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: editorRef,
          contentEditable: true,
          suppressContentEditableWarning: true,
          className: "reg-edit bg-white rounded-xl p-8 min-h-[400px] outline-none focus:ring-2 focus:ring-cyan-500/40",
          dangerouslySetInnerHTML: { __html: html }
        }
      )
    ] })
  ] });
}
export {
  Regulamento as default
};
