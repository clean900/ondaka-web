import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Save, Smartphone, ExternalLink } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    condominio: { id: number; nome: string; regulamento_mobile: boolean };
    html: string;
    urlVer: string;
}

export default function Regulamento({ condominio, html, urlVer }: Props) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [mobile, setMobile] = useState(condominio.regulamento_mobile);
    const [guardando, setGuardando] = useState(false);

    const guardar = () => {
        const conteudo = editorRef.current?.innerHTML ?? '';
        setGuardando(true);
        router.patch(`/condominios/${condominio.id}/regulamento`, { html: conteudo, regulamento_mobile: mobile }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Regulamento guardado.'),
            onFinish: () => setGuardando(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Regulamento — ${condominio.nome}`} />
            <style>{`.reg-edit h1{font-size:24px;text-align:center;margin:14px 0 4px;color:#111827}.reg-edit h3{font-size:17px;margin:22px 0 6px;padding-bottom:5px;border-bottom:1px solid #e5e7eb;color:#111827}.reg-edit p{font-size:14px;line-height:1.7;color:#374151;margin:6px 0}.reg-edit .art{font-weight:600;color:#111827}`}</style>
            <div className="max-w-4xl mx-auto py-6 px-4">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Regulamento do condomínio</h1>
                        <p className="text-sm text-zinc-500">{condominio.nome} · edite o texto diretamente abaixo</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={urlVer} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10"><ExternalLink className="h-4 w-4" /> Ver / imprimir</a>
                        <button onClick={guardar} disabled={guardando} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50"><Save className="h-4 w-4" /> {guardando ? 'A guardar...' : 'Guardar'}</button>
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-white/80 mb-4 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3">
                    <input type="checkbox" checked={mobile} onChange={(e) => setMobile(e.target.checked)} className="accent-emerald-500" />
                    <Smartphone className="h-4 w-4 text-emerald-300" />
                    Publicar no mobile (visível aos condóminos)
                </label>

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="reg-edit bg-white rounded-xl p-8 min-h-[400px] outline-none focus:ring-2 focus:ring-cyan-500/40"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </div>
        </AuthenticatedLayout>
    );
}
