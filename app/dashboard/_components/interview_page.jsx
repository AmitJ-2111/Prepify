"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

// This should go in app/interview/page.js
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
  const [interviewState, setInterviewState] = useState("prep"); // prep, instructions, active, completed, summary
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
  const [summary, setSummary] = useState("");

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

  // Fetch questions from the Gemini API
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the resume text from localStorage (assuming it was stored there from the previous step)
      const resumeText = localStorage.getItem("resumeText") || "";
      const jobDescription = localStorage.getItem("jobDescription") || "";

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobPosition,
          jobDescription,
          resumeText,
          experience: jobExperience,
          requestType: "generateQuestions",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch questions");
      }

      // Initialize with the requested number of questions or whatever we got back
      setQuestions(data.data.slice(0, numQuestions));
      setAnswers(new Array(Math.min(data.data.length, numQuestions)).fill(""));

      // Also fetch a summary for the intro
      const summaryResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobPosition,
          resumeText,
          requestType: "generateSummary",
        }),
      });

      const summaryData = await summaryResponse.json();

      if (summaryResponse.ok) {
        setSummary(summaryData.data);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to generate interview questions. Please try again.");
    } finally {
      setLoading(false);
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
      getFeedbackOnAnswer();
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
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser.");
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

    recognition.start();
    speechRecognitionRef.current = recognition;
  };

  // Get AI feedback on the current answer
  const getFeedbackOnAnswer = async () => {
    if (!currentAnswer.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentQuestion: questions[currentQuestionIndex].question,
          userResponse: currentAnswer,
          jobPosition,
          requestType: "evaluateAnswer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get feedback");
      }

      setFeedback(data.data);
    } catch (err) {
      console.error("Error getting feedback:", err);
      setError("Failed to analyze your answer. Please try again.");
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
      // End of interview
      setInterviewState("completed");
    }
  };

  // Start the interview
  const startInterview = () => {
    if (interviewState === "prep") {
      setInterviewState("instructions");
    } else if (interviewState === "instructions") {
      if (mediaPermissions.camera && mediaPermissions.microphone) {
        setInterviewState("active");
      } else {
        setError(
          "Camera and microphone permissions are required to start the interview."
        );
      }
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

  // Render the appropriate screen based on interview state
  const renderInterviewContent = () => {
    switch (interviewState) {
      case "prep":
        return (
          <div className="flex flex-col items-center justify-center space-y-6 p-8 max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold">Prepare for Your Interview</h1>
            <p className="text-lg text-muted-foreground">
              You're about to start an AI-powered interview practice session for
              the position of{" "}
              <span className="font-semibold">{jobPosition}</span>.
            </p>
            <p className="text-base text-muted-foreground">
              This session will include {numQuestions} questions tailored to
              your experience level and resume.
            </p>
            <div className="flex flex-col space-y-4 w-full max-w-md mt-4">
              <Button size="lg" onClick={startInterview}>
                Continue to Setup
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </div>
        );

      case "instructions":
        return (
          <div className="flex flex-col space-y-6 p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold">Interview Setup</h1>

            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Interview Summary</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Position:</span> {jobPosition}
                </p>
                <p>
                  <span className="font-medium">Experience Level:</span>{" "}
                  {jobExperience} years
                </p>
                <p>
                  <span className="font-medium">Number of Questions:</span>{" "}
                  {numQuestions}
                </p>
                {summary && (
                  <div className="mt-4">
                    <p className="font-medium">Profile Summary:</p>
                    <p className="text-sm mt-1">{summary}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Device Permissions</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      mediaPermissions.camera ? "bg-green-100" : "bg-red-100"
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
                    <p className="text-sm text-muted-foreground">
                      {mediaPermissions.camera ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
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
                    <p className="text-sm text-muted-foreground">
                      {mediaPermissions.microphone
                        ? "Connected"
                        : "Not connected"}
                    </p>
                  </div>
                </div>
              </div>

              {!mediaPermissions.camera || !mediaPermissions.microphone ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={initializeMedia}
                >
                  Request Permissions
                </Button>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-green-600">
                    All permissions granted
                  </p>
                </div>
              )}
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Video Preview</h2>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
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

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                onClick={startInterview}
                disabled={
                  !mediaPermissions.camera || !mediaPermissions.microphone
                }
              >
                Start Interview
              </Button>
            </div>
          </div>
        );

      case "active":
        return (
          <div className="flex flex-col h-full">
            {/* Top bar with progress */}
            <div className="bg-muted px-4 py-2 flex justify-between items-center">
              <div className="text-sm">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span
                  className={`text-sm font-mono ${
                    timeRemaining < 30 ? "text-red-500" : ""
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 flex-1">
              {/* Left column - video feed */}
              <div className="md:col-span-1 space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className={
                      !isRecording
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-muted"
                    }
                    onClick={toggleRecording}
                  >
                    {isRecording ? <MicOff /> : <Mic />}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextQuestion}
                  >
                    <SkipForward />
                  </Button>
                </div>

                {feedback && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h3 className="font-medium">Answer Feedback</h3>
                    <div className="text-sm">
                      <p className="mb-2">
                        <span className="font-medium">Rating:</span>{" "}
                        {feedback.overallRating}/10
                      </p>

                      {feedback.strengths && feedback.strengths.length > 0 && (
                        <div className="mb-2">
                          <p className="font-medium text-green-600">
                            Strengths:
                          </p>
                          <ul className="list-disc list-inside">
                            {feedback.strengths.map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {feedback.areasForImprovement &&
                        feedback.areasForImprovement.length > 0 && (
                          <div>
                            <p className="font-medium text-amber-600">
                              Areas to Improve:
                            </p>
                            <ul className="list-disc list-inside">
                              {feedback.areasForImprovement.map((area, i) => (
                                <li key={i}>{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {feedback.specificAdvice && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="font-medium">Specific Advice:</p>
                          <p>{feedback.specificAdvice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - question and transcription */}
              <div className="md:col-span-2 space-y-4">
                {questions.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">
                      {questions[currentQuestionIndex].question}
                    </h2>
                    {questions[currentQuestionIndex].skillTested && (
                      <p className="text-sm text-muted-foreground">
                        Skill being tested:{" "}
                        {questions[currentQuestionIndex].skillTested}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-white border rounded-lg p-4 flex-1 min-h-[300px]">
                  <h3 className="font-medium mb-2">
                    Your Answer {isRecording && "(recording...)"}
                  </h3>
                  <div className="h-full overflow-y-auto">
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
                </div>

                {questions.length > 0 &&
                  questions[currentQuestionIndex].idealAnswerElements && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">
                        Key points to consider in your answer:
                      </h3>
                      <ul className="list-disc list-inside">
                        {questions[
                          currentQuestionIndex
                        ].idealAnswerElements.map((element, i) => (
                          <li key={i} className="text-sm">
                            {element}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="flex justify-end">
                  <Button onClick={handleNextQuestion}>
                    {currentQuestionIndex < questions.length - 1
                      ? "Next Question"
                      : "Finish Interview"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "completed":
        return (
          <div className="flex flex-col items-center justify-center space-y-6 p-8 max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold">Interview Completed!</h1>
            <p className="text-lg text-muted-foreground">
              Congratulations on completing your practice interview for{" "}
              {jobPosition}.
            </p>
            <p>
              Your detailed feedback report is being generated and will be
              available soon.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/dashboard")}
              >
                Return to Dashboard
              </Button>
              <Button size="lg" onClick={() => setInterviewState("summary")}>
                View Summary
              </Button>
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Interview Summary</h1>

            <div className="bg-muted p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">Interview Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Position:</span> {jobPosition}
                </p>
                <p>
                  <span className="font-medium">Experience Level:</span>{" "}
                  {jobExperience} years
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Question {index + 1}: {question.question}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Skill being tested: {question.skillTested}
                  </p>

                  <div className="mb-4">
                    <h4 className="font-medium">Your Answer:</h4>
                    <p className="whitespace-pre-wrap bg-muted/30 p-3 rounded mt-1">
                      {answers[index] || "(No answer provided)"}
                    </p>
                  </div>

                  {/* This would show the stored feedback for each question */}
                  {/* In a real implementation, you'd store feedback for each answer */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium">Feedback:</h4>
                    <p className="text-sm mt-1">
                      Feedback for this question would be displayed here.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded flex items-center justify-between mb-4">
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
          <div className="bg-white p-4 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1">{renderInterviewContent()}</div>
    </div>
  );
}
