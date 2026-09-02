import { Link } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check, X, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstadoAfiliado, EstadoComissao, Nivel, SerieMes } from '@/types/afiliados';

/* ============================================================
   Formatação
   ============================================================ */

export const fmtKz = (v: string | number | null | undefined, dec = 2): string => {
    const n = Number(v ?? 0);
    return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(isNaN(n) ? 0 : n) + ' Kz';
};

export const fmtNum = (v: string | number | null | undefined): string =>
    new Intl.NumberFormat('pt-AO').format(Number(v ?? 0) || 0);

export const fmtPct = (v: string | number | null | undefined): string => {
    const n = Number(v ?? 0);
    const s = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
    return s + '%';
};

export const fmtData = (v: string | null | undefined): string => (v ? new Date(v).toLocaleDateString('pt-PT') : '—');

export const fmtDataHora = (v: string | null | undefined): string =>
    v ? new Date(v).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/* ============================================================
   Badges
   ============================================================ */

export function EstadoComissaoBadge({ estado }: { estado: EstadoComissao }) {
    const map: Record<EstadoComissao, [string, string]> = {
        pendente: ['badge-warn', 'Em carência'],
        aprovada: ['badge-info', 'Aprovada'],
        paga: ['badge-success', 'Paga'],
        anulada: ['badge-danger', 'Anulada'],
    };
    const [cls, label] = map[estado] ?? ['badge', estado];
    return <span className={cls}>{label}</span>;
}

export function EstadoAfiliadoBadge({ estado }: { estado: EstadoAfiliado }) {
    const map: Record<EstadoAfiliado, [string, string]> = {
        pendente: ['badge-warn', 'Pendente'],
        activo: ['badge-success', 'Activo'],
        suspenso: ['badge-danger', 'Suspenso'],
        recusado: ['badge', 'Recusado'],
    };
    const [cls, label] = map[estado] ?? ['badge', estado];
    return <span className={cn(cls, estado === 'recusado' && 'bg-white/5 text-white/50 border border-white/10')}>{label}</span>;
}

export function NivelBadge({ nivel, taxa }: { nivel: Nivel | null | undefined; taxa?: string | number }) {
    const map: Record<Nivel, [string, string]> = {
        bronze: ['bg-amber-700/20 text-amber-300 border-amber-600/40', 'Bronze'],
        prata: ['bg-zinc-300/15 text-zinc-100 border-zinc-300/40', 'Prata'],
        ouro: ['bg-yellow-400/20 text-yellow-300 border-yellow-400/50', 'Ouro'],
    };
    const [cls, label] = map[(nivel ?? 'bronze') as Nivel] ?? map.bronze;
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', cls)}>
            {label}{taxa !== undefined && <span className="opacity-80">· {fmtPct(taxa)}</span>}
        </span>
    );
}

export function SubscricaoBadge({ estado }: { estado: string }) {
    const map: Record<string, [string, string]> = {
        trial: ['badge-info', 'Trial'],
        activa: ['badge-success', 'Activa'],
        grace: ['badge-warn', 'Em graça'],
        em_atraso: ['badge-warn', 'Em atraso'],
        limitado: ['badge-warn', 'Limitado'],
        suspensa: ['badge-danger', 'Suspensa'],
        cancelada: ['badge-danger', 'Cancelada'],
        arquivada: ['badge', 'Arquivada'],
        sem_subscricao: ['badge', 'Sem subscrição'],
    };
    const [cls, label] = map[estado] ?? ['badge', estado];
    return <span className={cn(cls, cls === 'badge' && 'bg-white/5 text-white/50 border border-white/10')}>{label}</span>;
}

/* ============================================================
   Cartões / layout
   ============================================================ */

type Tom = 'ciano' | 'roxo' | 'verde' | 'amber' | 'vermelho' | 'neutro';

