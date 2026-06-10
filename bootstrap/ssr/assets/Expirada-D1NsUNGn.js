import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BxaWWjLC.js";
import { Head, Link } from "@inertiajs/react";
import { Archive, CircleX, Mail, Phone } from "lucide-react";
import "react";
import "sonner";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function formatData(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(iso));
}
function SubscricaoExpirada({ subscricao }) {
  const estado = (subscricao == null ? void 0 : subscricao.estado) ?? "";
  const Icon = estado === "arquivada" ? Archive : CircleX;
  const titulos = {
    suspensa: "Subscrição suspensa",
    arquivada: "Conta arquivada",
    cancelada: "Subscrição terminada"
  };
  const titulo = titulos[estado] ?? "Subscrição inactiva";
  const mensagens = {
    suspensa: "A sua conta foi suspensa por falta de pagamento. Os dados permanecem seguros por 90 dias.",
    arquivada: "A sua conta foi arquivada. Para reactivar, contacte o nosso suporte.",
    cancelada: `A sua subscrição foi cancelada e o período pago expirou em ${formatData(
      (subscricao == null ? void 0 : subscricao.periodo_actual_fim) ?? null
    )}.`
  };
  const mensagem = mensagens[estado] ?? "A sua subscrição não está activa.";
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Subscrição expirada" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-[70vh] flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-lg w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Icon, { className: "w-8 h-8 text-red-400" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white mb-3", children: titulo }),
      /* @__PURE__ */ jsx("p", { className: "text-white/70 mb-8 leading-relaxed", children: mensagem }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-white/5 border border-white/10 text-left mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-white/80 mb-3", children: "Como reactivar" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-4 leading-relaxed", children: "A nossa equipa pode ajudar a regularizar a situação e restaurar o acesso. Os seus condomínios, condóminos e histórico permanecem intactos." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "mailto:suporte@ondaka.ao",
              className: "flex items-center gap-2 text-sm text-[#00D4FF] hover:text-[#8FE7FF] transition-colors",
              children: [
                /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }),
                "suporte@ondaka.ao"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "tel:+244000000000",
              className: "flex items-center gap-2 text-sm text-[#00D4FF] hover:text-[#8FE7FF] transition-colors",
              children: [
                /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4" }),
                "+244 (contacto em breve)"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/subscricao",
          className: "text-sm text-white/60 hover:text-white transition-colors",
          children: "Ver detalhes da subscrição"
        }
      )
    ] }) })
  ] });
}
export {
  SubscricaoExpirada as default
};
