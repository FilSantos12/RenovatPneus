<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id ?? $this->route('product');

        return [
            'name' => ['required', 'string', 'max:255'],
            'barcode' => ['required', 'string', "unique:products,barcode,{$productId}"],
            'description' => ['nullable', 'string'],
            'brand' => ['nullable', 'string', 'max:100'],
            'size' => ['nullable', 'string', 'max:50'],
            'price_cost' => ['required', 'numeric', 'min:0'],
            'price_sale' => ['required', 'numeric', 'min:0'],
            'quantity' => ['integer', 'min:0'],
            'min_stock' => ['integer', 'min:0'],
            'active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome do produto é obrigatório.',
            'barcode.required' => 'O código de barras é obrigatório.',
            'barcode.unique' => 'Este código de barras já está em uso.',
            'price_cost.required' => 'O preço de custo é obrigatório.',
            'price_sale.required' => 'O preço de venda é obrigatório.',
        ];
    }
}
