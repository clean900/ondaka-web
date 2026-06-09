<?php

declare(strict_types=1);

use App\Domains\Assembleia\Http\Controllers\AssembleiaController;
use App\Domains\Assembleia\Http\Controllers\VotacaoController;
use App\Domains\Faq\Http\Controllers\FaqController;
use App\Domains\Condominio\Http\Controllers\CondominioController;
use App\Domains\Condominio\Http\Controllers\EdificioController;
use App\Domains\Condominio\Http\Controllers\FraccaoController;
use App\Domains\Condominio\Http\Controllers\TipoFraccaoController;
use App\Domains\Condomino\Http\Controllers\CondominoController;
use App\Domains\Condomino\Http\Controllers\ContratoOcupacaoController;
use App\Domains\Feature\Http\Controllers\AdminFeaturesController;
use App\Domains\Feature\Http\Controllers\FuncionalidadesController;
use App\Domains\Integracao\Sms\Http\Controllers\AdminSmsController;
use App\Domains\Payment\Http\Controllers\AdminOrdemController;
use App\Domains\Payment\Http\Controllers\FacturaController;
use App\Domains\Payment\Http\Controllers\OrdemController;
use App\Domains\Payment\Http\Controllers\PagamentoController;
use App\Domains\Subscription\Http\Controllers\AdminSubscricoesController;
use App\Domains\Subscription\Http\Controllers\SuperAdminSubscricaoConfigController;
use App\Domains\Subscription\Http\Controllers\SuperAdminFacturasPlataformaController;
use App\Domains\Subscription\Http\Controllers\SuperAdminDashboardController;
use App\Domains\Subscription\Http\Controllers\SuperAdminClientesController;
use App\Domains\Subscription\Http\Controllers\SubscricaoController;
use App\Domains\Encomenda\Http\Controllers\EncomendaWebController;
use App\Domains\Visitor\Http\Controllers\Web\VisitantesWebController;
use App\Domains\Tickets\Http\Controllers\Web\TicketsWebController;
use App\Domains\Financas\Http\Controllers\ContaBancariaController;
use App\Domains\Financas\Http\Controllers\DespesaController;
use App\Http\Controllers\DocumentosController;
use App\Http\Controllers\Auth\DoisFactoresController;
use App\Http\Controllers\Web\PerfilController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect raiz para login ou dashboard
Route::get('/', function () {
    // Utilizadores autenticados → dashboard
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    // Visitantes → landing page pública
    return app(\App\Http\Controllers\LandingController::class)->index();
})->name('landing');

Route::get('/catalogo', [\App\Http\Controllers\CatalogoController::class, 'index'])->name('catalogo');

// Páginas legais (HTML estático em public/)
Route::get('/privacidade', function () {
    return response()->file(public_path('privacidade.html'));
})->name('privacidade');

Route::get('/termos', function () {
    return response()->file(public_path('termos.html'));
})->name('termos');

// Auto-registo público (wizard 3 passos)
Route::get('/registo', [\App\Http\Controllers\RegistoController::class, 'index'])->name('registo.index');
Route::post('/registo', [\App\Http\Controllers\RegistoController::class, 'store'])->name('registo.store');

// ===========================================================
// Autenticação
// ===========================================================
require __DIR__ . '/auth.php';

// ===========================================================
// 2FA SMS
// ===========================================================
// ===========================================================
// Convite Público (sem auth — destinatário ainda não tem conta)
// ===========================================================
Route::get('/convite/{token}', [\App\Domains\Utilizadores\Http\Controllers\Web\ConvitePublicoController::class, 'mostrar'])
    ->name('convite.mostrar');
Route::post('/convite/{token}', [\App\Domains\Utilizadores\Http\Controllers\Web\ConvitePublicoController::class, 'aceitar'])
    ->name('convite.aceitar');

Route::middleware('auth')->group(function () {
    Route::get('/2fa/desafio', [DoisFactoresController::class, 'desafio'])->name('2fa.desafio');
    Route::post('/2fa/verificar', [DoisFactoresController::class, 'verificar'])->name('2fa.verificar');
    Route::post('/2fa/reenviar', [DoisFactoresController::class, 'reenviar'])->name('2fa.reenviar');

    // Perfil do user logado (acessível mesmo antes de 2FA / com must_change_password)
    Route::get('/perfil', [PerfilController::class, 'index'])->name('perfil.index');
    Route::patch('/perfil', [PerfilController::class, 'updatePerfil'])->name('perfil.update');
    Route::patch('/perfil/password', [PerfilController::class, 'updatePassword'])->name('perfil.password.update');
});

