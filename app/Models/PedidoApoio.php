<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoApoio extends Model
{
    use HasFactory;

    protected $table = 'pedidos_apoios';

    protected $fillable = [
        'ticket_id',
        'user_id',
    ];

    public $timestamps = false;
    protected $casts = [
        'created_at' => 'datetime',
    ];
}
