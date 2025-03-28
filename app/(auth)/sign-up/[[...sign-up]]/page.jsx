import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left column - Brand/Marketing Content */}
      <div className="relative hidden w-0 flex-1 lg:block lg:w-3/5 bg-[#4148D9]">
        <div className="absolute inset-0">
          {/* Background pattern circles - matches the current design */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#5761FF] opacity-20"></div>
          <div className="absolute top-2/3 left-1/3 w-80 h-80 rounded-full bg-[#5761FF] opacity-20"></div>
          <div className="absolute bottom-1/4 right-1/3 w-40 h-40 rounded-full bg-[#5761FF] opacity-10"></div>
        </div>

        <div className="relative flex flex-col h-full px-12 py-16 text-white z-10">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">
              Start your interview preparation journey
            </h1>
            <p className="text-lg mb-12 text-blue-100">
              Join thousands of job seekers who have improved their interview
              performance with Prepify.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                <span>AI-powered mock interviews with real-time feedback</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                <span>
                  Personalized practice questions for your target roles
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                <span>Resume analysis and improvement suggestions</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                <span>Track your progress with detailed analytics</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                <span>Practice technical and behavioral interview skills</span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between max-w-md">
            <div className="text-center">
              <div className="text-4xl font-bold">85%</div>
              <div className="text-sm text-blue-200">
                Interview success rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">30K+</div>
              <div className="text-sm text-blue-200">Practicing users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">250+</div>
              <div className="text-sm text-blue-200">Company templates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Auth content */}
      <div className="flex flex-col justify-center w-full px-8 md:px-16 lg:w-2/5 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>

          <div className="flex flex-col items-center mb-8">
            <Image
              src="/logo.png"
              alt="Prepify Logo"
              width={48}
              height={48}
              className="mb-4"
            />
            <h2 className="text-2xl font-bold text-center">Prepify</h2>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center mb-2">
              Create your account
            </h3>
            <p className="text-center text-gray-600">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "bg-[#4148D9] hover:bg-[#3a40c4]",
                footerActionLink: "text-[#4148D9] hover:text-[#3a40c4]",
                card: "shadow-none",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
          />

          <p className="mt-8 text-center text-sm text-gray-500">
            By signing up, you agree to our{" "}
            <a href="#" className="text-[#4148D9] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#4148D9] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
