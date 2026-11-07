<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class OrderController extends Controller
{
    #[OA\Get(
        path: '/orders',
        summary: 'Listar las órdenes del usuario autenticado',
        security: [['bearerAuth' => []]],
        tags: ['Orders'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Historial de compras',
                content: new OA\JsonContent(ref: '#/components/schemas/OrderList')
            ),
            new OA\Response(
                response: 401,
                description: 'No autenticado',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
        ]
    )]
    public function index(): AnonymousResourceCollection
    {
        $orders = auth('api')->user()
            ->orders()
            ->with('items.product')
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    #[OA\Get(
        path: '/orders/{order}',
        summary: 'Ver el detalle de una orden propia',
        security: [['bearerAuth' => []]],
        tags: ['Orders'],
        parameters: [
            new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Detalle de la orden',
                content: new OA\JsonContent(ref: '#/components/schemas/OrderSingle')
            ),
            new OA\Response(
                response: 401,
                description: 'No autenticado',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
            new OA\Response(
                response: 403,
                description: 'La orden pertenece a otro usuario',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
            new OA\Response(
                response: 404,
                description: 'Orden no encontrada',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
        ]
    )]
    public function show(Order $order): OrderResource
    {
        Gate::authorize('view', $order);

        return new OrderResource($order->load('items.product'));
    }

    #[OA\Post(
        path: '/orders',
        summary: 'Crear una orden (descuenta stock)',
        security: [['bearerAuth' => []]],
        tags: ['Orders'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreOrderRequest')
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Orden creada',
                content: new OA\JsonContent(ref: '#/components/schemas/OrderSingle')
            ),
            new OA\Response(
                response: 401,
                description: 'No autenticado',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
            new OA\Response(
                response: 422,
                description: 'Validación o stock insuficiente',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')
            ),
        ]
    )]
    public function store(StoreOrderRequest $request, OrderService $service): JsonResponse
    {
        $order = $service->create(auth('api')->user(), $request->validated('items'));

        return (new OrderResource($order))->response()->setStatusCode(201);
    }
}