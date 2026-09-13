<?php

namespace App\Http\Controllers\Api;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'dia_inicio_mes' => (int) Setting::get('dia_inicio_mes', 1),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dia_inicio_mes' => 'required|integer|min:1|max:31',
        ]);

        Setting::set('dia_inicio_mes', $validated['dia_inicio_mes']);

        return response()->json([
            'data' => [
                'dia_inicio_mes' => (int) Setting::get('dia_inicio_mes'),
            ],
        ]);
    }
}
