import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FileText, Upload, Trash2, Download, Plus } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';
import { toast } from 'sonner';

interface Modelo {
    id: number;
    nome: string;
    descricao: string | null;
    url: string;
    criado_em: string | null;
}

interface Props {
    titulo: string;
    descricao: string;
    categoria: string;
    modelos: Modelo[];
}

export default function RepositorioDocumentos({ titulo, descricao, categoria, modelos }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const form = useForm<{ categoria: string; nome: string; descricao: string; ficheiro: File | null }>({
        categoria,
        nome: '',
        descricao: '',
        ficheiro: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!form.data.ficheiro) {
            toast.error('Escolha um ficheiro.');
            return;
        }
        form.post('/documentos/modelos', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Modelo adicionado.');
                form.reset('nome', 'descricao', 'ficheiro');
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const apagar = (m: Modelo) => {
        if (!confirm(`Apagar o modelo "${m.nome}"?`)) return;
        router.delete(`/documentos/modelos/${m.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Modelo removido.'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={titulo} />
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                        <FileText className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white">{titulo}</h1>
                </div>
                <p className="text-zinc-400 mb-6">{descricao}</p>

                {/* Upload */}
                <form onSubmit={submit} className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-5 mb-6 space-y-3">
                    <div className="text-sm font-medium text-white flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar modelo</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" value={form.data.nome} onChange={(e) => form.setData('nome', e.target.value)} placeholder="Nome (ex: Contrato de administração)" className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                        <input type="text" value={form.data.descricao} onChange={(e) => form.setData('descricao', e.target.value)} placeholder="Descrição (opcional)" className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                    </div>
                    {form.errors.nome && <p className="text-xs text-red-400">{form.errors.nome}</p>}
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={(e) => form.setData('ficheiro', e.target.files?.[0] ?? null)}
                        className="w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
                    />
                    {form.errors.ficheiro && <p className="text-xs text-red-400">{form.errors.ficheiro}</p>}
                    <div className="flex justify-end">
                        <button type="submit" disabled={form.processing} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
                            <Upload className="w-4 h-4" /> {form.processing ? 'A enviar...' : 'Adicionar modelo'}
                        </button>
                    </div>
                </form>

                {/* Lista */}
                {modelos.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/40 p-10 text-center text-sm text-zinc-400">
                        Ainda não há modelos nesta categoria. Adicione o primeiro acima.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {modelos.map((m) => (
                            <li key={m.id} className="flex items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-900/50 px-4 py-3">
                                <div className="min-w-0">
                                    <div className="text-sm text-white truncate">{m.nome}</div>
                                    {m.descricao && <div className="text-xs text-zinc-400 truncate">{m.descricao}</div>}
                                    {m.criado_em && <div className="text-[11px] text-zinc-500">{m.criado_em}</div>}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-300 hover:underline text-sm"><Download className="w-4 h-4" /> Abrir</a>
                                    <button onClick={() => apagar(m)} className="p-1.5 rounded text-red-400 hover:bg-red-500/10" title="Apagar"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
