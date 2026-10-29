import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-mD2wK_DI.js";
import { useForm, Head } from "@inertiajs/react";
import { UserCog, Landmark, Link2 } from "lucide-react";
import { P as PageHeader, b as PortalNav, S as Seccao, j as EstadoAfiliadoBadge, N as NivelBadge, C as CopiarBotao } from "./ui-BNWuS-9O.js";
import "react";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Dados({ afiliado }) {
  const { data, setData, post, processing, errors, isDirty } = useForm({
    tipo: afiliado.tipo,
    nome: afiliado.nome ?? "",
    nif: afiliado.nif ?? "",
    telefone: afiliado.telefone ?? "",
    iban: afiliado.iban ?? "",
    banco: afiliado.banco ?? "",
    titular_conta: afiliado.titular_conta ?? "",
    como_divulga: afiliado.como_divulga ?? ""
  });
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Dados de pagamento" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: UserCog, titulo: "Dados do afiliado e de pagamento", subtitulo: "Os pagamentos de comissões são feitos por transferência bancária para o IBAN indicado" }),
      /* @__PURE__ */ jsx(PortalNav, { activo: "/afiliado/dados" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        post("/afiliado/dados", { preserveScroll: true });
      }, className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Seccao, { titulo: "Identificação", className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Tipo" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ["particular", "empresa"].map((t) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setData("tipo", t), className: `rounded-lg border px-3 py-2 text-sm ${data.tipo === t ? "border-purple-500 bg-purple-500/15 text-white" : "border-white/10 text-white/60 hover:bg-white/5"}`, children: t === "particular" ? "Particular" : "Empresa" }, t)) })
          ] }),
          /* @__PURE__ */ jsx(Campo, { label: data.tipo === "empresa" ? "Nome da empresa" : "Nome completo", erro: errors.nome, children: /* @__PURE__ */ jsx("input", { className: "input", value: data.nome, onChange: (e) => setData("nome", e.target.value), required: true }) }),
          /* @__PURE__ */ jsx(Campo, { label: "NIF", erro: errors.nif, children: /* @__PURE__ */ jsx("input", { className: "input", value: data.nif, onChange: (e) => setData("nif", e.target.value), placeholder: "Necessário para o recibo da comissão" }) }),
          /* @__PURE__ */ jsx(Campo, { label: "Telefone", erro: errors.telefone, children: /* @__PURE__ */ jsx("input", { className: "input", value: data.telefone, onChange: (e) => setData("telefone", e.target.value), placeholder: "+244 9xx xxx xxx" }) }),
          /* @__PURE__ */ jsx(Campo, { label: "Email da conta", children: /* @__PURE__ */ jsx("input", { className: "input", value: afiliado.email, disabled: true }) })
        ] }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Landmark, { className: "h-4 w-4 text-emerald-300" }),
          " Conta bancária para receber comissões"
        ] }), className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5", children: [
          /* @__PURE__ */ jsx(Campo, { label: "IBAN", erro: errors.iban, children: /* @__PURE__ */ jsx("input", { className: "input font-mono", value: data.iban, onChange: (e) => setData("iban", e.target.value.toUpperCase()), placeholder: "AO06 0000 0000 0000 0000 0000 0", maxLength: 40 }) }),
          /* @__PURE__ */ jsx(Campo, { label: "Banco", erro: errors.banco, children: /* @__PURE__ */ jsx("input", { className: "input", value: data.banco, onChange: (e) => setData("banco", e.target.value), placeholder: "BAI, BFA, BIC, Standard Bank…" }) }),
          /* @__PURE__ */ jsx(Campo, { label: "Titular da conta", erro: errors.titular_conta, children: /* @__PURE__ */ jsx("input", { className: "input", value: data.titular_conta, onChange: (e) => setData("titular_conta", e.target.value), placeholder: "Nome exactamente como no banco" }) }),
          /* @__PURE__ */ jsx(Campo, { label: "Como divulga a ONDAKA (opcional)", erro: errors.como_divulga, children: /* @__PURE__ */ jsx("textarea", { className: "input min-h-[96px]", value: data.como_divulga, onChange: (e) => setData("como_divulga", e.target.value), placeholder: "Ex.: contactos com gestoras de condomínio em Luanda, redes sociais, eventos…" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: isDirty ? "Alterações por guardar" : "Sem alterações" }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing || !isDirty, className: "btn-primary", children: "Guardar dados" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Seccao, { titulo: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Link2, { className: "h-4 w-4 text-cyan-300" }),
          " A sua conta de afiliado"
        ] }), className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-5 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(EstadoAfiliadoBadge, { estado: afiliado.estado }),
            /* @__PURE__ */ jsx(NivelBadge, { nivel: afiliado.nivel, taxa: afiliado.taxa_actual_pct })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/40", children: "Código" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold tracking-widest text-white", children: afiliado.codigo })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/40", children: "Link" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-cyan-200 break-all", children: afiliado.link }),
            /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(CopiarBotao, { texto: afiliado.link, label: "Copiar link" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/50", children: [
            "Afiliado desde ",
            afiliado.created_at ? new Date(afiliado.created_at).toLocaleDateString("pt-PT") : "—",
            afiliado.aprovado_em ? ` · aprovado a ${new Date(afiliado.aprovado_em).toLocaleDateString("pt-PT")}` : "",
            ".",
            afiliado.empresa_gestora && /* @__PURE__ */ jsxs(Fragment, { children: [
              " Ligado à empresa ",
              /* @__PURE__ */ jsx("strong", { className: "text-white/80", children: afiliado.empresa_gestora.nome }),
              " (não gera comissão sobre a própria empresa)."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs leading-relaxed text-white/50", children: [
            "O código e o link não podem ser alterados. Para mudar o email de acesso use o ",
            /* @__PURE__ */ jsx("a", { href: "/perfil", className: "text-cyan-300 underline", children: "perfil" }),
            "."
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
function Campo({ label, erro, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: label }),
    children,
    erro && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-red-400", children: erro })
  ] });
}
export {
  Dados as default
};
