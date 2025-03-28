import { useState } from "react";

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const uploadPDF = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    // Convert PDF to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result.split(",")[1]; // Remove "data:application/pdf;base64,"

      if (!base64String) {
        setError("Failed to convert PDF.");
        setLoading(false);
        return;
      }

      try {
        // Call the Next.js API Route instead of AWS directly
        const response = await fetch("/api/uploadPdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdf_base64: base64String }),
        });

        if (!response.ok) {
          throw new Error("Failed to process PDF.");
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError("Error processing PDF.");
      }

      setLoading(false);
    };
  };

  return (
    <div className="flex flex-col items-center">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
        onClick={uploadPDF}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Upload & Convert"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg w-full max-w-2xl">
          <h3 className="text-lg font-bold">Extracted Data:</h3>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
