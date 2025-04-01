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

import { eq } from "drizzle-orm";
import { useParams } from "next/navigation";
import { db } from "utils/db";
import { MockInterview } from "utils/schema";
import { Mic, MicOff, Video, Clock, ArrowLeft } from "lucide-react";
import QuestionsSection from "./_components/QuestionsSection";
import DynamicRecordAnsSection from "./_components/DynamicRecordAnsSection";

function Interview() {
  const params = useParams();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
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
  const router = useRouter();
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

  // Format seconds into MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // --------

  // Get Interview Details
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  useEffect(() => {
    GetInterviewDetails();
  }, []);
  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewID));
    const jsonMockResponse = JSON.parse(result[0].jsonMockResp);
    setMockInterviewQuestion(jsonMockResponse);
    setInterviewData(result[0]);
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
          <h1 className="text-xl font-semibold">Interview for jobPostion</h1>

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-5">
        {/* Left column - video feed */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              {/* <div className="relative aspect-video bg-gray-900 rounded-lg mb-4 overflow-hidden">
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
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className={timeRemaining < 30 ? "text-red-500" : ""}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
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
                    onClick=""
                  >
                    {isRecording ? <MicOff /> : <Mic />}
                  </Button>

                  <Button variant="outline" onClick="">
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

                    {feedback.strengths && feedback.strengths.length > 0 && (
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
                        <p className="font-medium text-sm">Specific Advice:</p>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {feedback.specificAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )} */}
              <DynamicRecordAnsSection
                mockInterviewQuestion={mockInterviewQuestion}
                activeQuestionIndex={activeQuestionIndex}
                interviewData={interviewData}
              />
            </CardContent>
          </Card>
        </div>
        {/* Right column - question and transcription */}
        <div className="md:col-span-2">
          <QuestionsSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
          />
        </div>
      </div>
      <div className="flex justify-end gap-6 m-5">
        {activeQuestionIndex > 0 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
          >
            Previous Question
          </Button>
        )}

        {activeQuestionIndex !== mockInterviewQuestion?.length - 1 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
          >
            Next Question
          </Button>
        )}

        {activeQuestionIndex === mockInterviewQuestion?.length - 1 && (
          <Button
            onClick={() =>
              router.push(`/interview/${interviewData?.mockId}/report`)
            }
          >
            Finish Interview
          </Button>
        )}
      </div>
    </div>
  );
}

export default Interview;
