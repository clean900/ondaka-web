<?php

declare(strict_types=1);

use App\Domains\Nps\Http\Controllers\Api\NpsApiController;
use App\Domains\Checklist\Http\Controllers\Api\ChecklistApiController;
use App\Domains\Reserva\Http\Controllers\Api\ReservaApiController;
use App\Domains\Facturacao\Http\Controllers\Api\AcordoCondominoApiController;
use App\Domains\Marketplace\Http\Controllers\Api\MarketplaceApiController;
use App\Domains\Prestadores\Http\Controllers\Api\PrestadoresApiController;
use App\Domains\Visitor\Http\Controllers\PortariaController;
use App\Domains\Visitor\Http\Controllers\PreAprovacaoController;
use App\Domains\Notifications\Http\Controllers\DeviceTokenController;
use App\Domains\Tickets\Http\Controllers\TicketController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Endpoints consumidos pelo app mobile Flutter (Android, iOS, Web).
| Autenticação via Laravel Sanctum — Bearer tokens.
|
*/

// --- Públicas ---

Route::post('login', [AuthController::class, 'login']);

// --- Protegidas (Sanctum) ---

// === Catálogo público (sem auth — leitura) ===
Route::get('catalogo', [\App\Http\Controllers\Api\CatalogoApiController::class, 'index'])->name('api.catalogo');

// Foto de anuncio do marketplace (publica)
Route::get('marketplace/foto/{foto}', [\App\Domains\Marketplace\Http\Controllers\Api\MarketplaceApiController::class, 'verFoto'])->name('marketplace.foto');

