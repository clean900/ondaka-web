import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout, c as cn } from "./AuthenticatedLayout-CLWcivhb.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { ArrowLeft, Building, UserCircle, FileText, Phone, Briefcase, Lock, EyeOff, Eye, MapPin, Save } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Form({ condomino, tipoInicial, provincias }) {
  const editar = !!condomino;
  const { data, setData, post, put, processing, errors } = useForm({
    tipo: (condomino == null ? void 0 : condomino.tipo) ?? tipoInicial ?? "singular",
    nome_completo: (condomino == null ? void 0 : condomino.nome_completo) ?? "",
    nome_comercial: (condomino == null ? void 0 : condomino.nome_comercial) ?? "",
    // Singular
    numero_bi: (condomino == null ? void 0 : condomino.numero_bi) ?? "",
    data_nascimento: (condomino == null ? void 0 : condomino.data_nascimento) ?? "",
    genero: (condomino == null ? void 0 : condomino.genero) ?? "",
    nacionalidade: (condomino == null ? void 0 : condomino.nacionalidade) ?? "Angolana",
    estado_civil: (condomino == null ? void 0 : condomino.estado_civil) ?? "",
    profissao: (condomino == null ? void 0 : condomino.profissao) ?? "",
    // Empresa
    nif: (condomino == null ? void 0 : condomino.nif) ?? "",
    data_constituicao_empresa: (condomino == null ? void 0 : condomino.data_constituicao_empresa) ?? "",
    numero_registo_comercial: (condomino == null ? void 0 : condomino.numero_registo_comercial) ?? "",
    // Contactos
    telefone_principal: (condomino == null ? void 0 : condomino.telefone_principal) ?? "",
    telefone_alternativo: (condomino == null ? void 0 : condomino.telefone_alternativo) ?? "",
    email: (condomino == null ? void 0 : condomino.email) ?? "",
    // Morada
    morada: (condomino == null ? void 0 : condomino.morada) ?? "",
    provincia: (condomino == null ? void 0 : condomino.provincia) ?? "Luanda",
    municipio: (condomino == null ? void 0 : condomino.municipio) ?? "",
    bairro: (condomino == null ? void 0 : condomino.bairro) ?? "",
    // Representante (empresa)
    representante_nome: (condomino == null ? void 0 : condomino.representante_nome) ?? "",
    representante_bi: (condomino == null ? void 0 : condomino.representante_bi) ?? "",
    representante_cargo: (condomino == null ? void 0 : condomino.representante_cargo) ?? "",
    representante_telefone: (condomino == null ? void 0 : condomino.representante_telefone) ?? "",
    representante_email: (condomino == null ? void 0 : condomino.representante_email) ?? "",
    observacoes: (condomino == null ? void 0 : condomino.observacoes) ?? "",
    estado: (condomino == null ? void 0 : condomino.estado) ?? "activo",
    // Conta de utilizador (apenas no store)
    criar_user: false,
    password: "",
    password_confirmation: "",
    must_change_password: false
  });
  const [verPassword, setVerPassword] = useState(false);
  const [tabActiva, setTabActiva] = useState("identificacao");
  const submeter = (e) => {
    e.preventDefault();
    if (editar) {
      put(`/condominos/${condomino.id}`);
    } else {
      post("/condominos");
    }
  };
  const ehEmpresa = data.tipo === "empresa";
  const ehSingular = data.tipo === "singular";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: editar ? `Editar ${condomino.nome_completo}` : "Novo condómino" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/condominos",
          className: "inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Voltar à lista"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            style: {
              background: ehEmpresa ? "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)" : "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)",
              border: `0.5px solid ${ehEmpresa ? "rgba(236, 72, 153, 0.3)" : "rgba(168, 85, 247, 0.3)"}`
            },
            children: ehEmpresa ? /* @__PURE__ */ jsx(Building, { className: "w-6 h-6 text-[#EC4899]" }) : /* @__PURE__ */ jsx(UserCircle, { className: "w-6 h-6 text-[#A855F7]" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: editar ? `Editar ${condomino.nome_completo}` : "Novo condómino" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: editar ? "Actualize os dados." : "Preencha os dados do novo condómino." })
        ] })
      ] }),
      !editar && /* @__PURE__ */ jsxs("div", { className: "mb-6 inline-flex p-1 rounded-lg bg-white/5 border border-white/10", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setData("tipo", "singular"),
            className: cn(
              "px-4 py-2 rounded-md text-sm font-medium transition",
              ehSingular ? "text-white" : "text-white/50 hover:text-white/80"
            ),
            style: ehSingular ? {
              background: "linear-gradient(135deg, #A855F7 0%, #00D4FF 100%)"
            } : void 0,
            children: [
              /* @__PURE__ */ jsx(UserCircle, { className: "w-3.5 h-3.5 inline mr-1.5 -mt-0.5" }),
              "Pessoa singular"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setData("tipo", "empresa"),
            className: cn(
              "px-4 py-2 rounded-md text-sm font-medium transition",
              ehEmpresa ? "text-white" : "text-white/50 hover:text-white/80"
            ),
            style: ehEmpresa ? {
              background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)"
            } : void 0,
            children: [
              /* @__PURE__ */ jsx(Building, { className: "w-3.5 h-3.5 inline mr-1.5 -mt-0.5" }),
              "Empresa"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1 mb-5 border-b border-white/5", children: [
        /* @__PURE__ */ jsx(TabButton, { activa: tabActiva === "identificacao", onClick: () => setTabActiva("identificacao"), icon: FileText, label: "Identificação" }),
        /* @__PURE__ */ jsx(TabButton, { activa: tabActiva === "contactos", onClick: () => setTabActiva("contactos"), icon: Phone, label: "Contactos" }),
        ehEmpresa && /* @__PURE__ */ jsx(TabButton, { activa: tabActiva === "extra", onClick: () => setTabActiva("extra"), icon: Briefcase, label: "Representante" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-5", children: [
        tabActiva === "identificacao" && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Seccao, { icon: FileText, iconColor: ehEmpresa ? "#EC4899" : "#A855F7", titulo: ehEmpresa ? "Dados da empresa" : "Dados pessoais", children: [
          /* @__PURE__ */ jsx(Campo, { label: ehEmpresa ? "Razão social" : "Nome completo", erro: errors.nome_completo, obrigatorio: true, children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.nome_completo,
              onChange: (e) => setData("nome_completo", e.target.value),
              className: "input",
              placeholder: ehEmpresa ? "Nome legal da empresa" : "Nome próprio + apelidos"
            }
          ) }),
          ehEmpresa && /* @__PURE__ */ jsx(Campo, { label: "Nome comercial", erro: errors.nome_comercial, ajuda: "Se diferente da razão social", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.nome_comercial,
              onChange: (e) => setData("nome_comercial", e.target.value),
              className: "input"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            ehSingular && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Campo, { label: "Nº BI", erro: errors.numero_bi, children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.numero_bi,
                  onChange: (e) => setData("numero_bi", e.target.value.toUpperCase()),
                  className: "input font-mono",
                  placeholder: "000000000LA000"
                }
              ) }),
              /* @__PURE__ */ jsx(Campo, { label: "Data de nascimento", erro: errors.data_nascimento, children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  value: typeof data.data_nascimento === "string" ? data.data_nascimento.slice(0, 10) : "",
                  onChange: (e) => setData("data_nascimento", e.target.value),
                  className: "input"
                }
              ) })
            ] }),
            ehEmpresa && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Campo, { label: "NIF", erro: errors.nif, obrigatorio: true, children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.nif,
                  onChange: (e) => setData("nif", e.target.value),
                  className: "input font-mono",
                  placeholder: "5999999999"
                }
              ) }),
              /* @__PURE__ */ jsx(Campo, { label: "Data constituição", erro: errors.data_constituicao_empresa, children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  value: typeof data.data_constituicao_empresa === "string" ? data.data_constituicao_empresa.slice(0, 10) : "",
                  onChange: (e) => setData("data_constituicao_empresa", e.target.value),
                  className: "input"
                }
              ) })
            ] })
          ] }),
          ehSingular && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Género", erro: errors.genero, children: /* @__PURE__ */ jsxs("select", { value: data.genero, onChange: (e) => setData("genero", e.target.value), className: "input", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "—" }),
              /* @__PURE__ */ jsx("option", { value: "masculino", children: "Masculino" }),
              /* @__PURE__ */ jsx("option", { value: "feminino", children: "Feminino" }),
              /* @__PURE__ */ jsx("option", { value: "outro", children: "Outro" })
            ] }) }),
            /* @__PURE__ */ jsx(Campo, { label: "Nacionalidade", erro: errors.nacionalidade, children: /* @__PURE__ */ jsx("input", { type: "text", value: data.nacionalidade, onChange: (e) => setData("nacionalidade", e.target.value), className: "input" }) }),
            /* @__PURE__ */ jsx(Campo, { label: "Estado civil", erro: errors.estado_civil, children: /* @__PURE__ */ jsxs("select", { value: data.estado_civil, onChange: (e) => setData("estado_civil", e.target.value), className: "input", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "—" }),
              /* @__PURE__ */ jsx("option", { value: "solteiro", children: "Solteiro(a)" }),
              /* @__PURE__ */ jsx("option", { value: "casado", children: "Casado(a)" }),
              /* @__PURE__ */ jsx("option", { value: "uniao_facto", children: "União de facto" }),
              /* @__PURE__ */ jsx("option", { value: "divorciado", children: "Divorciado(a)" }),
              /* @__PURE__ */ jsx("option", { value: "viuvo", children: "Viúvo(a)" })
            ] }) })
          ] }),
          ehSingular && /* @__PURE__ */ jsx(Campo, { label: "Profissão", erro: errors.profissao, children: /* @__PURE__ */ jsx("input", { type: "text", value: data.profissao, onChange: (e) => setData("profissao", e.target.value), className: "input" }) }),
          ehEmpresa && /* @__PURE__ */ jsx(Campo, { label: "Nº registo comercial", erro: errors.numero_registo_comercial, children: /* @__PURE__ */ jsx("input", { type: "text", value: data.numero_registo_comercial, onChange: (e) => setData("numero_registo_comercial", e.target.value), className: "input" }) })
        ] }) }),
        tabActiva === "contactos" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Seccao, { icon: Phone, iconColor: "#00D4FF", titulo: "Contactos", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsx(Campo, { label: "Telefone principal", erro: errors.telefone_principal, children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "tel",
                  value: data.telefone_principal,
                  onChange: (e) => setData("telefone_principal", e.target.value),
                  className: "input",
                  placeholder: "+244 9XX XXX XXX"
                }
              ) }),
              /* @__PURE__ */ jsx(Campo, { label: "Telefone alternativo", erro: errors.telefone_alternativo, children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "tel",
                  value: data.telefone_alternativo,
                  onChange: (e) => setData("telefone_alternativo", e.target.value),
                  className: "input"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx(Campo, { label: "Email", erro: errors.email, children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                value: data.email,
                onChange: (e) => setData("email", e.target.value),
                className: "input",
                placeholder: "nome@exemplo.com"
              }
            ) })
          ] }),
          !editar && /* @__PURE__ */ jsxs(Seccao, { icon: Lock, iconColor: "#10B981", titulo: "Conta de utilizador (opcional)", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  id: "criar_user",
                  checked: data.criar_user,
                  onChange: (e) => setData("criar_user", e.target.checked),
                  className: "mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                }
              ),
              /* @__PURE__ */ jsxs("label", { htmlFor: "criar_user", className: "flex-1 cursor-pointer", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white", children: "Criar conta de utilizador para este condómino" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-white/50 mt-0.5", children: "Será criado um login com o email indicado. O condómino poderá aceder à app mobile e ao portal web." })
              ] })
            ] }),
            data.criar_user && /* @__PURE__ */ jsxs(Fragment, { children: [
              !data.email && /* @__PURE__ */ jsx("div", { className: "text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3", children: "⚠️ Para criar conta de utilizador é necessário preencher o campo Email acima." }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsx(Campo, { label: "Password inicial *", erro: errors.password, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: verPassword ? "text" : "password",
                      value: data.password,
                      onChange: (e) => setData("password", e.target.value),
                      className: "input pr-10",
                      placeholder: "Mínimo 8 caracteres",
                      autoComplete: "new-password"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setVerPassword(!verPassword),
                      className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white",
                      children: verPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsx(Campo, { label: "Confirmar password *", erro: errors.password_confirmation, children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: verPassword ? "text" : "password",
                    value: data.password_confirmation,
                    onChange: (e) => setData("password_confirmation", e.target.value),
                    className: "input",
                    placeholder: "Repetir password",
                    autoComplete: "new-password"
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "must_change_password",
                    checked: data.must_change_password,
                    onChange: (e) => setData("must_change_password", e.target.checked),
                    className: "mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  }
                ),
                /* @__PURE__ */ jsxs("label", { htmlFor: "must_change_password", className: "flex-1 cursor-pointer", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm text-white", children: "Obrigar a alterar password no próximo login" }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-white/50 mt-0.5", children: "Recomendado por segurança quando o admin define a password." })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Seccao, { icon: MapPin, iconColor: "#A855F7", titulo: "Morada de correspondência", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Morada", erro: errors.morada, children: /* @__PURE__ */ jsx(
              "textarea",
              {
                value: data.morada,
                onChange: (e) => setData("morada", e.target.value),
                rows: 2,
                className: "input resize-none"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsx(Campo, { label: "Província", erro: errors.provincia, children: /* @__PURE__ */ jsx("select", { value: data.provincia, onChange: (e) => setData("provincia", e.target.value), className: "input", children: provincias.map((p) => /* @__PURE__ */ jsx("option", { value: p, className: "bg-[#16163A]", children: p }, p)) }) }),
              /* @__PURE__ */ jsx(Campo, { label: "Município", erro: errors.municipio, children: /* @__PURE__ */ jsx("input", { type: "text", value: data.municipio, onChange: (e) => setData("municipio", e.target.value), className: "input" }) }),
              /* @__PURE__ */ jsx(Campo, { label: "Bairro", erro: errors.bairro, children: /* @__PURE__ */ jsx("input", { type: "text", value: data.bairro, onChange: (e) => setData("bairro", e.target.value), className: "input" }) })
            ] })
          ] })
        ] }),
        tabActiva === "extra" && ehEmpresa && /* @__PURE__ */ jsxs(Seccao, { icon: Briefcase, iconColor: "#EC4899", titulo: "Representante legal", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Nome", erro: errors.representante_nome, children: /* @__PURE__ */ jsx("input", { type: "text", value: data.representante_nome, onChange: (e) => setData("representante_nome", e.target.value), className: "input" }) }),
            /* @__PURE__ */ jsx(Campo, { label: "BI", erro: errors.representante_bi, children: /* @__PURE__ */ jsx("input", { type: "text", value: data.representante_bi, onChange: (e) => setData("representante_bi", e.target.value.toUpperCase()), className: "input font-mono" }) })
          ] }),
          /* @__PURE__ */ jsx(Campo, { label: "Cargo", erro: errors.representante_cargo, children: /* @__PURE__ */ jsx("input", { type: "text", value: data.representante_cargo, onChange: (e) => setData("representante_cargo", e.target.value), className: "input", placeholder: "CEO, Administrador..." }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Telefone", erro: errors.representante_telefone, children: /* @__PURE__ */ jsx("input", { type: "tel", value: data.representante_telefone, onChange: (e) => setData("representante_telefone", e.target.value), className: "input" }) }),
            /* @__PURE__ */ jsx(Campo, { label: "Email", erro: errors.representante_email, children: /* @__PURE__ */ jsx("input", { type: "email", value: data.representante_email, onChange: (e) => setData("representante_email", e.target.value), className: "input" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Seccao, { icon: FileText, iconColor: "#64748B", titulo: "Outras informações", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Observações", erro: errors.observacoes, children: /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.observacoes,
              onChange: (e) => setData("observacoes", e.target.value),
              rows: 3,
              className: "input resize-none",
              placeholder: "Notas internas..."
            }
          ) }),
          editar && /* @__PURE__ */ jsx(Campo, { label: "Estado", erro: errors.estado, children: /* @__PURE__ */ jsxs("select", { value: data.estado, onChange: (e) => setData("estado", e.target.value), className: "input sm:w-48", children: [
            /* @__PURE__ */ jsx("option", { value: "activo", children: "Activo" }),
            /* @__PURE__ */ jsx("option", { value: "inactivo", children: "Inactivo" }),
            /* @__PURE__ */ jsx("option", { value: "arquivado", children: "Arquivado" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 pt-5 mt-6", style: { borderTop: "0.5px solid rgba(255,255,255,0.05)" }, children: [
          /* @__PURE__ */ jsx(Link, { href: "/condominos", className: "btn-secondary", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: processing, className: "btn-primary", children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            processing ? "A guardar..." : editar ? "Guardar alterações" : "Criar condómino"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function TabButton({
  activa,
  onClick,
  icon: Icon,
  label
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2 border-b-2 -mb-px",
        activa ? "text-white border-[#00D4FF]" : "text-white/50 hover:text-white/80 border-transparent"
      ),
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "w-3.5 h-3.5" }),
        label
      ]
    }
  );
}
function Seccao({
  icon: Icon,
  iconColor,
  titulo,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-5 pb-4 border-b border-white/5", children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: iconColor } }),
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: titulo })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children })
  ] });
}
function Campo({
  label,
  erro,
  obrigatorio,
  ajuda,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { className: "block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider", children: [
      label,
      " ",
      obrigatorio && /* @__PURE__ */ jsx("span", { className: "text-[#EC4899]", children: "*" })
    ] }),
    children,
    ajuda && !erro && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[11px] text-white/40", children: ajuda }),
    erro && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-red-400", children: erro })
  ] });
}
export {
  Form as default
};
