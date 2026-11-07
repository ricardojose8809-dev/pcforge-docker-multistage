
# PCForge — E-commerce de Componentes para PC

PCForge es una aplicación frontend de comercio electrónico desarrollada con Next.js 16, App Router y TypeScript, orientada a la compra de componentes de computadoras para armar equipos personalizados.

La aplicación consume una API REST desarrollada con Laravel 12, documentada con Swagger/OpenAPI e integrada con Stripe Checkout para procesar pagos en un entorno de pruebas.

Este proyecto fue desarrollado como parte de la actividad evaluada **Optimización Avanzada de Rendimiento: Dominio de Web Vitals y Mutaciones Asíncronas en el Servidor**.

## Tecnologías utilizadas

### Frontend
- Next.js 16.4.1 (App Router)
- React
- TypeScript
- Tailwind CSS 4
- Server Components
- Server Actions
- React Context para el carrito
- pnpm

### Backend consumido
- Laravel 12
- API REST
- Autenticación mediante JWT
- Swagger / OpenAPI
- MySQL
- Stripe Checkout y webhooks

## Funcionalidades principales

### Catálogo público
- Listado paginado de productos.
- Vista de detalle de cada componente.
- Lectura de información desde la API mediante Server Components.
- Imágenes optimizadas con `next/image`.
- Metadatos SEO dinámicos para productos.

### Autenticación
- Registro de usuarios.
- Inicio y cierre de sesión.
- Consumo de la API mediante Server Actions.
- Persistencia del token JWT en una cookie `httpOnly`.
- Página de cuenta del usuario.
- Protección de páginas que requieren autenticación.

### Carrito de compras
- Agregar productos al carrito.
- Modificar cantidades.
- Quitar productos.
- Persistencia local entre recargas.
- Resumen de productos y total.

### Órdenes y pagos
- Creación de órdenes mediante Server Actions.
- Consulta de órdenes del usuario autenticado.
- Redirección a Stripe Checkout.
- Confirmación del pago mediante webhook de Laravel.
- Visualización del estado de la compra.
- Acceso al historial desde la página de cuenta.

### Rendimiento y resiliencia
- Renderizado en servidor para consultas de productos.
- `Suspense` en el catálogo.
- `loading.tsx` en rutas principales.
- `error.tsx` con opción de reintento.
- Revalidación mediante `revalidatePath()`.
- Compilación optimizada para producción.
- Auditoría de rendimiento con Lighthouse.

## Requisitos previos

Se necesita:

- Node.js compatible con Next.js 16 (20.9 o superior).
- pnpm.
- Acceso a la API REST de PCForge en Laravel.
- Un navegador moderno.

Para probar pagos también se requiere que el backend esté configurado con Stripe en modo de prueba y pueda recibir webhooks.

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/ricardojose8809-dev/pcforge_tarea.git
cd pcforge-frontend
```

Reemplazar `https://github.com/ricardojose8809-dev/pcforge_tarea.git` por la dirección pública de GitHub.

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar las variables de entorno

Copiar `.env.example` y crear `.env.local`.

En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Configuración para el backend local:

```dotenv
API_BASE_URL=http://127.0.0.1:8000/api
```

Si Laravel utiliza otro host o puerto, actualizar esta dirección.

El archivo `.env.local` no debe publicarse en GitHub.

### 4. Iniciar la API Laravel

Desde el proyecto backend, iniciar el servidor:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

La API debe responder en:

`http://127.0.0.1:8000/api/products`

### 5. Iniciar el frontend

Desde el proyecto Next.js:

```bash
pnpm dev
```

Abrir:

`http://localhost:3000`

## Ejecución en producción local

Generar la compilación optimizada:

```bash
pnpm build
```

Iniciar el servidor de producción:

```bash
pnpm start
```

La API Laravel debe permanecer disponible para las rutas que consultan información del servidor.

## Rutas implementadas

| Ruta | Descripción | Acceso |
| --- | --- | --- |
| `/` | Página principal | Público |
| `/products` | Catálogo paginado | Público |
| `/products/[id]` | Detalle de producto | Público |
| `/register` | Registro de usuario | Público |
| `/login` | Inicio de sesión | Público |
| `/account` | Información de cuenta | Autenticado |
| `/cart` | Carrito de compras | Público |
| `/checkout` | Inicio del proceso de compra | Autenticado |
| `/checkout/[id]` | Consulta y pago de una orden | Autenticado |
| `/checkout/success` | Resultado de Stripe Checkout | Vinculado a una orden |
| `/orders` | Historial de compras | Autenticado |

