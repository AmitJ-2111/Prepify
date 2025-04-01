// app/interview/[interviewID]/report/page.jsx - Updated with saving report data

"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { db } from "utils/db";
import { eq } from "drizzle-orm";
import { UserAnswer, MockInterview, ReportData } from "utils/schema";
import { chatSession } from "utils/GeminiAIModal";
import moment from "moment";
import { toast } from "sonner";

function Report() {
  const { interviewID } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [skillRatings, setSkillRatings] = useState({
    communication: 0,
    technicalKnowledge: 0,
    problemSolving: 0,
    communicationFeedback: "",
    technicalKnowledgeFeedback: "",
    problemSolvingFeedback: "",
  });
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
  const [reportSaved, setReportSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if we already have a report for this interview
        const existingReports = await db
          .select()
          .from(ReportData)
          .where(eq(ReportData.mockIdRef, interviewID));

        if (existingReports.length > 0) {
          // Report already exists, load it
          const report = existingReports[0];
          setInterviewData({
            mockId: report.mockIdRef,
            jobPosition: report.jobPosition,
            createdAt: report.createdAt,
          });
          setOverallScore(report.overallScore);
          setSkillRatings({
            communication: report.communicationScore,
            technicalKnowledge: report.technicalKnowledgeScore,
            problemSolving: report.problemSolvingScore,
            communicationFeedback: report.reportData
              ? JSON.parse(report.reportData).communicationFeedback || ""
              : "",
            technicalKnowledgeFeedback: report.reportData
              ? JSON.parse(report.reportData).technicalKnowledgeFeedback || ""
              : "",
            problemSolvingFeedback: report.reportData
              ? JSON.parse(report.reportData).problemSolvingFeedback || ""
              : "",
          });

          // Still need to fetch user answers and questions
          const interviewResults = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, interviewID));

          if (interviewResults.length > 0) {
            const parsedMockResp = JSON.parse(interviewResults[0].jsonMockResp);
            setMockInterviewQuestions(parsedMockResp);
          }

          const userAnswerResults = await db
            .select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, interviewID));

          setUserAnswers(userAnswerResults);
          setReportSaved(true);
        } else {
          // No existing report, fetch and generate everything
          // Fetch interview data
          const interviewResults = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, interviewID));

          if (interviewResults.length === 0) {
            throw new Error("Interview not found");
          }

          const interviewData = interviewResults[0];
          setInterviewData(interviewData);

          // Parse the mock questions from the JSON response
          const parsedMockResp = JSON.parse(interviewData.jsonMockResp);
          setMockInterviewQuestions(parsedMockResp);

          // Fetch user answers for this interview
          const userAnswerResults = await db
            .select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, interviewID));

          setUserAnswers(userAnswerResults);

          // Calculate overall score based on ratings
          if (userAnswerResults.length > 0) {
            const totalRating = userAnswerResults.reduce((sum, answer) => {
              return sum + (parseInt(answer.rating) || 0);
            }, 0);

            const avgRating = Math.round(
              totalRating / userAnswerResults.length
            );
            setOverallScore(avgRating);

            // Use Gemini to analyze skill categories
            await analyzeSkillCategories(
              userAnswerResults,
              interviewData.jobPosition
            );
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast.error("Error loading report data");
        setLoading(false);
      }
    };

    if (interviewID) {
      fetchData();
    }
  }, [interviewID]);

  // Function to analyze skill categories using Gemini
  const analyzeSkillCategories = async (userAnswers, jobPosition) => {
    try {
      // Prepare the data for Gemini
      const answersData = userAnswers.map((answer) => ({
        question: answer.question,
        userAnswer: answer.userAns,
        rating: answer.rating,
      }));

      // Create the prompt for Gemini
      const prompt = `
        You are an expert interview analyzer. I need you to evaluate a candidate's interview performance for a ${jobPosition} position.
        
        Here are the candidate's responses to interview questions:
        ${JSON.stringify(answersData)}
        
        Based on these answers, provide a detailed analysis in JSON format with the following:
        1. Rating for communication skills (scale 1-5)
        2. Rating for technical knowledge (scale 1-5)
        3. Rating for problem-solving abilities (scale 1-5)
        
        For each category, consider:
        - Communication: clarity, structure, conciseness, engagement
        - Technical Knowledge: accuracy, depth, relevance to the position
        - Problem Solving: approach, creativity, thoroughness
        
        Respond with ONLY a JSON object in this format:
        {
          "communication": number,
          "technicalKnowledge": number,
          "problemSolving": number,
          "communicationFeedback": "brief explanation",
          "technicalKnowledgeFeedback": "brief explanation",
          "problemSolvingFeedback": "brief explanation"
        }
      `;

      // Send the prompt to Gemini
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();

      // Parse the JSON response
      const cleanedResponse = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const analysis = JSON.parse(cleanedResponse);

      // Update the skill ratings state
      setSkillRatings({
        communication: analysis.communication || 0,
        technicalKnowledge: analysis.technicalKnowledge || 0,
        problemSolving: analysis.problemSolving || 0,
        communicationFeedback: analysis.communicationFeedback || "",
        technicalKnowledgeFeedback: analysis.technicalKnowledgeFeedback || "",
        problemSolvingFeedback: analysis.problemSolvingFeedback || "",
      });

      // Save report data to database
      saveReportToDatabase(analysis);
    } catch (error) {
      console.error("Error analyzing skills with Gemini:", error);
      // Fallback to using overall score for all categories if Gemini analysis fails
      const fallbackSkills = {
        communication: overallScore,
        technicalKnowledge: overallScore,
        problemSolving: overallScore,
      };

      setSkillRatings({
        ...fallbackSkills,
        communicationFeedback: "Based on overall performance assessment",
        technicalKnowledgeFeedback: "Based on overall performance assessment",
        problemSolvingFeedback: "Based on overall performance assessment",
      });

      // Still save report with fallback values
      saveReportToDatabase(fallbackSkills);
    }
  };

  // Function to save report data to database
  const saveReportToDatabase = async (analysis) => {
    if (!interviewData || reportSaved) return;

    try {
      // Extract strengths and improvements from user answers
      const allStrengths = userAnswers
        .filter((answer) => answer.strengths)
        .flatMap((answer) => answer.strengths.split(",").map((s) => s.trim()))
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
        .slice(0, 5) // Take top 5
        .join(", ");

      const allImprovements = userAnswers
        .filter((answer) => answer.improvements)
        .flatMap((answer) =>
          answer.improvements.split(",").map((s) => s.trim())
        )
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
        .slice(0, 5) // Take top 5
        .join(", ");

      // Prepare additional data to store as JSON
      const reportDataJSON = JSON.stringify({
        communicationFeedback: analysis.communicationFeedback || "",
        technicalKnowledgeFeedback: analysis.technicalKnowledgeFeedback || "",
        problemSolvingFeedback: analysis.problemSolvingFeedback || "",
        answersDetails: userAnswers.map((a) => ({
          question: a.question,
          rating: a.rating,
          feedback: a.feedback,
        })),
      });

      // Insert into the ReportData table
      await db.insert(ReportData).values({
        mockIdRef: interviewID,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        jobPosition: interviewData.jobPosition,
        createdAt: moment().format("DD-MM-YYYY"),
        overallScore: overallScore,
        communicationScore: analysis.communication || overallScore,
        technicalKnowledgeScore: analysis.technicalKnowledge || overallScore,
        problemSolvingScore: analysis.problemSolving || overallScore,
        strengths: allStrengths,
        improvements: allImprovements,
        questionCount: mockInterviewQuestions.length,
        answeredCount: userAnswers.length,
        reportData: reportDataJSON,
      });

      setReportSaved(true);
      toast.success("Report data saved successfully");
    } catch (error) {
      console.error("Error saving report data:", error);
      toast.error("Failed to save report data");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Interview not found</h2>
        <Button onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Interview Report</CardTitle>
            <CardDescription>
              {interviewData.jobPosition} • {interviewData.createdAt}
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
              You completed a {mockInterviewQuestions.length}-question interview
              for the {interviewData.jobPosition} position. Based on your
              responses, here is a summary of your performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-2">Communication</h4>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${skillRatings.communication * 20}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-muted-foreground">
                {skillRatings.communicationFeedback ||
                  `Your communication skills are ${
                    skillRatings.communication >= 4 ? "strong" : "developing"
                  }.`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-2">Technical Knowledge</h4>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${skillRatings.technicalKnowledge * 20}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-muted-foreground">
                {skillRatings.technicalKnowledgeFeedback ||
                  `Your technical knowledge is ${
                    skillRatings.technicalKnowledge >= 3
                      ? "well-demonstrated"
                      : "adequate"
                  }.`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-2">Problem Solving</h4>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${skillRatings.problemSolving * 20}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-muted-foreground">
                {skillRatings.problemSolvingFeedback ||
                  `Your problem-solving approach is ${
                    skillRatings.problemSolving >= 4 ? "excellent" : "good"
                  }.`}
              </p>
            </div>
          </div>

          {/* Rest of the component remains the same */}
          <div className="mb-6">
            <h3 className="font-medium mb-4">Key Strengths</h3>
            <ul className="space-y-2">
              {userAnswers
                .flatMap((answer) =>
                  answer.strengths
                    ? answer.strengths
                        .split(",")
                        .slice(0, 3)
                        .map((strength, idx) => (
                          <li
                            key={`strength-${idx}`}
                            className="flex items-start gap-3"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>{strength.trim()}</span>
                          </li>
                        ))
                    : []
                )
                .slice(0, 3)}

              {/* Fallback if no strengths found */}
              {!userAnswers.some((answer) => answer.strengths) && (
                <>
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
                </>
              )}
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="font-medium mb-4">Areas for Improvement</h3>
            <ul className="space-y-2">
              {userAnswers
                .flatMap((answer) =>
                  answer.improvements
                    ? answer.improvements
                        .split(",")
                        .slice(0, 2)
                        .map((improvement, idx) => (
                          <li
                            key={`improvement-${idx}`}
                            className="flex items-start gap-3"
                          >
                            <ChevronRight className="h-5 w-5 text-amber-500 mt-0.5" />
                            <span>{improvement.trim()}</span>
                          </li>
                        ))
                    : []
                )
                .slice(0, 2)}

              {/* Fallback if no improvements found */}
              {!userAnswers.some((answer) => answer.improvements) && (
                <>
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
                </>
              )}
            </ul>
          </div>

          <Separator className="mb-6" />

          <h3 className="font-medium mb-4">Detailed Question Analysis</h3>

          <div className="space-y-6">
            {mockInterviewQuestions.map((question, index) => {
              // Find the user answer for this question if available
              const userAnswer = userAnswers.find(
                (answer) => answer.question === question.question
              );

              return (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <p className="mt-1">{question.question}</p>
                      </div>
                      {userAnswer && (
                        <div className="px-2 py-1 bg-white rounded border text-sm">
                          {userAnswer.rating}/5
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h5 className="text-sm font-medium mb-2">Your Answer:</h5>
                    <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded">
                      {userAnswer ? userAnswer.userAns : "(No answer provided)"}
                    </p>

                    {userAnswer && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Feedback:</h5>
                        <div className="text-sm space-y-2">
                          {userAnswer.strengths && (
                            <div>
                              <p className="text-green-600">Strengths:</p>
                              <ul className="ml-5 list-disc text-muted-foreground">
                                {userAnswer.strengths
                                  .split(",")
                                  .map((strength, i) => (
                                    <li key={i}>{strength.trim()}</li>
                                  ))}
                              </ul>
                            </div>
                          )}

                          {userAnswer.improvements && (
                            <div>
                              <p className="text-amber-600">
                                Areas to Improve:
                              </p>
                              <ul className="ml-5 list-disc text-muted-foreground">
                                {userAnswer.improvements
                                  .split(",")
                                  .map((area, i) => (
                                    <li key={i}>{area.trim()}</li>
                                  ))}
                              </ul>
                            </div>
                          )}

                          {userAnswer.feedback && (
                            <div className="pt-2 border-t">
                              <p className="font-medium">Advice:</p>
                              <p className="text-muted-foreground">
                                {userAnswer.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-8">
            <Button onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Report;
