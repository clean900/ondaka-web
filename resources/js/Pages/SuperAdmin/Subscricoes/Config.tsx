import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import {
    Settings,
    DollarSign,
    Layers,
    Calendar,
    Clock,
    Receipt,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    AlertCircle,
} from 'lucide-react';

interface ConfigItem {
    chave: string;
    valor: string;
    tipo: string;
    descricao: string | null;
}

interface Escalao {
    id: number;
    slug: string;
    nome: string;
    descricao: string | null;
    min_fraccoes: number;
    max_fraccoes: number | null;
    preco_por_fraccao_mensal: number;
    desconto_pct: number;
    cor_badge: string | null;
    ordem: number;
    activo: boolean;
}

interface Props {
    config: Record<string, ConfigItem>;
    escaloes: Escalao[];
}

type TabKey = 'preco_base' | 'escaloes' | 'periodos' | 'trial_imposto';

export default function Config({ config, escaloes: initialEscaloes }: Props) {
    const [tab, setTab] = useState<TabKey>('preco_base');
    const [escaloes, setEscaloes] = useState<Escalao[]>(initialEscaloes);
    const [editingEscalao, setEditingEscalao] = useState<Escalao | null>(null);
    const [showEscalaoModal, setShowEscalaoModal] = useState(false);
    const [savingMessage, setSavingMessage] = useState<string | null>(null);

    const getCsrf = () =>
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    const updateConfig = async (chave: string, valor: string) => {
        try {
            const r = await fetch(`/super-admin/subscricoes-config/config/${chave}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ valor }),
            });
            if (r.ok) {
                setSavingMessage('Guardado ✓');
                setTimeout(() => setSavingMessage(null), 2000);
            } else {
                setSavingMessage('Erro ao guardar');
                setTimeout(() => setSavingMessage(null), 3000);
            }
        } catch {
            setSavingMessage('Erro de ligação');
            setTimeout(() => setSavingMessage(null), 3000);
        }
    };

    const eliminarEscalao = async (escalao: Escalao) => {
        if (!confirm(`Eliminar escalão "${escalao.nome}"?`)) return;
        try {
            const r = await fetch(`/super-admin/subscricoes-config/escaloes/${escalao.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                },
                credentials: 'same-origin',
            });
            if (r.ok) {
                setEscaloes(escaloes.filter((e) => e.id !== escalao.id));
            }
        } catch {
            alert('Erro ao eliminar.');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-zinc-100">
                    <Settings className="mr-2 inline h-5 w-5" />
                    Configuração de Subscrições
                </h2>
            }
        >
            <Head title="Subscrições - Configuração" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <div className="mb-6 flex gap-2 border-b border-zinc-800">
                        <TabButton active={tab === 'preco_base'} onClick={() => setTab('preco_base')} icon={<DollarSign className="h-4 w-4" />}>
                            Preço Base
                        </TabButton>
                        <TabButton active={tab === 'escaloes'} onClick={() => setTab('escaloes')} icon={<Layers className="h-4 w-4" />}>
                            Descontos por Quantidade
                        </TabButton>
                        <TabButton active={tab === 'periodos'} onClick={() => setTab('periodos')} icon={<Calendar className="h-4 w-4" />}>
                            Descontos por Período
                        </TabButton>
                        <TabButton active={tab === 'trial_imposto'} onClick={() => setTab('trial_imposto')} icon={<Clock className="h-4 w-4" />}>
                            Trial e Imposto
                        </TabButton>
                    </div>

                    {/* Status saving */}
                    {savingMessage && (
                        <div className="mb-4 rounded bg-cyan-500/10 px-3 py-2 text-sm text-cyan-400">
                            {savingMessage}
                        </div>
                    )}

                    {/* Tab content */}
                    {tab === 'preco_base' && <TabPrecoBase config={config} onUpdate={updateConfig} />}
                    {tab === 'escaloes' && (
                        <TabEscaloes
                            escaloes={escaloes}
                            precoBase={parseFloat(config.preco_base_imovel_mes?.valor || '0')}
                            onEdit={(esc) => {
                                setEditingEscalao(esc);
                                setShowEscalaoModal(true);
                            }}
                            onNew={() => {
                                setEditingEscalao(null);
                                setShowEscalaoModal(true);
                            }}
                            onDelete={eliminarEscalao}
                        />
                    )}
                    {tab === 'periodos' && <TabPeriodos config={config} onUpdate={updateConfig} />}
                    {tab === 'trial_imposto' && <TabTrialImposto config={config} onUpdate={updateConfig} />}
                </div>
            </div>

            {showEscalaoModal && (
                <EscalaoModal
                    escalao={editingEscalao}
                    onClose={() => {
                        setShowEscalaoModal(false);
                        setEditingEscalao(null);
                    }}
                    onSaved={(novo) => {
                        if (editingEscalao) {
                            setEscaloes(escaloes.map((e) => (e.id === novo.id ? novo : e)));
                        } else {
                            setEscaloes([...escaloes, novo].sort((a, b) => a.ordem - b.ordem));
                        }
                        setShowEscalaoModal(false);
                        setEditingEscalao(null);
                    }}
                />
            )}
        </AuthenticatedLayout>
    );
}

