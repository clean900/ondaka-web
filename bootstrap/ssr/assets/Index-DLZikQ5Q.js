import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-vuYqEFtM.js";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Server, Database, CheckCircle2, AlertTriangle, Zap, XCircle, Trash2 } from "lucide-react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function SistemaIndex({ estado }) {
  const [aProcessar, setAProcessar] = useState(null);
  const confirmar = (mensagem, rota, acao) => {
    if (!window.confirm(mensagem)) return;
    setAProcessar(acao);
    router.post(rota, {}, {
      preserveScroll: true,
      onFinish: () => setAProcessar(null)
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Estado do Sistema" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx(Server, { className: "text-cyan-400", size: 28 }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Estado do Sistema" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-400", children: [
            "Manutenção e atualização da produção · ambiente: ",
            estado.app_env
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-700 bg-zinc-900 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Database, { size: 18, className: "text-cyan-400" }),
            /* @__PURE__ */ jsx("h2", { className: "font-semibold text-white", children: "Migrações" })
          ] }),
          estado.num_pendentes === 0 ? /* @__PURE__ */ jsxs("p", { className: "text-sm text-emerald-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { size: 16 }),
            " Base de dados atualizada (0 pendentes)"
          ] }) : /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-400 mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(AlertTriangle, { size: 16 }),
              " ",
              estado.num_pendentes,
              " migração(ões) pendente(s):"
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "text-xs text-zinc-400 list-disc list-inside space-y-1", children: estado.migracoes_pendentes.map((m, i) => /* @__PURE__ */ jsx("li", { children: m }, i)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-700 bg-zinc-900 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Zap, { size: 18, className: "text-cyan-400" }),
            /* @__PURE__ */ jsx("h2", { className: "font-semibold text-white", children: "Caches" })
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm space-y-1", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-zinc-300", children: [
              estado.caches.config ? /* @__PURE__ */ jsx(CheckCircle2, { size: 14, className: "text-emerald-400" }) : /* @__PURE__ */ jsx(XCircle, { size: 14, className: "text-zinc-500" }),
              " Config ",
              estado.caches.config ? "(em cache)" : "(não)"
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-zinc-300", children: [
              estado.caches.rotas ? /* @__PURE__ */ jsx(CheckCircle2, { size: 14, className: "text-emerald-400" }) : /* @__PURE__ */ jsx(XCircle, { size: 14, className: "text-zinc-500" }),
              " Rotas ",
              estado.caches.rotas ? "(em cache)" : "(não)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-700 bg-zinc-900 p-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-semibold text-white mb-2", children: "Versão / Último deploy" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300", children: estado.versao })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-zinc-700 bg-zinc-900 p-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-semibold text-white mb-2", children: "Espaço em disco" }),
          estado.disco_livre_gb !== null ? /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-300", children: [
            estado.disco_livre_gb,
            " GB livres de ",
            estado.disco_total_gb,
            " GB"
          ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500", children: "indisponível" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold text-white mb-3", children: "Ações" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(
          AcaoBtn,
          {
            icon: /* @__PURE__ */ jsx(Database, { size: 18 }),
            titulo: "Correr migrações pendentes",
            descricao: "Aplica as alterações de base de dados pendentes (migrate --force).",
            cor: "cyan",
            disabled: aProcessar !== null,
            loading: aProcessar === "migrar",
            onClick: () => confirmar("Correr as migrações pendentes na base de dados de PRODUÇÃO?\n\nFaça um backup antes se tiver dúvidas.", "/admin/sistema/migrar", "migrar")
          }
        ),
        /* @__PURE__ */ jsx(
          AcaoBtn,
          {
            icon: /* @__PURE__ */ jsx(Trash2, { size: 18 }),
            titulo: "Limpar caches",
            descricao: "Limpa config, rotas, views e cache da aplicação (optimize:clear).",
            cor: "cyan",
            disabled: aProcessar !== null,
            loading: aProcessar === "limpar",
            onClick: () => confirmar("Limpar todas as caches?", "/admin/sistema/limpar-caches", "limpar")
          }
        ),
        /* @__PURE__ */ jsx(
          AcaoBtn,
          {
            icon: /* @__PURE__ */ jsx(Zap, { size: 18 }),
            titulo: "Otimizar",
            descricao: "Coloca config e rotas em cache para melhor desempenho.",
            cor: "cyan",
            disabled: aProcessar !== null,
            loading: aProcessar === "otimizar",
            onClick: () => confirmar("Otimizar (cache de config e rotas)?", "/admin/sistema/otimizar", "otimizar")
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-8 text-xs text-zinc-500", children: "Nota: o código novo continua a ser enviado por upload (tar.gz). Esta página executa apenas os passos finais (migrar, limpar, otimizar) e a manutenção." })
    ] })
  ] });
}
function AcaoBtn({ icon, titulo, descricao, cor, onClick, disabled, loading }) {
  const cores = {
    cyan: "border-cyan-700 hover:bg-cyan-950/40 text-cyan-300",
    amber: "border-amber-700 hover:bg-amber-950/40 text-amber-300",
    emerald: "border-emerald-700 hover:bg-emerald-950/40 text-emerald-300"
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      disabled,
      className: `w-full text-left rounded-xl border bg-zinc-900 p-4 flex items-center gap-4 transition disabled:opacity-50 ${cores[cor]}`,
      children: [
        /* @__PURE__ */ jsx("div", { className: "shrink-0", children: icon }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold", children: loading ? "A processar..." : titulo }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-zinc-400", children: descricao })
        ] })
      ]
    }
  );
}
export {
  SistemaIndex as default
};
