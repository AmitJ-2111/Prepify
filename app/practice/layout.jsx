"use client";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "../dashboard/_components/Header";

function PracticeLayout({ children }) {
  return (
    <SidebarProvider defaultOpen={true} collapsible="icon">
      <div className="flex min-h-screen flex-col">
        {/* Header is always visible */}
        <Header />

        {/* Page content */}
        <div className="flex-1">{children}</div>
      </div>
    </SidebarProvider>
  );
}

export default PracticeLayout;
