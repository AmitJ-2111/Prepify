"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Code,
  Search,
  Filter,
  Clock,
  ChevronRight,
  Star,
  Tag,
  Terminal,
  Database,
  GitBranch,
  LineChart,
  Activity,
  Box,
  ServerCrash,
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
import { Separator } from "@/components/ui/separator";

// Mock technical challenge categories
const categories = [
  {
    id: 1,
    name: "Algorithms",
    icon: GitBranch,
    description:
      "Classic algorithm problems covering sorting, searching, and optimization techniques",
    count: 48,
  },
  {
    id: 2,
    name: "Data Structures",
    icon: Box,
    description:
      "Problems focused on arrays, linked lists, trees, graphs, and other data structures",
    count: 64,
  },
  {
    id: 3,
    name: "System Design",
    icon: ServerCrash,
    description:
      "Design scalable and resilient systems, services, and architecture",
    count: 36,
  },
  {
    id: 4,
    name: "Databases",
    icon: Database,
    description: "SQL queries, database design, and optimization challenges",
    count: 28,
  },
  {
    id: 5,
    name: "Frontend",
    icon: Code,
    description: "JavaScript, React, and CSS challenges for web development",
    count: 42,
  },
  {
    id: 6,
    name: "Performance",
    icon: Activity,
    description: "Optimize code for speed, memory usage, and efficiency",
    count: 22,
  },
];

// Sample challenges data
const challenges = [
  {
    id: 1,
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    category: "Algorithms",
    topCompanies: ["Amazon", "Google", "Microsoft"],
    successRate: "75%",
    attempts: 12567,
    timeLimit: 15,
    popular: true,
  },
  {
    id: 2,
    title: "Implement LRU Cache",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    difficulty: "Medium",
    category: "Data Structures",
    topCompanies: ["Facebook", "Google", "Amazon"],
    successRate: "42%",
    attempts: 8945,
    timeLimit: 30,
    popular: true,
  },
  {
    id: 3,
    title: "Design a URL Shortener",
    description:
      "Design a system that converts a long URL to a shorter URL and vice versa.",
    difficulty: "Medium",
    category: "System Design",
    topCompanies: ["Twitter", "Dropbox", "Airbnb"],
    successRate: "55%",
    attempts: 6234,
    timeLimit: 45,
    popular: true,
  },
  {
    id: 4,
    title: "Binary Tree Level Order Traversal",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values.",
    difficulty: "Medium",
    category: "Data Structures",
    topCompanies: ["Apple", "Facebook", "Amazon"],
    successRate: "62%",
    attempts: 7852,
    timeLimit: 20,
    popular: false,
  },
  {
    id: 5,
    title: "Implement a Rate Limiter",
    description:
      "Design and implement a rate limiter that prevents users from making too many API requests within a time period.",
    difficulty: "Hard",
    category: "System Design",
    topCompanies: ["Stripe", "Netflix", "Uber"],
    successRate: "38%",
    attempts: 5421,
    timeLimit: 60,
    popular: true,
  },
  {
    id: 6,
    title: "SQL Join Optimization",
    description:
      "Optimize a set of SQL queries that join multiple tables to reduce execution time.",
    difficulty: "Medium",
    category: "Databases",
    topCompanies: ["Oracle", "Microsoft", "Amazon"],
    successRate: "48%",
    attempts: 4395,
    timeLimit: 30,
    popular: false,
  },
  {
    id: 7,
    title: "Implement Debounce Function",
    description:
      "Create a debounce function that delays invoking a function until after a specified wait time.",
    difficulty: "Medium",
    category: "Frontend",
    topCompanies: ["Google", "Facebook", "LinkedIn"],
    successRate: "57%",
    attempts: 6782,
    timeLimit: 25,
    popular: true,
  },
  {
    id: 8,
    title: "Merge K Sorted Lists",
    description: "Merge k sorted linked lists into one sorted linked list.",
    difficulty: "Hard",
    category: "Algorithms",
    topCompanies: ["Google", "Amazon", "Apple"],
    successRate: "32%",
    attempts: 7245,
    timeLimit: 30,
    popular: false,
  },
];

// Difficulty color mapping
const difficultyColors = {
  Easy: "text-green-600 bg-green-50",
  Medium: "text-amber-600 bg-amber-50",
  Hard: "text-red-600 bg-red-50",
};

