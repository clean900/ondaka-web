import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-mD2wK_DI.js";
import { useForm, Head } from "@inertiajs/react";
import { Handshake, Link2, Building2, Wallet, ShieldCheck, Clock } from "lucide-react";
import { P as PageHeader, f as fmtPct, a as fmtKz, S as Seccao, N as NivelBadge } from "./ui-BNWuS-9O.js";
import "react";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Aderir({ config, empresa, user }) {
  const { data, setData, post, processing, errors } = useForm({
    tipo: empresa ? "empresa" : "particular",
    nome: empresa ? empresa.nome : user.name,
    nif: (empresa ? empresa.nif : user.nif) ?? "",
    telefone: user.telefone ?? "",
    iban: "",
    banco: "",
    titular_conta: "",
    como_divulga: "",
    aceita_termos: false
  });
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Programa de Afiliados" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(PageHeader, { icon: Handshake, titulo: "Programa de Afiliados ONDAKA", subtitulo: `Indique outras empresas gestoras e administradores e ganhe ${fmtPct(config.taxa_min_pct)} a ${fmtPct(config.taxa_max_pct)} de tudo o que pagarem à ONDAKA` }),
      !config.programa_activo && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200", children: "O programa de afiliados não está a aceitar adesões de momento." }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 lg:col-span-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsx(Passo, { icon: Link2, n: "1", titulo: "Partilhe o seu link", texto: "Recebe um código e um link únicos. Quem se registar através deles fica ligado a si (o link fica memorizado durante a visita e nos dias seguintes)." }),
            /* @__PURE__ */ jsx(Passo, { icon: Building2, n: "2", titulo: "O cliente usa a ONDAKA", texto: "Trial grátis, depois subscrição, add-ons e pacotes SMS. Todos os pagamentos à ONDAKA contam — não só o primeiro." }),
            /* @__PURE__ */ jsx(Passo, { icon: Wallet, n: "3", titulo: "Recebe a comissão", texto: `Sobre o valor sem imposto de cada pagamento. Após ${config.carencia_dias} dias de carência fica aprovada; a ONDAKA paga por transferência a partir de ${fmtKz(config.pagamento_minimo_kz, 0)}.` })
          ] }),
          /* @__PURE__ */ jsx(Seccao, { titulo: "Níveis de comissão — sobem automaticamente com os clientes pagantes", children: /* @__PURE__ */ jsx("div", { className: "grid gap-0 divide-y divide-white/5 md:grid-cols-3 md:divide-x md:divide-y-0", children: config.niveis.map((n) => /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
            /* @__PURE__ */ jsx(NivelBadge, { nivel: n.nivel }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-bold text-white", children: fmtPct(n.taxa_pct) }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-white/50", children: n.max_clientes === null ? `${n.min_clientes} ou mais clientes pagantes` : n.min_clientes === 0 ? `até ${n.max_clientes} clientes pagantes` : `${n.min_clientes} a ${n.max_clientes} clientes pagantes` })
          ] }, n.nivel)) }) }),
          /* @__PURE__ */ jsx(Seccao, { titulo: "Regras do programa", children: /* @__PURE__ */ jsxs("ul", { className: "grid gap-3 p-5 text-sm text-white/70 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs(Regra, { icon: ShieldCheck, children: [
              "A comissão calcula-se sobre o valor ",
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "sem imposto" }),
              " (IVA/IPC) de cada pagamento efectivamente recebido pela ONDAKA."
            ] }),
            /* @__PURE__ */ jsxs(Regra, { icon: Clock, children: [
              "Carência de ",
              config.carencia_dias,
              " dias por comissão para cobrir estornos. Pagamentos anulados anulam a comissão."
            ] }),
            /* @__PURE__ */ jsxs(Regra, { icon: Wallet, children: [
              "Pagamento por transferência bancária quando o saldo aprovado atinge ",
              fmtKz(config.pagamento_minimo_kz, 0),
              Number(config.retencao_pct) > 0 ? `, com retenção na fonte de ${fmtPct(config.retencao_pct)}` : "",
              "."
            ] }),
            /* @__PURE__ */ jsxs(Regra, { icon: Building2, children: [
              config.duracao_meses > 0 ? `Cada cliente gera comissão durante ${config.duracao_meses} meses.` : "Cada cliente gera comissão enquanto for cliente (vitalício).",
              " Não é possível indicar a própria empresa nem clientes já existentes."
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(Seccao, { titulo: "Aderir ao programa", className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          post("/afiliado/aderir");
        }, className: "space-y-4 p-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs text-white/60", children: "Adere como" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ["particular", "empresa"].map((t) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
              setData("tipo", t);
              if (t === "empresa" && empresa) {
                setData("nome", empresa.nome);
                setData("nif", empresa.nif ?? "");
              }
              if (t === "particular") {
                setData("nome", user.name);
                setData("nif", user.nif ?? "");
              }
            }, className: `rounded-lg border px-3 py-2 text-sm ${data.tipo === t ? "border-purple-500 bg-purple-500/15 text-white" : "border-white/10 text-white/60 hover:bg-white/5"}`, children: t === "particular" ? "Particular (eu)" : empresa ? `Empresa (${empresa.nome})` : "Empresa" }, t)) })
          ] }),
          /* @__PURE__ */ jsx(Campo, { label: "Nome do afiliado", erro: errors.nome, children: /* @__PURE__ */ jsx("input", { className: "input", value: data.nome, onChange: (e) => setData("nome", e.target.value) }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(Campo, { label: "NIF", erro: errors.nif, children: /* @__PURE__ */ jsx("input", { className: "input", value: data.nif, onChange: (e) => setData("nif", e.target.value) }) }),
            /* @__PURE__ */ jsx(Campo, { label: "Telefone", erro: errors.telefone, children: /* @__PURE__ */ jsx("input", { className: "input", value: data.telefone, onChange: (e) => setData("telefone", e.target.value) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-white/10 bg-white/[0.02] p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs font-medium text-white/70", children: "Conta para receber comissões (pode preencher depois)" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("input", { className: "input font-mono", placeholder: "IBAN", value: data.iban, onChange: (e) => setData("iban", e.target.value.toUpperCase()) }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsx("input", { className: "input", placeholder: "Banco", value: data.banco, onChange: (e) => setData("banco", e.target.value) }),
                /* @__PURE__ */ jsx("input", { className: "input", placeholder: "Titular", value: data.titular_conta, onChange: (e) => setData("titular_conta", e.target.value) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Campo, { label: "Como pretende divulgar a ONDAKA? (opcional)", erro: errors.como_divulga, children: /* @__PURE__ */ jsx("textarea", { className: "input min-h-[80px]", value: data.como_divulga, onChange: (e) => setData("como_divulga", e.target.value) }) }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2 text-xs text-white/70", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-0.5", checked: data.aceita_termos, onChange: (e) => setData("aceita_termos", e.target.checked) }),
            /* @__PURE__ */ jsx("span", { children: "Li e aceito as regras do programa de afiliados ONDAKA." })
          ] }),
          errors.aceita_termos && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-400", children: errors.aceita_termos }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing || !config.programa_activo, className: "btn-primary w-full", children: [
            /* @__PURE__ */ jsx(Handshake, { className: "h-4 w-4" }),
            " ",
            config.aprovacao_automatica ? "Aderir e obter o meu link" : "Enviar adesão para aprovação"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-center text-[11px] text-white/40", children: config.aprovacao_automatica ? "A conta fica activa de imediato." : "A ONDAKA aprova a adesão e avisa por email." })
        ] }) })
      ] })
    ] })
  ] });
}
function Passo({ icon: Icon, n, titulo, texto }) {
  return /* @__PURE__ */ jsxs("div", { className: "card-elevated", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-xs font-bold text-white", children: n }),
      /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-cyan-300" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 font-semibold text-white", children: titulo }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs leading-relaxed text-white/60", children: texto })
  ] });
}
function Regra({ icon: Icon, children }) {
  return /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
    /* @__PURE__ */ jsx(Icon, { className: "mt-0.5 h-4 w-4 shrink-0 text-purple-300" }),
    /* @__PURE__ */ jsx("span", { children })
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
  Aderir as default
};
