<?php

namespace App\Http\Controllers\Api;

// Estende o Controller base da camada Api
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->login($request->only('username', 'password'));
        } catch (AuthenticationException $e) {
            Log::warning('Tentativa de login falhou', [
                'username' => $request->username,
                'ip'       => $request->ip(),
            ]);
            throw $e;
        }

        Auth::login($user);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        Log::info('Login realizado', [
            'user_id'  => $user->id,
            'username' => $user->username,
            'ip'       => $request->ip(),
        ]);

        return response()->json([
            'user' => new UserResource($user),
            'message' => 'Login realizado com sucesso.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Log::info('Logout realizado', [
            'user_id'  => auth()->id(),
            'username' => auth()->user()?->username,
        ]);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }
}
