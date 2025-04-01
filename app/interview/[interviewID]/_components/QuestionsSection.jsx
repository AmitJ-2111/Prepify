//app/interview/[interviewID]/_components/QuestionsSection.jsx
import React from "react";

function QuestionsSection({ mockInterviewQuestion, activeQuestionIndex }) {
  return (
    mockInterviewQuestion && (
      <div className="p-5 border rounded-lg bg-card">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockInterviewQuestion &&
            mockInterviewQuestion?.map((question, index) => (
              <h2
                key={index}
                className={`p-2 rounded-full text-xs md:text-sm text-center cursor-pointer transition-colors ${
                  activeQuestionIndex === index
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                    : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                Question #{index + 1}
              </h2>
            ))}
        </div>

        <h2 className="my-4 text-md md:text-lg ">
          {mockInterviewQuestion[activeQuestionIndex]?.question}
        </h2>
      </div>
    )
  );
}

export default QuestionsSection;
