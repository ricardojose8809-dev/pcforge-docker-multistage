<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: '/products',
        summary: 'Listar productos (paginado, 8 por página)',
        tags: ['Products'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'category', in: 'query', required: false, schema: new OA\Schema(type: 'string'), example: 'GPU'),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista paginada de productos',
                content: new OA\JsonContent(ref: '#/components/schemas/ProductList')
            ),
        ]
    )]
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->orderBy('id')
            ->paginate(8);

        return ProductResource::collection($products);
    }

    #[OA\Get(
        path: '/products/{product}',
        summary: 'Ver el detalle de un producto',
        tags: ['Products'],
        parameters: [
            new OA\Parameter(name: 'product', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Detalle del producto',
                content: new OA\JsonContent(ref: '#/components/schemas/ProductSingle')
            ),
            new OA\Response(
                response: 404,
                description: 'Producto no encontrado',
                content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')
            ),
        ]
    )]
    public function show(Product $product): ProductResource
    {
        return new ProductResource($product);
    }
}