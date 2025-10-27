// components/login-form.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type LoginFormProps = React.ComponentProps<"form"> & {
  checkEmail?: boolean;
  nextPath?: string; // ⬅️ nueva prop
};

export function LoginForm({ className, checkEmail = false, nextPath, ...props }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      if (!email || !password) {
        setErrorMsg("Introduce tu email y contraseña.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(/invalid login/i.test(error.message) ? "Email o contraseña inválidos." : error.message);
        return;
      }

      // ⬇️ si nos pasaron ?next=..., respétalo; si no, /dashboard
      router.replace(nextPath || "/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al iniciar sesión.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        {checkEmail && (
          <FieldDescription className="text-green-600 text-sm">
            Te enviamos un email de verificación. Confirma tu cuenta y vuelve a iniciar sesión aquí.
          </FieldDescription>
        )}
        {errorMsg && <FieldDescription className="text-red-600 text-sm">{errorMsg}</FieldDescription>}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" autoComplete="email" required />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a href="/reset-password" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="underline underline-offset-4">Sign up</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
