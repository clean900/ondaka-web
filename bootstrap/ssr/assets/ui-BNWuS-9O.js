import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Inbox, X, ChevronLeft, ChevronRight } from "lucide-react";
import { c as cn } from "./utils-B_FeHPtl.js";
const fmtKz = (v, dec = 2) => {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(isNaN(n) ? 0 : n) + " Kz";
};
const fmtNum = (v) => new Intl.NumberFormat("pt-AO").format(Number(v ?? 0) || 0);
const fmtPct = (v) => {
  const n = Number(v ?? 0);
  const s = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
  return s + "%";
};
const fmtData = (v) => v ? new Date(v).toLocaleDateString("pt-PT") : "—";
const fmtDataHora = (v) => v ? new Date(v).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
function EstadoComissaoBadge({ estado }) {
  const map = {
    pendente: ["badge-warn", "Em carência"],
    aprovada: ["badge-info", "Aprovada"],
    paga: ["badge-success", "Paga"],
    anulada: ["badge-danger", "Anulada"]
  };
  const [cls, label] = map[estado] ?? ["badge", estado];
  return /* @__PURE__ */ jsx("span", { className: cls, children: label });
}
function EstadoAfiliadoBadge({ estado }) {
  const map = {
    pendente: ["badge-warn", "Pendente"],
    activo: ["badge-success", "Activo"],
    suspenso: ["badge-danger", "Suspenso"],
    recusado: ["badge", "Recusado"]
  };
  const [cls, label] = map[estado] ?? ["badge", estado];
  return /* @__PURE__ */ jsx("span", { className: cn(cls, estado === "recusado" && "bg-white/5 text-white/50 border border-white/10"), children: label });
}
function NivelBadge({ nivel, taxa }) {
  const map = {
    bronze: ["bg-amber-700/20 text-amber-300 border-amber-600/40", "Bronze"],
    prata: ["bg-zinc-300/15 text-zinc-100 border-zinc-300/40", "Prata"],
    ouro: ["bg-yellow-400/20 text-yellow-300 border-yellow-400/50", "Ouro"]
  };
  const [cls, label] = map[nivel ?? "bronze"] ?? map.bronze;
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", cls), children: [
    label,
    taxa !== void 0 && /* @__PURE__ */ jsxs("span", { className: "opacity-80", children: [
      "· ",
      fmtPct(taxa)
    ] })
  ] });
}
function SubscricaoBadge({ estado }) {
  const map = {
    trial: ["badge-info", "Trial"],
    activa: ["badge-success", "Activa"],
    grace: ["badge-warn", "Em graça"],
    em_atraso: ["badge-warn", "Em atraso"],
    limitado: ["badge-warn", "Limitado"],
    suspensa: ["badge-danger", "Suspensa"],
    cancelada: ["badge-danger", "Cancelada"],
    arquivada: ["badge", "Arquivada"],
    sem_subscricao: ["badge", "Sem subscrição"]
  };
  const [cls, label] = map[estado] ?? ["badge", estado];
  return /* @__PURE__ */ jsx("span", { className: cn(cls, cls === "badge" && "bg-white/5 text-white/50 border border-white/10"), children: label });
}
function StatCard({ label, valor, sub, icon: Icon, tom = "neutro" }) {
  const cls = {
    ciano: "stat-card-ciano",
    roxo: "stat-card-roxo",
    verde: "stat-card border-emerald-500/30",
    amber: "stat-card border-amber-500/30",
    vermelho: "stat-card border-red-500/30",
    neutro: "stat-card"
  };
  const iconCls = {
    ciano: "text-cyan-400",
    roxo: "text-purple-400",
    verde: "text-emerald-400",
    amber: "text-amber-400",
    vermelho: "text-red-400",
    neutro: "text-white/50"
  };
  return /* @__PURE__ */ jsxs("div", { className: cn(cls[tom], "flex flex-col justify-between min-h-[104px]"), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/50", children: label }),
      Icon && /* @__PURE__ */ jsx(Icon, { className: cn("h-4 w-4 shrink-0", iconCls[tom]) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 text-2xl font-bold text-white leading-tight", children: valor }),
    sub && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-white/50", children: sub })
  ] });
}
function PageHeader({ titulo, subtitulo, icon: Icon, accoes }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      Icon && /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-purple-500/30", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-cyan-300" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-white", children: titulo }),
        subtitulo && /* @__PURE__ */ jsx("div", { className: "text-sm text-white/50", children: subtitulo })
      ] })
    ] }),
    accoes && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: accoes })
  ] });
}
function Seccao({ titulo, accoes, children, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("card-elevated p-0 overflow-hidden", className), children: [
    (titulo || accoes) && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-white", children: titulo }),
      accoes && /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: accoes })
    ] }),
    children
  ] });
}
function Vazio({ titulo, texto, accao }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", children: [
    /* @__PURE__ */ jsx(Inbox, { className: "h-8 w-8 text-white/20" }),
    /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white/70", children: titulo }),
    texto && /* @__PURE__ */ jsx("div", { className: "max-w-md text-xs text-white/40", children: texto }),
    accao && /* @__PURE__ */ jsx("div", { className: "mt-2", children: accao })
  ] });
}
function Th({ children, className, right }) {
  return /* @__PURE__ */ jsx("th", { className: cn("px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap", right ? "text-right" : "text-left", className), children });
}
function Td({ children, className, right, mono }) {
  return /* @__PURE__ */ jsx("td", { className: cn("px-4 py-3 align-top text-sm text-white/80", right && "text-right whitespace-nowrap", mono && "font-mono tabular-nums", className), children });
}
function SubNav({ itens, activo }) {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1", children: itens.map((i) => /* @__PURE__ */ jsx(
    Link,
    {
      href: i.href,
      className: cn(
        "rounded-lg px-3.5 py-2 text-sm font-medium transition",
        activo === i.href ? "bg-gradient-to-r from-cyan-400/20 to-purple-500/20 text-white border border-purple-500/30" : "text-white/60 hover:bg-white/5 hover:text-white"
      ),
      children: i.label
    },
    i.href
  )) });
}
function PortalNav({ activo }) {
  return /* @__PURE__ */ jsx(
    SubNav,
    {
      activo,
      itens: [
        { href: "/afiliado", label: "Painel" },
        { href: "/afiliado/clientes", label: "Clientes indicados" },
        { href: "/afiliado/comissoes", label: "Comissões" },
        { href: "/afiliado/pagamentos", label: "Pagamentos" },
        { href: "/afiliado/dados", label: "Dados de pagamento" }
      ]
    }
  );
}
function AdminNav({ activo }) {
  return /* @__PURE__ */ jsx(
    SubNav,
    {
      activo,
      itens: [
        { href: "/super-admin/afiliados", label: "Afiliados" },
        { href: "/super-admin/afiliados/comissoes", label: "Comissões" },
        { href: "/super-admin/afiliados/pagamentos", label: "Pagamentos" },
        { href: "/super-admin/afiliados/config", label: "Configuração" }
      ]
    }
  );
}
function Paginacao({ links, from, to, total }) {
  if (!links || links.length <= 3) {
    return total > 0 ? /* @__PURE__ */ jsxs("div", { className: "px-5 py-3 text-xs text-white/40", children: [
      total,
      " registo(s)"
    ] }) : null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-t border-white/10 px-5 py-3 md:flex-row md:items-center md:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-xs text-white/40", children: [
      from ?? 0,
      "–",
      to ?? 0,
      " de ",
      total
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: links.map((l, i) => {
      const label = l.label.includes("Previous") ? /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" }) : l.label.includes("Next") ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx("span", { dangerouslySetInnerHTML: { __html: l.label } });
      return l.url ? /* @__PURE__ */ jsx(Link, { href: l.url, preserveScroll: true, preserveState: true, className: cn("inline-flex min-w-[32px] items-center justify-center rounded-md px-2 py-1 text-xs", l.active ? "bg-purple-500/30 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"), children: label }, i) : /* @__PURE__ */ jsx("span", { className: "inline-flex min-w-[32px] items-center justify-center rounded-md px-2 py-1 text-xs text-white/20", children: label }, i);
    }) })
  ] });
}
function Modal({ aberto, onClose, titulo, children, largura = "max-w-lg" }) {
  if (!aberto) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: cn("w-full rounded-2xl border border-white/10 bg-[#16163A] shadow-2xl", largura), onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-white/10 px-5 py-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-base font-semibold text-white", children: titulo }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-h-[80vh] overflow-y-auto px-5 py-4", children })
  ] }) });
}
function CopiarBotao({ texto, label = "Copiar", className }) {
  const [ok, setOk] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setOk(true);
      toast.success("Copiado para a área de transferência.");
      setTimeout(() => setOk(false), 1800);
    } catch {
      toast.error("Não foi possível copiar. Seleccione e copie manualmente.");
    }
  };
  return /* @__PURE__ */ jsxs("button", { type: "button", onClick: copiar, className: cn("btn-secondary", className), children: [
    ok ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
    ok ? "Copiado" : label
  ] });
}
function BarrasMensais({ serie, altura = 140 }) {
  const max = Math.max(1, ...serie.map((s) => Number(s.total_kz)));
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-end gap-1.5", style: { height: altura }, children: serie.map((s) => {
      const v = Number(s.total_kz);
      const h = v > 0 ? Math.max(4, Math.round(v / max * (altura - 8))) : 2;
      return /* @__PURE__ */ jsx("div", { className: "group relative flex flex-1 flex-col items-center justify-end", title: `${s.label}: ${fmtKz(v)} · ${s.n} comissão(ões)`, children: /* @__PURE__ */ jsx("div", { className: "w-full rounded-t-md bg-gradient-to-t from-purple-500/60 to-cyan-400/70 transition group-hover:from-purple-400 group-hover:to-cyan-300", style: { height: h } }) }, s.mes);
    }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-1.5 flex gap-1.5", children: serie.map((s) => /* @__PURE__ */ jsx("div", { className: "flex-1 text-center text-[10px] text-white/40", children: s.label }, s.mes)) })
  ] });
}
function ProgressoNivel({ clientes, nivel, proximo }) {
  if (!proximo) {
    return /* @__PURE__ */ jsxs("div", { className: "text-sm text-yellow-300", children: [
      "Nível máximo atingido · ",
      clientes,
      " cliente(s) pagante(s)"
    ] });
  }
  const pct = Math.min(100, Math.round(clientes / proximo.min_clientes * 100));
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-center justify-between text-xs text-white/60", children: [
      /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(NivelBadge, { nivel }) }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Faltam ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: proximo.faltam }),
        " cliente(s) pagante(s) para ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: proximo.label }),
        " (",
        fmtPct(proximo.taxa_pct),
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-2.5 w-full overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500", style: { width: `${pct}%` } }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-1 text-[11px] text-white/40", children: [
      clientes,
      " de ",
      proximo.min_clientes,
      " clientes pagantes"
    ] })
  ] });
}
export {
  AdminNav as A,
  BarrasMensais as B,
  CopiarBotao as C,
  EstadoComissaoBadge as E,
  Modal as M,
  NivelBadge as N,
  PageHeader as P,
  Seccao as S,
  Th as T,
  Vazio as V,
  fmtKz as a,
  PortalNav as b,
  StatCard as c,
  fmtNum as d,
  Td as e,
  fmtPct as f,
  fmtData as g,
  SubscricaoBadge as h,
  Paginacao as i,
  EstadoAfiliadoBadge as j,
  ProgressoNivel as k,
  fmtDataHora as l
};
