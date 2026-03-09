"use client";

import { useSearchParams } from "next/navigation";

export default function ResumeViewer() {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");

  if (!file) {
    return <p className="text-white">No resume found</p>;
  }

  return (
    <div className="w-screen h-screen bg-black">
      <embed
        src={decodeURIComponent(file)}
        type="application/pdf"
        width="100%"
        height="100%"
      />
    </div>
  );
}
