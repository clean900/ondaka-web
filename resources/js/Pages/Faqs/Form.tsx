import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

interface Faq {
    id: number;
    condominio_id: number | null;
    categoria: string;
    pergunta: string;
    resposta: string;
    palavras_chave: string | null;
    ordem: number;
    activa: boolean;
}

interface Props {
    condominios: Array<{ id: number; nome: string }>;
    categorias: Record<string, string>;
    faq: Faq | null;
}

export default function FaqForm({ condominios, categorias, faq }: Props) {
    const isEdit = !!faq;

    const { data, setData, post, put, processing, errors } = useForm({
        condominio_id: faq?.condominio_id?.toString() || '',
        categoria: faq?.categoria || 'geral',
        pergunta: faq?.pergunta || '',
        resposta: faq?.resposta || '',
        palavras_chave: faq?.palavras_chave || '',
        ordem: faq?.ordem || 0,
        activa: faq?.activa ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('faqs.update', faq.id));
        } else {
            post(route('faqs.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Editar FAQ' : 'Nova FAQ'} />
            <div className="p-6 max-w-3xl">
                <div className="mb-6">
                    <Link
                        href={route('faqs.index')}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar à lista
                    </Link>
                    <h1 className="text-2xl font-semibold text-zinc-100">
                        {isEdit ? 'Editar FAQ' : 'Nova FAQ'}
                    </h1>
                </div>

                <form onSubmit={submit} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Condomínio</label>
                            <select
                                value={data.condominio_id}
                                onChange={(e) => setData('condominio_id', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
                            >
                                <option value="">Todos os condomínios (geral)</option>
                                {condominios.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                            {errors.condominio_id && <p className="text-xs text-rose-400 mt-1">{errors.condominio_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Categoria *</label>
                            <select
                                value={data.categoria}
                                onChange={(e) => setData('categoria', e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
                            >
                                {Object.entries(categorias).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Pergunta *</label>
                        <input
                            type="text"
                            value={data.pergunta}
                            onChange={(e) => setData('pergunta', e.target.value)}
                            placeholder="Ex: Como pago a minha quota mensal?"
                            className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
                            maxLength={300}
                        />
                        {errors.pergunta && <p className="text-xs text-rose-400 mt-1">{errors.pergunta}</p>}
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Resposta *</label>
                        <textarea
                            value={data.resposta}
                            onChange={(e) => setData('resposta', e.target.value)}
                            rows={6}
                            placeholder="Resposta detalhada. Podes usar várias frases e parágrafos."
                            className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
                            maxLength={5000}
                        />
                        <p className="text-xs text-zinc-600 mt-1">{data.resposta.length} / 5000 caracteres</p>
                        {errors.resposta && <p className="text-xs text-rose-400 mt-1">{errors.resposta}</p>}
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">
                            Palavras-chave (separadas por vírgula)
                        </label>
                        <input
                            type="text"
                            value={data.palavras_chave}
                            onChange={(e) => setData('palavras_chave', e.target.value)}
                            placeholder="Ex: pagar, quota, multicaixa, referência, transferência"
                            className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
                        />
                        <p className="text-xs text-zinc-600 mt-1">
                            Ajudam o chatbot a encontrar esta FAQ mais rápido. São usadas em matching prioritário.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Ordem</label>
                            <input
                                type="number"
                                value={data.ordem}
                                onChange={(e) => setData('ordem', parseInt(e.target.value) || 0)}
                                min={0}
                                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:border-cyan-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center mt-5">
                            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.activa}
                                    onChange={(e) => setData('activa', e.target.checked)}
                                    className="rounded bg-zinc-950 border-zinc-700 text-cyan-500 focus:ring-cyan-500"
                                />
                                FAQ activa
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                        <Link
                            href={route('faqs.index')}
                            className="px-4 py-2 text-sm rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isEdit ? 'Actualizar' : 'Criar FAQ'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
