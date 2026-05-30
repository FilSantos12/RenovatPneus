<?php

namespace App\Http\Requests\Sale;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['array'],
            'items.*.product_id' => ['required_with:items', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_price' => ['required_with:items', 'numeric', 'min:0'],
            'services' => ['array'],
            'services.*.service_id' => ['required_with:services', 'integer', 'exists:services,id'],
            'services.*.quantity' => ['required_with:services', 'integer', 'min:1'],
            'services.*.unit_price' => ['required_with:services', 'numeric', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);
            $services = $this->input('services', []);
            if (empty($items) && empty($services)) {
                $validator->errors()->add('items', 'A venda deve ter pelo menos um produto ou serviço.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'payment_method.required' => 'A forma de pagamento é obrigatória.',
            'items.*.product_id.exists' => 'Produto não encontrado.',
            'items.*.quantity.min' => 'A quantidade deve ser pelo menos 1.',
            'items.*.unit_price.min' => 'O preço unitário não pode ser negativo.',
            'services.*.service_id.exists' => 'Serviço não encontrado.',
            'services.*.quantity.min' => 'A quantidade deve ser pelo menos 1.',
        ];
    }
}
