"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, FileText, Save, Edit3, X, ArrowLeft, Camera, CheckCircle2, TrendingUp, Target, Mic, Youtube, BookOpen, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

type UserType = {
  name: string;
  email: string;
  resume?: string; // Path
  resumeText?: string; // Content
};

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserType>({ name: "", email: "", resume: "" });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching profile via apiFetch...");
    apiFetch(`/users/me`)
      .then((res) => {
        console.log("Profile fetch status:", res.status);
        if (!res.ok) {
          console.log("Profile fetch failed, redirecting to login");
          router.push("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        console.log("Profile data received:", data && data.user ? "User exists" : "User missing");
        if (data && data.user) {
          setUserData(data.user);
          setFormData(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        router.push("/login");
      });

    // Fetch Interview Results
    apiFetch(`/interview/results`)
      .then((res) => res.json())
      .then((data) => setResults(data.results || []))
      .catch((err) => console.error("Results fetch error:", err));
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
        setEditing(false);
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all transform hover:-translate-x-1"
          >
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent italic">
            PREPMIND
          </h1>
        </div>

        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* COVER AREA */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-700 relative">
            <div className="absolute -bottom-12 left-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-gray-800 border-4 border-gray-900 flex items-center justify-center overflow-hidden shadow-xl">
                  <User size={48} className="text-gray-400" />
                </div>
                <button className="absolute bottom-1 right-1 p-1.5 bg-blue-500 rounded-lg shadow-lg border-2 border-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-10 px-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold">{userData.name}</h2>
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <Mail size={14} /> {userData.email}
                </p>
              </div>

              <button
                onClick={editing ? handleSave : () => setEditing(true)}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 ${editing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {editing ? (
                  <><Save size={18} /> {saving ? "Saving..." : "Save Changes"}</>
                ) : (
                  <><Edit3 size={18} /> Edit Profile</>
                )}
              </button>
            </div>

            {/* FORM GRID */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* PERSONAL INFO */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-blue-400">
                  <User size={18} /> Account Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2 block">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      disabled={!editing}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full bg-gray-800/50 border rounded-2xl p-4 outline-none transition-all ${editing ? 'border-blue-500/50 focus:border-blue-500 ring-2 ring-blue-500/10' : 'border-gray-800 cursor-not-allowed text-gray-400'}`}
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2 block">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled={!editing}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full bg-gray-800/50 border rounded-2xl p-4 outline-none transition-all ${editing ? 'border-blue-500/50 focus:border-blue-500 ring-2 ring-blue-500/10' : 'border-gray-800 cursor-not-allowed text-gray-400'}`}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* RESUME PREVIEW */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-purple-400">
                  <FileText size={18} /> Active Resume
                </h3>

                <div className={`p-6 rounded-3xl bg-gray-800/30 border border-gray-800 flex flex-col items-center justify-center text-center h-[180px] relative overflow-hidden group`}>
                  {userData.resume ? (
                    <>
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-3">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="font-bold">Resume Analyzed</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={userData.resume?.split(/[\\/]/).pop() || "Resume File"}>
                        {userData.resume ? userData.resume.split(/[\\/]/).pop() : "Extracted text ready"}
                      </p>
                      <button
                        onClick={() => window.alert("Resume Content:\n\n" + userData.resumeText)}
                        className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 transition-all uppercase tracking-widest"
                      >
                        View Content
                      </button>
                    </>
                  ) : (
                    <>
                      <FileText size={32} className="text-gray-600 mb-3" />
                      <p className="text-gray-500 text-sm">No resume stored.</p>
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-4 text-xs font-bold text-blue-400 uppercase tracking-widest"
                      >
                        Upload from Dashboard
                      </button>
                    </>
                  )}

                  <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* INTERVIEW HISTORY */}
        <div className="mt-8 space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <TrendingUp size={24} className="text-green-500" /> Interview History
          </h3>

          <div className="grid gap-4">
            {results.length > 0 ? (
              results.map((res: any) => (
                <div key={res._id} className="space-y-3">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${expandedId === res._id ? 'bg-gray-800 border-blue-500 shadow-lg' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'}`}
                    onClick={() => setExpandedId(expandedId === res._id ? null : res._id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${expandedId === res._id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-blue-500'}`}>
                        {res.mode === 'resume' ? <FileText size={20} /> : <Target size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{res.role}</p>
                        <p className="text-sm text-gray-500 capitalize">{res.mode} Mode • {new Date(res.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Score</p>
                        <p className={`text-xl font-black ${res.score >= 70 ? 'text-green-500' : 'text-blue-500'}`}>{res.score}%</p>
                      </div>
                      <button className={`p-3 rounded-xl transition-all ${expandedId === res._id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                        <Edit3 className={`${expandedId === res._id ? 'rotate-90' : 'rotate-180'} transition-transform`} size={18} />
                      </button>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {expandedId === res._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-gray-900/30 border border-gray-800 rounded-3xl"
                      >
                        <div className="p-8 space-y-6">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20">
                              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Overall AI Feedback</h4>
                              <p className="text-gray-300 italic">"{res.feedback}"</p>
                            </div>
                            {res.behavioralAnalysis && (
                              <div className="p-5 rounded-2xl bg-gray-800/50 border border-gray-800 grid grid-cols-3 gap-4 text-center">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Confidence</p>
                                  <p className="text-2xl font-black text-white">{res.behavioralAnalysis.confidenceScore}%</p>
                                  <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full" style={{ width: `${res.behavioralAnalysis.confidenceScore}%` }} />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Nervous</p>
                                  <p className="text-2xl font-black text-white">{res.behavioralAnalysis.nervousScore}%</p>
                                  <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                                    <div className="bg-yellow-500 h-full" style={{ width: `${res.behavioralAnalysis.nervousScore}%` }} />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Aggression</p>
                                  <p className="text-2xl font-black text-white">{res.behavioralAnalysis.aggressionScore}%</p>
                                  <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full" style={{ width: `${res.behavioralAnalysis.aggressionScore}%` }} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {res.recommendations && res.recommendations.length > 0 && (
                            <div className="p-5 rounded-2xl bg-blue-600/5 border border-blue-500/10">
                              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BookOpen size={16} /> Recommended Learning
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {res.recommendations.map((rec: any, idx: number) => (
                                  <a
                                    key={idx}
                                    href={rec.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 transition-all group"
                                  >
                                    <div className={rec.type === 'youtube' ? 'text-red-500' : 'text-blue-400'}>
                                      {rec.type === 'youtube' ? <Youtube size={18} /> : <BookOpen size={18} />}
                                    </div>
                                    <p className="text-sm font-medium truncate flex-1 group-hover:text-blue-400 transition-colors">{rec.title}</p>
                                    <ExternalLink size={14} className="text-gray-600" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Question & Answer Breakdown</h4>
                            {res.answers && res.answers.map((ans: any, idx: number) => (
                              <div key={idx} className="p-5 rounded-2xl bg-gray-800/50 border border-gray-800 space-y-3">
                                <p className="font-bold text-blue-300">Q: {ans.question}</p>
                                <div className="pl-4 border-l-2 border-gray-700">
                                  <div className="flex items-center gap-3 mb-2">
                                    <p className="text-sm text-gray-400 underline decoration-gray-600 underline-offset-4 uppercase font-bold tracking-tighter">Your Answer</p>
                                  </div>
                                  <p className="text-gray-300">"{ans.answer || "No response."}"</p>
                                </div>
                                <div className="mt-3 flex items-start gap-3 bg-black/30 p-4 rounded-xl">
                                  <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest">AI Tip (Score: {ans.score})</p>
                                    <p className="text-sm text-gray-400">{ans.feedback}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => router.push(`/interview/results?id=${res._id}`)}
                            className="w-full py-4 rounded-2xl border border-gray-800 hover:bg-gray-800 transition-all font-bold text-gray-400 hover:text-white"
                          >
                            Open Final Report Page →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-gray-800 flex flex-col items-center justify-center text-center">
                <Mic size={40} className="text-gray-700 mb-4" />
                <p className="text-gray-500">No interviews recorded yet.</p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-4 text-sm font-bold text-blue-500 hover:underline"
                >
                  Start your first session →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* EXTRA DETAILS */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-gray-900/40 border border-gray-800">
            <h4 className="font-bold mb-2">Password & Security</h4>
            <p className="text-sm text-gray-500 mb-4">You can update your security settings or change your password here.</p>
            <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-white transition">Update Password →</button>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20">
            <h4 className="font-bold mb-2 flex items-center gap-2">🚀 Pro Tip</h4>
            <p className="text-sm text-gray-400">Complete at least 5 mock interviews to unlock advanced performance insights on your profile!</p>
          </div>
        </div>

      </div>
    </div>
  );
}
