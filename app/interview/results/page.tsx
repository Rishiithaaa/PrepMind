"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, AlertCircle, ArrowLeft, Trophy, Youtube, BookOpen, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function Results() {
    const router = useRouter();
    const params = useSearchParams();
    const resultId = params.get("id");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await apiFetch(`/interview/results/${resultId}`);
                const data = await res.json();
                if (res.ok) {
                    setResult(data.result);
                }
            } catch (err) {
                console.error("Fetch result error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (resultId) {
            fetchResult();
        }
    }, [resultId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Trophy size={48} className="text-blue-500" />
                </motion.div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
                <h2 className="text-2xl font-bold mb-4">No results found</h2>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="bg-blue-600 px-6 py-2 rounded-lg"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-4 rounded-full bg-blue-600/20 mb-4"
                    >
                        <Trophy size={48} className="text-blue-500" />
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-2">Interview Analysis</h1>
                    <p className="text-gray-400">Role: {result.role} ({result.mode})</p>
                </header>

                <section className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                        <p className="text-gray-400 text-sm mb-1">Overall Technical Score</p>
                        <p className="text-5xl font-extrabold text-blue-500">{result.score}/100</p>
                    </div>
                    <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="font-bold flex items-center gap-2 mb-3">
                            <TrendingUp className="text-green-500" /> AI Summary
                        </h3>
                        <p className="text-gray-300 leading-relaxed">{result.feedback}</p>
                    </div>
                </section>

                {result.recommendations && result.recommendations.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <BookOpen className="text-blue-500" /> Recommended Learning
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.recommendations.map((rec: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={rec.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                                >
                                    <div className={`p-3 rounded-xl ${rec.type === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-gray-800 text-gray-400'
                                        }`}>
                                        {rec.type === 'youtube' ? <Youtube size={24} /> : <BookOpen size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{rec.type}</p>
                                        <h4 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{rec.title}</h4>
                                    </div>
                                    <ExternalLink size={18} className="text-gray-600 group-hover:text-blue-400" />
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {result.behavioralAnalysis && (
                    <section className="mb-12">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle2 className="text-blue-500" /> Behavioral Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-800/30 rounded-2xl p-6">
                                <p className="text-green-400 text-sm font-bold uppercase tracking-wider mb-2">Confidence (Calm/Confident)</p>
                                <p className="text-4xl font-bold">{result.behavioralAnalysis.confidenceScore}%</p>
                                <div className="w-full bg-gray-800 h-2 rounded-full mt-4">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.behavioralAnalysis.confidenceScore}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-900/40 to-black border border-yellow-800/30 rounded-2xl p-6">
                                <p className="text-yellow-400 text-sm font-bold uppercase tracking-wider mb-2">Nervousness Level</p>
                                <p className="text-4xl font-bold">{result.behavioralAnalysis.nervousScore}%</p>
                                <div className="w-full bg-gray-800 h-2 rounded-full mt-4">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${result.behavioralAnalysis.nervousScore}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-red-900/40 to-black border border-red-800/30 rounded-2xl p-6">
                                <p className="text-red-400 text-sm font-bold uppercase tracking-wider mb-2">Aggression/Forcefulness</p>
                                <p className="text-4xl font-bold">{result.behavioralAnalysis.aggressionScore}%</p>
                                <div className="w-full bg-gray-800 h-2 rounded-full mt-4">
                                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${result.behavioralAnalysis.aggressionScore}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <h3 className="text-2xl font-bold mb-6">Performance analysis</h3>
                <div className="space-y-6">
                    {result.answers.map((ans: any, i: number) => {
                        // Emotion color mapping helper
                        const getEmotionStyles = (emotion: string) => {
                            const e = emotion?.toLowerCase();
                            switch (e) {
                                case 'happy': return 'bg-green-500/20 text-green-400 border-green-500/30';
                                case 'neutral': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                                case 'angry': return 'bg-red-600/20 text-red-500 border-red-500/30';
                                case 'fear': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
                                case 'sad': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                                case 'disgust': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
                                case 'surprise': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
                                default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                            }
                        };

                        return (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
                            >
                                <h4 className="font-bold text-lg mb-4 text-blue-400">Q{i + 1}: {ans.question}</h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Answer</p>
                                        </div>
                                        <p className="text-gray-300 italic">"{ans.answer || "No response recorded."}"</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Feedback</p>
                                            <p className={`text-sm font-bold ${ans.score >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>Score: {ans.score}</p>
                                        </div>
                                        <p className="text-gray-300">{ans.feedback}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
