import RepositorioDocumentos from './RepositorioDocumentos';

export default function Outros(props: { titulo: string; descricao: string; categoria: string; modelos: any[] }) {
    return <RepositorioDocumentos {...props} />;
}
