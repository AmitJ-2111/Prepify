// components/ui/loading.jsx
import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