export function StatCard({ label, valor, sub, icon: Icon, tom = 'neutro' }: {
    label: string; valor: ReactNode; sub?: ReactNode; icon?: React.ElementType; tom?: Tom;
}) {
    const cls: Record<Tom, string> = {
        ciano: 'stat-card-ciano',
        roxo: 'stat-card-roxo',
        verde: 'stat-card border-emerald-500/30',
        amber: 'stat-card border-amber-500/30',
        vermelho: 'stat-card border-red-500/30',
        neutro: 'stat-card',
    };
    const iconCls: Record<Tom, string> = {
        ciano: 'text-cyan-400', roxo: 'text-purple-400', verde: 'text-emerald-400', amber: 'text-amber-400', vermelho: 'text-red-400', neutro: 'text-white/50',
    };
    return (
        <div className={cn(cls[tom], 'flex flex-col justify-between min-h-[104px]')}>
            <div className="flex items-start justify-between gap-2">
                <div className="text-[11px] uppercase tracking-wider text-white/50">{label}</div>
                {Icon && <Icon className={cn('h-4 w-4 shrink-0', iconCls[tom])} />}
            </div>
            <div className="mt-2 text-2xl font-bold text-white leading-tight">{valor}</div>
            {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
        </div>
    );
}

export function PageHeader({ titulo, subtitulo, icon: Icon, accoes }: { titulo: string; subtitulo?: ReactNode; icon?: React.ElementType; accoes?: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-purple-500/30">
                        <Icon className="h-5 w-5 text-cyan-300" />
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-semibold text-white">{titulo}</h1>
                    {subtitulo && <div className="text-sm text-white/50">{subtitulo}</div>}
                </div>
            </div>
            {accoes && <div className="flex flex-wrap gap-2">{accoes}</div>}
        </div>
    );
}

export function Seccao({ titulo, accoes, children, className }: { titulo?: ReactNode; accoes?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <div className={cn('card-elevated p-0 overflow-hidden', className)}>
            {(titulo || accoes) && (
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
                    <div className="text-sm font-semibold text-white">{titulo}</div>
                    {accoes && <div className="flex gap-2">{accoes}</div>}
                </div>
            )}
            {children}
        </div>
    );
}

export function Vazio({ titulo, texto, accao }: { titulo: string; texto?: string; accao?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <Inbox className="h-8 w-8 text-white/20" />
            <div className="text-sm font-medium text-white/70">{titulo}</div>
            {texto && <div className="max-w-md text-xs text-white/40">{texto}</div>}
            {accao && <div className="mt-2">{accao}</div>}
        </div>
    );
}

export function Th({ children, className, right }: { children?: ReactNode; className?: string; right?: boolean }) {
    return <th className={cn('px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap', right ? 'text-right' : 'text-left', className)}>{children}</th>;
}

export function Td({ children, className, right, mono }: { children?: ReactNode; className?: string; right?: boolean; mono?: boolean }) {
    return <td className={cn('px-4 py-3 align-top text-sm text-white/80', right && 'text-right whitespace-nowrap', mono && 'font-mono tabular-nums', className)}>{children}</td>;
}

/* ============================================================
   Navegação secundária
   ============================================================ */

function SubNav({ itens, activo }: { itens: { href: string; label: string }[]; activo: string }) {
    return (
        <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
            {itens.map((i) => (
                <Link
                    key={i.href}
                    href={i.href}
                    className={cn(
                        'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                        activo === i.href ? 'bg-gradient-to-r from-cyan-400/20 to-purple-500/20 text-white border border-purple-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white',
                    )}
                >
                    {i.label}
                </Link>
            ))}
        </div>
    );
}

export function PortalNav({ activo }: { activo: string }) {
    return (
        <SubNav
            activo={activo}
            itens={[
                { href: '/afiliado', label: 'Painel' },
                { href: '/afiliado/clientes', label: 'Clientes indicados' },
                { href: '/afiliado/comissoes', label: 'Comissões' },
                { href: '/afiliado/pagamentos', label: 'Pagamentos' },
                { href: '/afiliado/dados', label: 'Dados de pagamento' },
            ]}
        />
    );
}

export function AdminNav({ activo }: { activo: string }) {
    return (
        <SubNav
            activo={activo}
            itens={[
                { href: '/super-admin/afiliados', label: 'Afiliados' },
                { href: '/super-admin/afiliados/comissoes', label: 'Comissões' },
                { href: '/super-admin/afiliados/pagamentos', label: 'Pagamentos' },
                { href: '/super-admin/afiliados/config', label: 'Configuração' },
            ]}
        />
    );
}

/* ============================================================
   Paginação (links do paginator Laravel)
   ============================================================ */

export function Paginacao({ links, from, to, total }: { links: { url: string | null; label: string; active: boolean }[]; from: number | null; to: number | null; total: number }) {
    if (!links || links.length <= 3) {
        return total > 0 ? <div className="px-5 py-3 text-xs text-white/40">{total} registo(s)</div> : null;
    }
    return (
        <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-white/40">{from ?? 0}–{to ?? 0} de {total}</div>
            <div className="flex flex-wrap gap-1">
                {links.map((l, i) => {
                    const label = l.label.includes('Previous') ? <ChevronLeft className="h-3.5 w-3.5" /> : l.label.includes('Next') ? <ChevronRight className="h-3.5 w-3.5" /> : <span dangerouslySetInnerHTML={{ __html: l.label }} />;
                    return l.url ? (
                        <Link key={i} href={l.url} preserveScroll preserveState className={cn('inline-flex min-w-[32px] items-center justify-center rounded-md px-2 py-1 text-xs', l.active ? 'bg-purple-500/30 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white')}>{label}</Link>
                    ) : (
                        <span key={i} className="inline-flex min-w-[32px] items-center justify-center rounded-md px-2 py-1 text-xs text-white/20">{label}</span>
                    );
                })}
            </div>
        </div>
    );
}

/* ============================================================
   Modal
   ============================================================ */

export function Modal({ aberto, onClose, titulo, children, largura = 'max-w-lg' }: { aberto: boolean; onClose: () => void; titulo: ReactNode; children: ReactNode; largura?: string }) {
    if (!aberto) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className={cn('w-full rounded-2xl border border-white/10 bg-[#16163A] shadow-2xl', largura)} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div className="text-base font-semibold text-white">{titulo}</div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto px-5 py-4">{children}</div>
            </div>
        </div>
    );
}

