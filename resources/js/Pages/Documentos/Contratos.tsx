import RepositorioDocumentos from './RepositorioDocumentos';

export default function Contratos(props: { titulo: string; descricao: string; categoria: string; modelos: any[] }) {
    return <RepositorioDocumentos {...props} />;
}
