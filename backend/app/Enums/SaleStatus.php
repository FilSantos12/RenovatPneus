<?php

namespace App\Enums;

enum SaleStatus: string
{
    case PENDENTE   = 'pendente';
    case PAGO       = 'pago';
    case CANCELADO  = 'cancelado';
}
