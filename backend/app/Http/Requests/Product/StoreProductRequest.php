<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', 'unique:products,barcode'],
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
            'barcode.unique' => 'Este código de barras já está cadastrado.',
            'price_cost.required' => 'O preço de custo é obrigatório.',
            'price_cost.min' => 'O preço de custo não pode ser negativo.',
            'price_sale.required' => 'O preço de venda é obrigatório.',
            'price_sale.min' => 'O preço de venda não pode ser negativo.',
            'quantity.min' => 'A quantidade não pode ser negativa.',
            'min_stock.min' => 'O estoque mínimo não pode ser negativo.',
        ];
    }
}
