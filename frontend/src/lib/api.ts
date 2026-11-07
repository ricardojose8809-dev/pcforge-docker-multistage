const API_BASE_URL = process.env.API_BASE_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(
  endpoint: string,
  revalidate = 60,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      "La variable API_BASE_URL no está configurada.",
    );
  }

  const url = `${API_BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate,
      },
    });
  } catch {
    throw new Error(
      "No fue posible conectar con Laravel. Verifica que la API esté ejecutándose.",
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `La API respondió con HTTP ${response.status}.`,
      response.status,
    );
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new Error(
      "La API no devolvió una respuesta JSON válida.",
    );
  }

  return (await response.json()) as T;
}