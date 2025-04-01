// app/interview/page.jsx

"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Pause,
  SkipForward,
  Clock,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  User,
} from "lucide-react";

export default function InterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // Get interview parameters from URL query params
  const jobPosition = searchParams.get("jobPosition") || "";
  const jobExperience = searchParams.get("jobExperience") || "";
  const numQuestions = parseInt(searchParams.get("numQuestions") || "5", 10);

  // Interview state
  const [interviewState, setInterviewState] = useState("prep"); // prep, instructions, active, completed, summary, report
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes per question
  const [mediaPermissions, setMediaPermissions] = useState({
    camera: false,
    microphone: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [summary, setSummary] = useState("");
  const [overallScore, setOverallScore] = useState(0);

  // Initialize camera and microphone
  useEffect(() => {
    if (interviewState === "instructions") {
      initializeMedia();
    }

    // Cleanup function to stop everything when component unmounts
    return () => {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }

      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [interviewState]);

  // Initialize questions when moving to active state
  useEffect(() => {
    if (interviewState === "active" && questions.length === 0) {
      fetchQuestions();
    }
  }, [interviewState]);

  // Timer logic for each question
  useEffect(() => {
    let interval;

    if (interviewState === "active" && isRecording && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Auto-move to next question when time expires
      handleNextQuestion();
    }

    return () => clearInterval(interval);
  }, [interviewState, isRecording, timeRemaining]);

  // Fetch questions from the Gemini API
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPosition,
          jobDescription: localStorage.getItem("jobDescription") || "",
          resumeText: localStorage.getItem("resumeText") || "",
          experience: jobExperience,
          numQuestions,
          requestType: "generateQuestions",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate interview questions");
      }

      const data = await response.json();
      setQuestions(data.data || []);
      setAnswers(new Array(data.data?.length || 0).fill(""));
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to generate interview questions.");
    } finally {
      setLoading(false);
    }
  };

  // Set mock questions for testing or fallback
  const setMockQuestions = () => {
    const mockQuestions = [
      {
        question: `Tell me about your experience as a ${jobPosition}.`,
        skillTested: "Professional Background",
        idealAnswerElements: [
          "Highlight relevant projects",
          "Mention specific technologies used",
          "Quantify achievements with metrics",
          "Show progression in responsibilities",
        ],
      },
      {
        question:
          "Describe a challenging problem you solved in a previous role.",
        skillTested: "Problem Solving",
        idealAnswerElements: [
          "Clearly define the problem",
          "Explain your approach and methodology",
          "Describe the solution implemented",
          "Share the impact or results",
        ],
      },
      {
        question: "How do you handle tight deadlines and pressure?",
        skillTested: "Stress Management",
        idealAnswerElements: [
          "Provide a specific example",
          "Show prioritization skills",
          "Demonstrate communication approach",
          "Explain how you maintained quality",
        ],
      },
      {
        question: "Describe your approach to learning new technologies.",
        skillTested: "Adaptability & Learning",
        idealAnswerElements: [
          "Show enthusiasm for continuous learning",
          "Mention specific learning methods",
          "Give example of quickly mastering a new skill",
          "Explain how you apply new knowledge",
        ],
      },
      {
        question: "Where do you see yourself professionally in 5 years?",
        skillTested: "Career Planning",
        idealAnswerElements: [
          "Show ambition balanced with realism",
          "Align answer with the company/role trajectory",
          "Demonstrate commitment to growth",
          "Express specific goals and milestones",
        ],
      },
      {
        question: "How do you handle disagreements with team members?",
        skillTested: "Conflict Resolution",
        idealAnswerElements: [
          "Emphasize respectful communication",
          "Show willingness to understand other perspectives",
          "Describe a systematic approach to resolution",
          "Provide a concrete example",
        ],
      },
    ];

    setQuestions(mockQuestions.slice(0, numQuestions));
    setAnswers(
      new Array(Math.min(mockQuestions.length, numQuestions)).fill("")
    );

    // Mock summary
    setSummary(
      `Based on your profile, you have ${jobExperience} years of experience in ${jobPosition} roles, with a focus on software development and team collaboration. Your background shows progressive responsibility and technical proficiency which aligns well with the requirements for this position.`
    );
  };

  // Request camera and microphone permissions
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setMediaPermissions({
        camera: true,
        microphone: true,
      });
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError(
        "Could not access camera or microphone. Please check your permissions."
      );
      setMediaPermissions({
        camera: false,
        microphone: false,
      });
    }
  };

  // Start/stop recording of current answer
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecording(false);

      // Save current answer to the answers array
      setAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex] = currentAnswer;
        return newAnswers;
      });

      // Get feedback on the answer
      getFeedback();
    } else {
      // Start recording
      startSpeechRecognition();
      setIsRecording(true);
      setTimeRemaining(120); // Reset timer to 2 minutes
      setFeedback(null); // Clear previous feedback
    }
  };

  // Initialize speech recognition
  const startSpeechRecognition = () => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }

      setCurrentAnswer(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError("Speech recognition error: " + event.error);
    };

    try {
      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError("Failed to start speech recognition. Please try again.");
    }
  };

  // Get AI feedback on the current answer
  const getFeedback = async () => {
    if (!currentAnswer.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentQuestion: questions[currentQuestionIndex]?.question,
          userResponse: currentAnswer,
          jobPosition,
          requestType: "evaluateAnswer",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get feedback");
      }

      const data = await response.json();
      setFeedback(data.data);
      setAllFeedback((prev) => {
        const newFeedback = [...prev];
        newFeedback[currentQuestionIndex] = data.data;
        return newFeedback;
      });
    } catch (err) {
      console.error("Error getting feedback:", err);
      setError("Failed to analyze your answer.");
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock feedback for testing without API
  const getMockFeedback = () => {
    if (!currentAnswer.trim()) return;

    setLoading(true);

    // Generate random score between 6-9
    const randomScore = Math.floor(Math.random() * 4) + 6;

    // Simulate API delay
    setTimeout(() => {
      const mockFeedback = {
        overallRating: randomScore,
        strengths: [
          "Good structure to your answer",
          "Provided concrete examples",
          "Demonstrated relevant technical knowledge",
        ],
        areasForImprovement: [
          "Could be more concise in certain areas",
          "Consider quantifying your achievements more",
        ],
        specificAdvice:
          "Try using the STAR method (Situation, Task, Action, Result) more explicitly in your responses to showcase your problem-solving approach and impact.",
      };

      setFeedback(mockFeedback);

      // Add to all feedback for final report
      setAllFeedback((prev) => {
        const newFeedback = [...prev];
        newFeedback[currentQuestionIndex] = mockFeedback;
        return newFeedback;
      });

      setLoading(false);
    }, 1500);
  };

  // Save interview data to the database
  const saveInterviewData = async () => {
    try {
      setLoading(true);

      // Prepare data to submit
      const interviewData = {
        jobPosition,
        jobDescription: localStorage.getItem("jobDescription") || "",
        jobExperience,
        questions,
        answers,
        feedback: allFeedback,
      };

      // Call our API endpoint
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) {
        throw new Error("Failed to save interview");
      }

      const result = await response.json();
      console.log("Interview saved with ID:", result.mockId);

      // Optional: Store the mockId in localStorage for redirection or reference
      localStorage.setItem("lastInterviewId", result.mockId);
    } catch (err) {
      console.error("Error saving interview:", err);
      setError("Failed to save interview results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Move to the next question
  const handleNextQuestion = () => {
    // Save the current answer first
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = currentAnswer;
      return newAnswers;
    });

    // If there's no feedback (user skipped without recording), generate feedback
    if (!allFeedback[currentQuestionIndex] && currentAnswer.trim()) {
      getFeedback();
    }

    // Stop recording if active
    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecording(false);
    }

    // Clear current answer and feedback
    setCurrentAnswer("");
    setFeedback(null);

    // Move to next question or end interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeRemaining(120); // Reset timer
    } else {
      // End of interview - calculate overall score
      const scores = allFeedback
        .filter((f) => f)
        .map((f) => parseInt(f.overallRating));
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 7;
      setOverallScore(avgScore);

      // Save the interview data to the database
      saveInterviewData();

      // End of interview
      setInterviewState("completed");
    }
  };

  // Format seconds into MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Interview for {jobPosition}</h1>

          {interviewState === "active" && (
            <div className="ml-auto flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span
                className={`text-sm font-mono ${
                  timeRemaining < 30 ? "text-red-500" : ""
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md mx-auto my-4 max-w-4xl flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700">
            &times;
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
            <p>Analyzing your response...</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {interviewState === "prep" && (
          <div className="max-w-3xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Prepare for Your Interview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-lg">
                  You're about to start an AI-powered interview practice session
                  for the position of{" "}
                  <span className="font-semibold">{jobPosition}</span>.
                </p>

                <div className="bg-slate-50 p-6 rounded-lg mb-6">
                  <h3 className="font-medium mb-3 text-lg">
                    Interview Details
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <span className="font-medium">Position:</span>{" "}
                      {jobPosition}
                    </li>
                    <li>
                      <span className="font-medium">Experience Level:</span>{" "}
                      {jobExperience} years
                    </li>
                    <li>
                      <span className="font-medium">Number of Questions:</span>{" "}
                      {numQuestions}
                    </li>
                  </ul>
                </div>

                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-lg">Before you begin:</h3>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Mic className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Check your microphone</p>
                      <p className="text-muted-foreground">
                        We'll need access to your microphone to convert your
                        speech to text.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Video className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Check your camera</p>
                      <p className="text-muted-foreground">
                        We'll need access to your camera to simulate a real
                        interview.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Allow enough time</p>
                      <p className="text-muted-foreground">
                        You'll need about {numQuestions * 5} minutes to complete
                        this interview.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setInterviewState("instructions")}
                  >
                    Continue to Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {interviewState === "instructions" && (
          <div className="max-w-3xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Interview Setup</CardTitle>
                <CardDescription>
                  Configure your camera and microphone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h3 className="font-medium mb-3 text-lg">
                      Interview Summary
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Position:</span>{" "}
                        {jobPosition}
                      </p>
                      <p>
                        <span className="font-medium">Experience Level:</span>{" "}
                        {jobExperience} years
                      </p>
                      <p>
                        <span className="font-medium">
                          Number of Questions:
                        </span>{" "}
                        {numQuestions}
                      </p>
                      {summary && (
                        <div className="mt-4 p-4 bg-white rounded-lg">
                          <p className="font-medium">Profile Summary:</p>
                          <p className="text-muted-foreground mt-1">
                            {summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h3 className="font-medium mb-3 text-lg">
                      Device Permissions
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-full ${
                            mediaPermissions.camera
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          <Video
                            className={`h-6 w-6 ${
                              mediaPermissions.camera
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">Camera</p>
                          <p className="text-muted-foreground">
                            {mediaPermissions.camera
                              ? "Connected"
                              : "Not connected"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-full ${
                            mediaPermissions.microphone
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          <Mic
                            className={`h-6 w-6 ${
                              mediaPermissions.microphone
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">Microphone</p>
                          <p className="text-muted-foreground">
                            {mediaPermissions.microphone
                              ? "Connected"
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(!mediaPermissions.camera ||
                      !mediaPermissions.microphone) && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={initializeMedia}
                      >
                        Request Permissions
                      </Button>
                    )}
                  </div>

                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h3 className="font-medium mb-3 text-lg">Video Preview</h3>
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {!mediaPermissions.camera && (
                        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/70">
                          <p>Camera not available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setInterviewState("active")}
                      disabled={
                        !mediaPermissions.camera || !mediaPermissions.microphone
                      }
                    >
                      Start Interview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {interviewState === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - video feed */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="relative aspect-video bg-gray-900 rounded-lg mb-4 overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted={!isRecording} // Only mute when not recording
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Question {currentQuestionIndex + 1} of{" "}
                        {questions.length}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span
                          className={timeRemaining < 30 ? "text-red-500" : ""}
                        >
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            ((currentQuestionIndex + 1) / questions.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-center gap-3 mt-4">
                      <Button
                        variant={isRecording ? "outline" : "default"}
                        size="icon"
                        className={
                          !isRecording
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : ""
                        }
                        onClick={toggleRecording}
                      >
                        {isRecording ? <MicOff /> : <Mic />}
                      </Button>

                      <Button variant="outline" onClick={handleNextQuestion}>
                        {currentQuestionIndex < questions.length - 1
                          ? "Next Question"
                          : "Finish Interview"}
                      </Button>
                    </div>
                  </div>

                  {feedback && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-medium mb-2">Answer Feedback</h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Rating:</span>
                          <div className="px-2 py-1 bg-white rounded text-sm">
                            {feedback.overallRating}/10
                          </div>
                        </div>

                        {feedback.strengths &&
                          feedback.strengths.length > 0 && (
                            <div>
                              <p className="font-medium text-green-600 text-sm">
                                Strengths:
                              </p>
                              <ul className="mt-1 space-y-1">
                                {feedback.strengths.map((strength, i) => (
                                  <li
                                    key={i}
                                    className="text-sm flex items-start gap-2"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {feedback.areasForImprovement &&
                          feedback.areasForImprovement.length > 0 && (
                            <div>
                              <p className="font-medium text-amber-600 text-sm">
                                Areas to Improve:
                              </p>
                              <ul className="mt-1 space-y-1">
                                {feedback.areasForImprovement.map((area, i) => (
                                  <li
                                    key={i}
                                    className="text-sm flex items-start gap-2"
                                  >
                                    <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span>{area}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {feedback.specificAdvice && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="font-medium text-sm">
                              Specific Advice:
                            </p>
                            <p className="text-sm mt-1 text-muted-foreground">
                              {feedback.specificAdvice}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column - question and transcription */}
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>
                    {questions.length > 0
                      ? questions[currentQuestionIndex].question
                      : "Loading question..."}
                  </CardTitle>
                  {questions.length > 0 &&
                    questions[currentQuestionIndex].skillTested && (
                      <CardDescription>
                        Skill being tested:{" "}
                        {questions[currentQuestionIndex].skillTested}
                      </CardDescription>
                    )}
                </CardHeader>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">
                    Your Answer {isRecording && "(recording...)"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[200px] max-h-[300px] overflow-y-auto rounded-lg bg-slate-50 p-4">
                    {currentAnswer ? (
                      <p className="whitespace-pre-wrap">{currentAnswer}</p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        {isRecording
                          ? "Speak now - your answer will appear here..."
                          : "Click the microphone button to start recording your answer."}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {questions.length > 0 &&
                questions[currentQuestionIndex].idealAnswerElements && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Key points to consider
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {questions[
                          currentQuestionIndex
                        ].idealAnswerElements.map((element, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                              <CheckCircle className="h-3 w-3 text-blue-600" />
                            </div>
                            <span>{element}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
            </div>
          </div>
        )}

        {interviewState === "completed" && (
          <div className="max-w-3xl mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle>Interview Completed!</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-8">
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Great job!</h2>
                  <p className="text-muted-foreground">
                    You've completed your practice interview for the{" "}
                    {jobPosition} position.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-lg mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{overallScore}</div>
                        <div className="text-xs text-muted-foreground">
                          Overall Score
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-center">
                    Your detailed feedback report is now available.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                  <Button size="lg" onClick={() => setInterviewState("report")}>
                    View Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {interviewState === "report" && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Interview Report</CardTitle>
                  <CardDescription>
                    {jobPosition} • {new Date().toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center justify-center rounded-full w-16 h-16 bg-slate-50">
                  <span className="text-2xl font-bold">{overallScore}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  <h3 className="font-medium">Interview Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    You completed a {numQuestions}-question interview for the{" "}
                    {jobPosition} position. Based on your responses, here is a
                    summary of your performance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium mb-2">Communication</h4>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(overallScore - 1) * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Your communication skills are{" "}
                      {overallScore > 7 ? "strong" : "developing"}.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium mb-2">Technical Knowledge</h4>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(overallScore + 1) * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Your technical knowledge is{" "}
                      {overallScore > 6 ? "well-demonstrated" : "adequate"}.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium mb-2">Problem Solving</h4>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${overallScore * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Your problem-solving approach is{" "}
                      {overallScore > 8 ? "excellent" : "good"}.
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-4">Key Strengths</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>
                        You provided specific examples to support your answers
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>
                        Your answers were well-structured and easy to follow
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>
                        You demonstrated relevant technical knowledge for the
                        role
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h3 className="font-medium mb-4">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <ChevronRight className="h-5 w-5 text-amber-500 mt-0.5" />
                      <span>
                        Try to be more concise in your answers while maintaining
                        completeness
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ChevronRight className="h-5 w-5 text-amber-500 mt-0.5" />
                      <span>
                        Quantify your achievements more explicitly with metrics
                        and results
                      </span>
                    </li>
                  </ul>
                </div>

                <Separator className="mb-6" />

                <h3 className="font-medium mb-4">Detailed Question Analysis</h3>

                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="p-4 bg-slate-50 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              Question {index + 1}
                            </h4>
                            <p className="mt-1">{question.question}</p>
                          </div>
                          {allFeedback[index] && (
                            <div className="px-2 py-1 bg-white rounded border text-sm">
                              {allFeedback[index].overallRating}/10
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <h5 className="text-sm font-medium mb-2">
                          Your Answer:
                        </h5>
                        <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded">
                          {answers[index] || "(No answer provided)"}
                        </p>

                        {allFeedback[index] && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">
                              Feedback:
                            </h5>
                            <div className="text-sm space-y-2">
                              {allFeedback[index].strengths &&
                                allFeedback[index].strengths.length > 0 && (
                                  <div>
                                    <p className="text-green-600">Strengths:</p>
                                    <ul className="ml-5 list-disc text-muted-foreground">
                                      {allFeedback[index].strengths.map(
                                        (strength, i) => (
                                          <li key={i}>{strength}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {allFeedback[index].areasForImprovement &&
                                allFeedback[index].areasForImprovement.length >
                                  0 && (
                                  <div>
                                    <p className="text-amber-600">
                                      Areas to Improve:
                                    </p>
                                    <ul className="ml-5 list-disc text-muted-foreground">
                                      {allFeedback[
                                        index
                                      ].areasForImprovement.map((area, i) => (
                                        <li key={i}>{area}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              {allFeedback[index].specificAdvice && (
                                <div className="pt-2 border-t">
                                  <p className="font-medium">Advice:</p>
                                  <p className="text-muted-foreground">
                                    {allFeedback[index].specificAdvice}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-8">
                  <Button onClick={() => router.push("/dashboard")}>
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
