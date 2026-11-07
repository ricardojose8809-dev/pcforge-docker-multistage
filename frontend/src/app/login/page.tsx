import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta PCForge.",
};

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
    logout?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  let message: string | undefined;

  if (params.registered === "1") {
    message =
      "Cuenta creada correctamente. Ahora inicia sesión.";
  } else if (params.logout === "1") {
    message = "Tu sesión ha finalizado.";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <AuthForm mode="login" message={message} />
    </main>
  );
}