export default function TechnicalChallenges() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  // Filter challenges based on search, category, and difficulty
  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      searchQuery === "" ||
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || challenge.category === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === "" || challenge.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get popular challenges
  const popularChallenges = challenges.filter((challenge) => challenge.popular);

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
              Technical Challenges
            </h1>
            <p className="text-muted-foreground">
              Sharpen your coding skills with hands-on technical challenges
              commonly asked in interviews.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search challenges by title or description..."
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

            {/* Difficulty filters */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Difficulty</h3>
              <div className="flex gap-2">
                <Button
                  variant={selectedDifficulty === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty("")}
                >
                  All
                </Button>
                <Button
                  variant={
                    selectedDifficulty === "Easy" ? "default" : "outline"
                  }
                  size="sm"
                  className={
                    selectedDifficulty === "Easy" ? "" : "text-green-600"
                  }
                  onClick={() => setSelectedDifficulty("Easy")}
                >
                  Easy
                </Button>
                <Button
                  variant={
                    selectedDifficulty === "Medium" ? "default" : "outline"
                  }
                  size="sm"
                  className={
                    selectedDifficulty === "Medium" ? "" : "text-amber-600"
                  }
                  onClick={() => setSelectedDifficulty("Medium")}
                >
                  Medium
                </Button>
                <Button
                  variant={
                    selectedDifficulty === "Hard" ? "default" : "outline"
                  }
                  size="sm"
                  className={
                    selectedDifficulty === "Hard" ? "" : "text-red-600"
                  }
                  onClick={() => setSelectedDifficulty("Hard")}
                >
                  Hard
                </Button>
              </div>
            </div>
          </div>

          {/* Challenge Categories */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Challenge Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-2">
                          {category.description}
                        </p>
                        <p className="text-xs">
                          <span className="font-medium">{category.count}</span>{" "}
                          challenges
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Popular Challenges */}
          {selectedCategory === "" &&
            selectedDifficulty === "" &&
            searchQuery === "" && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">
                  Popular Challenges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularChallenges.map((challenge) => (
                    <Card
                      key={challenge.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${
                              difficultyColors[challenge.difficulty]
                            }`}
                          >
                            {challenge.difficulty}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{challenge.timeLimit} min</span>
                          </div>
                        </div>
                        <CardTitle className="mt-3">
                          {challenge.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {challenge.category} • {challenge.successRate} Success
                          Rate
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {challenge.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {challenge.topCompanies.map((company) => (
                            <div
                              key={company}
                              className="text-xs px-2 py-0.5 bg-slate-100 rounded-full"
                            >
                              {company}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() =>
                            router.push(`/practice/technical/${challenge.id}`)
                          }
                        >
                          <Terminal className="h-4 w-4 mr-2" />
                          Start Challenge
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {/* All Challenges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedCategory
                  ? `${selectedCategory} Challenges`
                  : "All Challenges"}
                {selectedDifficulty && ` - ${selectedDifficulty} Difficulty`}
              </h2>

              {(selectedCategory || selectedDifficulty) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedDifficulty("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Challenge list */}
            <div className="space-y-4">
              {filteredChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No challenges found matching your search criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                      setSelectedDifficulty("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                filteredChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 md:w-8/12">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-lg">
                            {challenge.title}
                          </h3>
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${
                              difficultyColors[challenge.difficulty]
                            }`}
                          >
                            {challenge.difficulty}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {challenge.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            <span>{challenge.category}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5" />
                            <span>{challenge.successRate} success</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5" />
                            <span>
                              {challenge.attempts.toLocaleString()} attempts
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator className="md:hidden" />

                      <div className="p-6 bg-slate-50 md:w-4/12 flex flex-col">
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Time Limit:
                            </span>
                            <span className="font-medium">
                              {challenge.timeLimit} minutes
                            </span>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Top Companies:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {challenge.topCompanies.map((company) => (
                                <div
                                  key={company}
                                  className="text-xs px-2 py-0.5 bg-white rounded-full border"
                                >
                                  {company}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <Button
                            className="w-full"
                            onClick={() =>
                              router.push(`/practice/technical/${challenge.id}`)
                            }
                          >
                            <Terminal className="h-4 w-4 mr-2" />
                            Start Challenge
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
