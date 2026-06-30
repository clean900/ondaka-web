import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Calculator, Download, FileSpreadsheet, Receipt, Wallet } from 'lucide-react';

interface TipoExport {
    slug: 'pagamentos' | 'lancamentos' | 'despesas';
    nome: string;
    descricao: string;
}

interface Props {
    condominios: { id: number; nome: string }[];
    tipos: TipoExport[];
}

const ICONES: Record<string, React.ElementType> = {
    pagamentos: Receipt,
    lancamentos: Wallet,
    despesas: FileSpreadsheet,
};

const CORES: Record<string, string> = {
    pagamentos: '#10B981',
    lancamentos: '#00D4FF',
    despesas: '#EC4899',
};

export default function Index({ condominios, tipos }: Props) {
    const hoje = new Date();
    const inicioAno = `${hoje.getFullYear()}-01-01`;
    const hojeStr = hoje.toISOString().slice(0, 10);

    const [condominioId, setCondominioId] = useState('');
    const [de, setDe] = useState(inicioAno);
    const [ate, setAte] = useState(hojeStr);

    const hrefExport = (tipo: string) => {
        const params = new URLSearchParams();
        if (condominioId) params.set('condominio_id', condominioId);
        if (de) params.set('de', de);
        if (ate) params.set('ate', ate);
        return `/contabilidade/exportar/${tipo}?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Integração Contabilidade" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(0,212,255,0.12)', border: '0.5px solid rgba(0,212,255,0.3)' }}
                    >
                        <Calculator className="w-5 h-5 text-[#00D4FF]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Integração Contabilidade</h1>
                        <p className="text-sm text-white/60 mt-1">
                            Exporte os movimentos financeiros em CSV para importar no PHC, Primavera ou outro ERP.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Condomínio</label>
                        <select value={condominioId} onChange={(e) => setCondominioId(e.target.value)} className="input">
                            <option value="">Todos os condomínios</option>
                            {condominios.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">De</label>
                        <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="input" />
                    </div>
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Até</label>
                        <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className="input" />
                    </div>
                </div>
            </div>

            {/* Cartões de export */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tipos.map((t) => {
                    const Icon = ICONES[t.slug] ?? Download;
                    const cor = CORES[t.slug] ?? '#A855F7';
                    return (
                        <div key={t.slug} className="card flex flex-col">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                style={{ background: `${cor}18`, border: `0.5px solid ${cor}33` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: cor }} />
                            </div>
                            <h3 className="font-semibold text-white">{t.nome}</h3>
                            <p className="text-xs text-white/55 mt-1 mb-4 flex-1">{t.descricao}</p>
                            <a
                                href={hrefExport(t.slug)}
                                className="inline-flex items-center justify-center gap-2 text-sm py-2 rounded-lg font-medium text-white transition hover:opacity-90"
                                style={{ background: `linear-gradient(135deg, ${cor} 0%, #A855F7 100%)` }}
                            >
                                <Download className="w-4 h-4" />
                                Exportar CSV
                            </a>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-white/40 mt-6 max-w-2xl">
                Os ficheiros usam codificação UTF-8 e separador <code className="text-white/60">;</code> — abrem
                directamente no Excel e importam no PHC/Primavera. Exporta-se: pagamentos confirmados, taxas/lançamentos
                não cancelados e despesas não canceladas no período escolhido.
            </p>
        </AuthenticatedLayout>
    );
}
