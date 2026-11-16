import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-inmGbT7l.js";
import { Head } from "@inertiajs/react";
import { Presentation, ExternalLink, Download } from "lucide-react";
import { P as PageHeader, b as PortalNav } from "./ui-DbTW8l3u.js";
import "react";
import "sonner";
import "./utils-B_FeHPtl.js";
import "clsx";
import "tailwind-merge";
import "react-markdown";
import "remark-gfm";
import "driver.js";
function Apresentacao({ afiliado, url }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Apresentação do programa" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          icon: Presentation,
          titulo: "Apresentação do programa",
          subtitulo: /* @__PURE__ */ jsxs("span", { children: [
            "Mostre-a a quem quiser trazer: explica os escalões, o que dá comissão e como se recebe — e traz os tutoriais em vídeo lá dentro. O seu código é",
            " ",
            /* @__PURE__ */ jsx("strong", { className: "text-white", children: afiliado.codigo }),
            "."
          ] }),
          accoes: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "btn-ghost text-xs", children: [
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
              " Abrir em separador novo"
            ] }),
            /* @__PURE__ */ jsxs("a", { href: url, download: "programa-de-afiliados-ondaka.html", className: "btn-ghost text-xs", children: [
              /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
              " Descarregar"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(PortalNav, { activo: "/afiliado/apresentacao" }),
      /* @__PURE__ */ jsx(
        "iframe",
        {
          src: url,
          title: "Apresentação do Programa de Afiliados da ONDAKA",
          loading: "lazy",
          referrerPolicy: "no-referrer",
          className: "block w-full rounded-xl border border-white/10 bg-[#061226]",
          style: { height: "calc(100vh - 300px)", minHeight: 560 }
        }
      )
    ] })
  ] });
}
export {
  Apresentacao as default
};
