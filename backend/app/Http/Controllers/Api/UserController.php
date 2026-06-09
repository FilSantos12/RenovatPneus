<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function __construct(private UserService $service) {}

    public function index(Request $request): UserCollection
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->when($request->role, fn ($q, $v) => $q->where('role', $v))
            ->when(! is_null($request->active), fn ($q) => $q->where('active', $request->boolean('active')))
            ->paginate(15);

        return new UserCollection($users);
    }

    public function store(StoreUserRequest $request): UserResource
    {
        $this->authorize('create', User::class);

        $user = $this->service->store($request->validated());

        Log::info('Usuário criado', [
            'new_user_id'  => $user->id,
            'new_username' => $user->username,
            'role'         => $user->role,
            'created_by'   => auth()->id(),
        ]);

        return new UserResource($user);
    }

    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $this->authorize('update', $user);

        $user = $this->service->update($user, $request->validated());

        return new UserResource($user);
    }

    public function toggleActive(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Você não pode desativar sua própria conta.',
            ], 403);
        }

        $this->authorize('update', $user);

        $user->update(['active' => !$user->active]);

        Log::warning('Status de usuário alterado', [
            'target_user_id'  => $user->id,
            'target_username' => $user->username,
            'active'          => $user->active,
            'changed_by'      => auth()->id(),
        ]);

        return response()->json([
            'message' => $user->active ? 'Usuário ativado.' : 'Usuário desativado.',
            'data'    => new UserResource($user),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return $this->deleted('Usuário removido com sucesso.');
    }
}