// ============== TAB BUTTON ==============
function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                active
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
        >
            {icon}
            {children}
        </button>
    );
}

// ============== TAB: PREÇO BASE ==============
function TabPrecoBase({ config, onUpdate }: { config: Record<string, ConfigItem>; onUpdate: (k: string, v: string) => void }) {
    const [valor, setValor] = useState(config.preco_base_imovel_mes?.valor || '0');

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-zinc-100">
                <DollarSign className="h-5 w-5 text-cyan-400" />
                Preço Base
            </h3>
            <p className="mb-4 text-sm text-zinc-400">
                Este é o ponto de partida. Os descontos são aplicados sobre este valor.
            </p>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Preço por imóvel / mês (Kz)</label>
            <div className="flex gap-2">
                <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-48 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                    step="0.01"
                />
                <button
                    onClick={() => onUpdate('preco_base_imovel_mes', valor)}
                    className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500"
                >
                    <Save className="h-4 w-4" />
                    Guardar
                </button>
            </div>
        </div>
    );
}

// ============== TAB: ESCALÕES ==============
function TabEscaloes({ escaloes, precoBase, onEdit, onNew, onDelete }: { escaloes: Escalao[]; precoBase: number; onEdit: (e: Escalao) => void; onNew: () => void; onDelete: (e: Escalao) => void }) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-medium text-zinc-100">
                        <Layers className="h-5 w-5 text-purple-400" />
                        Descontos por Quantidade de Imóveis
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                        Cada escalão aplica um desconto % sobre o preço base ({precoBase} Kz/imóvel).
                    </p>
                </div>
                <button onClick={onNew} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500">
                    <Plus className="h-4 w-4" />
                    Novo escalão
                </button>
            </div>

            <table className="w-full">
                <thead className="border-b border-zinc-800">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400">Nome</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400">Imóveis</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400">Desconto</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400">Preço final</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-zinc-400">Estado</th>
                        <th className="px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {escaloes.map((e) => (
                        <tr key={e.id} className="hover:bg-zinc-850">
                            <td className="px-3 py-3 text-sm text-zinc-100">
                                <div className="font-medium">{e.nome}</div>
                                <div className="text-xs text-zinc-500">{e.slug}</div>
                            </td>
                            <td className="px-3 py-3 text-sm text-zinc-300">
                                {e.min_fraccoes} - {e.max_fraccoes ?? '∞'}
                            </td>
                            <td className="px-3 py-3 text-sm text-cyan-400">{e.desconto_pct}%</td>
                            <td className="px-3 py-3 text-sm text-zinc-300">
                                {(precoBase * (1 - e.desconto_pct / 100)).toFixed(2)} Kz
                            </td>
                            <td className="px-3 py-3 text-sm">
                                {e.activo ? (
                                    <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">Activo</span>
                                ) : (
                                    <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">Inactivo</span>
                                )}
                            </td>
                            <td className="px-3 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => onEdit(e)} className="rounded p-1.5 text-cyan-400 hover:bg-cyan-500/10">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => onDelete(e)} className="rounded p-1.5 text-red-400 hover:bg-red-500/10">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ============== TAB: PERÍODOS ==============
