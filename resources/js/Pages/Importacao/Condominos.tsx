import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { useState } from 'react';

interface LinhaPreview {
    linha: number;
    dados: Record<string, string>;
    erros: string[];
}
interface Preview {
    linhas: LinhaPreview[];
    total: number;
    validas: number;
}
interface Props {
    preview: Preview | null;
}

export default function ImportacaoCondominos({ preview }: Props) {
    const flash = (usePage().props as any).flash;
    const [ficheiro, setFicheiro] = useState<File | null>(null);
    const [processando, setProcessando] = useState(false);

    const analisar = () => {
        if (!ficheiro) return;
        setProcessando(true);
        router.post(route('importacao.condominos.analisar'), { ficheiro }, {
            forceFormData: true, preserveScroll: true,
            onFinish: () => setProcessando(false),
        });
    };

    const importar = () => {
        if (!ficheiro) return;
        if (!confirm(`Importar ${preview?.validas} condóminos válidos? As linhas com erro são ignoradas.`)) return;
        setProcessando(true);
        router.post(route('importacao.condominos.importar'), { ficheiro }, {
            forceFormData: true,
            onFinish: () => setProcessando(false),
        });
    };

    const exemploCsv = 'data:text/csv;charset=utf-8,nome,bi,nif,telefone,email%0AJoao Silva,001234LA042,5417...,923000000,joao@mail.com%0AMaria Costa,009876LA011,,924111111,';

    return (
        <AuthenticatedLayout>
            <Head title="Importação de Condóminos" />
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                        <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100">Importação Massiva de Condóminos</h1>
                        <p className="text-sm text-zinc-500">Carregue um CSV, reveja o preview e importe — só as linhas válidas entram.</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg px-4 py-3 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Upload */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">1. Ficheiro CSV</h2>
                        <a href={exemploCsv} download="modelo-condominos.csv" className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
                            <Download className="h-3.5 w-3.5" /> Descarregar modelo
                        </a>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">Colunas aceites (cabeçalho): <code className="text-zinc-300">nome, bi, nif, telefone, email</code>. Só <b>nome</b> é obrigatório.</p>
                    <div className="flex items-center gap-3">
                        <input type="file" accept=".csv,.txt" onChange={(e) => setFicheiro(e.target.files?.[0] ?? null)}
                            className="text-sm text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-zinc-200" />
                        <button onClick={analisar} disabled={!ficheiro || processando}
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 hover:bg-cyan-500 text-white text-sm px-4 py-2 disabled:opacity-50">
                            <Upload className="h-4 w-4" /> Analisar
                        </button>
                    </div>
                </div>

                {/* Preview */}
                {preview && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">2. Preview</h2>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-emerald-400">{preview.validas} válidas</span>
                                <span className="text-rose-400">{preview.total - preview.validas} com erro</span>
                                <span className="text-zinc-500">{preview.total} total</span>
                            </div>
                        </div>

                        <div className="overflow-auto max-h-[400px] rounded-lg border border-zinc-800">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-900 text-zinc-500 text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="text-left px-3 py-2">#</th>
                                        <th className="text-left px-3 py-2">Nome</th>
                                        <th className="text-left px-3 py-2">BI</th>
                                        <th className="text-left px-3 py-2">Telefone</th>
                                        <th className="text-left px-3 py-2">Email</th>
                                        <th className="text-left px-3 py-2">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.linhas.map((l) => (
                                        <tr key={l.linha} className={`border-t border-zinc-800/70 ${l.erros.length ? 'bg-rose-500/5' : ''}`}>
                                            <td className="px-3 py-2 text-zinc-600">{l.linha}</td>
                                            <td className="px-3 py-2 text-zinc-200">{l.dados.nome_completo || '—'}</td>
                                            <td className="px-3 py-2 text-zinc-400">{l.dados.numero_bi || '—'}</td>
                                            <td className="px-3 py-2 text-zinc-400">{l.dados.telefone_principal || '—'}</td>
                                            <td className="px-3 py-2 text-zinc-400">{l.dados.email || '—'}</td>
                                            <td className="px-3 py-2">
                                                {l.erros.length === 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> OK</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-rose-400"><AlertTriangle className="h-3.5 w-3.5" /> {l.erros.join(', ')}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button onClick={importar} disabled={processando || preview.validas === 0}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 text-sm disabled:opacity-50">
                                <CheckCircle2 className="h-4 w-4" /> Importar {preview.validas} condóminos
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
