// app/dashboard/page.jsx - Updated with real data
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  BarChart3,
  Calendar,
  Clock,
  Flame,
  Mic,
  Play,
  Plus,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { InterviewStatsCard } from "./_components/InterviewStatsCard";
import AddNewInterview from "./_components/AddNewInterview";
import Loading from "@/components/ui/loading";
import { db } from "utils/db";
import { MockInterview, UserAnswer } from "utils/schema";
import { eq, desc } from "drizzle-orm";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [greeting, setGreeting] = useState("Hello");
  const [activeSection, setActiveSection] = useState("overview");
  const [newInterviewOpen, setNewInterviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // States for real data
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [skillAssessment, setSkillAssessment] = useState({
    communication: 0,
    technicalKnowledge: 0,
    problemSolving: 0,
    leadership: 0,
    teamwork: 0,
  });
  const [recentInterview, setRecentInterview] = useState(null);
  const [interviewStats, setInterviewStats] = useState({
    totalSessions: 0,
    practiceTime: 0,
    averageScore: 0,
  });

  // Set appropriate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch user's interview data
  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, user]);

  // Fetch user data from database
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user's interview history
      const userEmail = user?.primaryEmailAddress?.emailAddress;

      // Using the same pattern as in your interview pages
      const interviews = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, userEmail))
        .orderBy(desc(MockInterview.createdAt));

      if (interviews.length > 0) {
        setInterviewHistory(interviews);
        setRecentInterview(interviews[0]);

        // Fetch answers for statistics calculation
        const answers = await db
          .select()
          .from(UserAnswer)
          .where(eq(UserAnswer.userEmail, userEmail));

        // Calculate stats
        calculateInterviewStats(interviews, answers);
        calculateSkillAssessment(answers);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate interview statistics
  const calculateInterviewStats = (interviews, answers) => {
    // Total sessions
    const totalSessions = interviews.length;

    // Practice time (estimated based on number of questions and answers)
    // Assuming each question takes about 3 minutes on average
    const totalQuestions = answers.length;
    const practiceTime = totalQuestions * 3;

    // Average score based on ratings in answers
    let totalScore = 0;
    let ratedAnswers = 0;

    answers.forEach((answer) => {
      if (answer.rating) {
        totalScore += parseInt(answer.rating);
        ratedAnswers++;
      }
    });

    const averageScore =
      ratedAnswers > 0 ? Math.round((totalScore / ratedAnswers) * 20) : 0;

    setInterviewStats({
      totalSessions,
      practiceTime,
      averageScore,
    });
  };

  // Calculate skill assessment based on user answers
  const calculateSkillAssessment = (answers) => {
    // This would ideally be done with Gemini AI for real analysis
    // For now, we'll do a basic estimation based on answer ratings

    // Initialize skill scores
    const skills = {
      communication: 0,
      technicalKnowledge: 0,
      problemSolving: 0,
      leadership: 0,
      teamwork: 0,
    };

    // Count ratings by category
    const skillCounts = { ...skills };

    // Analyze answers - in a real implementation, this would use
    // more sophisticated NLP or come from Gemini's analysis
    answers.forEach((answer) => {
      if (!answer.rating) return;

      const rating = parseInt(answer.rating);
      const question = answer.question.toLowerCase();

      // Basic keyword matching to categorize questions
      if (
        question.includes("explain") ||
        question.includes("describe") ||
        question.includes("tell me")
      ) {
        skills.communication += rating;
        skillCounts.communication++;
      }

      if (
        question.includes("technical") ||
        question.includes("skill") ||
        question.includes("experience with")
      ) {
        skills.technicalKnowledge += rating;
        skillCounts.technicalKnowledge++;
      }

      if (
        question.includes("problem") ||
        question.includes("challenge") ||
        question.includes("difficult")
      ) {
        skills.problemSolving += rating;
        skillCounts.problemSolving++;
      }

      if (
        question.includes("lead") ||
        question.includes("manage") ||
        question.includes("team")
      ) {
        skills.leadership += rating;
        skillCounts.leadership++;
      }

      if (
        question.includes("collaborate") ||
        question.includes("team") ||
        question.includes("work with")
      ) {
        skills.teamwork += rating;
        skillCounts.teamwork++;
      }
    });

    // Calculate average for each skill
    Object.keys(skills).forEach((skill) => {
      if (skillCounts[skill] > 0) {
        skills[skill] = Math.round((skills[skill] / skillCounts[skill]) * 20);
      } else {
        // If no questions matched this skill, use the overall average
        skills[skill] = interviewStats.averageScore;
      }
    });

    setSkillAssessment(skills);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Calculate overall performance score
  const calculateOverallScore = () => {
    const skillValues = Object.values(skillAssessment);
    return Math.round(
      skillValues.reduce((a, b) => a + b, 0) / skillValues.length
    );
  };

  // Generate a quick tip based on the user's weakest skill
  const generateQuickTip = () => {
    const weakestSkill = Object.entries(skillAssessment).sort(
      ([, a], [, b]) => a - b
    )[0];

    switch (weakestSkill[0]) {
      case "communication":
        return "Try using the STAR method (Situation, Task, Action, Result) to structure your responses more clearly.";
      case "technicalKnowledge":
        return "Review fundamental concepts in your field and practice explaining them in simple terms.";
      case "problemSolving":
        return "Practice breaking down complex problems into smaller steps. Think aloud during your approach.";
      case "leadership":
        return "Prepare more examples that highlight how you've guided teams or initiatives to success.";
      case "teamwork":
        return "Include more examples of collaboration and how you've contributed to team goals.";
      default:
        return "Practice regularly with varied question types to build your overall interview confidence.";
    }
  };

  if (!isLoaded) return <Loading />;

  if (loading) return <Loading />;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar with sliding functionality */}
      <Sidebar>
        <SidebarContent>
          <AppSidebar />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Tab navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting}, {user?.firstName || "there"}
            </h1>
            <p className="text-muted-foreground">
              Track your interview preparation progress and continue practicing.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeSection === "overview" ? "default" : "outline"}
              onClick={() => setActiveSection("overview")}
            >
              Overview
            </Button>
            <Button
              variant={activeSection === "history" ? "default" : "outline"}
              onClick={() => setActiveSection("history")}
            >
              Interview History
            </Button>
            <Button
              onClick={() => setNewInterviewOpen(true)}
              className="ml-2 gap-2"
            >
              <Plus className="h-4 w-4" />
              New Interview
            </Button>
          </div>
        </div>

        {activeSection === "overview" ? (
          /* Overview dashboard content */
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium tracking-tight text-muted-foreground">
                      Completed Sessions
                    </h3>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {interviewStats.totalSessions}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      interviews
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium tracking-tight text-muted-foreground">
                      Practice Time
                    </h3>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {interviewStats.practiceTime}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      minutes
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium tracking-tight text-muted-foreground">
                      Average Score
                    </h3>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {interviewStats.averageScore}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two column layout for main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              {/* Left column (2/3 width on large screens) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Continue interview section */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Resume Your Preparation</CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveSection("history")}
                      >
                        View all
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentInterview ? (
                        <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                {recentInterview.jobPosition}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Created on{" "}
                                {formatDate(recentInterview.createdAt)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/interview/${recentInterview.mockId}`
                                )
                              }
                            >
                              <Play className="h-4 w-4 mr-1" /> Continue
                            </Button>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                Experience
                              </span>
                              <span className="text-sm">
                                {recentInterview.jobExperience} years
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                Questions
                              </span>
                              <span className="text-sm">
                                {
                                  JSON.parse(recentInterview.jsonMockResp)
                                    .length
                                }{" "}
                                total
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                Progress
                              </span>
                              <span className="text-sm">In progress</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground">
                            No interviews found. Start your first interview!
                          </p>
                        </div>
                      )}

                      <div
                        className="rounded-lg border p-4 bg-muted/30 cursor-pointer"
                        onClick={() => setNewInterviewOpen(true)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">
                              Start a new interview
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Practice for a different position
                            </p>
                          </div>
                          <Button size="sm" variant="secondary">
                            <Plus className="h-4 w-4 mr-1" /> Add New
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skill assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(skillAssessment).map(([skill, score]) => (
                        <div key={skill} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm capitalize">
                              {skill.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span className="text-sm font-medium">
                              {score}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InterviewStatsCard />
                  </CardContent>
                </Card>
              </div>

              {/* Right column (1/3 width on large screens) */}
              <div className="space-y-6">
                {/* Performance card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center text-center mb-4">
                        <div>
                          <div className="text-3xl font-bold">
                            {calculateOverallScore()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Overall Score
                          </div>
                        </div>
                      </div>

                      {interviewHistory.length > 1 && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 flex items-center">
                            <Flame className="h-3 w-3 mr-1" />
                            <span className="font-medium">+5 pts</span>
                          </div>
                          <span className="text-muted-foreground">
                            from last session
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Interview tip card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      </div>
                      <CardTitle>Interview Tip</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {generateQuickTip()}
                    </p>

                    <Button size="sm" variant="outline" className="w-full">
                      Get More Tips
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* Interview history content */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interviewHistory.length > 0 ? (
                    interviewHistory.map((interview) => (
                      <div
                        key={interview.mockId}
                        className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/interview/${interview.mockId}`)
                        }
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div>
                            <h3 className="font-medium">
                              {interview.jobPosition}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Created on {formatDate(interview.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-muted py-1 px-3 rounded-full text-sm">
                            <span className="font-medium">
                              {/* Score would come from user answers */}
                            </span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap text-sm text-muted-foreground gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(interview.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Experience: {interview.jobExperience} years
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mic className="h-3 w-3" />
                            <span>
                              {JSON.parse(interview.jsonMockResp).length}{" "}
                              questions
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/interview/${interview.mockId}/report`
                              );
                            }}
                          >
                            View Feedback
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/interview/${interview.mockId}`);
                            }}
                          >
                            Continue Interview
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">
                        No interview history found. Start your first interview!
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setNewInterviewOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> New Interview
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AddNewInterview component with controlled state */}
        <AddNewInterview
          open={newInterviewOpen}
          setOpen={setNewInterviewOpen}
        />
      </div>
    </div>
  );
}
