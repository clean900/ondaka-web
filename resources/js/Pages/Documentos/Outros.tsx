import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FolderOpen, Construction } from 'lucide-react';

interface Props {
    titulo: string;
    descricao: string;
}

export default function Outros({ titulo, descricao }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={titulo} />

            <div className="max-w-4xl mx-auto py-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-pink-500/10">
                        <FolderOpen className="w-6 h-6 text-pink-400" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white">{titulo}</h1>
                </div>
                <p className="text-zinc-400 mb-8">{descricao}</p>

                <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 mb-4">
                        <Construction className="w-8 h-8 text-purple-400" />
                    </div>
                    <h2 className="text-lg font-medium text-white mb-2">Em construção</h2>
                    <p className="text-sm text-zinc-400 max-w-md mx-auto">
                        Esta secção vai agregar outros documentos úteis: actas anteriores, manuais de equipamentos, plantas dos edifícios, e mais.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
