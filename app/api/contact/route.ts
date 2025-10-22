// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface ContactBody {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  acceptTerms: boolean;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // o ANON KEY si usas RLS para anon
);

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, message, acceptTerms } =
      (await req.json()) as ContactBody;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!acceptTerms) {
      return NextResponse.json({ error: "You must accept terms" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        message: message.trim(),
        accept_terms: true,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Si no necesitas el id, puedes devolver 204:
    // return new Response(null, { status: 204 });
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
