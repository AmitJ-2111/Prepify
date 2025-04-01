"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { FileUp, Upload, AlertCircle } from "lucide-react";
import { chatSession } from "utils/GeminiAIModal";
import { db } from "utils/db";
import { MockInterview } from "utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function AddNewInterview({ open, setOpen }) {
  const router = useRouter();
  const [jobPos, setJobPos] = useState("");
  const [jobDes, setJobDes] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [error, setError] = useState("");
  const [jsonResp, setJsonResp] = useState([]);
  const { user } = useUser();

  // Reset form state when dialog opens
  useEffect(() => {
    if (open) {
      // Keep existing values, just reset error states
      setError("");
      setUploadProgress(0);
    }
  }, [open]);

  // Handle PDF Upload & Extract Resume Text using AWS Lambda
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file is a PDF
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(10);

    try {
      // Convert file to base64
      const base64String = await convertFileToBase64(file);
      setUploadProgress(30);

      // Call AWS API Gateway through our API endpoint
      const response = await fetch("/api/uploadPdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_base64: base64String }),
      });

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error("Failed to process PDF");
      }

      const data = await response.json();
      setUploadProgress(90);

      // Extract text from the response (format depends on your AWS Lambda function)
      const extractedText = data.text || data.content || JSON.stringify(data);

      // Store the extracted text
      setPdfText(extractedText);
      setFileUploaded(true);

      // Store it in localStorage for the interview page to use
      localStorage.setItem("resumeText", extractedText);

      setUploadProgress(100);
    } catch (err) {
      console.error("Error processing PDF:", err);
      setError("Error processing PDF, but you can continue without it.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Form Submit Handler
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!jobPos.trim()) {
      setError("Job position is required");
      return;
    }

    if (!jobDes.trim()) {
      setError("Job description is required");
      return;
    }

    if (!jobExperience) {
      setError("Years of experience is required");
      return;
    }
    console.log(jobDes, jobExperience, jobPos, pdfText);

    const InputPrompt = [
      `
      You are a professional interview coach specializing in preparing candidates for job interviews. Your task is to generate tailored interview questions based on the information provided below.
      
      
      JOB DETAILS:
      - Position: ${jobPos}
      - Description: ${jobDes}
      
      CANDIDATE INFORMATION:
      - Resume: ${pdfText}
      - Candidates's Experience: ${jobExperience} years
      
      INSTRUCTIONS:
      1. Create ${numQuestions} high-quality interview questions specifically tailored to the job position and candidate's background.
      2. Include a mix of question types:
         - Technical/skill-based questions relevant to the position
         - Behavioral questions to assess soft skills
         - Situational questions to evaluate problem-solving abilities
         - Experience-based questions that reference the candidate's background
      3. For each question, provide:
         - The question itself
         - A brief explanation of why this question is relevant (for internal use)
         - Key points that would make for a strong answer
      
      
      FORMAT EACH QUESTION AS:
      Question #: [The interview question]
      Strong Answer Elements: [3-5 bullet points describing elements of a good response]
      
      
      Ensure questions are challenging but fair, and directly relevant to both the job requirements and the candidate's experience level. Focus on questions that would be asked in a real interview setting.In the response only give the questions, answers and other asked information, don't give any other filler, like pre text or a summary or anything, not even a heading like Generated Questions. I want the response in a json format, I want the question and answer as son field.
      Keep the response of this format:
      [
      {
        "question": "Question #1",
        "answer": "Answer #1",
        },
        "question": "Question #2",
        "answer": "Answer #2",
        },
        ]
      `,
    ];

    const result = await chatSession.sendMessage(InputPrompt);
    const MockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    console.log(JSON.parse(MockJsonResp));
    setJsonResp(MockJsonResp);

    if (MockJsonResp) {
      const resp = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: MockJsonResp,
          jobPosition: jobPos,
          jobDesc: jobDes,
          jobExperience: jobExperience,
          createdBy: user?.primaryEmailAddress.emailAddress,
          createdAt: moment().format("DD-MM-YYYY"),
        })
        .returning({ mockId: MockInterview.mockId });
      console.log("Inserted ID;", resp);
      if (resp) {
        setOpen(false);
        router.push("/interview/" + resp[0].mockId);
      }
    } else {
      console.log("Error");
    }
    // Store job description in localStorage for the interview page
    localStorage.setItem("jobDescription", jobDes);

    // Redirect to interview page with query parameters
    // router.push(
    //   `/interview?jobPosition=${encodeURIComponent(
    //     jobPos
    //   )}&jobExperience=${encodeURIComponent(
    //     jobExperience
    //   )}&numQuestions=${numQuestions}`
    // );
  };

  return (
    <Dialog className="h-20" open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Tell us about your job target
          </DialogTitle>
          <DialogDescription>
            Add details about the job position you're interviewing for. This
            helps our AI generate relevant questions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="">
          {error && (
            <div className="flex items-center gap-2 p-3 my-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title/Position</label>
              <Input
                placeholder="Ex. Senior Software Engineer"
                value={jobPos}
                onChange={(e) => setJobPos(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description</label>
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[120px]"
                value={jobDes}
                onChange={(e) => setJobDes(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Copy and paste the full job description from the job
                posting for best results.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Years of Experience</label>
              <Input
                placeholder="Ex. 5"
                type="number"
                min="0"
                max="40"
                value={jobExperience}
                onChange={(e) => setJobExperience(e.target.value)}
              />
            </div>

            {/* Resume Upload (now optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Upload Resume (PDF){" "}
                <span className="text-xs text-muted-foreground">
                  (Optional)
                </span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 ${
                  fileUploaded
                    ? "border-green-300 bg-green-50"
                    : "border-muted hover:border-muted-foreground/50"
                } text-center transition-colors`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {fileUploaded ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FileUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-green-600">
                            Resume Uploaded
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Click to replace
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium">
                            Click to upload your resume
                          </span>
                          <span className="text-xs text-muted-foreground">
                            PDF files only (optional)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {loading && (
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {uploadProgress < 100
                      ? `Processing resume... ${uploadProgress}%`
                      : "Resume processed successfully!"}
                  </p>
                </div>
              )}
            </div>

            {/* Interview Length Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Number of Questions
                </label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {numQuestions}
                </span>
              </div>
              <Slider
                defaultValue={[numQuestions]}
                min={3}
                max={15}
                step={1}
                onValueChange={(value) => setNumQuestions(value[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shorter</span>
                <span>Longer</span>
              </div>
            </div>
          </div>

          <div className="flex gap-5 justify-end mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Start Interview"}
            </Button>
          </div>
        </form>
        {jsonResp && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-medium">Generated Questions:</h3>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(jsonResp, null, 2)}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddNewInterview;
