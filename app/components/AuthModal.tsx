"use client";

import { useState, useEffect } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setMode(initialMode);
    setError("");
    setIsLoading(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (mode === "login") {
      try {
        const res = await signIn("credentials", { redirect: false, email, password });
        if (res?.error) {
          setError(res.error);
        } else {
          await getSession();
          onClose();
        }
      } catch {
        setError("Login failed. Please try again.");
      }
    } else {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Signup failed");
        } else {
          const loginResult = await signIn("credentials", { redirect: false, email, password });
          if (loginResult?.error) {
            setError(loginResult.error);
          } else {
            await getSession();
            onClose();
          }
        }
      } catch {
        setError("An error occurred. Please try again.");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl overflow-hidden bg-gradient-to-br from-background-dark to-black border-2 border-[#D4A744] shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="fd text-xl font-light tracking-wide text-text-light">
            {mode === "login" ? "Welcome " : "Join "}
            <em className="gold-text not-italic font-medium">Dubai Adventures</em>
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex bg-white/5 rounded-lg p-1 mb-8">
            <button
              className={cn(
                "flex-1 py-2 text-sm font-medium tracking-wide uppercase rounded-md transition-all",
                mode === "login" ? "bg-primary text-black shadow-lg" : "text-white/50 hover:text-white/80"
              )}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={cn(
                "flex-1 py-2 text-sm font-medium tracking-wide uppercase rounded-md transition-all",
                mode === "signup" ? "bg-primary text-black shadow-lg" : "text-white/50 hover:text-white/80"
              )}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            {mode === "signup" && (
              <AuthInput
                label="Full Name"
                icon={<User size={16} />}
                type="text"
                value={name}
                onChange={setName}
                placeholder="John Doe"
                required
              />
            )}
            <AuthInput
              label="Email Address"
              icon={<Mail size={16} />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
            <AuthInput
              label="Password"
              icon={<Lock size={16} />}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase bg-gradient-to-r from-primary-light to-primary text-black transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="text-primary-light hover:underline"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthInput({ label, icon, type, value, onChange, placeholder, required }: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
          {icon}
        </div>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