/* ============================================================
   Copiar
   ============================================================ */

export function CopiarBotao({ texto, label = 'Copiar', className }: { texto: string; label?: string; className?: string }) {
    const [ok, setOk] = useState(false);
    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(texto);
            setOk(true);
            toast.success('Copiado para a área de transferência.');
            setTimeout(() => setOk(false), 1800);
        } catch {
            toast.error('Não foi possível copiar. Seleccione e copie manualmente.');
        }
    };
    return (
        <button type="button" onClick={copiar} className={cn('btn-secondary', className)}>
            {ok ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {ok ? 'Copiado' : label}
        </button>
    );
}

/* ============================================================
   Gráfico de barras mensal (12 meses) — sem dependências
   ============================================================ */

export function BarrasMensais({ serie, altura = 140 }: { serie: SerieMes[]; altura?: number }) {
    const max = Math.max(1, ...serie.map((s) => Number(s.total_kz)));
    return (
        <div className="w-full">
            <div className="flex items-end gap-1.5" style={{ height: altura }}>
                {serie.map((s) => {
                    const v = Number(s.total_kz);
                    const h = v > 0 ? Math.max(4, Math.round((v / max) * (altura - 8))) : 2;
                    return (
                        <div key={s.mes} className="group relative flex flex-1 flex-col items-center justify-end" title={`${s.label}: ${fmtKz(v)} · ${s.n} comissão(ões)`}>
                            <div className="w-full rounded-t-md bg-gradient-to-t from-purple-500/60 to-cyan-400/70 transition group-hover:from-purple-400 group-hover:to-cyan-300" style={{ height: h }} />
                        </div>
                    );
                })}
            </div>
            <div className="mt-1.5 flex gap-1.5">
                {serie.map((s) => (
                    <div key={s.mes} className="flex-1 text-center text-[10px] text-white/40">{s.label}</div>
                ))}
            </div>
        </div>
    );
}

/* ============================================================
   Progresso de nível
   ============================================================ */

export function ProgressoNivel({ clientes, nivel, proximo }: { clientes: number; nivel: Nivel; proximo: { label: string; min_clientes: number; faltam: number; taxa_pct: string } | null }) {
    if (!proximo) {
        return <div className="text-sm text-yellow-300">Nível máximo atingido · {clientes} cliente(s) pagante(s)</div>;
    }
    const pct = Math.min(100, Math.round((clientes / proximo.min_clientes) * 100));
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-white/60">
                <span><NivelBadge nivel={nivel} /></span>
                <span>Faltam <strong className="text-white">{proximo.faltam}</strong> cliente(s) pagante(s) para <strong className="text-white">{proximo.label}</strong> ({fmtPct(proximo.taxa_pct)})</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-[11px] text-white/40">{clientes} de {proximo.min_clientes} clientes pagantes</div>
        </div>
    );
}
