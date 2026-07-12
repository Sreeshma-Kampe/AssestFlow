"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// lightweight browser JWT signer using Web Crypto for HS256

function base64UrlEncode(str: string) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJwt(payload: Record<string, unknown>, secret: string) {
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const sigB64 = base64UrlEncodeBytes(new Uint8Array(sig));
  return `${data}.${sigB64}`;
}

type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

const mockUsers: MockUser[] = [
  { id: "user-admin", name: "Alex Chen", email: "admin@assetflow.com", password: "password123", role: "ADMIN" },
  { id: "user-manager", name: "Priya Singh", email: "manager@assetflow.com", password: "password123", role: "MANAGER" },
];

async function createMockSession(user: MockUser) {
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = { sub: user.id, role: user.role, email: user.email, iat: now, exp: now + 7 * 24 * 60 * 60 };
  const token = await createJwt(payload, "development-secret");
  document.cookie = `auth_token=${token}; path=/; max-age=604800; samesite=lax`;
  window.localStorage.setItem("mock-auth-user", JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));
}

async function tryMockLogin(email: string, password: string) {
  const user = mockUsers.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);
  if (!user) return false;
  await createMockSession(user);
  return true;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@assetflow.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        try {
          // prefer client-side router, but also force a full navigation to ensure middleware picks up auth cookie
          router.replace("/");
          window.location.assign("/");
        } catch (e) {
          window.location.href = "/";
        }
        return;
      } else {
        // try to surface server message if present
        try {
          const json = await response.json();
          setError(json?.message ?? "Invalid credentials");
        } catch {
          setError("Invalid credentials");
        }
        setLoading(false);
        return;
      }
    } catch {
      // fall through to temporary mock authentication when the backend is unavailable
    }

    const fallback = await tryMockLogin(email, password);
    if (fallback) {
      try {
        router.replace("/");
        window.location.assign("/");
      } catch (e) {
        window.location.href = "/";
      }
      return;
    }

    setError("Unable to sign in. Try admin@assetflow.com with password123.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input className="w-full rounded-md border border-slate-300 p-3" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <input className="w-full rounded-md border border-slate-300 p-3" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Demo access: admin@assetflow.com / password123</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Immediately create a demo session and redirect
                createMockSession(mockUsers[0]);
                router.push("/");
              }}
            >
              Use demo account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