## Endpoints REST consumidos

La aplicación utiliza los siguientes endpoints de Laravel:

| Método | Endpoint | Uso |
| --- | --- | --- |
| GET | `/api/products` | Listar productos |
| GET | `/api/products/{id}` | Detalle de producto |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Consultar usuario |
| POST | `/api/auth/logout` | Cerrar sesión |
| POST | `/api/orders` | Crear orden |
| GET | `/api/orders` | Historial de compras |
| GET | `/api/orders/{id}` | Consultar orden |
| POST | `/api/orders/{id}/pay` | Iniciar pago con Stripe |

La documentación Swagger del backend local está disponible en:

`http://127.0.0.1:8000/api/documentation`

## Arquitectura y manejo de datos

### Server Components

El catálogo y las páginas de detalle utilizan componentes de servidor para consultar la API sin depender de una carga inicial completa desde el navegador.

### Server Actions

Las operaciones de autenticación y creación de órdenes se ejecutan mediante Server Actions, que permiten realizar mutaciones desde el servidor.

### Sesiones

El token de autenticación se almacena mediante una cookie `httpOnly`, evitando su exposición directa a JavaScript del navegador.

### Carrito

El carrito utiliza estado local y persistencia mediante almacenamiento del navegador. No se almacena el token de autenticación en localStorage.

### Actualización de información

Se utiliza `revalidatePath()` después de las mutaciones correspondientes para evitar que la aplicación muestre información desactualizada.

### Manejo de errores

Las rutas principales disponen de estados de carga y límites de error con reintento.

## Flujo de compra con Stripe

1. El usuario selecciona productos del catálogo.
2. Agrega los componentes al carrito.
3. Inicia sesión, si todavía no lo ha hecho.
4. Crea una orden mediante el frontend.
5. Next.js solicita a Laravel la URL de Stripe Checkout.
6. El usuario completa el pago en Stripe.
7. Stripe envía un webhook al backend.
8. Laravel actualiza el estado de la orden.
9. PCForge muestra la compra confirmada.
10. El usuario puede consultar su compra en `/orders`.

Los pagos utilizados durante las pruebas se realizan en el entorno de pruebas de Stripe.

### Webhooks durante desarrollo local

Con Laravel en ejecución y Stripe CLI autenticado en el mismo sandbox utilizado por el backend:

```powershell
stripe listen --forward-to http://127.0.0.1:8000/api/stripe/webhook
```

El secreto `whsec_` generado por el listener debe configurarse en el backend Laravel.

Las claves privadas de Stripe y los secretos de webhook no forman parte de la configuración pública del frontend.

## Rendimiento y Web Vitals

El proyecto fue compilado correctamente mediante `pnpm build` y auditado utilizando Chrome Lighthouse sobre una ejecución de producción.

**Resultado registrado:**

| Métrica | Resultado |
| --- | --- |
| Página evaluada | `/products` |
| Dispositivo | Mobile |
| Lighthouse Performance | **93/100** |
| Objetivo de la actividad | ≥90 |

La evidencia de la auditoría está disponible en `evidencias/lighthouse/`.

Las mediciones de Lighthouse pueden variar según el dispositivo y el entorno de ejecución.

## Evidencias de la actividad

Las evidencias se organizan de la siguiente forma:

```text
evidencias/
├── swagger/
│   └── Capturas de los endpoints documentados
├── flujo-compra/
│   └── Capturas del recorrido de compra
└── lighthouse/
    └── Captura y reporte PDF de rendimiento
```

### Swagger

Las capturas muestran los endpoints utilizados para productos, autenticación, órdenes y Stripe.

### Flujo de compra

Se documenta la navegación desde el catálogo y carrito hasta la confirmación del pago y el historial de órdenes.

### Lighthouse

Se incluye evidencia de la auditoría Mobile con una puntuación de Performance de 93.

## Seguridad

- El token JWT se almacena en una cookie `httpOnly`.
- Las rutas protegidas verifican la autenticación.
- Las mutaciones se realizan desde el servidor.
- El frontend no almacena claves privadas de Stripe.
- Los pagos se procesan mediante la API Laravel.
- Los secretos y archivos de entorno locales se excluyen del repositorio.

## Alcance del proyecto

PCForge es una implementación académica enfocada en Next.js, consumo de API REST, autenticación, mutaciones asíncronas y optimización de rendimiento.

El entorno de pago utilizado es de pruebas. No se presenta como una plataforma comercial de producción.

## Autoría

Proyecto individual desarrollado como parte de una actividad para KODIGO de desarrollo frontend.
