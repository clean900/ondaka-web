import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useForm, Head } from "@inertiajs/react";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle2, Info, Wrench, Phone, FileText, Mail, MapPin, Send } from "lucide-react";
function InscricaoPublica({ categorias, valorSubscricao }) {
  const [submetido, setSubmetido] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    nome: "",
    telefone: "",
    nif: "",
    email: "",
    especialidades: "",
    observacoes: "",
    latitude: "",
    longitude: ""
  });
  const submeter = (e) => {
    e.preventDefault();
    post(route("prestadores.inscricao.submeter"), {
      preserveScroll: true,
      onSuccess: () => {
        setSubmetido(true);
        reset();
        toast.success("Inscricao submetida com sucesso!");
      },
      onError: () => {
        toast.error("Verifique os campos obrigatorios.");
      }
    });
  };
  const usarLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalizacao nao suportada neste dispositivo.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7)
        }));
        toast.success("Localizacao capturada.");
      },
      () => toast.error("Nao foi possivel obter a localizacao.")
    );
  };
  const formatMoeda = (v) => new Intl.NumberFormat("pt-PT").format(v) + " Kz";
  if (submetido) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Head, { title: "Inscricao submetida - ONDAKA" }),
      /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#0A0A1A] flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-8 h-8 text-emerald-400" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white mb-3", children: "Inscricao submetida" }),
        /* @__PURE__ */ jsx("p", { className: "text-white/60 mb-8", children: "A sua inscricao sera analisada pela equipa ONDAKA. Entraremos em contacto em breve atraves do telefone ou email indicado." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSubmetido(false),
            className: "text-cyan-400 hover:text-cyan-300 text-sm font-medium",
            children: "Submeter outra inscricao"
          }
        )
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Inscricao de Prestador - ONDAKA" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#0A0A1A] py-10 px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold tracking-[0.2em] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent", children: "ONDAKA" }),
        /* @__PURE__ */ jsx("p", { className: "text-white/50 mt-2", children: "Inscreva-se como prestador de servicos" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/[0.03] border border-purple-500/15 rounded-2xl p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 bg-cyan-500/10 rounded-lg mb-6", children: [
          /* @__PURE__ */ jsx(Info, { className: "w-5 h-5 text-cyan-400 flex-shrink-0" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-cyan-300", children: [
            "Subscricao de ",
            formatMoeda(valorSubscricao),
            "/mes apos aprovacao da equipa ONDAKA"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submeter, className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Campo, { label: "Nome do prestador / empresa", obrigatorio: true, erro: errors.nome, icone: /* @__PURE__ */ jsx(Wrench, { className: "w-4 h-4" }), children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.nome,
              onChange: (e) => setData("nome", e.target.value),
              placeholder: "Ex: Joao Canalizacoes",
              className: "input-ondaka"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Campo, { label: "Telefone", obrigatorio: true, erro: errors.telefone, icone: /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4" }), children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.telefone,
                onChange: (e) => setData("telefone", e.target.value),
                placeholder: "+244 9XX XXX XXX",
                className: "input-ondaka"
              }
            ) }),
            /* @__PURE__ */ jsx(Campo, { label: "NIF (opcional)", erro: errors.nif, icone: /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }), children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.nif,
                onChange: (e) => setData("nif", e.target.value),
                placeholder: "Ex: 5417658413",
                className: "input-ondaka"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx(Campo, { label: "Email (opcional)", erro: errors.email, icone: /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }), children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              value: data.email,
              onChange: (e) => setData("email", e.target.value),
              placeholder: "contacto@exemplo.ao",
              className: "input-ondaka"
            }
          ) }),
          /* @__PURE__ */ jsxs(Campo, { label: "Especialidades", obrigatorio: true, erro: errors.especialidades, children: [
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: data.especialidades,
                onChange: (e) => setData("especialidades", e.target.value),
                placeholder: "Ex: Canalizacao, reparacao de fugas, instalacao de bombas de agua",
                rows: 3,
                className: "input-ondaka resize-y"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: categorias.map((cat) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  const atual = data.especialidades.trim();
                  const nova = atual ? `${atual}, ${cat.nome}` : cat.nome;
                  setData("especialidades", nova);
                },
                className: "text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 hover:bg-white/10 hover:text-white/80 transition",
                children: cat.nome
              },
              cat.id
            )) })
          ] }),
          /* @__PURE__ */ jsx(Campo, { label: "Observacoes (opcional)", erro: errors.observacoes, children: /* @__PURE__ */ jsx(
            "textarea",
            {
              value: data.observacoes,
              onChange: (e) => setData("observacoes", e.target.value),
              placeholder: "Horario de atendimento, zona de cobertura, etc.",
              rows: 2,
              className: "input-ondaka resize-y"
            }
          ) }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: usarLocalizacao,
              className: "flex items-center gap-2 w-full px-4 py-3 bg-white/5 rounded-lg text-sm text-white/60 hover:bg-white/10 transition",
              children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-5 h-5" }),
                data.latitude ? `Localizacao capturada (${data.latitude}, ${data.longitude})` : "Usar a minha localizacao (opcional) - ajuda condominos proximos a encontra-lo"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition",
              children: [
                /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
                processing ? "A submeter..." : "Submeter inscricao"
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/40 text-center", children: "A inscricao sera analisada pela equipa ONDAKA" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("style", { children: `
                .input-ondaka {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 10px 12px;
                    color: white;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .input-ondaka:focus { border-color: rgba(34,211,238,0.5); }
                .input-ondaka::placeholder { color: rgba(255,255,255,0.3); }
            ` })
  ] });
}
function Campo({
  label,
  obrigatorio,
  erro,
  icone,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-sm text-white/60 mb-1.5", children: [
      icone,
      label,
      " ",
      obrigatorio && /* @__PURE__ */ jsx("span", { className: "text-pink-400", children: "*" })
    ] }),
    children,
    erro && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mt-1", children: erro })
  ] });
}
export {
  InscricaoPublica as default
};
