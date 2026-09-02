export type EstadoAfiliado = 'pendente' | 'activo' | 'suspenso' | 'recusado';
export type EstadoComissao = 'pendente' | 'aprovada' | 'paga' | 'anulada';
export type Nivel = 'bronze' | 'prata' | 'ouro';

export interface NivelConfig {
    nivel: Nivel;
    label: string;
    taxa_pct: string;
    min_clientes: number;
    max_clientes: number | null;
}

export interface ConfigAfiliados {
    programa_activo: boolean;
    niveis: NivelConfig[];
    carencia_dias: number;
    pagamento_minimo_kz: string;
    cookie_dias: number;
    duracao_meses: number;
    retencao_pct: string;
    aprovacao_automatica: boolean;
    taxa_min_pct: string;
    taxa_max_pct: string;
}

export interface Afiliado {
    id: number;
    codigo: string;
    link: string;
    tipo: 'particular' | 'empresa';
    nome: string;
    email: string;
    telefone: string | null;
    nif: string | null;
    estado: EstadoAfiliado;
    estado_label: string;
    nivel: Nivel;
    nivel_label: string;
    taxa_actual_pct: string;
    taxa_manual_pct: string | null;
    iban: string | null;
    banco: string | null;
    titular_conta: string | null;
    como_divulga: string | null;
    notas_admin: string | null;
    motivo_recusa: string | null;
    motivo_suspensao: string | null;
    aprovado_em: string | null;
    aprovado_por: string | null;
    suspenso_em: string | null;
    total_cliques: number;
    user: { id: number; name: string; email: string } | null;
    empresa_gestora: { id: number; nome: string } | null;
    dados_pagamento_completos: boolean;
    created_at: string | null;
}

export interface ProximoNivel {
    nivel: Nivel;
    label: string;
    taxa_pct: string;
    min_clientes: number;
    faltam: number;
}

export interface SerieMes {
    mes: string;
    label: string;
    total_kz: string;
    n: number;
}

export interface ResumoAfiliado {
    cliques: number;
    registos: number;
    registos_mes: number;
    clientes_activos: number;
    clientes_pagantes: number;
    nivel: Nivel;
    nivel_label: string;
    taxa_pct: string;
    taxa_manual: boolean;
    proximo_nivel: ProximoNivel | null;
    pendente_kz: string; pendente_n: number;
    aprovada_kz: string; aprovada_n: number;
    paga_kz: string; paga_n: number;
    anulada_kz: string; anulada_n: number;
    total_gerado_kz: string;
    base_gerada_kz: string;
    mes_actual_kz: string;
    total_pago_liquido_kz: string;
    serie_12m: SerieMes[];
    ultimo_pagamento: { numero: string; valor_liquido_kz: string; pago_em: string | null } | null;
    pagamento_minimo_kz: string;
    carencia_dias: number;
    atinge_minimo: boolean;
}

export interface ClienteIndicado {
    id: number;
    nome: string;
    tipo_cliente: 'empresa_gestora' | 'admin_independente';
    provincia: string | null;
    municipio: string | null;
    registado_em: string | null;
    atribuido_em: string | null;
    origem: 'link' | 'manual' | null;
    expira_em: string | null;
    atribuicao_activa: boolean;
    subscricao_estado: string;
    num_imoveis: number;
    n_pagamentos: number;
    base_kz: string;
    comissao_kz: string;
    ultimo_pagamento_em: string | null;
}

export interface Comissao {
    id: number;
    afiliado: { id: number; nome: string; codigo: string } | null;
    empresa: { id: number; nome: string; tipo_cliente: string } | null;
    origem_type: 'plataforma_factura' | 'ordem_compra';
    origem_label: string;
    origem_numero: string | null;
    descricao: string;
    valor_pago_total_kz: string;
    valor_imposto_kz: string;
    valor_base_kz: string;
    taxa_pct: string;
    valor_comissao_kz: string;
    nivel: Nivel | null;
    estado: EstadoComissao;
    estado_label: string;
    pago_pelo_cliente_em: string | null;
    disponivel_em: string | null;
    aprovada_em: string | null;
    paga_em: string | null;
    anulada_em: string | null;
    motivo_anulacao: string | null;
    pagamento: { id: number; numero: string; pago_em: string | null } | null;
    created_at: string | null;
}

export interface Pagamento {
    id: number;
    numero: string;
    afiliado: { id: number; nome: string; codigo: string } | null;
    num_comissoes: number;
    valor_bruto_kz: string;
    retencao_pct: string;
    retencao_valor_kz: string;
    valor_liquido_kz: string;
    metodo: string;
    metodo_label: string;
    referencia_bancaria: string | null;
    iban_destino: string | null;
    tem_comprovativo: boolean;
    comprovativo_nome: string | null;
    pago_em: string | null;
    notas: string | null;
    registado_por: string | null;
    created_at: string | null;
    comissoes?: { id: number; descricao: string; origem_numero: string | null; valor_comissao_kz: string }[];
}

export interface TotalEstado { n: number; total_kz: string; base_kz: string }
export interface TotaisComissoes {
    pendente: TotalEstado;
    aprovada: TotalEstado;
    paga: TotalEstado;
    anulada: TotalEstado;
    total_nao_anulada_kz: string;
}

export interface Paginado<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

export interface AfiliadoLista {
    id: number;
    codigo: string;
    nome: string;
    email: string;
    telefone: string | null;
    tipo: 'particular' | 'empresa';
    estado: EstadoAfiliado;
    estado_label: string;
    nivel: Nivel;
    taxa_pct: string;
    taxa_manual: boolean;
    clientes_count: number;
    cliques: number;
    pendente_kz: string;
    aprovada_kz: string;
    paga_kz: string;
    created_at: string | null;
    aprovado_em: string | null;
}

export interface ResumoGlobal {
    afiliados_total: number;
    afiliados_activos: number;
    afiliados_pendentes: number;
    afiliados_suspensos: number;
    clientes_indicados: number;
    clientes_pagantes: number;
    pendente_kz: string; pendente_n: number;
    aprovada_kz: string; aprovada_n: number;
    paga_kz: string; paga_n: number;
    anulada_kz: string; anulada_n: number;
    base_gerada_kz: string;
    mes_comissoes_kz: string;
    mes_registos: number;
    afiliados_a_pagar: number;
    afiliados_a_pagar_kz: string;
    pagamento_minimo_kz: string;
    top: { id: number; nome: string; codigo: string; nivel: Nivel; total_kz: string; clientes: number }[];
    serie_12m: SerieMes[];
}

export interface Materiais {
    link: string;
    codigo: string;
    whatsapp: string;
    whatsapp_url: string;
    email_assunto: string;
    email_corpo: string;
    email_url: string;
    sms: string;
}
