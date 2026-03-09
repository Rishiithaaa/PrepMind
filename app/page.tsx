"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      
      {/* ------------------ HERO SECTION ------------------ */}
      <section className="pt-24 pb-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Master Your Interviews with  <br></br>
              <span className="text-blue-500">Prep Mind</span>
            </h1>

            <p className="mt-6 text-lg text-gray-300">
              PrepMind is an intelligent, voice-interactive interview simulator that helps 
              students practice, improve, and build confidence — across Engineering, 
              Law, UPSC, Pharmacy and more.
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="/login"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
              >
                Start Practicing
              </a>

              <a
                href="#features"
                className="px-6 py-3 border border-gray-600 hover:bg-gray-800 rounded-xl font-semibold"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <video
  src="/hero.mp4"
  autoPlay
  loop
  muted
  playsInline
  className="rounded-3xl shadow-2xl opacity-90 w-[550px] h-[550px] object-cover"
></video>

          </motion.div>
        </div>
      </section>

      {/* ------------------ FEATURE GRID ------------------ */}
      <section id="features" className="py-24 px-6 bg-gray-950/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-bold mb-16">
            Why <span className="text-blue-400">PrepMind?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            
            {/* 1 - AI Simulation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900 p-8 rounded-2xl border border-gray-700"
            >
              <Image src="/Interview.png" width={70} height={70} alt="AI Interview" />
              <h3 className="text-2xl font-semibold mt-4">AI Interview Simulation</h3>
              <p className="text-gray-400 mt-2">
                Experience real interview pressure with dynamic, context-aware 
                AI-generated questions.
              </p>
            </motion.div>

            {/* 2 - Voice Interaction */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="bg-gray-900 p-8 rounded-2xl border border-gray-700"
            >
              <Image src="/microphn.png" width={70} height={70} alt="Voice Input" />
              <h3 className="text-2xl font-semibold mt-4">Voice-Based Interaction</h3>
              <p className="text-gray-400 mt-2">
                Answer questions using your voice — just like a real interview.
              </p>
            </motion.div>

            {/* 3 - AI Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-900 p-8 rounded-2xl border border-gray-700"
            >
              <Image src="/feedback.png" width={70} height={70} alt="AI Feedback" />
              <h3 className="text-2xl font-semibold mt-4">Instant Smart Feedback</h3>
              <p className="text-gray-400 mt-2">
                AI evaluates clarity, relevance, confidence, and gives personalized improvement tips.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------ DOMAINS SECTION ------------------ */}
      <section id="domains" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Practice for Any Domain</h2>
          <p className="text-gray-400 mb-12">
            PrepMind generates domain-specific interview questions tailored to your field.
          </p>

<video 
  src="/domainblend.mp4"
  autoPlay 
  loop 
  muted 
  playsInline
  className="mx-auto mb-8 rounded-2xl"
  width={500}
  height={300}
/>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {["Engineering", "Law", "UPSC", "Pharmacy", "MBA", "Finance"].map((d) => (
              <span
                key={d}
                className="px-5 py-2 bg-gray-900 border border-gray-700 rounded-full text-gray-300"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ HOW IT WORKS ------------------ */}
      <section className="py-24 px-6 bg-gray-950/60">
        <h2 className="text-center text-4xl font-bold mb-16">How PrepMind Works</h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            
            <h3 className="text-2xl font-semibold mt-4">1. AI Asks Questions</h3>
            <p className="text-gray-400 mt-2">Based on your domain selection.</p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            
            <h3 className="text-2xl font-semibold mt-4">2. You Answer by Voice</h3>
            <p className="text-gray-400 mt-2">
              Practice naturally — just like a real interview.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            
            <h3 className="text-2xl font-semibold mt-4">3. AI Analyzes & Gives Feedback</h3>
            <p className="text-gray-400 mt-2">
              Improve clarity, accuracy, and confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ------------------ FINAL CTA ------------------ */}
      <section className="py-24 text-center px-6">
        <h2 className="text-4xl font-extrabold mb-6">
          Ready to Become Your Best Interview Self?
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          Start practicing with PrepMind and get personalized, real-time feedback powered by AI.
        </p>

        <a
          href="/login"
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-xl font-semibold"
        >
          Get Started →
        </a>
      </section>
    </div>
  );
}
