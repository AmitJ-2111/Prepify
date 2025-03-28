"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ChevronRight,
  Bookmark,
  Tag,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Code,
  Users,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Sample question data
const questionData = [
  {
    id: 1,
    question:
      "Tell me about a time when you had to deal with a difficult team member.",
    category: "Behavioral",
    difficulty: "Medium",
    tags: ["Communication", "Conflict Resolution", "Teamwork"],
    company: "Amazon",
    likes: 124,
    views: 3845,
  },
  {
    id: 2,
    question: "How would you design Twitter's backend architecture?",
    category: "System Design",
    difficulty: "Hard",
    tags: ["Distributed Systems", "Databases", "Scaling"],
    company: "Twitter",
    likes: 98,
    views: 2156,
  },
  {
    id: 3,
    question:
      "Implement a function to find the longest substring without repeating characters.",
    category: "Technical",
    difficulty: "Medium",
    tags: ["Strings", "Algorithms", "Dynamic Programming"],
    company: "Google",
    likes: 215,
    views: 7845,
  },
  {
    id: 4,
    question: "Explain the differences between REST and GraphQL APIs.",
    category: "Technical",
    difficulty: "Easy",
    tags: ["API", "Backend", "Web Development"],
    company: "Facebook",
    likes: 76,
    views: 1532,
  },
  {
    id: 5,
    question: "How do you handle failure in a project?",
    category: "Behavioral",
    difficulty: "Medium",
    tags: ["Project Management", "Resilience", "Problem Solving"],
    company: "Microsoft",
    likes: 87,
    views: 2345,
  },
  {
    id: 6,
    question: "Design a scalable e-commerce product catalog system.",
    category: "System Design",
    difficulty: "Hard",
    tags: ["Databases", "Search", "Cache"],
    company: "Amazon",
    likes: 143,
    views: 3267,
  },
  {
    id: 7,
    question: "Implement a binary search tree and its common operations.",
    category: "Technical",
    difficulty: "Medium",
    tags: ["Data Structures", "Trees", "Algorithms"],
    company: "Google",
    likes: 195,
    views: 4521,
  },
  {
    id: 8,
    question:
      "Tell me about a time you received negative feedback and how you handled it.",
    category: "Behavioral",
    difficulty: "Medium",
    tags: ["Feedback", "Growth Mindset", "Self-improvement"],
    company: "Apple",
    likes: 102,
    views: 3156,
  },
];

// Category icon mapping
const categoryIcons = {
  Technical: Code,
  Behavioral: Users,
  "System Design": Sparkles,
  "Company Specific": Briefcase,
};

// Color mapping for difficulty
const difficultyColors = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard: "bg-red-100 text-red-800",
};

export default function QuestionBank() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  // Filter questions based on search and category
  const filteredQuestions = questionData.filter((q) => {
    const matchesSearch =
      searchQuery === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "" ||
      q.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Available categories for filter
  const categories = [
    { name: "All", count: questionData.length },
    {
      name: "Technical",
      count: questionData.filter((q) => q.category === "Technical").length,
    },
    {
      name: "Behavioral",
      count: questionData.filter((q) => q.category === "Behavioral").length,
    },
    {
      name: "System Design",
      count: questionData.filter((q) => q.category === "System Design").length,
    },
  ];

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
              Question Bank
            </h1>
            <p className="text-muted-foreground">
              Browse and search through our collection of interview questions.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions by keyword or skill..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>

            {/* Category filters */}
            <div className="flex overflow-x-auto gap-2 pb-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={
                    selectedCategory ===
                    (category.name === "All" ? "" : category.name.toLowerCase())
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category.name === "All" ? "" : category.name.toLowerCase()
                    )
                  }
                  className="whitespace-nowrap"
                >
                  {category.name}{" "}
                  <span className="ml-1 text-xs opacity-70">
                    ({category.count})
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No questions found matching your search criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredQuestions.map((question) => {
                const CategoryIcon = categoryIcons[question.category] || Code;

                return (
                  <Card
                    key={question.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      router.push(`/practice/questions/${question.id}`)
                    }
                  >
                    <CardContent className="p-5">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg bg-primary/10 h-fit`}>
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">
                              {question.company}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                difficultyColors[question.difficulty]
                              }`}
                            >
                              {question.difficulty}
                            </span>
                          </div>

                          <h3 className="font-medium text-lg mb-3">
                            {question.question}
                          </h3>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {question.tags.map((tag) => (
                              <div
                                key={tag}
                                className="flex items-center gap-1 text-xs bg-slate-100 px-2 py-1 rounded-full"
                              >
                                <Tag className="h-3 w-3" />
                                <span>{tag}</span>
                              </div>
                            ))}
                          </div>

                          <Separator className="my-3" />

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3.5 w-3.5" />
                                <span>{question.likes}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Tag className="h-3.5 w-3.5" />
                                <span>{question.category}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Copy question implementation
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Bookmark question implementation
                                }}
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