function TabPeriodos({ config, onUpdate }: { config: Record<string, ConfigItem>; onUpdate: (k: string, v: string) => void }) {
    const [mensal, setMensal] = useState(config.desconto_periodo_mensal_pct?.valor || '0');
    const [semestral, setSemestral] = useState(config.desconto_periodo_semestral_pct?.valor || '0');
    const [anual, setAnual] = useState(config.desconto_periodo_anual_pct?.valor || '0');

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-medium text-zinc-100">
                <Calendar className="h-5 w-5 text-blue-400" />
                Descontos por Período
            </h3>
            <p className="mb-6 text-sm text-zinc-400">% de desconto aplicado ao subtotal conforme periodicidade escolhida.</p>

            <div className="space-y-3">
                <PercentInput label="Mensal (1 mês)" value={mensal} onChange={setMensal} onSave={() => onUpdate('desconto_periodo_mensal_pct', mensal)} />
                <PercentInput label="Semestral (6 meses)" value={semestral} onChange={setSemestral} onSave={() => onUpdate('desconto_periodo_semestral_pct', semestral)} />
                <PercentInput label="Anual (12 meses)" value={anual} onChange={setAnual} onSave={() => onUpdate('desconto_periodo_anual_pct', anual)} />
            </div>
        </div>
    );
}

// ============== TAB: TRIAL & IMPOSTO ==============
function TabTrialImposto({ config, onUpdate }: { config: Record<string, ConfigItem>; onUpdate: (k: string, v: string) => void }) {
    const [trialDias, setTrialDias] = useState(config.trial_duracao_dias?.valor || '14');
    const [impostoTipo, setImpostoTipo] = useState(config.imposto_tipo?.valor || 'IVA');
    const [impostoTaxa, setImpostoTaxa] = useState(config.imposto_taxa_pct?.valor || '14');
    const [impostoAplicavel, setImpostoAplicavel] = useState(config.imposto_aplicavel?.valor === '1');

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-zinc-100">
                    <Clock className="h-5 w-5 text-orange-400" />
                    Período de Trial
                </h3>
                <label className="mb-2 block text-sm text-zinc-200">Duração do trial (dias)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={trialDias}
                        onChange={(e) => setTrialDias(e.target.value)}
                        className="w-32 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                        min="1"
                    />
                    <button onClick={() => onUpdate('trial_duracao_dias', trialDias)} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500">
                        <Save className="h-4 w-4" />
                        Guardar
                    </button>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Após este período, sem pagamento o cliente entra em modo limitado (extracto + pagar).
                </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-zinc-100">
                    <Receipt className="h-5 w-5 text-green-400" />
                    Imposto sobre subscrições
                </h3>

                <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-zinc-200">
                    <input
                        type="checkbox"
                        checked={impostoAplicavel}
                        onChange={(e) => {
                            setImpostoAplicavel(e.target.checked);
                            onUpdate('imposto_aplicavel', e.target.checked ? '1' : '0');
                        }}
                        className="rounded border-zinc-600 bg-zinc-900 text-cyan-500"
                    />
                    Aplicar imposto às facturas
                </label>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block text-sm text-zinc-200">Tipo de imposto</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={impostoTipo}
                                onChange={(e) => setImpostoTipo(e.target.value)}
                                placeholder="IVA, IPC, etc."
                                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                                maxLength={10}
                            />
                            <button onClick={() => onUpdate('imposto_tipo', impostoTipo)} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white hover:bg-cyan-500">
                                <Save className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm text-zinc-200">Taxa (%)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={impostoTaxa}
                                onChange={(e) => setImpostoTaxa(e.target.value)}
                                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                                step="0.01"
                                min="0"
                                max="100"
                            />
                            <button onClick={() => onUpdate('imposto_taxa_pct', impostoTaxa)} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white hover:bg-cyan-500">
                                <Save className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============== HELPER ==============
function PercentInput({ label, value, onChange, onSave }: { label: string; value: string; onChange: (v: string) => void; onSave: () => void }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <label className="flex-1 text-sm text-zinc-200">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-right text-white"
                step="0.01"
                min="0"
                max="100"
            />
            <span className="text-sm text-zinc-400">%</span>
            <button onClick={onSave} className="flex items-center gap-1 rounded bg-cyan-600 px-3 py-1 text-xs text-white hover:bg-cyan-500">
                <Save className="h-3 w-3" />
                Guardar
            </button>
        </div>
    );
}

