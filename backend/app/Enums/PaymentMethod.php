<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case DINHEIRO = 'dinheiro';
    case CARTAO_CREDITO = 'cartao_credito';
    case CARTAO_DEBITO = 'cartao_debito';
    case PIX = 'pix';
    case FIADO = 'fiado';

    public function label(): string
    {
        return match ($this) {
            PaymentMethod::DINHEIRO => 'Dinheiro',
            PaymentMethod::CARTAO_CREDITO => 'Cartão de Crédito',
            PaymentMethod::CARTAO_DEBITO => 'Cartão de Débito',
            PaymentMethod::PIX => 'PIX',
            PaymentMethod::FIADO => 'Fiado',
        };
    }
}
