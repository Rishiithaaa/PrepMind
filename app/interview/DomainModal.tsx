"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const domainPlaceholders: Record<string, string> = {
  Engineering: "e.g. Software Engineer, Data Analyst",
  Medicine: "e.g. MBBS Doctor, Surgeon",
  UPSC: "e.g. IAS Officer, IPS Officer",
  Law: "e.g. Corporate Lawyer, Public Prosecutor",
  "Resume Based": "e.g. Your Current Role",
};

const allDomains = Object.keys(domainPlaceholders);

export default function DomainModal({
  domain,
  onClose,
}: {
  domain?: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState(domain || "");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Basic");

  const handleStart = () => {
    if (!selectedDomain || !role.trim()) return;
    router.push(
      `/interview?domain=${encodeURIComponent(selectedDomain)}&role=${encodeURIComponent(
        role
      )}&level=${encodeURIComponent(level)}`
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md relative"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2">
          {domain ? `${domain} Interview` : "Start New Interview"}
        </h2>
        <p className="text-gray-400 mb-6">
          {domain
            ? "Enter the role you want to practice for"
            : "Select domain, role, and level to start"}
        </p>

        {/* Domain Selector if no domain is preselected */}
        {!domain && (
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none mb-4"
          >
            <option value="">Select Domain</option>
            {allDomains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}

        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder={
            selectedDomain ? domainPlaceholders[selectedDomain] : "Enter role"
          }
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none mb-4"
        />

        {/* Difficulty Level Dropdown */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none mb-6"
        >
          <option value="Basic">Basic</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg font-semibold"
        >
          Start Interview
        </button>
      </motion.div>
    </div>
  );
}
