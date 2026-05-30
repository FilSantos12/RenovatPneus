<?php

namespace App\Enums;

enum UserRole: string
{
    case ADM = 'adm';
    case OPERADOR = 'operador';

    public function label(): string
    {
        return match ($this) {
            UserRole::ADM => 'Administrador',
            UserRole::OPERADOR => 'Operador',
        };
    }
}
