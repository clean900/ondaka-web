import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Presentation, ExternalLink, Download } from 'lucide-react';
import { PageHeader, PortalNav } from '@/Components/Afiliados/ui';
import type { Afiliado, ConfigAfiliados } from '@/types/afiliados';

/**
 * A apresentação do programa, DENTRO do painel — para o afiliado a mostrar a
 * quem está a tentar trazer, sem sair do sítio nem andar à procura de um
 * ficheiro no email.
 *
 * Porquê uma moldura e não a apresentação reescrita aqui: ela é um documento
 * autónomo, com estilo próprio, navegação própria e os quatro tutoriais em
 * vídeo lá dentro. Trazê-la para React punha dois estilos a brigar e obrigava
 * a repetir o trabalho de cada vez que a apresentação mudasse. Assim há um só
 * original — o que o construir.py produz.
 */
interface Props {
    afiliado: Afiliado;
    config: ConfigAfiliados;
    url: string;
}

export default function Apresentacao({ afiliado, url }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Apresentação do programa" />
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <PageHeader
                    icon={Presentation}
                    titulo="Apresentação do programa"
                    subtitulo={
                        <span>
                            Mostre-a a quem quiser trazer: explica os escalões, o que dá comissão e como se
                            recebe — e traz os tutoriais em vídeo lá dentro. O seu código é{' '}
                            <strong className="text-white">{afiliado.codigo}</strong>.
                        </span>
                    }
                    accoes={
                        <>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
                                <ExternalLink className="h-3.5 w-3.5" /> Abrir em separador novo
                            </a>
                            <a href={url} download="programa-de-afiliados-ondaka.html" className="btn-ghost text-xs">
                                <Download className="h-3.5 w-3.5" /> Descarregar
                            </a>
                        </>
                    }
                />
                <PortalNav activo="/afiliado/apresentacao" />

                {/* LARGURA TOTAL e altura à medida da janela: uma apresentação
                    comercial numa coluna estreita não se mostra a ninguém, e
                    duas barras de deslocamento a competir dão cabo da leitura. */}
                <iframe
                    src={url}
                    title="Apresentação do Programa de Afiliados da ONDAKA"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="block w-full rounded-xl border border-white/10 bg-[#061226]"
                    style={{ height: 'calc(100vh - 300px)', minHeight: 560 }}
                />
            </div>
        </AuthenticatedLayout>
    );
}
