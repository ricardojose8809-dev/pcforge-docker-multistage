import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "pcforge_auth_token";

export type AuthUser = {
  id?: number | string;
  name: string;
  email: string;
};

type JsonObject = Record<string, unknown>;

export type AuthApiResult =
  | {
      ok: true;
      data: unknown;
      status: number;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

export type LoginSession = {
  token: string;
  expiresIn: number;
};

function isObject(value: unknown): value is JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "La variable API_BASE_URL no está configurada.",
    );
  }

  return `${baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
}

function getErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (!isObject(payload)) {
    return fallback;
  }

  if (isObject(payload.errors)) {
    for (const messages of Object.values(payload.errors)) {
      if (
        Array.isArray(messages) &&
        typeof messages[0] === "string"
      ) {
        return messages[0];
      }
    }
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

// Formato real devuelto por AuthController@login.
export function extractLoginSession(
  payload: unknown,
): LoginSession | null {
  if (!isObject(payload)) {
    return null;
  }

  const token = payload.access_token;
  const expiresIn = payload.expires_in;
  const tokenType = payload.token_type;

  if (
    typeof token !== "string" ||
    token.length === 0
  ) {
    return null;
  }

  if (
    typeof expiresIn !== "number" ||
    !Number.isFinite(expiresIn) ||
    expiresIn <= 0
  ) {
    return null;
  }

  if (
    typeof tokenType === "string" &&
    tokenType.toLowerCase() !== "bearer"
  ) {
    return null;
  }

  return {
    token,
    expiresIn: Math.floor(expiresIn),
  };
}

// Soporta UserResource directo o envuelto en data.
function extractUser(
  payload: unknown,
): AuthUser | null {
  if (!isObject(payload)) {
    return null;
  }

  const candidate = isObject(payload.data)
    ? payload.data
    : payload;

  if (
    typeof candidate.name !== "string" ||
    typeof candidate.email !== "string"
  ) {
    return null;
  }

  const id =
    typeof candidate.id === "number" ||
    typeof candidate.id === "string"
      ? candidate.id
      : undefined;

  return {
    id,
    name: candidate.name,
    email: candidate.email,
  };
}

export async function authApiPost(
  endpoint: string,
  body: Record<string, string> | null,
  token?: string,
): Promise<AuthApiResult> {
  try {
    const response = await fetch(
      getApiUrl(endpoint),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(body !== null
            ? { "Content-Type": "application/json" }
            : {}),
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body:
          body !== null
            ? JSON.stringify(body)
            : undefined,
        cache: "no-store",
      },
    );

    const payload: unknown = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: getErrorMessage(
          payload,
          `La API respondió con HTTP ${response.status}.`,
        ),
      };
    }

    return {
      ok: true,
      data: payload,
      status: response.status,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      error:
        "No fue posible conectar con Laravel.",
    };
  }
}

export async function getAuthToken(): Promise<
  string | null
> {
  const cookieStore = await cookies();

  return (
    cookieStore.get(COOKIE_NAME)?.value ?? null
  );
}

export async function setAuthToken(
  token: string,
  expiresIn: number,
): Promise<void> {
  const cookieStore = await cookies();

  // La cookie expira ligeramente antes que el JWT.
  const maxAge = Math.max(
    1,
    Math.floor(expiresIn) - 30,
  );

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<
  AuthUser | null
> {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const response = await fetch(
    getApiUrl("/auth/me"),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      "No fue posible verificar la sesión con Laravel.",
    );
  }

  const payload: unknown = await response.json();

  const user = extractUser(payload);

  if (!user) {
    throw new Error(
      "Laravel devolvió un formato de usuario no reconocido.",
    );
  }

  return user;
}