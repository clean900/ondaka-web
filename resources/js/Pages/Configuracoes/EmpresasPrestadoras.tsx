import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Briefcase, Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Phone, Mail, Hash, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Empresa {
    id: number;
    nome: string;
    nif: string | null;
    telefone: string | null;
    email: string | null;
    especialidades: string | null;
    observacoes: string | null;
    ativa: boolean;
    certificado?: boolean;
    certificado_em?: string | null;
    intervencoes_count?: number;
    preco_medio?: number | null;
}

const fmtKz = (v: number) => new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(v) + ' Kz';

interface PageProps {
    empresas: Empresa[];
    podeCertificar?: boolean;
}

export default function EmpresasPrestadoras({ empresas, podeCertificar = false }: PageProps) {
    const [modal, setModal] = useState<null | { tipo: 'novo' | 'editar'; emp?: Empresa }>(null);

    const certificar = (e: Empresa) => {
        router.post(`/configuracoes/empresas-prestadoras/${e.id}/certificar`, {
            certificado: !e.certificado,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(e.certificado ? 'Certificação removida.' : 'Prestador certificado.'),
        });
    };

    const toggle = (e: Empresa) => {
        router.patch(`/configuracoes/empresas-prestadoras/${e.id}`, {
            nome: e.nome,
            nif: e.nif,
            telefone: e.telefone,
            email: e.email,
            especialidades: e.especialidades,
            observacoes: e.observacoes,
            ativa: !e.ativa,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Estado actualizado.'),
        });
    };

    const eliminar = (e: Empresa) => {
        if (!confirm(`Eliminar empresa "${e.nome}"?`)) return;
        router.delete(`/configuracoes/empresas-prestadoras/${e.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Empresa removida.'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Empresas Prestadoras — ONDAKA" />
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-100">Empresas Prestadoras</h1>
                            <p className="text-sm text-zinc-500">
                                {empresas.length} empresas registadas · {empresas.filter((e) => e.ativa).length} activas
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModal({ tipo: 'novo' })}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white px-4 py-2 text-sm font-medium shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Nova empresa
                    </button>
                </div>

                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-900/80 border-b border-zinc-800">
                            <tr>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">Nome</th>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">NIF</th>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">Contactos</th>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">Especialidades</th>
                                <th className="text-left px-4 py-2 text-zinc-400 text-xs uppercase">Activa</th>
                                <th className="text-right px-4 py-2 text-zinc-400 text-xs uppercase">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empresas.map((e) => (
                                <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40">
                                    <td className="px-4 py-3 text-zinc-200 font-medium">
                                        <span className="inline-flex items-center gap-1.5">
                                            {e.nome}
                                            {e.certificado && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                                    <BadgeCheck className="h-3 w-3" />
                                                    Certificado
                                                </span>
                                            )}
                                        </span>
                                        {(e.intervencoes_count ?? 0) > 0 && (
                                            <div className="text-[11px] text-zinc-500 mt-0.5">
                                                {e.intervencoes_count} intervenç{e.intervencoes_count === 1 ? 'ão' : 'ões'}
                                                {e.preco_medio != null && <> · média {fmtKz(Number(e.preco_medio))}</>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs">{e.nif ?? '—'}</td>
                                    <td className="px-4 py-3 text-xs text-zinc-400 space-y-0.5">
                                        {e.telefone && <div><Phone className="inline h-3 w-3 mr-1" />{e.telefone}</div>}
                                        {e.email && <div><Mail className="inline h-3 w-3 mr-1" />{e.email}</div>}
                                        {!e.telefone && !e.email && <span className="text-zinc-600">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-xs truncate">{e.especialidades ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggle(e)}>
                                            {e.ativa ? (
                                                <ToggleRight className="h-5 w-5 text-emerald-400" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-zinc-600" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {podeCertificar && (
                                            <button
                                                onClick={() => certificar(e)}
                                                title={e.certificado ? 'Remover certificação' : 'Certificar prestador'}
                                                className={`mr-2 ${e.certificado ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-500 hover:text-emerald-400'}`}
                                            >
                                                <BadgeCheck className="h-4 w-4 inline" />
                                            </button>
                                        )}
                                        <button onClick={() => setModal({ tipo: 'editar', emp: e })} className="text-zinc-400 hover:text-zinc-200 mr-2">
                                            <Pencil className="h-4 w-4 inline" />
                                        </button>
                                        <button onClick={() => eliminar(e)} className="text-red-400 hover:text-red-300">
                                            <Trash2 className="h-4 w-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {empresas.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Nenhuma empresa prestadora ainda.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && <ModalEmpresa modal={modal} onClose={() => setModal(null)} />}
        </AuthenticatedLayout>
    );
}

