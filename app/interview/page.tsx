"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

// Helper to convert WebM blob to WAV blob
async function convertWebMToWav(webmBlob: Blob): Promise<Blob> {
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 22050 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i, sample, pos = 0, offset = 0;

  const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
  const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
  const writeString = (s: string) => { for (let i = 0; i < s.length; i++) { view.setUint8(pos, s.charCodeAt(i)); pos++; } };

  writeString('RIFF'); setUint32(length - 8); writeString('WAVE'); writeString('fmt ');
  setUint32(16); setUint16(1); setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate); setUint32(audioBuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2); setUint16(16); writeString('data'); setUint32(length - pos - 4);

  for (i = 0; i < audioBuffer.numberOfChannels; i++) channels.push(audioBuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true); pos += 2;
    }
    offset++;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

export default function InterviewPage() {
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isAnalyzingRef = useRef(false);
  const pendingAnalysesRef = useRef(0);

  const router = useRouter();
  const params = useSearchParams();

  const mode = params.get("mode") ?? "domain";
  const context = params.get("context") ?? "";
  const role = params.get("role") ?? "";
  const level = params.get("level") ?? "Medium";

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState("Preparing your interview...");
  const [answers, setAnswers] = useState<{ question: string; answer: string; emotion?: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [timer, setTimer] = useState(10 * 60);
  const [interviewRunning, setInterviewRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // FETCH QUESTIONS ON LOAD
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await apiFetch(`/interview/generate`, {
          method: "POST",
          body: JSON.stringify({
            context: context,
            role: role,
            type: mode,
            level: level
          }),
        });

        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setQuestion(data.questions[0]);
        } else {
          setQuestion("Tell me about yourself and your experience.");
        }
      } catch (err) {
        console.error("Load questions error:", err);
        setQuestion("Let's start. Tell me about yourself.");
      } finally {
        setIsLoading(false);
      }
    };

    if (mode && context) {
      loadQuestions();
    }
  }, [mode, context, role]);

  // TIMER
  useEffect(() => {
    if (!interviewRunning) return;
    if (timer <= 0) {
      stopInterview(answers);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [interviewRunning, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // INIT CAMERA & MICROPHONE
  const initCameraMic = async () => {
    try {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setAudioOn(true);
      setInterviewRunning(true);

      speakQuestion(question);
    } catch (err) {
      console.error("Camera/Mic error:", err);
      alert("Cannot access camera/microphone. Please allow permissions.");
    }
  };

  const toggleAudio = () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setAudioOn(track.enabled);
  };

  // SPEECH RECOGNITION
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setCurrentAnswer(text);
    };

    recognitionRef.current = recognition;
  }, []);

  const speakQuestion = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // MOVE TO NEXT QUESTION
  const nextQuestion = async () => {
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < questions.length) {
      const q = questions[nextIdx];
      setQuestion(q);
      setCurrentQuestionIndex(nextIdx);
      setCurrentAnswer("");
      speakQuestion(q);
    } else {
      setQuestion("Interview Completed! Analyzing your results...");
      speakQuestion("Interview Completed! Analyzing your results...");

      // We pass the current answers state. 
      // Note: setAnswers is async, so if we just updated it, we might need the functional update or captured value.
      setAnswers((prev) => {
        setTimeout(() => stopInterview(prev), 2000);
        return prev;
      });
    }
  };

  // RECORD / STOP ANSWERING
  const handleRecord = async () => {
    if (!interviewRunning || !sessionId) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (!isRecording) {
      setCurrentAnswer("");
      const localChunks: Blob[] = [];

      // Start STT
      try {
        recognition.start();
      } catch (e) {
        console.warn("Speech recognition already started:", e);
      }

      // Start Audio Recording for Emotion Analysis
      if (streamRef.current) {
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            localChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          pendingAnalysesRef.current++;
          let detectedEmotion = "neutral";

          try {
            const audioBlob = new Blob(localChunks, { type: 'audio/webm' });

            if (audioBlob.size < 5) {
              console.warn("Audio blob too small, treating as silence");
              detectedEmotion = "silence";
            } else {
              const wavBlob = await convertWebMToWav(audioBlob);

              const formData = new FormData();
              formData.append("audio", wavBlob, `answer_${currentQuestionIndex}.wav`);

              console.log("Sending WAV chunk size:", wavBlob.size);

              const res = await apiFetch("/interview/analyze-emotion", {
                method: "POST",
                body: formData,
              });
              const data = await res.json();
              detectedEmotion = data.emotion || "silence";
              console.log("Detected Emotion for Answer:", detectedEmotion);
            }
          } catch (err) {
            console.error("Emotion analysis failed:", err);
            detectedEmotion = "silence";
          } finally {
            pendingAnalysesRef.current--;
          }

          setAnswers((prev) => {
            const newAnswers = [...prev];
            // Find the answer with this question to update its emotion
            const existingIdx = newAnswers.findIndex(a => a.question === question);
            if (existingIdx >= 0) {
              newAnswers[existingIdx].emotion = detectedEmotion;
            } else {
              // Fallback (rarely needed if stop path runs as expected)
              newAnswers.push({
                question,
                answer: currentAnswer, // Still stale but this is a fallback
                emotion: detectedEmotion
              });
            }
            return newAnswers;
          });
        };

        mediaRecorder.start(1000); // collect chunks every second
      }

      setIsRecording(true);
    } else {
      // Stop STT
      try {
        recognition.stop();
      } catch (e) {
        console.warn("Speech recognition already stopped:", e);
      }

      // Stop Audio Recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop(); // This triggers onstop above
      }

      setIsRecording(false);

      // We already start the next question immediately to not block UI
      setAnswers((prev) => [...prev, {
        question,
        answer: currentAnswer,
        emotion: "processing..." // Temporary state
      }]);

      await nextQuestion();
    }
  };


  // STOP INTERVIEW
  const stopInterview = async (finalAnswers?: { question: string; answer: string; emotion?: string }[]) => {
    if (isAnalyzingRef.current) return;
    isAnalyzingRef.current = true;
    setIsAnalyzing(true);
    setInterviewRunning(false);
    window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());

    setQuestion("Analyzing your interview performance...");
    speakQuestion("Analyzing your interview performance...");

    // Wait for pending emotion analyses (max 5 seconds)
    let waitAttempts = 0;
    while (pendingAnalysesRef.current > 0 && waitAttempts < 10) {
      console.log(`Waiting for ${pendingAnalysesRef.current} pending analyses...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      waitAttempts++;
    }

    try {
      // Use provided finalAnswers or fallback to state
      const answersToSubmit = finalAnswers || answers;
      console.log("Submitting interview for analysis. Answers count:", answersToSubmit.length);

      const res = await apiFetch(`/interview/analyze`, {
        method: "POST",
        body: JSON.stringify({ answers: answersToSubmit, mode, context, role }),
      });

      const data = await res.json();
      if (res.ok) {
        // Redirect to a results page
        router.push(`/interview/results?id=${data.resultId}`);
        return;
      } else {
        console.error("Backend Analysis Failed:", data.message);
        alert(`Analysis failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("A network error occurred while analyzing your interview.");
    } finally {
      setIsAnalyzing(false);
      isAnalyzingRef.current = false;
    }

    router.push("/dashboard");
  };

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-br from-black via-blue-950 to-black text-white">
      <div className="flex flex-1 relative flex-col items-center justify-center p-10">

        {/* TOP RIGHT CONTROLS */}
        <div className="absolute top-6 right-6 flex gap-4">
          {interviewRunning && (
            <button onClick={toggleAudio} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg shadow-lg">
              {audioOn ? "Mute Mic" : "Unmute Mic"}
            </button>
          )}
          {!interviewRunning && (
            <button onClick={initCameraMic} className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow-lg">
              Start Interview
            </button>
          )}
          <button onClick={() => stopInterview()} disabled={isAnalyzing} className={`px-5 py-2 ${isAnalyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} rounded-lg shadow-lg`}>
            {isAnalyzing ? "Analyzing..." : "Stop Interview"}
          </button>
        </div>

        {/* MAIN VISUAL */}
        <div className={`w-72 h-72 rounded-full flex items-center justify-center text-[120px] transition-all duration-300 shadow-2xl ${isSpeaking ? "bg-blue-600 animate-pulse scale-110 border-4 border-blue-400" : "bg-blue-900 border-4 border-blue-800"}`}>
          🤖
        </div>

        {/* QUESTION TEXT */}
        <p className="mt-10 text-2xl font-medium text-center text-blue-100 max-w-2xl px-6">
          {question}
        </p>

        {/* TIMER */}
        {interviewRunning && (
          <p className="mt-4 text-md font-mono text-blue-400">Time Left: {formatTime(timer)}</p>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div className="w-full bg-black border-t border-blue-900 px-10 py-4 h-[110px] flex items-center justify-between">
        <div className="max-w-3xl">
          <p className="text-sm text-blue-400">Your Answer</p>
          <p className="text-white text-lg min-h-[40px]">{currentAnswer || "Waiting to start..."}</p>
        </div>

        <button
          onClick={handleRecord}
          disabled={!interviewRunning || isSpeaking}
          className={`px-8 py-3 rounded-xl text-lg transition-all duration-300 ${!interviewRunning || isSpeaking
            ? "bg-gray-600 cursor-not-allowed"
            : isRecording
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isRecording ? "Stop Answering" : isSpeaking ? "AI is Speaking..." : "Start Answering"}
        </button>
      </div>
    </div>
  );
}
