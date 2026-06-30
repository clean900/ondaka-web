import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-X_1jlzlW.js";
import { Head, router } from "@inertiajs/react";
import { Radio, Clock, KeyRound, CircleCheck, RotateCcw } from "lucide-react";
import { useState } from "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Index({ configs }) {
  const [keys, setKeys] = useState({});
  const [processando, setProcessando] = useState(null);
  const configurar = (c) => {
    const apiKey = (keys[c.id] ?? "").trim();
    if (apiKey.length < 8) {
      alert("A API key deve ter pelo menos 8 caracteres.");
      return;
    }
    setProcessando(c.id);
    router.post(
      `/admin/sms-sender/${c.id}/configurar`,
      { api_key: apiKey },
      {
        preserveScroll: true,
        onFinish: () => setProcessando(null),
        onSuccess: () => setKeys((k) => ({ ...k, [c.id]: "" }))
      }
    );
  };
  const reverter = (c) => {
    if (!confirm(`Reverter "${c.sender_name}" para pendente? A API key actual será removida.`)) return;
    setProcessando(c.id);
    router.post(`/admin/sms-sender/${c.id}/reverter`, {}, {
      preserveScroll: true,
      onFinish: () => setProcessando(null)
    });
  };
  const pendentes = configs.filter((c) => c.estado === "pendente");
  const configurados = configs.filter((c) => c.estado === "configurado");
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Sender IDs SMS" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600", children: /* @__PURE__ */ jsx(Radio, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Sender IDs SMS" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300", children: "Configurar a API key do Serviço SMS ONDAKA de cada remetente personalizado pedido pelos gestores." })
        ] })
      ] }),
      configs.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400", children: "Ainda não há pedidos de Sender ID." }),
      pendentes.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mb-8", children: [
        /* @__PURE__ */ jsxs("h2", { className: "mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
          " Pendentes (",
          pendentes.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: pendentes.map((c) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex flex-wrap items-baseline justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-gray-900 dark:text-white", children: c.sender_name }),
              /* @__PURE__ */ jsxs("span", { className: "ml-2 text-sm text-gray-500 dark:text-gray-400", children: [
                "· ",
                c.condominio_nome
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: c.actualizado_em })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsx(KeyRound, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: keys[c.id] ?? "",
                  onChange: (e) => setKeys((k) => ({ ...k, [c.id]: e.target.value })),
                  placeholder: "Colar API key do Serviço SMS ONDAKA…",
                  className: "w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => configurar(c),
                disabled: processando === c.id,
                className: "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50",
                children: [
                  /* @__PURE__ */ jsx(CircleCheck, { className: "h-4 w-4" }),
                  processando === c.id ? "A guardar…" : "Marcar configurado"
                ]
              }
            )
          ] })
        ] }, c.id)) })
      ] }),
      configurados.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400", children: [
          /* @__PURE__ */ jsx(CircleCheck, { className: "h-4 w-4" }),
          " Configurados (",
          configurados.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: configurados.map((c) => /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-gray-900 dark:text-white", children: c.sender_name }),
            /* @__PURE__ */ jsxs("span", { className: "ml-2 text-sm text-gray-500 dark:text-gray-400", children: [
              "· ",
              c.condominio_nome
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "ml-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", children: [
              /* @__PURE__ */ jsx(CircleCheck, { className: "h-3 w-3" }),
              " Activo"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => reverter(c),
              disabled: processando === c.id,
              className: "inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700",
              children: [
                /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
                " Reverter"
              ]
            }
          )
        ] }, c.id)) })
      ] })
    ] })
  ] });
}
export {
  Index as default
};
