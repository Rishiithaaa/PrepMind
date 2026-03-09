"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getStrength = () => {
    if (password.length > 10) return "Strong";
    if (password.length > 6) return "Medium";
    if (password.length > 0) return "Weak";
    return "";
  };

  const handleCreateAccount = async () => {
    setError("");

    const res = await apiFetch(`/users/register`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Signup failed");
      return;
    }

    // ✅ signup success
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-950 text-white overflow-hidden">
      {/* LEFT PANEL */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-700 to-blue-600 items-center justify-center p-10"
      >
        <img
          src="/signup.png"
          alt="PrepMind Illustration"
          className="w-96 drop-shadow-2xl rounded-2xl"
        />
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-1/2 flex items-center justify-center p-10"
      >
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-800">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Join PrepMind
          </h1>

          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded-xl bg-gray-800 border border-gray-700"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded-xl bg-gray-800 border border-gray-700"
            />

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
              />
              {password && (
                <p className="text-sm mt-1 text-gray-400">
                  Password Strength: {getStrength()}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <motion.button
              type="button"
              onClick={handleCreateAccount}
              className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold"
            >
              Create Account
            </motion.button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 hover:underline">
              Login
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
