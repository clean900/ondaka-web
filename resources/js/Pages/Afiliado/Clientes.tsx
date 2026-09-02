import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Building2, Users, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';
import { fmtKz, fmtNum, fmtData, StatCard, PageHeader, Seccao, Vazio, Th, Td, PortalNav, CopiarBotao, SubscricaoBadge } from '@/Components/Afiliados/ui';
import type { Afiliado, ResumoAfiliado, ConfigAfiliados, ClienteIndicado } from '@/types/afiliados';

interface Props {
    afiliado: Afiliado;
    resumo: ResumoAfiliado;
    clientes: ClienteIndicado[];
    config: ConfigAfiliados;
}

export default function Clientes({ afiliado, resumo, clientes }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Clientes indicados" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader icon={Building2} titulo="Clientes indicados" subtitulo="Empresas gestoras e administradores que se registaram com o seu link ou que a ONDAKA lhe atribuiu" />
                <PortalNav activo="/afiliado/clientes" />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <StatCard label="Registos" valor={fmtNum(resumo.registos)} icon={Building2} tom="ciano" sub={`${resumo.registos_mes} este mês`} />
                    <StatCard label="Subscrição activa" valor={fmtNum(resumo.clientes_activos)} icon={CheckCircle2} tom="verde" />
                    <StatCard label="Já pagaram" valor={fmtNum(resumo.clientes_pagantes)} icon={Users} tom="roxo" sub="contam para o nível" />
                    <StatCard label="Base gerada (s/ imposto)" valor={fmtKz(resumo.base_gerada_kz, 0)} icon={TrendingUp} tom="neutro" />
                    <StatCard label="Comissão gerada" valor={fmtKz(resumo.total_gerado_kz, 0)} icon={Wallet} tom="verde" />
                </div>

                <Seccao titulo={`${clientes.length} cliente(s)`}>
                    {clientes.length === 0 ? (
                        <Vazio
                            titulo="Ainda não tem clientes indicados"
                            texto="Partilhe o seu link. Quando uma empresa gestora ou administrador independente se registar através dele, aparece aqui com o estado da subscrição e as comissões geradas."
                            accao={<CopiarBotao texto={afiliado.link} label="Copiar o meu link" />}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr>
                                        <Th>Cliente</Th><Th>Localização</Th><Th>Registado</Th><Th>Origem</Th><Th>Subscrição</Th>
                                        <Th right>Imóveis</Th><Th right>Pagamentos</Th><Th right>Base gerada</Th><Th right>Comissão</Th><Th>Último pagamento</Th><Th>Indicação</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {clientes.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/[0.02]">
                                            <Td><div className="font-medium text-white">{c.nome}</div><div className="text-xs text-white/40">{c.tipo_cliente === 'admin_independente' ? 'Administrador independente' : 'Empresa gestora'}</div></Td>
                                            <Td>{[c.municipio, c.provincia].filter(Boolean).join(', ') || '—'}</Td>
                                            <Td>{fmtData(c.atribuido_em ?? c.registado_em)}</Td>
                                            <Td>{c.origem === 'manual' ? <span className="badge bg-white/5 text-white/60 border border-white/10">Atribuído pela ONDAKA</span> : <span className="badge-info">Link</span>}</Td>
                                            <Td><SubscricaoBadge estado={c.subscricao_estado} /></Td>
                                            <Td right mono>{c.num_imoveis}</Td>
                                            <Td right mono>{c.n_pagamentos}</Td>
                                            <Td right mono>{fmtKz(c.base_kz)}</Td>
                                            <Td right mono><span className="font-semibold text-emerald-300">{fmtKz(c.comissao_kz)}</span></Td>
                                            <Td>{fmtData(c.ultimo_pagamento_em)}</Td>
                                            <Td>{c.atribuicao_activa ? <span className="badge-success">Activa{c.expira_em ? ` até ${fmtData(c.expira_em)}` : ' · vitalícia'}</span> : <span className="badge-danger">Expirou {fmtData(c.expira_em)}</span>}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Seccao>
            </div>
        </AuthenticatedLayout>
    );
}
