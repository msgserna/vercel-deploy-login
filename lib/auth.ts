"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

type SignUpInput = {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
};

/**
 * Crea el usuario en Supabase Auth.
 * - Guarda nombre/apellidos en user_metadata
 * - Redirige el enlace del email a /login (si confirmación está activa)
 * - Devuelve needsEmailConfirm para que el caller decida la navegación
 */
export async function signUp({ nombre, apellidos, email, password }: SignUpInput) {
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,            // tras confirmar, volverá a /login
      data: { nombre, apellidos } // metadatos útiles
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email")) throw new Error("El email no es válido o ya está registrado.");
    if (msg.includes("password")) throw new Error("La contraseña no cumple los requisitos.");
    throw new Error(error.message);
  }

  return {
    needsEmailConfirm: !data.session, // si tienes “Confirm email” ON, será true
    user: data.user ?? null,
  };
}