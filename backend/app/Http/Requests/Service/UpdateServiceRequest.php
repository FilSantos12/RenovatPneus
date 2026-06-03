<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'price_cost' => ['nullable', 'numeric', 'min:0'],
            'active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome do serviço é obrigatório.',
            'price.required' => 'O preço é obrigatório.',
            'price.min' => 'O preço não pode ser negativo.',
        ];
    }
}