// ============== ESCALÃO MODAL ==============
function EscalaoModal({ escalao, onClose, onSaved }: { escalao: Escalao | null; onClose: () => void; onSaved: (e: Escalao) => void }) {
    const [slug, setSlug] = useState(escalao?.slug || '');
    const [nome, setNome] = useState(escalao?.nome || '');
    const [descricao, setDescricao] = useState(escalao?.descricao || '');
    const [minFraccoes, setMinFraccoes] = useState(escalao?.min_fraccoes?.toString() || '1');
    const [maxFraccoes, setMaxFraccoes] = useState(escalao?.max_fraccoes?.toString() || '');
    const [descontoPct, setDescontoPct] = useState(escalao?.desconto_pct?.toString() || '0');
    const [corBadge, setCorBadge] = useState(escalao?.cor_badge || 'c-blue');
    const [ordem, setOrdem] = useState(escalao?.ordem?.toString() || '1');
    const [activo, setActivo] = useState(escalao?.activo ?? true);
    const [saving, setSaving] = useState(false);

    const getCsrf = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    const guardar = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = escalao ? `/super-admin/subscricoes-config/escaloes/${escalao.id}` : `/super-admin/subscricoes-config/escaloes`;
            const method = escalao ? 'PUT' : 'POST';
            const r = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    slug,
                    nome,
                    descricao: descricao || null,
                    min_fraccoes: parseInt(minFraccoes),
                    max_fraccoes: maxFraccoes ? parseInt(maxFraccoes) : null,
                    desconto_pct: parseFloat(descontoPct),
                    cor_badge: corBadge,
                    ordem: parseInt(ordem),
                    activo,
                }),
            });
            const data = await r.json();
            if (r.ok && data.success) {
                onSaved(data.escalao);
            } else {
                alert(data.message || 'Erro ao guardar.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 z-40 bg-black/60" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                    <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white">
                            {escalao ? 'Editar Escalão' : 'Novo Escalão'}
                        </h3>
                        <button onClick={onClose} className="text-zinc-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </header>

                    <form onSubmit={guardar} className="space-y-4 p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm text-zinc-200">Slug *</label>
                                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required maxLength={50} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-zinc-200">Nome *</label>
                                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={100} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-zinc-200">Descrição</label>
                            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1 block text-sm text-zinc-200">Min imóveis *</label>
                                <input type="number" value={minFraccoes} onChange={(e) => setMinFraccoes(e.target.value)} required min="1" className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-zinc-200">Max (vazio = ∞)</label>
                                <input type="number" value={maxFraccoes} onChange={(e) => setMaxFraccoes(e.target.value)} min="1" className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-zinc-200">Desconto %</label>
                                <input type="number" value={descontoPct} onChange={(e) => setDescontoPct(e.target.value)} required min="0" max="100" step="0.01" className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1 block text-sm text-zinc-200">Cor badge</label>
                                <select value={corBadge} onChange={(e) => setCorBadge(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white">
                                    <option value="c-teal">Teal</option>
                                    <option value="c-blue">Azul</option>
                                    <option value="c-purple">Púrpura</option>
                                    <option value="c-amber">Âmbar</option>
                                    <option value="c-pink">Rosa</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-zinc-200">Ordem</label>
                                <input type="number" value={ordem} onChange={(e) => setOrdem(e.target.value)} required min="0" className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white" />
                            </div>
                            <div className="flex items-end">
                                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200">
                                    <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="rounded border-zinc-600 bg-zinc-900 text-cyan-500" />
                                    Activo
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                            <button type="button" onClick={onClose} className="rounded border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500 disabled:opacity-50">
                                <Save className="h-4 w-4" />
                                {saving ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