// ===========================================================
// Área autenticada base (sem subscrição activa exigida)
// Inclui: subscrição, admin, conta pessoal
// ===========================================================
Route::middleware(['auth', 'verified', '2fa'])->group(function () {
    // Página para roles mobile-only (condomino, guarda, prestador) — SEM middleware mobile.redirect
    Route::get('/mobile-redirect', [\App\Http\Controllers\MobileRedirectController::class, 'show'])
        ->name('mobile-redirect');


    // Subscrição (cliente) - SEMPRE acessível, mesmo se suspensa
    Route::prefix('subscricao')->name('subscricao.')->group(function () {
        Route::get('/', [SubscricaoController::class, 'index'])->name('index');
        Route::get('/expirada', [SubscricaoController::class, 'expirada'])->name('expirada');
        Route::post('/calcular', [SubscricaoController::class, 'calcular'])->name('calcular');
        Route::post('/activar', [SubscricaoController::class, 'activar'])->name('activar');
        Route::post('/pagar', [SubscricaoController::class, 'pagar'])->name('pagar');
        Route::post('/alterar-imoveis', [SubscricaoController::class, 'alterarImoveis'])->name('alterar-imoveis');
        Route::get('/facturas', [SubscricaoController::class, 'facturas'])->name('facturas');
        Route::get('/facturas/{id}', [SubscricaoController::class, 'facturaShow'])->name('facturas.show')->whereNumber('id');
        Route::post('/facturas/{id}/gerar-referencia', [SubscricaoController::class, 'gerarReferenciaPagamento'])->name('facturas.gerar-referencia')->whereNumber('id');
        Route::post('/cancelar', [SubscricaoController::class, 'cancelar'])->name('cancelar');
        Route::post('/reverter-cancelamento', [SubscricaoController::class, 'reverterCancelamento'])->name('reverter-cancelamento');
        Route::post('/mudar-plano/preview', [SubscricaoController::class, 'previewMudancaPlano'])->name('mudar-plano.preview');
        Route::post('/mudar-plano', [SubscricaoController::class, 'mudarPlano'])->name('mudar-plano');
        Route::post('/cancelar-downgrade', [SubscricaoController::class, 'cancelarDowngrade'])->name('cancelar-downgrade');
    });

    // Admin subscrições (super-admin) - SEMPRE acessível
    Route::middleware('role:super-admin')->prefix('admin/subscricoes')->name('admin.subscricoes.')->group(function () {
        Route::get('/', [AdminSubscricoesController::class, 'index'])->name('index');
        Route::get('/{subscricao}', [AdminSubscricoesController::class, 'show'])->name('show');
        Route::post('/{subscricao}/estender-trial', [AdminSubscricoesController::class, 'estenderTrial'])->name('estender-trial');
        Route::post('/{subscricao}/reactivar', [AdminSubscricoesController::class, 'reactivar'])->name('reactivar');
        Route::patch('/{subscricao}/preco-customizado', [AdminSubscricoesController::class, 'definirPrecoCustomizado'])->name('preco-customizado');
    });

    // Super-admin: configuração GLOBAL de subscrições (preço base, escalões, descontos, trial, imposto)
    Route::middleware('role:super-admin')
        ->prefix('super-admin/subscricoes-config')
        ->name('super-admin.subscricoes-config.')
        ->group(function () {
            Route::get('/', [SuperAdminSubscricaoConfigController::class, 'index'])->name('index');
            Route::patch('/config/{chave}', [SuperAdminSubscricaoConfigController::class, 'actualizarConfig'])->name('actualizar-config');
            Route::post('/escaloes', [SuperAdminSubscricaoConfigController::class, 'guardarEscalao'])->name('guardar-escalao');
            Route::put('/escaloes/{id}', [SuperAdminSubscricaoConfigController::class, 'guardarEscalao'])->name('actualizar-escalao');
            Route::delete('/escaloes/{id}', [SuperAdminSubscricaoConfigController::class, 'eliminarEscalao'])->name('eliminar-escalao');
        });

    // Super-admin: facturas plataforma de TODAS as empresas
    Route::middleware('role:super-admin')
        ->prefix('super-admin/facturas-plataforma')
        ->name('super-admin.facturas-plataforma.')
        ->group(function () {
            Route::get('/', [SuperAdminFacturasPlataformaController::class, 'index'])->name('index');
            Route::post('/{id}/anular', [SuperAdminFacturasPlataformaController::class, 'anular'])->name('anular')->whereNumber('id');
        });

    // Super-admin: Dashboard com KPIs (MRR, ARR, churn, pipeline)
    Route::middleware('role:super-admin')
        ->prefix('super-admin')
        ->name('super-admin.')
        ->group(function () {
            Route::get('/', [SuperAdminDashboardController::class, 'index'])->name('dashboard');

            // Clientes B2B
            Route::get('/clientes', [SuperAdminClientesController::class, 'index'])->name('clientes.index');
            Route::get('/clientes/{id}', [SuperAdminClientesController::class, 'show'])->name('clientes.show')->whereNumber('id');
            Route::post('/clientes/subscricao/{id}/extender-trial', [SuperAdminClientesController::class, 'extenderTrial'])->name('clientes.extender-trial')->whereNumber('id');
            Route::post('/clientes/subscricao/{id}/cancelar', [SuperAdminClientesController::class, 'cancelar'])->name('clientes.cancelar')->whereNumber('id');
            Route::post('/clientes/subscricao/{id}/mudar-plano', [SuperAdminClientesController::class, 'mudarPlano'])->name('clientes.mudar-plano')->whereNumber('id');
            Route::post('/clientes/{id}/login-as', [SuperAdminClientesController::class, 'loginAs'])->name('clientes.login-as')->whereNumber('id');
        });

    // Voltar ao super-admin (fora do middleware role:super-admin para permitir regresso)
    Route::middleware('auth')->post('/super-admin-voltar', [SuperAdminClientesController::class, 'voltarSuperAdmin'])->name('super-admin.voltar');

    // Admin features (super-admin)
    Route::middleware('role:super-admin')->prefix('admin/features')->name('admin.features.')->group(function () {
        Route::get('/', [AdminFeaturesController::class, 'index'])->name('index');
        Route::get('/nova', [AdminFeaturesController::class, 'create'])->name('create');
        Route::post('/', [AdminFeaturesController::class, 'store'])->name('store');
        Route::get('/{subscription}', [AdminFeaturesController::class, 'show'])->name('show');
        Route::post('/{subscription}/suspender', [AdminFeaturesController::class, 'suspender'])->name('suspender');
        Route::post('/{subscription}/reactivar', [AdminFeaturesController::class, 'reactivar'])->name('reactivar');
        Route::post('/{subscription}/cancelar', [AdminFeaturesController::class, 'cancelar'])->name('cancelar');
        Route::post('/{subscription}/adicionar-saldo', [AdminFeaturesController::class, 'adicionarSaldo'])->name('adicionar-saldo');
    });

    // Admin ordens (super-admin)
    Route::middleware('role:super-admin')->prefix('admin/ordens')->name('admin.ordens.')->group(function () {
        Route::get('/', [AdminOrdemController::class, 'index'])->name('index');
        Route::get('/{ordem}', [AdminOrdemController::class, 'show'])->name('show');
        Route::post('/{ordem}/pagamentos/{pagamento}/confirmar', [AdminOrdemController::class, 'confirmarPagamento'])->name('pagamentos.confirmar');
        Route::post('/{ordem}/pagamentos/{pagamento}/rejeitar', [AdminOrdemController::class, 'rejeitarPagamento'])->name('pagamentos.rejeitar');
        Route::post('/{ordem}/aprovar', [AdminOrdemController::class, 'aprovarDirecto'])->name('aprovar');
        Route::post('/{ordem}/rejeitar', [AdminOrdemController::class, 'rejeitarOrdem'])->name('rejeitar');
    });

    // Admin SMS (super-admin) - logs + reenvio
    Route::middleware('role:super-admin')->prefix('admin/sms')->name('admin.sms.')->group(function () {
        Route::get('/', [AdminSmsController::class, 'index'])->name('index');
        Route::get('/{smsLog}', [AdminSmsController::class, 'show'])->name('show');
        Route::post('/{smsLog}/reenviar', [AdminSmsController::class, 'reenviar'])->name('reenviar');
    });

    // Funcionalidades (loja e minhas) - SEMPRE acessível, mesmo em grace
    Route::prefix('funcionalidades')->name('funcionalidades.')->group(function () {
        Route::get('/', [FuncionalidadesController::class, 'index'])->name('index');
        Route::get('/minhas', [FuncionalidadesController::class, 'minhas'])->name('minhas');
        Route::get('/{slug}', [FuncionalidadesController::class, 'show'])->name('show');
        Route::post('/{slug}/trial', [FuncionalidadesController::class, 'iniciarTrial'])->name('trial');
        Route::post('/{slug}/activar', [FuncionalidadesController::class, 'solicitarActivacao'])->name('activar');
    });

    // Documentos (sub-itens da nova seccao sidebar)
    Route::prefix('documentos')->name('documentos.')->group(function () {
        Route::get('/contratos', [DocumentosController::class, 'contratos'])->name('contratos');
        Route::get('/regulamentos', [DocumentosController::class, 'regulamentos'])->name('regulamentos');
        Route::get('/formulario-registo', [DocumentosController::class, 'formularioRegisto'])->name('formulario-registo');
        Route::get('/outros', [DocumentosController::class, 'outros'])->name('outros');
    });

    // Ordens de compra (cliente) - SEMPRE acessíveis, mesmo em grace
    Route::prefix('ordens')->name('ordens.')->group(function () {
        Route::get('/', [OrdemController::class, 'index'])->name('minhas');
        Route::get('/confirmar', [OrdemController::class, 'confirmar'])->name('confirmar');
        Route::post('/', [OrdemController::class, 'store'])->name('store');
        Route::get('/{ordem}', [OrdemController::class, 'show'])->name('show');
        Route::post('/{ordem}/cancelar', [OrdemController::class, 'cancelar'])->name('cancelar');
        Route::post('/{ordem}/gerar-referencia', [OrdemController::class, 'gerarReferenciaProxyPay'])->name('gerar-referencia');

        // Pagamentos
        Route::post('/{ordem}/pagamentos', [PagamentoController::class, 'submeter'])->name('pagamentos.submeter');
    });

    // Download de comprovativo (protegido)
    Route::get('/pagamentos/{pagamento}/comprovativo', [PagamentoController::class, 'comprovativo'])
        ->name('pagamentos.comprovativo');

    // Factura PDF (dono da ordem ou super-admin)
    Route::get('/facturas/{factura}', [FacturaController::class, 'download'])
        ->name('facturas.download');
    Route::get('/facturas/{factura}/download', [FacturaController::class, 'download'])
        ->defaults('modo', 'download')
        ->name('facturas.download-attachment');

    // =======================================================
    // Funcionalidades do produto - exigem subscrição activa
    // (leitura em grace, escrita bloqueada em grace)
    // =======================================================
    Route::middleware(['subscricao.activa', 'grace.bloquear', 'mobile.redirect'])->group(function () {

        // Dashboard com dados reais (Service + Controller)
        Route::get('/dashboard', [\App\Domains\Dashboard\Http\Controllers\Web\DashboardController::class, 'index'])->name('dashboard');

        // Condomínios
        Route::resource('condominios', CondominioController::class);

        // Edifícios (nested dentro de condomínio)
        Route::resource('condominios.edificios', EdificioController::class)
            ->shallow()
            ->except(['index']);

        // Fracções (nested dentro de edifício)
        Route::resource('edificios.fraccoes', FraccaoController::class)
            ->shallow()
            ->parameters(['fraccoes' => 'fraccao'])
            ->except(['index']);

        // Tipos de fracção (configuração da empresa)
        Route::resource('tipos-fraccao', TipoFraccaoController::class)
            ->except(['show', 'create', 'edit']);

        // Condóminos
        Route::resource('condominos', CondominoController::class);

        // Contratos de ocupação (nested dentro de condómino)
        Route::get('/condominos/{condomino}/contratos/create', [ContratoOcupacaoController::class, 'create'])
            ->name('condominos.contratos.create');
        Route::post('/condominos/{condomino}/contratos', [ContratoOcupacaoController::class, 'store'])
            ->name('condominos.contratos.store');
        Route::patch('/contratos/{contrato}/terminar', [ContratoOcupacaoController::class, 'terminar'])
            ->name('contratos.terminar');
        Route::delete('/contratos/{contrato}', [ContratoOcupacaoController::class, 'destroy'])
            ->name('contratos.destroy');

        // Assembleias
        Route::prefix('assembleias')->name('assembleias.')->group(function () {
            Route::get('/', [AssembleiaController::class, 'index'])->name('index');
            Route::get('/nova', [AssembleiaController::class, 'create'])->name('create');
            Route::post('/', [AssembleiaController::class, 'store'])->name('store');
            Route::get('/{assembleia}', [AssembleiaController::class, 'show'])->name('show');
            Route::get('/{assembleia}/entrar', [AssembleiaController::class, 'entrar'])->name('entrar');
            Route::post('/{assembleia}/convocatorias', [AssembleiaController::class, 'enviarConvocatorias'])->name('convocatorias');
            Route::post('/{assembleia}/regenerar-participantes', [AssembleiaController::class, 'regenerarParticipantes'])->name('regenerar-participantes');
            Route::post('/{assembleia}/iniciar', [AssembleiaController::class, 'iniciar'])->name('iniciar');
            Route::post('/{assembleia}/terminar', [AssembleiaController::class, 'terminar'])->name('terminar');
            Route::post('/{assembleia}/cancelar', [AssembleiaController::class, 'cancelar'])->name('cancelar');

            // Acta PDF
            Route::get('/{assembleia}/acta', [AssembleiaController::class, 'downloadActa'])->name('acta.download');
            Route::post('/{assembleia}/acta/regenerar', [AssembleiaController::class, 'regenerarActa'])->name('acta.regenerar');

            // Votações dentro de assembleia
            Route::post('/{assembleia}/votacoes/detectar', [VotacaoController::class, 'detectar'])->name('votacoes.detectar');
            Route::post('/{assembleia}/votacoes/manual', [VotacaoController::class, 'criarManual'])->name('votacoes.criar');
            Route::post('/votacoes/{ponto}/abrir', [VotacaoController::class, 'abrir'])->name('votacoes.abrir');
            Route::post('/votacoes/{ponto}/votar', [VotacaoController::class, 'votar'])->name('votacoes.votar');
            Route::post('/votacoes/{ponto}/fechar', [VotacaoController::class, 'fechar'])->name('votacoes.fechar');
        });

        // FAQs
        Route::prefix('faqs')->name('faqs.')->group(function () {
            Route::get('/', [FaqController::class, 'index'])->name('index');
            Route::get('/nova', [FaqController::class, 'create'])->name('create');
            Route::post('/', [FaqController::class, 'store'])->name('store');
            Route::get('/{faq}/editar', [FaqController::class, 'edit'])->name('edit');
            Route::put('/{faq}', [FaqController::class, 'update'])->name('update');
            Route::delete('/{faq}', [FaqController::class, 'destroy'])->name('destroy');
        });

        // Chatbot endpoints
        Route::post('/chatbot/perguntar', [App\Domains\Chatbot\Http\Controllers\ChatbotController::class, 'perguntar'])->name('chatbot.perguntar');
        Route::post('/chatbot/faqs/{faq}/util', [FaqController::class, 'marcarUtil'])->name('chatbot.util');

        // Admin Chatbot FAQs Condomínio (CRUD)
        Route::middleware('role:super-admin|admin-empresa|gestor')
            ->prefix('admin/chatbot/faqs')
            ->name('admin.chatbot.faqs.')
            ->group(function () {
                Route::get('/', [App\Domains\Chatbot\Http\Controllers\AdminChatbotFaqController::class, 'index'])->name('index');
                Route::post('/', [App\Domains\Chatbot\Http\Controllers\AdminChatbotFaqController::class, 'store'])->name('store');
                Route::put('/{faq}', [App\Domains\Chatbot\Http\Controllers\AdminChatbotFaqController::class, 'update'])->name('update');
                Route::delete('/{faq}', [App\Domains\Chatbot\Http\Controllers\AdminChatbotFaqController::class, 'destroy'])->name('destroy');
                Route::post('/{faq}/toggle', [App\Domains\Chatbot\Http\Controllers\AdminChatbotFaqController::class, 'toggle'])->name('toggle');
                Route::post('/reorder', [App\Domains\Chatbot\Http\Controllers\AdminChatbotFaqController::class, 'reorder'])->name('reorder');
            });

    // === Visitantes ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('visitantes')
        ->name('visitantes.')
        ->group(function () {
            Route::get('/dentro-agora', [VisitantesWebController::class, 'dentroAgora'])->name('dentro-agora');
            Route::get('/historico', [VisitantesWebController::class, 'historico'])->name('historico');
            Route::get('/pre-aprovacoes', [VisitantesWebController::class, 'preAprovacoes'])->name('pre-aprovacoes');
        });

    // === Encomendas ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('encomendas')
        ->name('encomendas.')
        ->group(function () {
            Route::get('/', [EncomendaWebController::class, 'index'])->name('index');
        });


    // === Tickets ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('tickets')
        ->name('tickets.')
        ->group(function () {
            Route::get('/', [TicketsWebController::class, 'index'])->name('index');
            Route::get('/condominos', [TicketsWebController::class, 'pesquisarCondominos'])->name('condominos');
            Route::post('/{id}/comentarios', [TicketsWebController::class, 'comentar'])->name('comentar');
            Route::patch('/{id}/estado', [TicketsWebController::class, 'mudarEstado'])->name('mudar-estado');
            Route::get('/{id}', [TicketsWebController::class, 'show'])->name('show');
        });

    // === Contas Bancárias ===
    Route::middleware('role:gestor|administrador-condominio')
        ->prefix('financas/contas-bancarias')
        ->name('financas.contas-bancarias.')
        ->group(function () {
            Route::get('/', [ContaBancariaController::class, 'index'])->name('index');
            Route::post('/trocar-condominio', [ContaBancariaController::class, 'trocarCondominio'])->name('trocar-condominio');
            Route::post('/', [ContaBancariaController::class, 'store'])->name('store');
            Route::put('/{conta}', [ContaBancariaController::class, 'update'])->name('update');
            Route::patch('/{conta}/marcar-principal', [ContaBancariaController::class, 'marcarPrincipal'])->name('marcar-principal');
            Route::delete('/{conta}', [ContaBancariaController::class, 'destroy'])->name('destroy');
            Route::post('/{conta}/movimentos', [ContaBancariaController::class, 'adicionarMovimento'])->name('movimentos.adicionar');
            Route::delete('/movimentos/{movimento}', [ContaBancariaController::class, 'apagarMovimento'])->name('movimentos.apagar');
        });

    // === Categorias de Despesas (gestão restrita) ===
    Route::middleware('role:gestor|admin-empresa')
        ->prefix('despesas/categorias')
        ->name('despesas.categorias.')
        ->group(function () {
            Route::get('/', [DespesaController::class, 'categorias'])->name('index');
            Route::post('/', [DespesaController::class, 'categoriaStore'])->name('store');
            Route::put('/{categoria}', [DespesaController::class, 'categoriaUpdate'])->name('update');
            Route::delete('/{categoria}', [DespesaController::class, 'categoriaDestroy'])->name('destroy');
        });

    // === Despesas ===
    Route::middleware('role:gestor|administrador-condominio|admin-empresa|funcionario')
        ->prefix('despesas')
        ->name('despesas.')
        ->group(function () {
            Route::get('/', [DespesaController::class, 'index'])->name('index');
            Route::post('/', [DespesaController::class, 'store'])->name('store');
            Route::put('/{despesa}', [DespesaController::class, 'update'])->name('update');
            Route::post('/{despesa}/aprovar', [DespesaController::class, 'aprovar'])->name('aprovar');
            Route::post('/{despesa}/pagar', [DespesaController::class, 'marcarPaga'])->name('pagar');
            Route::post('/{despesa}/cancelar', [DespesaController::class, 'cancelar'])->name('cancelar');
            Route::delete('/{despesa}', [DespesaController::class, 'destroy'])->name('destroy');
        });

    // === Quotas (Facturacao) ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('quotas')
        ->name('quotas.')
        ->group(function () {
            Route::get('/', [\App\Domains\Facturacao\Http\Controllers\Web\QuotasWebController::class, 'index'])->name('index');
            Route::post('/gerar', [\App\Domains\Facturacao\Http\Controllers\Web\QuotasWebController::class, 'gerar'])->name('gerar');
            Route::get('/{id}', [\App\Domains\Facturacao\Http\Controllers\Web\QuotasWebController::class, 'show'])->whereNumber('id')->name('show');
            Route::post('/{id}/cancelar', [\App\Domains\Facturacao\Http\Controllers\Web\QuotasWebController::class, 'cancelar'])->whereNumber('id')->name('cancelar');
        });

    // === Pagamentos B2C (Facturacao) ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('pagamentos')
        ->name('pagamentos.')
        ->group(function () {
            Route::get('/', [\App\Domains\Facturacao\Http\Controllers\Web\PagamentosWebController::class, 'index'])->name('index');
            Route::get('/{id}', [\App\Domains\Facturacao\Http\Controllers\Web\PagamentosWebController::class, 'show'])->whereNumber('id')->name('show');
            Route::get('/{id}/confirmacao-pdf', [\App\Domains\Facturacao\Http\Controllers\Web\PagamentosWebController::class, 'confirmacaoPdf'])->whereNumber('id')->name('confirmacao-pdf');
            Route::get('/{id}/comprovativo', [\App\Domains\Facturacao\Http\Controllers\Web\PagamentosWebController::class, 'comprovativo'])->whereNumber('id')->name('ver-comprovativo');
            Route::post('/{id}/confirmar', [\App\Domains\Facturacao\Http\Controllers\Web\PagamentosWebController::class, 'confirmar'])->whereNumber('id')->name('confirmar');
            Route::post('/{id}/rejeitar', [\App\Domains\Facturacao\Http\Controllers\Web\PagamentosWebController::class, 'rejeitar'])->whereNumber('id')->name('rejeitar');
            Route::post('/{id}/devolver', [\App\Domains\Facturacao\Http\Controllers\Web\PagamentosWebController::class, 'devolver'])->whereNumber('id')->name('devolver');
            Route::post('/{id}/converter-credito', [\App\Domains\Facturacao\Http\Controllers\Web\PagamentosWebController::class, 'converterCredito'])->whereNumber('id')->name('converter-credito');
        });

    // === Creditos (Facturacao) ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('creditos')
        ->name('creditos.')
        ->group(function () {
            Route::get('/', [\App\Domains\Facturacao\Http\Controllers\Web\CreditosWebController::class, 'index'])->name('index');
            Route::post('/{id}/usar', [\App\Domains\Facturacao\Http\Controllers\Web\CreditosWebController::class, 'usar'])->whereNumber('id')->name('usar');
        });

    // === Lancamentos (Facturacao) ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('lancamentos')
        ->name('lancamentos.')
        ->group(function () {
            Route::get('/', [\App\Domains\Facturacao\Http\Controllers\Web\LancamentosWebController::class, 'index'])->name('index');
            Route::post('/', [\App\Domains\Facturacao\Http\Controllers\Web\LancamentosWebController::class, 'store'])->name('store');
            Route::post('/{id}/cancelar', [\App\Domains\Facturacao\Http\Controllers\Web\LancamentosWebController::class, 'cancelar'])->whereNumber('id')->name('cancelar');
        });

    // === Utilizadores (gestão) ===
    Route::middleware('role:super-admin|admin-empresa')
        ->prefix('utilizadores')
        ->name('utilizadores.')
        ->group(function () {
            Route::get('/', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'index'])->name('index');
            Route::post('/convidar', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'convidar'])->name('convidar');
            Route::post('/criar-directo', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'criarDirecto'])->name('criar-directo');
            Route::post('/{id}/reenviar-convite', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'reenviarConvite'])->whereNumber('id')->name('reenviar-convite');
            Route::post('/{id}/cancelar-convite', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'cancelarConvite'])->whereNumber('id')->name('cancelar-convite');
            Route::patch('/{id}/alterar-condominio', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'alterarCondominio'])->whereNumber('id')->name('alterar-condominio');
            Route::patch('/{id}/alterar-password', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'alterarPassword'])->whereNumber('id')->name('alterar-password');
            Route::patch('/{id}/editar', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'editar'])->whereNumber('id')->name('editar');
            Route::post('/{id}/suspender', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'suspender'])->whereNumber('id')->name('suspender');
            Route::post('/{id}/reactivar', [\App\Domains\Utilizadores\Http\Controllers\Web\UtilizadoresController::class, 'reactivar'])->whereNumber('id')->name('reactivar');
        });

    // === Equipa do Condomínio ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->get('/condominio/equipa', [\App\Domains\Tickets\Http\Controllers\Web\EquipaController::class, 'index'])
        ->name('condominio.equipa');

    // === Configurações: Categorias de Pedidos ===
    Route::middleware('role:super-admin|admin-empresa|gestor')
        ->prefix('configuracoes/categorias-pedidos')
        ->name('configuracoes.categorias-pedidos.')
        ->group(function () {
            Route::get('/', [\App\Domains\Tickets\Http\Controllers\Web\CategoriasPedidoController::class, 'index'])->name('index');
            Route::post('/', [\App\Domains\Tickets\Http\Controllers\Web\CategoriasPedidoController::class, 'criar'])->name('criar');
            Route::patch('/{id}', [\App\Domains\Tickets\Http\Controllers\Web\CategoriasPedidoController::class, 'actualizar'])->whereNumber('id')->name('actualizar');
            Route::delete('/{id}', [\App\Domains\Tickets\Http\Controllers\Web\CategoriasPedidoController::class, 'eliminar'])->whereNumber('id')->name('eliminar');
        });

    // === Configurações: Empresas Prestadoras ===
    Route::middleware('role:super-admin|admin-empresa|gestor')
        ->prefix('configuracoes/empresas-prestadoras')
        ->name('configuracoes.empresas-prestadoras.')
        ->group(function () {
            Route::get('/', [\App\Domains\Tickets\Http\Controllers\Web\EmpresasPrestadorasController::class, 'index'])->name('index');
            Route::post('/', [\App\Domains\Tickets\Http\Controllers\Web\EmpresasPrestadorasController::class, 'criar'])->name('criar');
            Route::patch('/{id}', [\App\Domains\Tickets\Http\Controllers\Web\EmpresasPrestadorasController::class, 'actualizar'])->whereNumber('id')->name('actualizar');
            Route::delete('/{id}', [\App\Domains\Tickets\Http\Controllers\Web\EmpresasPrestadorasController::class, 'eliminar'])->whereNumber('id')->name('eliminar');
        });

    // === SOS: Emergências (admin-empresa, gestor, admin-condominio) ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('sos')
        ->name('sos.')
        ->group(function () {
            Route::get('/alertas', [\App\Domains\Sos\Http\Controllers\Web\SosController::class, 'index'])->name('index');
            Route::get('/alertas/data', [\App\Domains\Sos\Http\Controllers\Web\SosController::class, 'data'])->name('data');
            Route::get('/alertas/{id}', [\App\Domains\Sos\Http\Controllers\Web\SosController::class, 'show'])->whereNumber('id')->name('show');
            Route::patch('/alertas/{id}/estado', [\App\Domains\Sos\Http\Controllers\Web\SosController::class, 'atualizarEstado'])->whereNumber('id')->name('estado');
        });

    // === Configurações: Contactos & Suporte (admin-empresa only) ===
    Route::middleware('role:super-admin|admin-empresa')
        ->prefix('configuracoes/contactos-suporte')
        ->name('configuracoes.contactos-suporte.')
        ->group(function () {
            Route::get('/', [\App\Domains\Empresa\Http\Controllers\Web\ContactosSuporteController::class, 'index'])->name('index');
            Route::patch('/', [\App\Domains\Empresa\Http\Controllers\Web\ContactosSuporteController::class, 'actualizar'])->name('actualizar');
        });

    // === Configurações: Turnos (Modelos) ===
    Route::middleware('role:super-admin|admin-empresa|gestor')
        ->prefix('configuracoes/turnos')
        ->name('configuracoes.turnos.')
        ->group(function () {
            Route::get('/', [\App\Domains\Turnos\Http\Controllers\Web\TurnosModeloController::class, 'index'])->name('index');
            Route::post('/', [\App\Domains\Turnos\Http\Controllers\Web\TurnosModeloController::class, 'criar'])->name('criar');
            Route::patch('/{id}', [\App\Domains\Turnos\Http\Controllers\Web\TurnosModeloController::class, 'actualizar'])->whereNumber('id')->name('actualizar');
            Route::delete('/{id}', [\App\Domains\Turnos\Http\Controllers\Web\TurnosModeloController::class, 'eliminar'])->whereNumber('id')->name('eliminar');
        });

    // === Turnos: Escala ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('turnos/escala')
        ->name('turnos.escala.')
        ->group(function () {
            Route::get('/', [\App\Domains\Turnos\Http\Controllers\Web\EscalaController::class, 'index'])->name('index');
            Route::post('/', [\App\Domains\Turnos\Http\Controllers\Web\EscalaController::class, 'criar'])->name('criar');
            Route::delete('/{id}', [\App\Domains\Turnos\Http\Controllers\Web\EscalaController::class, 'eliminar'])->whereNumber('id')->name('eliminar');
        });

    // === Turnos: Presença + Relatório ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio|guarda|funcionario')
        ->prefix('turnos/presenca')
        ->name('turnos.presenca.')
        ->group(function () {
            Route::get('/', [\App\Domains\Turnos\Http\Controllers\Web\PresencaController::class, 'index'])->name('index');
            Route::post('/checkin', [\App\Domains\Turnos\Http\Controllers\Web\PresencaController::class, 'checkin'])->name('checkin');
            Route::post('/checkout', [\App\Domains\Turnos\Http\Controllers\Web\PresencaController::class, 'checkout'])->name('checkout');
        });

    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->get('/turnos/relatorio', [\App\Domains\Turnos\Http\Controllers\Web\PresencaController::class, 'relatorio'])
        ->name('turnos.relatorio');

    // === Minhas Quotas (condómino) ===
    Route::get('/minhas-quotas', [\App\Domains\Facturacao\Http\Controllers\Web\MinhasQuotasController::class, 'index'])
        ->name('minhas-quotas');

    // === Facturação Config por Condomínio ===
    Route::middleware('role:super-admin|admin-empresa|gestor')
        ->group(function () {
            Route::get('condominios/{condominio}/facturacao', [\App\Domains\Facturacao\Http\Controllers\Web\FacturacaoConfigController::class, 'show'])->name('condominios.facturacao.show');
            Route::patch('condominios/{condominio}/facturacao/coordenadas-bancarias', [\App\Domains\Facturacao\Http\Controllers\Web\FacturacaoConfigController::class, 'actualizarCoordenadasBancarias'])->name('condominios.facturacao.coordenadas-bancarias');
            Route::patch('condominios/{condominio}/facturacao/proxypay', [\App\Domains\Facturacao\Http\Controllers\Web\FacturacaoConfigController::class, 'actualizarProxyPay'])->name('condominios.facturacao.proxypay');
            Route::patch('condominios/{condominio}/facturacao/quotas', [\App\Domains\Facturacao\Http\Controllers\Web\FacturacaoConfigController::class, 'actualizarQuotas'])->name('condominios.facturacao.quotas');
            Route::patch('condominios/{condominio}/facturacao/multas', [\App\Domains\Facturacao\Http\Controllers\Web\FacturacaoConfigController::class, 'actualizarMultas'])->name('condominios.facturacao.multas');
        });

    // === Avisos ===
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('avisos')
        ->name('avisos.')
        ->group(function () {
            Route::get('/', [\App\Domains\Avisos\Http\Controllers\Web\AvisosWebController::class, 'index'])->name('index');
            Route::get('/criar', [\App\Domains\Avisos\Http\Controllers\Web\AvisosWebController::class, 'create'])->name('create');
            Route::post('/', [\App\Domains\Avisos\Http\Controllers\Web\AvisosWebController::class, 'store'])->name('store');
            Route::get('/{aviso}', [\App\Domains\Avisos\Http\Controllers\Web\AvisosWebController::class, 'show'])->name('show');
            Route::post('/{aviso}/publicar', [\App\Domains\Avisos\Http\Controllers\Web\AvisosWebController::class, 'publicar'])->name('publicar');
            Route::post('/{aviso}/arquivar', [\App\Domains\Avisos\Http\Controllers\Web\AvisosWebController::class, 'arquivar'])->name('arquivar');
            Route::post('/{aviso}/comentarios', [\App\Domains\Avisos\Http\Controllers\Web\AvisosWebController::class, 'comentar'])->name('comentar');
        });

    });
});
/*
|--------------------------------------------------------------------------
| Webhooks externos
|--------------------------------------------------------------------------
| Rotas públicas para receber callbacks de serviços externos (ProxyPay,
| etc). CSRF é excluído via bootstrap/app.php. Autenticação é feita
| via assinatura HMAC dentro do controller.
*/
Route::post('/webhooks/proxypay', \App\Http\Controllers\Webhooks\ProxyPayWebhookController::class)
    ->name('webhooks.proxypay');
