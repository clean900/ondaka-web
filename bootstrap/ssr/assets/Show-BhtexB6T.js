import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout, i as iniciais, g as gradientDeNome, f as formatDate, a as formatKz } from "./AuthenticatedLayout-Dh9fgZ4d.js";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Edit, Trash2, FileText, Home, Briefcase, Calendar, Building, UserCircle, Hash, MapPin, Phone, Mail, Plus, ChevronRight, X } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Show({ condomino, estatisticas }) {
  const eliminar = () => {
    if (confirm(`Tem a certeza que quer arquivar «${condomino.nome_completo}»?`)) {
      router.delete(`/condominos/${condomino.id}`);
    }
  };
  const ehEmpresa = condomino.tipo === "empresa";
  const nomeExibicao = ehEmpresa && condomino.nome_comercial ? condomino.nome_comercial : condomino.nome_completo;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: nomeExibicao }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/condominos", className: "inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Voltar à lista"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-14 h-14 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0",
              style: { background: gradientDeNome(condomino.nome_completo) },
              children: iniciais(condomino.nome_completo)
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-white tracking-tight", children: nomeExibicao }),
            ehEmpresa && condomino.nome_comercial && condomino.nome_comercial !== condomino.nome_completo && /* @__PURE__ */ jsx("p", { className: "text-sm text-white/50 mt-0.5", children: condomino.nome_completo }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-2", children: [
              /* @__PURE__ */ jsx(TipoBadge, { tipo: condomino.tipo }),
              /* @__PURE__ */ jsx(EstadoBadge, { estado: condomino.estado }),
              condomino.tipo === "empresa" && condomino.nif && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70 font-mono", children: [
                "NIF ",
                condomino.nif
              ] }),
              condomino.tipo === "singular" && condomino.numero_bi && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70 font-mono", children: [
                "BI ",
                condomino.numero_bi
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Link, { href: `/condominos/${condomino.id}/edit`, className: "btn-secondary", children: [
            /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
            "Editar"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: eliminar, className: "btn-danger", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-8", children: [
      /* @__PURE__ */ jsx(StatBox, { label: "Contratos activos", valor: estatisticas.total_fraccoes_activas, icon: FileText, cor: "#00D4FF" }),
      /* @__PURE__ */ jsx(StatBox, { label: "Propriedades", valor: estatisticas.total_propriedades, icon: Home, cor: "#A855F7" }),
      /* @__PURE__ */ jsx(StatBox, { label: "Arrendamentos", valor: estatisticas.total_arrendamentos, icon: Briefcase, cor: "#EC4899" }),
      /* @__PURE__ */ jsx(StatBox, { label: "Total histórico", valor: estatisticas.total_contratos, icon: Calendar, cor: "#64748B" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          ehEmpresa ? /* @__PURE__ */ jsx(Building, { className: "w-4 h-4 text-[#EC4899]" }) : /* @__PURE__ */ jsx(UserCircle, { className: "w-4 h-4 text-[#A855F7]" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: ehEmpresa ? "Dados da empresa" : "Dados pessoais" })
        ] }),
        /* @__PURE__ */ jsx("dl", { className: "space-y-3", children: ehEmpresa ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(InfoLine, { label: "NIF", value: condomino.nif, icon: Hash, mono: true }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Data constituição", value: condomino.data_constituicao_empresa ? formatDate(condomino.data_constituicao_empresa) : null, icon: Calendar }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Nº registo", value: condomino.numero_registo_comercial, icon: FileText })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(InfoLine, { label: "BI", value: condomino.numero_bi, icon: Hash, mono: true }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Data nascimento", value: condomino.data_nascimento ? formatDate(condomino.data_nascimento) : null, icon: Calendar }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Género", value: formatGenero(condomino.genero), icon: UserCircle }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Estado civil", value: formatEstadoCivil(condomino.estado_civil), icon: FileText }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Nacionalidade", value: condomino.nacionalidade, icon: MapPin }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Profissão", value: condomino.profissao, icon: Briefcase })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4 text-[#00D4FF]" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Contactos" })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(InfoLine, { label: "Telefone", value: condomino.telefone_principal, icon: Phone }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Telefone alt.", value: condomino.telefone_alternativo, icon: Phone }),
          /* @__PURE__ */ jsx(InfoLine, { label: "Email", value: condomino.email, icon: Mail }),
          condomino.morada && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "pt-2 mt-2 border-t border-white/5", children: [
            /* @__PURE__ */ jsx(InfoLine, { label: "Morada", value: condomino.morada, icon: MapPin }),
            /* @__PURE__ */ jsx(InfoLine, { label: "Localidade", value: [condomino.bairro, condomino.municipio, condomino.provincia].filter(Boolean).join(" · ") || null, icon: MapPin })
          ] }) })
        ] })
      ] })
    ] }),
    ehEmpresa && condomino.representante_nome && /* @__PURE__ */ jsxs("div", { className: "card mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsx(Briefcase, { className: "w-4 h-4 text-[#EC4899]" }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Representante legal" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3", children: [
        /* @__PURE__ */ jsx(InfoLine, { label: "Nome", value: condomino.representante_nome, icon: UserCircle }),
        /* @__PURE__ */ jsx(InfoLine, { label: "Cargo", value: condomino.representante_cargo, icon: Briefcase }),
        /* @__PURE__ */ jsx(InfoLine, { label: "BI", value: condomino.representante_bi, icon: Hash, mono: true }),
        /* @__PURE__ */ jsx(InfoLine, { label: "Telefone", value: condomino.representante_telefone, icon: Phone }),
        /* @__PURE__ */ jsx(InfoLine, { label: "Email", value: condomino.representante_email, icon: Mail })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-white", children: "Contratos de ocupação" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/50 mt-0.5", children: "Fracções associadas a este condómino (proprietário, inquilino, etc.)" })
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: `/condominos/${condomino.id}/contratos/create`, className: "btn-primary", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "Associar fracção"
      ] })
    ] }),
    !condomino.contratos || condomino.contratos.length === 0 ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: "text-center py-16 rounded-xl",
        style: { background: "rgba(255,255,255,0.02)", border: "0.5px dashed rgba(168, 85, 247, 0.2)" },
        children: [
          /* @__PURE__ */ jsx(Home, { className: "h-12 w-12 text-white/20 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-white/50 text-sm", children: "Ainda não há contratos associados." }),
          /* @__PURE__ */ jsxs(Link, { href: `/condominos/${condomino.id}/contratos/create`, className: "inline-flex items-center gap-1 mt-4 text-[#00D4FF] hover:text-[#A855F7] text-sm font-medium transition", children: [
            "Associar primeira fracção",
            /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3" })
          ] })
        ]
      }
    ) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: condomino.contratos.map((c) => /* @__PURE__ */ jsx(ContratoRow, { contrato: c }, c.id)) }),
    condomino.observacoes && /* @__PURE__ */ jsxs("div", { className: "card mt-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-white/50" }),
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-white uppercase tracking-[1px]", children: "Observações" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/80 whitespace-pre-wrap leading-relaxed", children: condomino.observacoes })
    ] })
  ] });
}
function ContratoRow({ contrato }) {
  const terminar = () => {
    const data = prompt("Data de fim do contrato (AAAA-MM-DD):", (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    if (!data) return;
    const motivo = prompt("Motivo (opcional):") || "";
    router.patch(`/contratos/${contrato.id}/terminar`, { data_fim: data, motivo_fim: motivo });
  };
  const remover = () => {
    if (confirm("Remover este contrato do histórico?")) {
      router.delete(`/contratos/${contrato.id}`);
    }
  };
  const tipoConfig = {
    proprietario: { label: "Proprietário", cor: "#A855F7", icon: Home },
    inquilino: { label: "Inquilino", cor: "#00D4FF", icon: Briefcase },
    usufructo: { label: "Usufruto", cor: "#F59E0B", icon: FileText },
    cedencia: { label: "Cedência", cor: "#64748B", icon: FileText }
  };
  const config = tipoConfig[contrato.tipo] ?? tipoConfig.proprietario;
  const Icon = config.icon;
  const fraccao = contrato.fraccao;
  const edificio = fraccao == null ? void 0 : fraccao.edificio;
  const condominio = edificio == null ? void 0 : edificio.condominio;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/[0.02]",
      style: {
        background: "rgba(255,255,255,0.02)",
        border: `0.5px solid ${contrato.estado === "activo" ? config.cor + "25" : "rgba(255,255,255,0.08)"}`,
        opacity: contrato.estado !== "activo" ? 0.6 : 1
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            style: { background: `${config.cor}15`, border: `0.5px solid ${config.cor}35` },
            children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: config.cor } })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium px-1.5 py-0.5 rounded", style: { background: `${config.cor}15`, color: config.cor }, children: config.label }),
            contrato.estado === "terminado" && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50", children: "Terminado" }),
            contrato.estado === "suspenso" && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400", children: "Suspenso" })
          ] }),
          fraccao && /* @__PURE__ */ jsxs(Link, { href: `/fraccoes/${fraccao.id}`, className: "text-sm text-white font-medium hover:text-[#00D4FF] transition", children: [
            "Fracção ",
            fraccao.identificador,
            edificio && /* @__PURE__ */ jsxs("span", { className: "text-white/50 font-normal", children: [
              " · ",
              edificio.nome
            ] }),
            condominio && /* @__PURE__ */ jsxs("span", { className: "text-white/40 font-normal", children: [
              " · ",
              condominio.nome
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-white/50 mt-0.5 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: formatDate(contrato.data_inicio) }),
            contrato.data_fim && /* @__PURE__ */ jsxs("span", { children: [
              "→ ",
              formatDate(contrato.data_fim)
            ] }),
            contrato.tipo === "inquilino" && contrato.valor_renda_mensal && /* @__PURE__ */ jsxs("span", { children: [
              "· Renda ",
              formatKz(contrato.valor_renda_mensal)
            ] }),
            contrato.tipo === "proprietario" && Number(contrato.percentagem_propriedade) < 100 && /* @__PURE__ */ jsxs("span", { children: [
              "· ",
              contrato.percentagem_propriedade,
              "% propriedade"
            ] })
          ] })
        ] }),
        contrato.estado === "activo" && /* @__PURE__ */ jsx("div", { className: "flex gap-1 flex-shrink-0", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: terminar,
            className: "p-2 rounded-lg text-white/50 hover:text-amber-400 hover:bg-white/5 transition",
            title: "Terminar contrato",
            children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
          }
        ) }),
        contrato.estado !== "activo" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: remover,
            className: "p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition",
            title: "Remover do histórico",
            children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
          }
        )
      ]
    }
  );
}
function StatBox({ label, valor, icon: Icon, cor }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl p-4 transition-all",
      style: {
        background: `linear-gradient(135deg, ${cor}15 0%, ${cor}05 100%)`,
        border: `0.5px solid ${cor}35`
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between mb-2", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: `${cor}20`, border: `0.5px solid ${cor}40` }, children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4", style: { color: cor } }) }) }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 uppercase tracking-[1px] font-medium mb-0.5", children: label }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold text-white tracking-tight", children: valor })
      ]
    }
  );
}
function InfoLine({
  label,
  value,
  icon: Icon,
  mono
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 py-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-white/50 text-xs flex-shrink-0", children: [
      Icon && /* @__PURE__ */ jsx(Icon, { className: "w-3 h-3" }),
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: `text-right text-sm ${mono ? "font-mono text-xs" : ""} ${value ? "text-white" : "text-white/30"}`, children: value || "—" })
  ] });
}
function TipoBadge({ tipo }) {
  if (tipo === "empresa") {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20", children: [
      /* @__PURE__ */ jsx(Building, { className: "w-2.5 h-2.5" }),
      "Empresa"
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20", children: [
    /* @__PURE__ */ jsx(UserCircle, { className: "w-2.5 h-2.5" }),
    "Pessoa singular"
  ] });
}
function EstadoBadge({ estado }) {
  const config = {
    activo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    inactivo: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    arquivado: "bg-white/5 text-white/50 border-white/10"
  };
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${config[estado] ?? config.arquivado}`, children: [
    /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-current" }),
    estado
  ] });
}
function formatGenero(g) {
  if (!g) return null;
  return g.charAt(0).toUpperCase() + g.slice(1);
}
function formatEstadoCivil(ec) {
  if (!ec) return null;
  const map = {
    solteiro: "Solteiro(a)",
    casado: "Casado(a)",
    uniao_facto: "União de facto",
    divorciado: "Divorciado(a)",
    viuvo: "Viúvo(a)"
  };
  return map[ec] ?? ec;
}
export {
  Show as default
};
