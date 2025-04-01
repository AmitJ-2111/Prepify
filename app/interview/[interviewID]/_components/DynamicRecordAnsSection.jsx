"use client";

import dynamic from "next/dynamic";

const DynamicRecordAnsSection = dynamic(() => import("./RecordAnsSection"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-10">
      Loading recording component...
    </div>
  ),
});

export default DynamicRecordAnsSection;
