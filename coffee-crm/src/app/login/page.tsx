import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Coffee } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // Already logged in? Go straight to the app.
  if (await getCurrentUser()) redirect("/dashboard");

  const { next } = await searchParams;
  const settings = await db.setting.findUnique({ where: { id: 1 }, select: { businessName: true } });

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-coffee-900 to-coffee-700 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 rounded-full bg-coffee-100 p-3 text-coffee-800">
            <Coffee className="size-7" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold">{settings?.businessName ?? "Coffee CRM"}</h1>
          <p className="text-sm text-stone-500">Sign in to continue</p>
        </div>
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
    </main>
  );
}
