"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Filter,
  ChevronRight,
  Sparkles,
  Code,
  Users,
  Briefcase,
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Categories for the practice library
const categories = [
  { name: "Technical", icon: Code, count: 78 },
  { name: "Behavioral", icon: Users, count: 42 },
  { name: "System Design", icon: Sparkles, count: 25 },
  { name: "Company Specific", icon: Briefcase, count: 65 },
];

// Popular topics
const popularTopics = [
  "JavaScript",
  "React",
  "Data Structures",
  "Algorithms",
  "Leadership",
  "Problem Solving",
  "AWS",
  "System Design",
  "Python",
  "SQL",
];

export default function PracticeLibrary() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Practice Library
            </h1>
            <p className="text-muted-foreground">
              Access thousands of interview questions, coding challenges, and
              other resources to help you prepare.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for questions, topics, or skills..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Topics */}
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSearchQuery(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/practice/questions?category=${category.name.toLowerCase()}`
                    )
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="p-2 bg-primary/10 rounded-lg inline-block mb-3">
                          <category.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {category.count} questions
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick access sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Question Bank</CardTitle>
                <CardDescription>
                  Browse our extensive library of interview questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access over 500 curated interview questions across various
                  categories, including technical, behavioral, and
                  company-specific questions.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => router.push("/practice/questions")}
                >
                  <span>Explore Questions</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mock Interviews</CardTitle>
                <CardDescription>
                  Practice with simulated interview experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Participate in realistic mock interviews tailored to specific
                  roles, companies, and experience levels with AI-powered
                  feedback.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => router.push("/practice/mock")}
                >
                  <span>Start Mock Interview</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Technical Challenges Banner */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Technical Challenges
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Sharpen your coding skills with our collection of programming
                  challenges and algorithmic problems designed to prepare you
                  for technical interviews.
                </p>
              </div>
              <div>
                <Button
                  className="min-w-[150px]"
                  onClick={() => router.push("/practice/technical")}
                >
                  Explore Challenges
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
