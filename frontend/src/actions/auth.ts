"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  authApiPost,
  clearAuthToken,
  extractLoginSession,
  getAuthToken,
  setAuthToken,
} from "@/lib/auth";

export type AuthFormState = {
  error: string | null;
};

function getText(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  // No modificar espacios en contraseñas.
  if (
    field === "password" ||
    field === "password_confirmation"
  ) {
    return value;
  }

  return value.trim();
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getText(formData, "email");
  const password = getText(formData, "password");

  if (!email || !password) {
    return {
      error: "Ingresa tu correo y contraseña.",
    };
  }

  const result = await authApiPost(
    "/auth/login",
    {
      email,
      password,
    },
  );

  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  const session = extractLoginSession(result.data);

  if (!session) {
    return {
      error:
        "La API no devolvió un token JWT válido o su duración.",
    };
  }

  await setAuthToken(
    session.token,
    session.expiresIn,
  );

  revalidatePath("/", "layout");

  redirect("/account");
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = getText(formData, "name");
  const email = getText(formData, "email");
  const password = getText(formData, "password");
  const confirmation = getText(
    formData,
    "password_confirmation",
  );

  if (!name || !email || !password) {
    return {
      error: "Completa todos los campos.",
    };
  }

  if (password.length < 8) {
    return {
      error:
        "La contraseña debe tener al menos 8 caracteres.",
    };
  }

  if (password !== confirmation) {
    return {
      error: "Las contraseñas no coinciden.",
    };
  }

  const result = await authApiPost(
    "/auth/register",
    {
      name,
      email,
      password,
      password_confirmation: confirmation,
    },
  );

  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  // Laravel registra al usuario, pero no emite JWT.
  // El usuario debe iniciar sesión posteriormente.
  redirect("/login?registered=1");
}

export async function logoutAction(): Promise<void> {
  const token = await getAuthToken();

  if (token) {
    const result = await authApiPost(
      "/auth/logout",
      null,
      token,
    );

    if (
      !result.ok &&
      result.status !== 401
    ) {
      throw new Error(
        "No fue posible invalidar el JWT en Laravel.",
      );
    }
  }

  await clearAuthToken();

  revalidatePath("/", "layout");

  redirect("/login?logout=1");
}