"use client";

import { createClient } from "@supabase/supabase-js";
import { getBaseUrl } from "./base-url";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

type SignUpInput = { nombre: string; apellidos: string; email: string; password: string };

export async function signUp({ nombre, apellidos, email, password }: SignUpInput) {
  const emailRedirectTo = `${getBaseUrl()}/login`; // 👈 ahora apunta a /login en tu dominio

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: { nombre, apellidos },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email")) throw new Error("El email no es válido o ya está registrado.");
    if (msg.includes("password")) throw new Error("La contraseña no cumple los requisitos.");
    throw new Error(error.message);
  }

  return { needsEmailConfirm: !data.session, user: data.user ?? null };
}
