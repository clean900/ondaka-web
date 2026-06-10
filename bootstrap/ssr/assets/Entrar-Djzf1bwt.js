import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-CLWcivhb.js";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Video, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function AssembleiaEntrar({ assembleia, participante, erro }) {
  useEffect(() => {
    if (!erro && assembleia.estado === "em_curso" && assembleia.url_jitsi) {
      const timer = setTimeout(() => {
        window.open(assembleia.url_jitsi + "#userInfo.displayName=" + encodeURIComponent((participante == null ? void 0 : participante.nome) ?? ""), "_blank");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [erro, assembleia.estado, assembleia.url_jitsi, participante == null ? void 0 : participante.nome]);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Entrar: ${assembleia.titulo}` }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/assembleias", className: "inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Voltar"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(Video, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-zinc-100 font-mono", children: assembleia.numero }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400", children: assembleia.titulo })
        ] })
      ] }),
      erro ? /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-xl p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-6 w-6 text-red-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-red-400", children: "Não foi possível entrar" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-300 mt-2", children: erro })
        ] })
      ] }) }) : assembleia.estado !== "em_curso" ? /* @__PURE__ */ jsx("div", { className: "bg-amber-500/10 border border-amber-500/30 rounded-xl p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-6 w-6 text-amber-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-amber-400", children: "Assembleia ainda não iniciada" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-300 mt-2", children: [
            "Estado actual: ",
            /* @__PURE__ */ jsx("strong", { children: assembleia.estado }),
            ".",
            assembleia.data_agendada && /* @__PURE__ */ jsxs("span", { className: "block mt-1", children: [
              "Agendada para: ",
              new Date(assembleia.data_agendada).toLocaleString("pt-PT")
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mt-3", children: "Aguarde que a administração inicie a sessão. Receberá notificação SMS/email quando começar." })
        ] })
      ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        participante && /* @__PURE__ */ jsx("div", { className: "bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-5 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-6 w-6 text-emerald-400 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-emerald-400", children: "Presença registada" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-200 mt-1", children: participante.nome }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-xs text-zinc-400 mt-2", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                participante.numero_fraccoes,
                " fracçã",
                participante.numero_fraccoes === 1 ? "o" : "es"
              ] }),
              /* @__PURE__ */ jsx("span", { children: "·" }),
              /* @__PURE__ */ jsxs("span", { children: [
                participante.permilagem_total.toFixed(4),
                "‰"
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center", children: [
          /* @__PURE__ */ jsx(Video, { className: "h-16 w-16 text-cyan-400 mx-auto mb-4" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-zinc-100 mb-2", children: "A entrar na sala virtual..." }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mb-6", children: "A abrir Jitsi Meet numa nova aba. Se não abrir automaticamente, clique no botão:" }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: assembleia.url_jitsi + "#userInfo.displayName=" + encodeURIComponent((participante == null ? void 0 : participante.nome) ?? ""),
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white px-6 py-3 text-base font-semibold",
              children: [
                /* @__PURE__ */ jsx(Video, { className: "h-5 w-5" }),
                "Abrir sala Jitsi"
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-600 mt-6 font-mono break-all", children: assembleia.url_jitsi })
        ] })
      ] })
    ] })
  ] });
}
export {
  AssembleiaEntrar as default
};
