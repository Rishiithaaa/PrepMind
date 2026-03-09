"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Mic, BarChart3, Briefcase, LogOut, Upload, Target, Laptop, Rocket, FileText, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [interviewMode, setInterviewMode] = useState<"domain" | "resume" | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [isUploading, setIsUploading] = useState(false);
  const [userName, setUserName] = useState("User");
  const [realStats, setRealStats] = useState({ count: 0, domains: 0, avgScore: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch(`/users/me`)
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        console.log("Dashboard profile data received:", data);
        if (data && data.user && data.user.name) {
          setUserName(data.user.name);
        } else {
          console.log("Dashboard: user.name is missing in data:", data);
        }
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        router.push("/login");
      });

    // Fetch Real Stats
    apiFetch(`/interview/results`)
      .then(res => res.json())
      .then(data => {
        if (data && data.results) {
          const count = data.results.length;
          const uniqueDomains = new Set(data.results.map((r: any) => r.context)).size;
          const totalScore = data.results.reduce((acc: number, r: any) => acc + (r.score || 0), 0);
          const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
          setRealStats({ count, domains: uniqueDomains, avgScore });
        }
      })
      .catch(err => console.error("Stats fetch error:", err));
  }, [router]);

  const statsDisplay = [
    { title: "Mock Interviews", value: realStats.count, icon: Mic },
    { title: "Domains Practiced", value: realStats.domains, icon: Briefcase },
    { title: "Confidence Score", value: `${realStats.avgScore}%`, icon: BarChart3 },
  ];

  const domains = [
    { name: "Engineering", icon: Laptop, tagline: "Ace technical interviews with AI guidance" },
    { name: "Medicine", icon: Briefcase, tagline: "Prepare for medical scenarios & questions" },
    { name: "UPSC", icon: Target, tagline: "Master general studies & current affairs" },
    { name: "Law", icon: Briefcase, tagline: "Sharpen legal reasoning and case analysis" },
  ];

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = localStorage.getItem("token");
        const res = await apiFetch(`/users/resume`, {
          method: "POST",
          headers: {}, // Do not set Content-Type, let browser set it for FormData
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          console.log("Resume uploaded and parsed:", data.resumeText);
          setInterviewMode("resume");
          setStep(3); // Go to Select Role
        } else {
          alert(data.message || "Failed to upload resume");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("An error occurred while uploading the resume.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const startInterview = () => {
    if (!selectedRole) return;
    const contextParam = interviewMode === 'domain' ? selectedDomain! : resumeFile?.name || '';
    let url = `/interview?mode=${interviewMode}&context=${encodeURIComponent(contextParam)}&role=${encodeURIComponent(selectedRole)}`;

    if (interviewMode === 'domain') {
      url += `&level=${difficulty}`;
    }

    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white font-sans">

      {/* TOP BAR */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">P</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">PrepMind</h1>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => router.push("/profile")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-all hover:scale-105">
            <User size={18} /> Profile
          </button>
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-all hover:scale-105">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="px-8 py-10 max-w-6xl mx-auto">

        {/* HERO SECTION */}
        <section className="mb-12">
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-extrabold">Welcome back, {userName} 👋</motion.h2>
          <p className="text-gray-400 mt-2 text-lg">Your path to the dream job starts with preparation.</p>
        </section>

        {/* SETUP INTERVIEW */}
        <section className="grid lg:grid-cols-3 gap-10">

          {/* STEPS COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Rocket className="text-blue-500" /> Setup Your Interview
            </h3>

            {/* STEP 1 & 2: RESUME OR DOMAIN */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* UPLOAD RESUME */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`relative overflow-hidden group p-6 rounded-3xl border-2 transition-all cursor-pointer ${interviewMode === 'resume' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'}`}
              >
                <input type="file" onChange={handleResumeUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" />
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${interviewMode === 'resume' ? 'bg-blue-600' : 'bg-gray-800'}`}>
                    {isUploading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Upload size={28} /></motion.div> : <FileText size={28} />}
                  </div>
                  <h4 className="text-xl font-bold">📄 Upload Resume</h4>
                  <p className="text-gray-400 mt-2 text-sm">{resumeFile ? `Selected: ${resumeFile.name}` : "Generate questions from your experience"}</p>
                </div>
                {resumeFile && <CheckCircle2 className="absolute top-4 right-4 text-blue-500" size={20} />}
              </motion.div>

              {/* OR DIVIDER */}
              <div className="md:hidden flex items-center justify-center p-2 text-gray-500 font-bold uppercase tracking-widest text-xs">OR</div>

              {/* SELECT DOMAIN */}
              <div
                className={`p-6 rounded-3xl border-2 transition-all ${interviewMode === 'domain' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 bg-gray-900/50'}`}
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${interviewMode === 'domain' ? 'bg-purple-600' : 'bg-gray-800'}`}>
                    <Target size={28} />
                  </div>
                  <h4 className="text-xl font-bold">🎯 Select Domain</h4>
                  <p className="text-gray-400 mt-2 text-sm">Choose a predefined career path</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {domains.map((d) => (
                    <button
                      key={d.name}
                      onClick={() => { setInterviewMode("domain"); setSelectedDomain(d.name); setStep(3); }}
                      className={`p-3 rounded-xl text-xs font-bold transition-all border ${selectedDomain === d.name ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: SELECT ROLE */}
            <AnimatePresence>
              {(interviewMode) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-8 rounded-3xl bg-gray-900/80 border border-gray-800 shadow-2xl"
                >
                  <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Laptop className="text-green-500" /> 👨💻 Select Target Role
                  </h4>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Developer"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-5 pl-6 outline-none focus:border-blue-500 transition-all text-lg font-medium mb-6"
                    />

                    {/* DIFFICULTY SELECTION - Only for Domain Mode and After Role Entry */}
                    {interviewMode === 'domain' && selectedRole && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-8"
                      >
                        <p className="text-gray-400 text-sm mb-3 ml-1">Select Difficulty Level:</p>
                        <div className="flex gap-4">
                          {["Easy", "Medium", "Hard"].map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setDifficulty(lvl as any)}
                              className={`flex-1 py-3 rounded-xl font-bold transition-all border ${difficulty === lvl
                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {selectedRole && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={startInterview}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 text-lg shadow-xl"
                      >
                        🚀 Start <span className="hidden sm:inline">Interview</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STATS COLUMN */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Your Stats</h3>
            <div className="grid gap-6">
              {statsDisplay.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, x: 5 }}
                  onClick={() => router.push("/profile")}
                  className="p-6 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                  <div className="text-gray-600 group-hover:text-blue-400 transition-all">
                    <Rocket size={20} className="rotate-90" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* TIPS CARD */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
              <h4 className="font-bold mb-2">💡 Quick Tip</h4>
              <p className="text-sm text-gray-300">The more specific your role title, the better Groq AI generates tailored questions for you!</p>
            </div>
          </div>

        </section>
      </main>

    </div>
  );
}

