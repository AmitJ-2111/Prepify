"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  Filter,
  Play,
  Search,
  Sparkles,
  Star,
  Timer,
  Users,
  Code,
  Lightbulb,
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

// Mock interview templates
const mockInterviews = [
  {
    id: 1,
    title: "Software Engineer Interview",
    company: "Tech Giants",
    description:
      "A comprehensive software engineering interview covering coding, system design, and behavioral questions.",
    duration: 45,
    questions: 10,
    difficulty: "Medium",
    category: "Technical",
    topics: ["Algorithms", "Data Structures", "Problem Solving"],
    rating: 4.8,
    reviews: 256,
    popular: true,
  },
  {
    id: 2,
    title: "Product Manager Interview",
    company: "Product Co.",
    description:
      "Practice product management scenarios, market analysis, and product strategy questions.",
    duration: 30,
    questions: 8,
    difficulty: "Medium",
    category: "Product",
    topics: ["Product Strategy", "Market Analysis", "User Experience"],
    rating: 4.6,
    reviews: 185,
    popular: true,
  },
  {
    id: 3,
    title: "Data Science Technical Interview",
    company: "Data Innovators",
    description:
      "Statistical concepts, machine learning algorithms, and practical data challenges.",
    duration: 50,
    questions: 12,
    difficulty: "Hard",
    category: "Technical",
    topics: ["Machine Learning", "Statistics", "Data Analysis"],
    rating: 4.9,
    reviews: 217,
    popular: true,
  },
  {
    id: 4,
    title: "Frontend Developer Interview",
    company: "Web Leaders",
    description:
      "React, JavaScript fundamentals, and frontend system design questions.",
    duration: 40,
    questions: 10,
    difficulty: "Medium",
    category: "Technical",
    topics: ["React", "JavaScript", "CSS", "Web Performance"],
    rating: 4.7,
    reviews: 193,
    popular: false,
  },
  {
    id: 5,
    title: "Leadership Behavioral Interview",
    company: "Leadership Inc.",
    description:
      "Leadership scenarios, conflict resolution, and team management questions.",
    duration: 35,
    questions: 8,
    difficulty: "Medium",
    category: "Behavioral",
    topics: ["Leadership", "Team Management", "Conflict Resolution"],
    rating: 4.5,
    reviews: 142,
    popular: false,
  },
  {
    id: 6,
    title: "System Design Interview",
    company: "Arch Solutions",
    description:
      "Practice designing scalable systems, discussing trade-offs, and architecture decisions.",
    duration: 60,
    questions: 5,
    difficulty: "Hard",
    category: "System Design",
    topics: ["Distributed Systems", "Databases", "Scalability"],
    rating: 4.9,
    reviews: 231,
    popular: true,
  },
];

// Category icon mapping
const categoryIcons = {
  Technical: Code,
  Behavioral: Users,
  "System Design": Sparkles,
  Product: Lightbulb,
};

// Difficulty color mapping
const difficultyColors = {
  Easy: "text-green-600 bg-green-50",
  Medium: "text-amber-600 bg-amber-50",
  Hard: "text-red-600 bg-red-50",
};

export default function MockInterviews() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Available categories
  const categories = [
    { name: "All", count: mockInterviews.length },
    {
      name: "Technical",
      count: mockInterviews.filter((m) => m.category === "Technical").length,
    },
    {
      name: "Behavioral",
      count: mockInterviews.filter((m) => m.category === "Behavioral").length,
    },
    {
      name: "System Design",
      count: mockInterviews.filter((m) => m.category === "System Design")
        .length,
    },
    {
      name: "Product",
      count: mockInterviews.filter((m) => m.category === "Product").length,
    },
  ];

  // Filter mock interviews based on search and category
  const filteredInterviews = mockInterviews.filter((interview) => {
    const matchesSearch =
      searchQuery === "" ||
      interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.topics.some((topic) =>
        topic.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "" ||
      interview.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Get popular interviews
  const popularInterviews = mockInterviews.filter(
    (interview) => interview.popular
  );

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
              Mock Interviews
            </h1>
            <p className="text-muted-foreground">
              Practice with structured interview simulations and receive
              AI-powered feedback.
            </p>
          </div>

          {/* Create custom interview button */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">
                      Create a Custom Interview
                    </h2>
                    <p className="text-muted-foreground max-w-xl">
                      Build a personalized interview experience tailored to your
                      target role, company, and experience level.
                    </p>
                  </div>
                  <Button
                    className="whitespace-nowrap"
                    onClick={() => router.push("/dashboard")}
                  >
                    Create Custom Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular interviews */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Popular Interviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularInterviews.map((interview) => {
                const CategoryIcon = categoryIcons[interview.category] || Code;

                return (
                  <Card
                    key={interview.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${
                            difficultyColors[interview.difficulty]
                          }`}
                        >
                          {interview.difficulty}
                        </div>
                      </div>
                      <CardTitle className="mt-3">{interview.title}</CardTitle>
                      <CardDescription>{interview.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {interview.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{interview.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{interview.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span>
                            {interview.rating} ({interview.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() =>
                          router.push(
                            `/interview?template=${
                              interview.id
                            }&jobPosition=${encodeURIComponent(
                              interview.title
                            )}&jobExperience=3&numQuestions=${
                              interview.questions
                            }`
                          )
                        }
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Interview
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Browse all interviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Browse All Interviews</h2>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search interviews..."
                    className="pl-10 w-[200px] md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Category filters */}
            <div className="flex overflow-x-auto gap-2 pb-2 mb-6">
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

            {/* Interview list */}
            <div className="space-y-4">
              {filteredInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No interviews found matching your search criteria.
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
                filteredInterviews.map((interview) => {
                  const CategoryIcon =
                    categoryIcons[interview.category] || Code;

                  return (
                    <Card key={interview.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 md:w-8/12">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <CategoryIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">
                                {interview.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {interview.company}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">
                            {interview.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {interview.topics.map((topic) => (
                              <div
                                key={topic}
                                className="text-xs bg-slate-100 px-2 py-1 rounded-full"
                              >
                                {topic}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator className="md:hidden" />

                        <div className="p-6 bg-slate-50 md:w-4/12 flex flex-col">
                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Difficulty:
                              </span>
                              <span
                                className={`font-medium ${
                                  interview.difficulty === "Hard"
                                    ? "text-red-600"
                                    : interview.difficulty === "Medium"
                                    ? "text-amber-600"
                                    : "text-green-600"
                                }`}
                              >
                                {interview.difficulty}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Duration:
                              </span>
                              <span className="font-medium">
                                {interview.duration} minutes
                              </span>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Questions:
                              </span>
                              <span className="font-medium">
                                {interview.questions}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Rating:
                              </span>
                              <span className="font-medium flex items-center">
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                                {interview.rating}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <Button
                              className="w-full"
                              onClick={() =>
                                router.push(
                                  `/interview?template=${
                                    interview.id
                                  }&jobPosition=${encodeURIComponent(
                                    interview.title
                                  )}&jobExperience=3&numQuestions=${
                                    interview.questions
                                  }`
                                )
                              }
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Interview
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