function ModalEmpresa({ modal, onClose }: { modal: { tipo: 'novo' | 'editar'; emp?: Empresa }; onClose: () => void }) {
    const emp = modal.emp;
    const [nome, setNome] = useState(emp?.nome ?? '');
    const [nif, setNif] = useState(emp?.nif ?? '');
    const [telefone, setTelefone] = useState(emp?.telefone ?? '');
    const [email, setEmail] = useState(emp?.email ?? '');
    const [especialidades, setEspecialidades] = useState(emp?.especialidades ?? '');
    const [observacoes, setObservacoes] = useState(emp?.observacoes ?? '');
    const [ativa, setAtiva] = useState(emp?.ativa ?? true);
    const [logo, setLogo] = useState<File | null>(null);
    const [enviando, setEnviando] = useState(false);

    const submit = () => {
        if (!nome.trim()) {
            toast.error('Nome obrigatório.');
            return;
        }
        setEnviando(true);
        const base = { nome, nif, telefone, email, especialidades, observacoes, ativa };

        if (modal.tipo === 'novo') {
            router.post('/configuracoes/empresas-prestadoras', logo ? { ...base, logo } : base, {
                preserveScroll: true,
                forceFormData: !!logo,
                onSuccess: () => { toast.success('Empresa criada.'); onClose(); },
                onFinish: () => setEnviando(false),
            });
        } else if (logo) {
            // Com ficheiro: POST + method spoofing (Laravel não lê multipart em PATCH).
            router.post(`/configuracoes/empresas-prestadoras/${emp!.id}`, { ...base, logo, _method: 'patch' }, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => { toast.success('Empresa actualizada.'); onClose(); },
                onFinish: () => setEnviando(false),
            });
        } else {
            router.patch(`/configuracoes/empresas-prestadoras/${emp!.id}`, base, {
                preserveScroll: true,
                onSuccess: () => { toast.success('Empresa actualizada.'); onClose(); },
                onFinish: () => setEnviando(false),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md py-8 px-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-[#16163A] border border-white/10 rounded-2xl w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">{modal.tipo === 'novo' ? 'Nova empresa prestadora' : 'Editar empresa'}</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Nome *</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" placeholder="Ex: Canalizações Lda" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">NIF</label>
                            <input type="text" value={nif} onChange={(e) => setNif(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Telefone</label>
                            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" placeholder="+244 ..." />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Especialidades</label>
                        <input type="text" value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white" placeholder="Ex: Canalização, Electricidade" />
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Observações</label>
                        <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white resize-none" />
                    </div>
                    <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-1.5">Logo da empresa (opcional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                            className="w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
                        />
                        {logo && <p className="mt-1 text-xs text-white/40">Selecionado: {logo.name}</p>}
                    </div>
                    {modal.tipo === 'editar' && (
                        <label className="flex items-center gap-2 text-sm text-white/80">
                            <input type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} />
                            Activa
                        </label>
                    )}
                </div>
                <div className="p-5 border-t border-white/5 flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancelar</button>
                    <button onClick={submit} disabled={enviando} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 text-white text-sm font-semibold disabled:opacity-50">
                        {enviando ? 'A guardar...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
