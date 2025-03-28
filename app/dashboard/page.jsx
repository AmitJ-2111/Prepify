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
import UploadPDF from "./_components/PDF";

// Mock data for the dashboard
const mockInterviewHistory = [
  {
    id: "int-1",
    position: "Senior Software Engineer",
    company: "Tech Solutions Inc.",
    date: "2025-02-22",
    duration: "28 min",
    score: 85,
    questions: 8,
    status: "completed",
  },
  {
    id: "int-2",
    position: "Product Manager",
    company: "Innovate Co.",
    date: "2025-02-19",
    duration: "35 min",
    score: 78,
    questions: 10,
    status: "completed",
  },
  {
    id: "int-3",
    position: "Full Stack Developer",
    company: "Digital Craft",
    date: "2025-02-14",
    duration: "22 min",
    score: 92,
    questions: 6,
    status: "completed",
  },
];

const mockSkillAssessment = {
  communication: 82,
  technicalKnowledge: 88,
  problemSolving: 76,
  leadership: 73,
  teamwork: 85,
};

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [greeting, setGreeting] = useState("Hello");
  const [activeSection, setActiveSection] = useState("overview");
  const [newInterviewOpen, setNewInterviewOpen] = useState(false); // New state for dialog control

  // Set appropriate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Function to calculate overall performance score
  const calculateOverallScore = () => {
    const skillValues = Object.values(mockSkillAssessment);
    return Math.round(
      skillValues.reduce((a, b) => a + b, 0) / skillValues.length
    );
  };

  // Generate a quick tip based on the user's weakest skill
  const generateQuickTip = () => {
    const weakestSkill = Object.entries(mockSkillAssessment).sort(
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

  if (!isLoaded) return null;

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
              onClick={() => setNewInterviewOpen(true)} // Direct state control
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
                      {mockInterviewHistory.length}
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
                    <span className="text-3xl font-bold">85</span>
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
                      {calculateOverallScore()}
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
                      <Button size="sm" variant="ghost">
                        View all
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              Senior Software Engineer
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Tech Solutions Inc.
                            </p>
                          </div>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" /> Continue
                          </Button>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Last session
                            </span>
                            <span className="text-sm">Feb 22, 2025</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Questions
                            </span>
                            <span className="text-sm">8 total</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              Score
                            </span>
                            <span className="text-sm">85/100</span>
                          </div>
                        </div>
                      </div>

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
                      {Object.entries(mockSkillAssessment).map(
                        ([skill, score]) => (
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
                        )
                      )}
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

                      <div className="flex items-center gap-2 text-sm">
                        <div className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 flex items-center">
                          <Flame className="h-3 w-3 mr-1" />
                          <span className="font-medium">+5 pts</span>
                        </div>
                        <span className="text-muted-foreground">
                          from last session
                        </span>
                      </div>
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
                  {mockInterviewHistory.map((interview) => (
                    <div
                      key={interview.id}
                      className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/interview/review/${interview.id}`)
                      }
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <h3 className="font-medium">{interview.position}</h3>
                          <p className="text-sm text-muted-foreground">
                            {interview.company}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-muted py-1 px-3 rounded-full text-sm">
                          <span className="font-medium">{interview.score}</span>
                          <span className="text-muted-foreground">/100</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap text-sm text-muted-foreground gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(interview.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{interview.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mic className="h-3 w-3" />
                          <span>{interview.questions} questions</span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          View Feedback
                        </Button>
                        <Button size="sm">Retry Interview</Button>
                      </div>
                    </div>
                  ))}
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