Route::middleware('auth:sanctum')->group(function () {

    // === Marketplace dos Condominos (mobile) ===
    Route::prefix('nps')->name('nps.')->group(function () {
        Route::get('/estado', [NpsApiController::class, 'estado'])->name('estado');
        Route::post('/responder', [NpsApiController::class, 'responder'])->name('responder');
    });
    Route::prefix('checklist')->name('checklist.')->group(function () {
        Route::get('/disponiveis', [ChecklistApiController::class, 'disponiveis'])->name('disponiveis');
        Route::post('/submeter', [ChecklistApiController::class, 'submeter'])->name('submeter');
        Route::get('/minhas', [ChecklistApiController::class, 'minhas'])->name('minhas');
    });
    Route::prefix('reservas')->name('reservas.')->group(function () {
        Route::get('/espacos', [ReservaApiController::class, 'espacos'])->name('espacos');
        Route::get('/espacos/{espaco}/disponibilidade', [ReservaApiController::class, 'disponibilidade'])->name('disponibilidade');
        Route::post('/', [ReservaApiController::class, 'criar'])->name('criar')->middleware('condomino.semdivida');
        Route::post('/{id}/comprovativo', [ReservaApiController::class, 'comprovativo'])->name('comprovativo');
        Route::get('/minhas', [ReservaApiController::class, 'minhas'])->name('minhas');
    });

    Route::get('publicidade/popup-ativo', [\App\Domains\Publicidade\Http\Controllers\Api\PublicidadeApiController::class, 'popupAtivo']);

    // Familiares (o titular gere os seus familiares)
    Route::prefix('familiares')->group(function () {
        Route::get('/', [\App\Domains\Familiar\Http\Controllers\Api\FamiliarApiController::class, 'index']);
        Route::post('/', [\App\Domains\Familiar\Http\Controllers\Api\FamiliarApiController::class, 'store']);
        Route::put('/{familiar}', [\App\Domains\Familiar\Http\Controllers\Api\FamiliarApiController::class, 'update']);
        Route::delete('/{familiar}', [\App\Domains\Familiar\Http\Controllers\Api\FamiliarApiController::class, 'destroy']);
    });

    Route::prefix('acordos')->name('acordos.')->group(function () {
        Route::get('/', [AcordoCondominoApiController::class, 'index'])->name('index');
        Route::post('/', [AcordoCondominoApiController::class, 'propor'])->name('propor');
        Route::post('/{acordo}/contrapropor', [AcordoCondominoApiController::class, 'contrapropor'])->whereNumber('acordo')->name('contrapropor');
        Route::post('/{acordo}/aceitar', [AcordoCondominoApiController::class, 'aceitar'])->whereNumber('acordo')->name('aceitar');
        Route::post('/{acordo}/recusar', [AcordoCondominoApiController::class, 'recusar'])->whereNumber('acordo')->name('recusar');
    });

    Route::prefix('marketplace')->name('marketplace.')->group(function () {
        Route::get('/', [MarketplaceApiController::class, 'index'])->name('index');
        Route::get('/meus', [MarketplaceApiController::class, 'meus'])->name('meus');
        Route::post('/', [MarketplaceApiController::class, 'criar'])->name('criar')->middleware('condomino.semdivida');
        Route::post('/subscrever', [MarketplaceApiController::class, 'subscrever'])->name('subscrever');
        Route::get('/{anuncio}', [MarketplaceApiController::class, 'show'])->name('show');
        Route::patch('/{anuncio}/estado', [MarketplaceApiController::class, 'alterarEstado'])->name('estado');
        Route::post('/{anuncio}/denunciar', [MarketplaceApiController::class, 'denunciar'])->name('denunciar');
        Route::post('/{anuncio}/fotos', [MarketplaceApiController::class, 'uploadFotos'])->name('fotos');
        Route::patch('/{anuncio}', [MarketplaceApiController::class, 'editar'])->name('editar');
        Route::delete('/{anuncio}/fotos/{foto}', [MarketplaceApiController::class, 'apagarFoto'])->name('foto.apagar');
    });


    // === Marketplace (mobile condómino) ===
    Route::prefix('prestadores')->name('prestadores.')->group(function () {
        Route::get('/', [PrestadoresApiController::class, 'index'])->name('index');
        Route::get('/{prestadora}', [PrestadoresApiController::class, 'show'])->name('show');
        Route::post('/{prestadora}/avaliar', [PrestadoresApiController::class, 'avaliar'])->name('avaliar');
    });


    // Auth
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Módulo Visitor — Pré-aprovações (condómino)
    |--------------------------------------------------------------------------
    */
    Route::prefix('pre-aprovacoes')->group(function () {
        Route::get('/', [PreAprovacaoController::class, 'index']);
        Route::get('/visitas-historico', [PreAprovacaoController::class, 'historicoVisitas']);
        Route::post('/', [PreAprovacaoController::class, 'store'])->middleware('condomino.semdivida');
        Route::post('/admin', [PreAprovacaoController::class, 'storeAdmin']);
        Route::get('/{id}', [PreAprovacaoController::class, 'show']);
        Route::post('/{id}/cancelar', [PreAprovacaoController::class, 'cancelar']);
    });

    // Passes de visitante (prestadores/trabalhadores) — condómino
    Route::prefix('passes')->controller(\App\Domains\Visitor\Http\Controllers\PassesApiController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store')->middleware('condomino.semdivida');
        Route::post('/{id}/estender', 'estender')->whereNumber('id');
    });

    /*
    |--------------------------------------------------------------------------
    | Módulo Visitor — Portaria (funcionário/guarda)
    |--------------------------------------------------------------------------
    */
    Route::prefix('portaria')->group(function () {
        Route::post('validar-qr', [PortariaController::class, 'validarQr']);
        Route::post('validar-otp', [PortariaController::class, 'validarOtp']);
        Route::post('entrada-manual', [PortariaController::class, 'entradaManual']);
        Route::post('lista-negra/verificar', [PortariaController::class, 'verificarListaNegra']);
        Route::get('dentro-agora', [PortariaController::class, 'dentroAgora']);
        Route::get('visitas', [PortariaController::class, 'historico']);
        Route::post('visitas/{id}/saida', [PortariaController::class, 'registarSaida']);

        // Add-on Controlo de Bens — itens à entrada/saída (gated)
        Route::middleware('feature:controlo_bens')->group(function () {
            Route::get('visitas/{id}/itens', [\App\Domains\Visitor\Http\Controllers\VisitaItemController::class, 'index']);
            Route::post('visitas/{id}/itens', [\App\Domains\Visitor\Http\Controllers\VisitaItemController::class, 'store']);
            Route::post('visitas/{id}/itens/{itemId}/saida', [\App\Domains\Visitor\Http\Controllers\VisitaItemController::class, 'resolver']);
            Route::delete('visitas/{id}/itens/{itemId}', [\App\Domains\Visitor\Http\Controllers\VisitaItemController::class, 'destroy']);
        });

        // Chamadas de voz: guarda liga ao condómino
        Route::get('fraccoes', [\App\Domains\Visitor\Http\Controllers\ChamadaApiController::class, 'fraccoes']);
        Route::post('chamadas', [\App\Domains\Visitor\Http\Controllers\ChamadaApiController::class, 'ligarCondomino']);
    });

    // Chamadas de voz: condómino liga à portaria
    Route::post('chamadas/portaria', [\App\Domains\Visitor\Http\Controllers\ChamadaApiController::class, 'ligarPortaria']);

    // Chamadas de voz WebRTC (matriz morador↔guarda↔gestor)
    Route::get('chamadas/destinos', [\App\Domains\Visitor\Http\Controllers\ChamadaWebrtcController::class, 'destinos']);
    Route::post('chamadas', [\App\Domains\Visitor\Http\Controllers\ChamadaWebrtcController::class, 'iniciar']);


    /*
    |--------------------------------------------------------------------------
    | Módulo Tickets
    |--------------------------------------------------------------------------
    */
    Route::prefix('tickets')->group(function () {
        Route::get('/', [TicketController::class, 'index']);
        Route::post('/', [TicketController::class, 'store']);
        Route::get('/categorias', [TicketController::class, 'categorias']);
        Route::get('/{id}', [TicketController::class, 'show']);
        Route::post('/{id}/comentarios', [TicketController::class, 'comentar']);
        Route::patch('/{id}/estado', [TicketController::class, 'mudarEstado']);
        Route::post('/{id}/cancelar', [TicketController::class, 'cancelar']);
        Route::post('/{id}/apoiar', [TicketController::class, 'apoiar']);
        Route::patch('/{id}/atribuir', [TicketController::class, 'atribuir']);
    });


    /*
    |--------------------------------------------------------------------------
    | Push Notifications
    |--------------------------------------------------------------------------
    */
    Route::post('devices/register-fcm-token', [DeviceTokenController::class, 'register']);

    /*
    |--------------------------------------------------------------------------
    | Avisos
    |--------------------------------------------------------------------------
    */
    Route::prefix('avisos')->controller(\App\Domains\Avisos\Http\Controllers\AvisoController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/{aviso}', 'show');
        Route::post('/', 'store');
        Route::post('/{aviso}/publicar', 'publicar');
        Route::post('/{aviso}/arquivar', 'arquivar');
        Route::post('/{aviso}/marcar-lido', 'marcarLido');
        Route::post('/{aviso}/comentarios', 'comentar');
        Route::get('/{aviso}/estatisticas', 'estatisticas');
    });


    /*
    |--------------------------------------------------------------------------
    | Ordens (mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('ordens')->controller(\App\Domains\Payment\Http\Controllers\Api\OrdemApiController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/{id}', 'show');
    });


    /*
    |--------------------------------------------------------------------------
    | Assembleias (mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('assembleias')->controller(\App\Domains\Assembleia\Http\Controllers\Api\AssembleiaApiController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/{id}', 'show');
        Route::get('/{id}/acta', 'baixarActa');
        Route::post('/{id}/entrar', 'entrar');
        Route::post('/{id}/pontos/{ponto}/votar', 'votar');
    });



    /*
    |--------------------------------------------------------------------------
    | FAQs (mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('faqs')->controller(\App\Domains\Faq\Http\Controllers\Api\FaqApiController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/buscar', 'buscar');
        Route::post('/{faq}/util', 'marcarUtil');
    });


    /*
    |--------------------------------------------------------------------------
    | Dashboard (mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('dashboard')->controller(\App\Domains\Dashboard\Http\Controllers\Api\DashboardApiController::class)->group(function () {
        Route::get('/condomino', 'condomino');
        Route::get('/condomino/estado-acesso', 'estadoAcesso');
    });

    /*
    |--------------------------------------------------------------------------
    | Extracto Financeiro (Condomino)
    |--------------------------------------------------------------------------
    */
    Route::prefix('extracto')->controller(\App\Domains\Facturacao\Http\Controllers\Api\ExtractoCondominoApiController::class)->group(function () {
        Route::get('/saldo', 'saldo');
        Route::get('/grafico-mensal', 'graficoMensal');
        Route::get('/', 'movimentos');
    });

    Route::prefix('extracto/pagamentos')->controller(\App\Domains\Facturacao\Http\Controllers\Api\PagamentoCondominoApiController::class)->group(function () {
        Route::get('/lancamentos-em-aberto', 'lancamentosEmAberto');
        Route::get('/coordenadas-bancarias', 'coordenadasBancarias');
        Route::get('/contas-disponiveis', 'contasDisponiveis');
        Route::get('/{id}/confirmacao-pdf', 'confirmacaoPdf');
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/{id}', 'show')->whereNumber('id');
        Route::match(['put', 'patch'], '/{id}', 'update')->whereNumber('id');
        Route::delete('/{id}', 'destroy')->whereNumber('id');
        Route::post('/{id}/gerar-referencia', 'gerarReferenciaProxyPay')->whereNumber('id');
        Route::get('/{id}/referencia', 'obterReferenciaProxyPay')->whereNumber('id');
    });

    /*
    |--------------------------------------------------------------------------
    | Empresa Gestora — Contactos de Suporte (mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('empresa-gestora')->controller(\App\Domains\Empresa\Http\Controllers\Api\EmpresaGestoraApiController::class)->group(function () {
        Route::get('/contactos', 'contactos');
    });

    /*
    |--------------------------------------------------------------------------
    | SOS — Alertas de emergência (condóminos)
    |--------------------------------------------------------------------------
    */
    Route::prefix('sos')->controller(\App\Domains\Sos\Http\Controllers\Api\SosAlertaApiController::class)->group(function () {
        Route::get('/tipos', 'tipos');
        Route::post('/alertas', 'store');
        Route::get('/alertas', 'index');
        Route::get('/alertas/{id}', 'show')->whereNumber('id');
    });

    // === API SOS dedicada para GUARDAS (role guarda + funcionario) ===
    Route::prefix('guarda/sos')->controller(\App\Domains\Sos\Http\Controllers\Api\SosGuardaApiController::class)->group(function () {
        Route::get('/alertas', 'index');
        Route::get('/alertas/{id}', 'show')->whereNumber('id');
        Route::patch('/alertas/{id}/estado', 'atualizarEstado')->whereNumber('id');
    });

    // === API SOS dedicada para GESTORES ===
    Route::prefix('gestor/sos')->controller(\App\Domains\Sos\Http\Controllers\Api\SosGestorApiController::class)->group(function () {
        Route::get('/alertas', 'index');
        Route::get('/alertas/{id}', 'show')->whereNumber('id');
        Route::patch('/alertas/{id}/estado', 'atualizarEstado')->whereNumber('id');
    });

    /*
    |--------------------------------------------------------------------------
    | Encomendas (condómino - mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('encomendas')->controller(\App\Domains\Encomenda\Http\Controllers\Api\EncomendaCondominoApiController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/pre-anuncio', 'preAnuncio');
        Route::post('/{id}/cancelar', 'cancelar')->whereNumber('id');
    });

    Route::prefix('fraccao/autorizados')->controller(\App\Domains\Encomenda\Http\Controllers\Api\EncomendaCondominoApiController::class)->group(function () {
        Route::get('/', 'listarAutorizados');
        Route::post('/', 'criarAutorizado');
        Route::delete('/{id}', 'removerAutorizado')->whereNumber('id');
    });
    /*
    |--------------------------------------------------------------------------
    | Portaria - Encomendas (guarda - mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('portaria')->controller(\App\Domains\Encomenda\Http\Controllers\Api\EncomendaPortariaApiController::class)->group(function () {
        // Condomínio activo (sessão)
        Route::get('/condominio-activo', 'condominioActivo');
        Route::post('/condominio-activo', 'escolherCondominio');

        // Listagens de encomendas
        Route::get('/encomendas/aguarda-chegada', 'aguardaChegada');
        Route::get('/encomendas/portaria', 'naPortaria');

        // Acções
        Route::post('/encomendas/registar', 'registar');
        Route::post('/encomendas/{id}/marcar-chegada', 'marcarChegada')->whereNumber('id');
        Route::post('/encomendas/{id}/entregar', 'entregar')->whereNumber('id');
    });
    /*
    |--------------------------------------------------------------------------
    | Admin - Encomendas (gestor / admin-empresa)
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin/encomendas')->controller(\App\Domains\Encomenda\Http\Controllers\Api\EncomendaAdminApiController::class)->group(function () {
        Route::get('/', 'index');
        Route::get('/config', 'config');
        Route::put('/config', 'actualizarConfig');
        Route::post('/{id}/cobrar-multa', 'cobrarMulta')->whereNumber('id');
        Route::post('/{id}/desbloquear', 'desbloquear')->whereNumber('id');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Chatbot FAQs Condomínio (mobile)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super-admin|admin-empresa|gestor')
        ->prefix('admin/chatbot/faqs')
        ->controller(\App\Domains\Chatbot\Http\Controllers\AdminChatbotFaqController::class)
        ->group(function () {
            Route::get('/', 'indexJson');
            Route::post('/', 'store');
            Route::put('/{faq}', 'update');
            Route::delete('/{faq}', 'destroy');
            Route::post('/{faq}/toggle', 'toggle');
            Route::post('/reorder', 'reorder');
        });

    /*
    |--------------------------------------------------------------------------
    | Chatbot (mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('chatbot')
        ->controller(\App\Domains\Chatbot\Http\Controllers\ChatbotController::class)
        ->group(function () {
            Route::get('/ondaka', 'ondaka');
            Route::get('/condominio', 'condominio');
            Route::post('/perguntar', 'perguntar');
        });
    /*
    |--------------------------------------------------------------------------
    | Notificações in-app (mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('notificacoes')
        ->controller(\App\Domains\Notificacoes\Http\Controllers\Web\NotificacoesController::class)
        ->group(function () {
            Route::get('/', 'listar');
            Route::post('/marcar-todas-lidas', 'marcarTodasLidas');
            Route::post('/{id}/marcar-lida', 'marcarLida');
        });
    /*
    |--------------------------------------------------------------------------
    | Equipa do Condomínio (mobile)
    |--------------------------------------------------------------------------
    */
    Route::get('condominio/equipa', [\App\Domains\Tickets\Http\Controllers\Web\EquipaController::class, 'apiIndex']);
    /*
    |--------------------------------------------------------------------------
    | Minhas Quotas (mobile)
    |--------------------------------------------------------------------------
    */
    Route::get('minhas-quotas', [\App\Domains\Facturacao\Http\Controllers\Web\MinhasQuotasController::class, 'apiIndex']);
    /*
    |--------------------------------------------------------------------------
    | Empresas Prestadoras (mobile — admin)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super-admin|admin-empresa|gestor|administrador-condominio')
        ->prefix('empresas-prestadoras')
        ->controller(\App\Domains\Tickets\Http\Controllers\Web\EmpresasPrestadorasController::class)
        ->group(function () {
            Route::get('/', 'apiIndex');
            Route::post('/', 'apiCriar');
            Route::patch('/{id}', 'apiActualizar')->whereNumber('id');
            Route::delete('/{id}', 'apiEliminar')->whereNumber('id');
        });
    /*
    |--------------------------------------------------------------------------
    | Turnos — Presença (mobile)
    |--------------------------------------------------------------------------
    */
    Route::prefix('turnos')
        ->controller(\App\Domains\Turnos\Http\Controllers\Web\PresencaController::class)
        ->group(function () {
            Route::get('/presenca', 'apiIndex');
            Route::post('/presenca/checkin', 'apiCheckin');
            Route::post('/presenca/checkout', 'apiCheckout');
            Route::get('/relatorio', 'apiRelatorio');
        });

    /*
    |--------------------------------------------------------------------------
    | User autenticado (perfil + fraccoes)
    |--------------------------------------------------------------------------
    */
    Route::get('me/fraccoes', [\App\Http\Controllers\Api\MeController::class, 'fraccoes']);
    Route::get('me/documentos', [\App\Http\Controllers\Api\MeController::class, 'documentos']);
    Route::get('me/acessos', [\App\Http\Controllers\Api\MeController::class, 'acessos']);
    Route::delete('me/conta', [\App\Http\Controllers\Api\MeController::class, 'apagarConta']);
    Route::patch('me/profile', [\App\Http\Controllers\Api\MeController::class, 'updateProfile']);
    Route::patch('me/password', [\App\Http\Controllers\Api\MeController::class, 'updatePassword']);

    // F-03: comissão de moradores — aprovar/recusar despesas pendentes (mobile)
    Route::get('me/despesas-comissao', [\App\Domains\Financas\Http\Controllers\Api\DespesaComissaoApiController::class, 'index']);
    Route::post('despesas-comissao/{despesa}/aprovar', [\App\Domains\Financas\Http\Controllers\Api\DespesaComissaoApiController::class, 'aprovar']);
    Route::post('despesas-comissao/{despesa}/recusar', [\App\Domains\Financas\Http\Controllers\Api\DespesaComissaoApiController::class, 'recusar']);
});
