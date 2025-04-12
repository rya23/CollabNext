"use server";

import { signIn, signOut, auth } from "@/auth";

export async function googleSignIn() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}


export async function getSession() {
  const session = await auth();
  return session;
}
