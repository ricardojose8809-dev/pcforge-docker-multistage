"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  loginAction,
  registerAction,
} from "@/actions/auth";

import type { AuthFormState } from "@/actions/auth";

type AuthFormProps = {
  mode: "login" | "register";
  message?: string;
};

const initialState: AuthFormState = {
  error: null,
};

export default function AuthForm({
  mode,
  message,
}: AuthFormProps) {
  const isLogin = mode === "login";

  const [state, formAction, isPending] =
    useActionState(
      isLogin ? loginAction : registerAction,
      initialState,
    );

  const inputStyle =
    "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400";

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-3xl font-black tracking-tight text-cyan-400"
        >
          PCFORGE
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-white">
          {isLogin
            ? "Bienvenido de nuevo"
            : "Crea tu cuenta"}
        </h1>

        <p className="mt-3 text-sm text-slate-400">
          {isLogin
            ? "Inicia sesión para administrar tus compras."
            : "Regístrate para comenzar a construir tu próxima PC."}
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400"
        >
          {message}
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {!isLogin && (
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-300"
            >
              Nombre completo
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Tu nombre completo"
              className={inputStyle}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-300"
          >
            Correo electrónico
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            className={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-300"
          >
            Contraseña
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={
              isLogin
                ? "current-password"
                : "new-password"
            }
            placeholder="••••••••"
            className={inputStyle}
          />
        </div>

        {!isLogin && (
          <div>
            <label
              htmlFor="password_confirmation"
              className="text-sm font-medium text-slate-300"
            >
              Confirmar contraseña
            </label>

            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputStyle}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Procesando..."
            : isLogin
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        {isLogin
          ? "¿Todavía no tienes cuenta?"
          : "¿Ya tienes una cuenta?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-cyan-400 hover:underline"
        >
          {isLogin ? "Regístrate" : "Inicia sesión"}
        </Link>
      </p>

      <div className="mt-6 border-t border-slate-800 pt-6 text-center">
        <Link
          href="/products"
          className="text-sm text-slate-400 hover:text-cyan-400"
        >
          ← Volver al catálogo
        </Link>
      </div>
    </div>
  );
}