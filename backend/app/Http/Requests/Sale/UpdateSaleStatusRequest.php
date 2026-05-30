<?php

namespace App\Http\Requests\Sale;

use App\Enums\PaymentMethod;
use App\Enums\SaleStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateSaleStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(SaleStatus::class)],
            'payment_method' => ['nullable', new Enum(PaymentMethod::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'O status é obrigatório.',
        ];
    }
}
