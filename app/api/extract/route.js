// // app/api/extract/route.js
// import { NextResponse } from "next/server";

// import * as pdfjs from "pdfjs-dist";
// import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// // Initialize the worker with the appropriate path
// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// export async function POST(req) {
//   try {
//     console.log("✅ Extract API POST request received");

//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     console.log("📂 File received:", file.name);
//     const fileBuffer = Buffer.from(await file.arrayBuffer());

//     // Use pdf.js to extract text
//     const extractedText = await extractTextFromPDF(fileBuffer);

//     return NextResponse.json({
//       message: "✅ PDF Parsed Successfully",
//       data: extractedText || "No text extracted",
//     });
//   } catch (error) {
//     console.error("❌ Error in PDF extraction:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// async function extractTextFromPDF(pdfBuffer) {
//   try {
//     // Load the PDF document
//     const loadingTask = pdfjs.getDocument({ data: pdfBuffer });
//     const pdf = await loadingTask.promise;
    
//     let fullText = "";
    
//     // Extract text from each page
//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const textContent = await page.getTextContent();
      
//       // Join the text items with spaces
//       const pageText = textContent.items
//         .map(item => item.str)
//         .join(" ");
      
//       fullText += pageText + "\n\n";
//     }
    
//     // Clean up the text - remove excessive whitespace
//     fullText = fullText
//       .replace(/\s+/g, " ")
//       .trim()
//       .replace(/\n\s*\n/g, "\n\n");
    
//     return fullText;
//   } catch (error) {
//     console.error("Error extracting text from PDF:", error);
//     throw error;
//   }
// }