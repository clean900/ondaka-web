export interface EmpresaGestora {
    id: number;
    nome: string;
    nif: string;
    slug: string;
    logotipo_path: string | null;
    plano: 'trial' | 'basico' | 'pro' | 'enterprise';
    activa: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    telefone: string | null;
    empresa_gestora_id: number | null;
    empresa_gestora?: EmpresaGestora;
    roles: string[];
    permissions: string[];
    locale: 'pt' | 'en' | 'fr';
    estado: 'activo' | 'suspenso' | 'pendente';
}

export interface Flash {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> {
    auth: {
        user: User | null;
    };
    flash: Flash;
    errors: Record<string, string>;
    ziggy: {
        location: string;
        url: string;
    };
    [key: string]: unknown;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
}

export interface Condominio {
    id: number;
    empresa_gestora_id: number;
    nome: string;
    codigo: string;
    tipo: 'vertical' | 'horizontal' | 'misto' | 'loteamento';
    numero_blocos_previsto: number | null;
    tem_area_comercial: boolean;
    nif: string | null;
    morada: string;
    provincia: string;
    municipio: string;
    distrito_urbano: string | null;
    bairro: string | null;
    latitude: number | null;
    longitude: number | null;
    data_constituicao: string | null;
    numero_matricula: string | null;
    conservatoria: string | null;
    iban: string | null;
    banco: string | null;
    moeda: string;
    ucf_valor_actual: number | null;
    percentagem_fundo_reserva: number;
    administrador_actual_id: number | null;
    administrador?: Pick<User, 'id' | 'name' | 'email' | 'telefone'>;
    estado: 'activo' | 'inactivo' | 'arquivado';
    edificios_count?: number;
    fraccoes_count?: number;
    // Labels adaptativos (accessors do model)
    tipo_label?: string;
    label_blocos?: string;
    label_bloco?: string;
    label_fraccoes?: string;
    label_fraccao?: string;
    created_at: string;
    updated_at: string;
}

export type TipoCondominio = 'vertical' | 'horizontal' | 'misto' | 'loteamento';
export type TipoBloco = 'torre' | 'conjunto' | 'comercial' | 'empresarial' | 'loteamento';
export type CategoriaFraccao = 'residencial_vertical' | 'residencial_horizontal' | 'comercial' | 'empresarial' | 'auxiliar' | 'loteamento';
export type TipoHabitacao = 'isolada' | 'geminada' | 'em_banda';
export type OrientacaoFraccao = 'norte' | 'sul' | 'este' | 'oeste' | 'nordeste' | 'noroeste' | 'sudeste' | 'sudoeste';

export interface Edificio {
    id: number;
    condominio_id: number;
    empresa_gestora_id: number;
    nome: string;
    codigo: string;
    tipo_bloco: TipoBloco;
    numero_pisos: number | null;
    pisos_subsolo: number | null;
    numero_fraccoes: number;
    tem_elevador: boolean | null;
    numero_elevadores: number;
    descricao: string | null;
    fraccoes_count?: number;
    condominio?: Pick<Condominio, 'id' | 'nome' | 'codigo' | 'tipo'>;
    created_at: string;
    updated_at: string;
}

export interface TipoFraccao {
    id: number;
    nome: string;
    codigo: string;
    descricao: string | null;
    paga_quota: boolean;
    categoria: CategoriaFraccao;
    tem_pisos_multiplos: boolean;
    numero_pisos_tipico: number;
    eh_residencial: boolean;
}

export interface Fraccao {
    id: number;
    condominio_id: number;
    edificio_id: number;
    tipo_fraccao_id: number;
    empresa_gestora_id: number;
    identificador: string;
    piso: number | null;
    letra: string | null;
    numero_pisos: number;
    tipo_habitacao: TipoHabitacao | null;
    area_privativa_m2: number;
    area_terreno_m2: number | null;
    permilagem: number;
    orientacao: OrientacaoFraccao | null;
    quota_mensal_base: number;
    quota_mensal_fundo_reserva: number;
    numero_quartos: number | null;
    numero_casas_banho: number | null;
    tem_lugar_garagem: boolean;
    numero_lugares_garagem: number;
    tem_arrecadacao: boolean;
    tem_piscina_privativa: boolean;
    tem_jardim_privativo: boolean;
    tem_anexo: boolean;
    estado: 'ocupada' | 'vaga' | 'obras' | 'arrendada';
    observacoes: string | null;
    tipo?: TipoFraccao;
    edificio?: Pick<Edificio, 'id' | 'nome' | 'codigo' | 'tipo_bloco'>;
    condominio?: Pick<Condominio, 'id' | 'nome' | 'codigo' | 'tipo'>;
    created_at: string;
    updated_at: string;
}

export type TipoCondomino = 'singular' | 'empresa';
export type EstadoCondomino = 'activo' | 'inactivo' | 'arquivado';
export type GeneroCondomino = 'masculino' | 'feminino' | 'outro';
export type EstadoCivil = 'solteiro' | 'casado' | 'uniao_facto' | 'divorciado' | 'viuvo';

export interface Condomino {
    id: number;
    empresa_gestora_id: number;
    tipo: TipoCondomino;
    nome_completo: string;
    nome_comercial: string | null;

    // Singular
    numero_bi: string | null;
    data_nascimento: string | null;
    genero: GeneroCondomino | null;
    nacionalidade: string | null;
    estado_civil: EstadoCivil | null;
    profissao: string | null;

    // Empresa
    nif: string | null;
    data_constituicao_empresa: string | null;
    numero_registo_comercial: string | null;

    // Contactos
    telefone_principal: string | null;
    telefone_alternativo: string | null;
    email: string | null;

    // Morada
    morada: string | null;
    provincia: string | null;
    municipio: string | null;
    bairro: string | null;

    // Representante (empresa)
    representante_nome: string | null;
    representante_bi: string | null;
    representante_cargo: string | null;
    representante_telefone: string | null;
    representante_email: string | null;

    observacoes: string | null;
    foto_path: string | null;
    bi_frente_path: string | null;
    bi_verso_path: string | null;

    estado: EstadoCondomino;
    user_id: number | null;

    // Contadores (vêm do backend via withCount)
    contratos_activos_count?: number;
    propriedades_count?: number;
    arrendamentos_count?: number;

    // Relações (opcionalmente carregadas)
    contratos?: ContratoOcupacao[];

    created_at: string;
    updated_at: string;
}

export type TipoContrato = 'proprietario' | 'inquilino' | 'usufructo' | 'cedencia';
export type EstadoContrato = 'activo' | 'terminado' | 'suspenso';

export interface ContratoOcupacao {
    id: number;
    empresa_gestora_id: number;
    condomino_id: number;
    fraccao_id: number;

    tipo: TipoContrato;
    percentagem_propriedade: number;

    data_inicio: string;
    data_fim: string | null;

    numero_contrato: string | null;
    data_contrato: string | null;
    contrato_path: string | null;

    valor_renda_mensal: number | null;
    proprietario_id: number | null;

    responsavel_facturacao: boolean;
    recebe_comunicacoes: boolean;

    observacoes: string | null;
    estado: EstadoContrato;
    motivo_fim: string | null;

    // Relações
    condomino?: Pick<Condomino, 'id' | 'nome_completo' | 'tipo'>;
    fraccao?: Fraccao;
    proprietario?: Pick<Condomino, 'id' | 'nome_completo' | 'tipo'>;

    created_at: string;
    updated_at: string;
}
