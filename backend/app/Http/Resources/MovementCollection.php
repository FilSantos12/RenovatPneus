<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class MovementCollection extends ResourceCollection
{
    public $collects = MovementResource::class;
}
