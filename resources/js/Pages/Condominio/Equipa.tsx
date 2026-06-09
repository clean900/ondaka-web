import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Users, Phone, Briefcase, Shield, UserCog, Building2, Wrench } from 'lucide-react';

interface Membro {
    id: number;
    tipo: 'user' | 'empresa';
    nome: string;
    cargo: string;
    role_slug: string;
    telefone: string | null;
    inicial: string;
}

interface PageProps {
    equipa: Membro[];
}

interface CategoriaConfig {
    titulo: string;
    descricao: string;
    icon: typeof Users;
    iconColor: string;
    gradient: string;
    roles: string[];
}

// Definição das categorias por ordem de apresentação
const CATEGORIAS: CategoriaConfig[] = [
    {
        titulo: 'Administração',
        descricao: 'Quem lidera e administra',
        icon: UserCog,
        iconColor: 'text-cyan-400',
        gradient: 'from-cyan-400 to-purple-500',
        roles: ['admin-empresa', 'administrador-condominio'],
    },
    {
        titulo: 'Gestão',
        descricao: 'Equipa de gestão diária',
        icon: Briefcase,
        iconColor: 'text-purple-400',
        gradient: 'from-purple-500 to-pink-500',
        roles: ['gestor'],
    },
    {
        titulo: 'Segurança',
        descricao: 'Vigilância e portaria',
        icon: Shield,
        iconColor: 'text-emerald-400',
        gradient: 'from-emerald-400 to-cyan-500',
        roles: ['guarda'],
    },
    {
        titulo: 'Funcionários',
        descricao: 'Limpeza, manutenção e operações',
        icon: Wrench,
        iconColor: 'text-amber-400',
        gradient: 'from-amber-400 to-orange-500',
        roles: ['funcionario'],
    },
    {
        titulo: 'Empresas Prestadoras',
        descricao: 'Serviços externos contratados',
        icon: Building2,
        iconColor: 'text-orange-400',
        gradient: 'from-orange-500 to-red-500',
        roles: ['empresa-prestadora'],
    },
];

export default function Equipa({ equipa }: PageProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Equipa — ONDAKA" />
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">A nossa equipa</h1>
                        <p className="text-sm text-zinc-500">Conheça quem cuida do seu condomínio</p>
                    </div>
                </div>

                <p className="text-xs text-zinc-600 mb-8">
                    {equipa.length} {equipa.length === 1 ? 'membro' : 'membros'} disponíveis
                </p>

                {equipa.length === 0 ? (
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-12 text-center">
                        <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500">Ainda não há membros da equipa registados.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {CATEGORIAS.map((cat) => {
                            const membros = equipa.filter((m) => cat.roles.includes(m.role_slug));
                            if (membros.length === 0) return null;
                            const CatIcon = cat.icon;
                            return (
                                <section key={cat.titulo}>
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800/60">
                                        <CatIcon className={`h-5 w-5 ${cat.iconColor}`} />
                                        <div className="flex-1">
                                            <h2 className="text-lg font-semibold text-zinc-100">{cat.titulo}</h2>
                                            <p className="text-xs text-zinc-500">{cat.descricao}</p>
                                        </div>
                                        <span className="text-xs text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-md border border-zinc-800">
                                            {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {membros.map((m) => (
                                            <div key={`${m.tipo}-${m.id}`} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5 hover:border-zinc-700 transition">
                                                <div className="flex items-start gap-3">
                                                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                        {m.tipo === 'empresa' ? (
                                                            <Building2 className="h-7 w-7 text-white" />
                                                        ) : (
                                                            <span className="text-2xl font-bold text-white">{m.inicial}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-semibold text-zinc-100 truncate">{m.nome}</p>
                                                        <p className="text-xs text-zinc-400 mt-0.5 truncate">{m.cargo}</p>
                                                    </div>
                                                </div>

                                                {m.telefone && (
                                                    
                                                    <a
                                                        href={`tel:${m.telefone}`}
                                                        className="mt-4 flex items-center gap-2 text-sm text-zinc-300 hover:text-cyan-300 transition"
                                                    >
                                                        <Phone className="h-4 w-4" />
                                                        {m.telefone}
                                                    </a>
                                                )}
                                                {!m.telefone && (
                                                    <p className="mt-4 text-xs text-zinc-600">Sem contacto disponível</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
