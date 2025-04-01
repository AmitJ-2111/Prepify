"use client";
import { Button } from "@/components/ui/button";
import React, { use, useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, User } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "utils/GeminiAIModal";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { db } from "utils/db";
import { UserAnswer } from "utils/schema";
function RecordAnsSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (results.length > 0) {
      const latestResult = results[results.length - 1];
      setUserAnswer((prevAns) => prevAns + latestResult.transcript);
    }
  }, [results]);
  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswer();
    }
  }, [userAnswer]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
      if (userAnswer.length < 10) {
        setLoading(false);
        toast("Error While saving your response, Please try again", {
          type: "error",
        });
        return;
      }
    } else {
      startSpeechToText();
    }
  };
  const UpdateUserAnswer = async () => {
    console.log("userAnswer", userAnswer);
    setLoading(true);
    const feedbackPrompt = `
    You are an expert interview coach evaluating a candidate's response to an interview question.

    QUESTION: ${mockInterviewQuestion[activeQuestionIndex].question}

    CANDIDATE'S ANSWER: ${userAnswer}

    Analyze this response and provide structured feedback in JSON format with the following fields:
    1. "rating": A score from 1-5 (where 1 is poor and 5 is excellent)
    2. "strengths": 1-2 specific aspects of the answer that were effective
    3. "improvements": 1-2 specific suggestions for how the answer could be improved
    4. "feedback": A concise 2-3 sentence overall assessment

    Your feedback should assess:
    - Relevance to the question asked
    - Specificity (use of examples/evidence)
    - Structure and clarity of communication
    - Technical accuracy (if applicable)
    - Professional tone

    Keep the total feedback concise (3-5 lines max).

    RESPONSE FORMAT:
    {
      "rating": number,
      "feedback": "concise overall assessment"
      "strengths": "brief description",
      "improvements": "brief description",
    }
    `;
    const result = await chatSession.sendMessage(feedbackPrompt);
    const feedback = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    console.log(feedback);
    const feedbackJSON = JSON.parse(feedback);
    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewData?.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: userAnswer,
      feedback: feedbackJSON?.feedback,
      rating: feedbackJSON?.rating,
      strengths: feedbackJSON?.strengths,
      improvements: feedbackJSON?.improvements,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdAt: moment().format("DD-MM-YYYY"),
    });
    if (resp) {
      toast("Response saved successfully", { type: "success" });
      setUserAnswer("");
      setResults([]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center p-5 ">
        <Webcam mirrored={true} />
      </div>
      <Button
        disabled={loading}
        onClick={StartStopRecording}
        className="flex items-center gap-2"
      >
        {isRecording ? (
          <h2 className="flex gap-2">
            <Mic /> Recording...
          </h2>
        ) : (
          "Start Recording"
        )}
      </Button>
    </div>
  );
}

export default RecordAnsSection;
