import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatKz(valor) {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  if (isNaN(num)) return "Kz 0";
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num).replace("AOA", "Kz");
}
function formatDate(data) {
  if (!data) return "—";
  try {
    const d = typeof data === "string" ? new Date(data) : data;
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(d);
  } catch {
    return "—";
  }
}
function formatRelativo(data) {
  const d = typeof data === "string" ? new Date(data) : data;
  const agora = /* @__PURE__ */ new Date();
  const diffMs = agora.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 6e4);
  const diffHoras = Math.floor(diffMs / 36e5);
  const diffDias = Math.floor(diffMs / 864e5);
  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHoras < 24) return `Há ${diffHoras}h`;
  if (diffDias < 7) return `Há ${diffDias} dias`;
  return formatDate(d);
}
function iniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
function gradientDeNome(nome) {
  const gradientes = [
    "linear-gradient(135deg, #00D4FF, #A855F7)",
    "linear-gradient(135deg, #A855F7, #EC4899)",
    "linear-gradient(135deg, #EC4899, #00D4FF)",
    "linear-gradient(135deg, #00D4FF, #10B981)",
    "linear-gradient(135deg, #A855F7, #F59E0B)",
    "linear-gradient(135deg, #EC4899, #F59E0B)"
  ];
  const hash = nome.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradientes[hash % gradientes.length];
}
export {
  formatKz as a,
  formatRelativo as b,
  cn as c,
  formatDate as f,
  gradientDeNome as g,
  iniciais as i
};
