"use client";

import { eq } from "drizzle-orm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "utils/db";
import { MockInterview } from "utils/schema";

function Interview() {
  const params = useParams();
  const [interviewData, setInterviewData] = useState();
  useEffect(() => {
    console.log(params.interviewID);
    GetInterviewDetails();
  }, []);
  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewID));
    setInterviewData(result[0]);
  };

  return <div>Interview Page</div>;
}

export default Interview;
