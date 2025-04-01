// app/dashboard/_components/interviewStatsCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUser } from "@clerk/nextjs";
import { db } from "utils/db";
import { ReportData } from "utils/schema";
import { eq, desc } from "drizzle-orm";

export function InterviewStatsCard() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [improvement, setImprovement] = useState(0);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProgressData();
    }
  }, [isLoaded, user]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;

      // Get report data ordered by date
      const reportData = await db
        .select()
        .from(ReportData)
        .where(eq(ReportData.userEmail, userEmail))
        .orderBy(desc(ReportData.createdAt))
        .limit(10); // Only get the last 10 reports

      if (reportData.length > 0) {
        // Format the data for the chart
        const chartData = reportData
          .reverse() // Reverse to show oldest to newest
          .map((report) => {
            // Convert DD-MM-YYYY to a more readable format for the chart
            const [day, month, year] = report.createdAt.split("-");
            const monthNames = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            const formattedDate = `${monthNames[parseInt(month) - 1]} ${day}`;

            return {
              date: formattedDate,
              score: report.overallScore * 20, // Convert from 1-5 scale to percentage
            };
          });

        setProgressData(chartData);

        // Calculate improvement (difference between first and last score)
        if (chartData.length >= 2) {
          const firstScore = chartData[0].score;
          const lastScore = chartData[chartData.length - 1].score;
          setImprovement(lastScore - firstScore);
        }
      } else {
        // If no reports, use placeholder data
        setProgressData([{ date: "Today", score: 70 }]);
        setImprovement(0);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
      // Use placeholder data in case of error
      setProgressData([{ date: "Today", score: 70 }]);
      setImprovement(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Interview Performance Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progressData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Score"]}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{
                  fontSize: 12,
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {progressData.length >= 2 ? (
          <div className="mt-2 flex justify-between items-center text-sm text-muted-foreground">
            <div>Starting: {progressData[0].score}%</div>
            <div>Current: {progressData[progressData.length - 1].score}%</div>
            <div
              className={
                improvement >= 0
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {improvement >= 0 ? "↑" : "↓"} {Math.abs(improvement)}%
            </div>
          </div>
        ) : (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Complete more interviews to see your progress trend
          </div>
        )}
      </CardContent>
    </Card>
  );
}
