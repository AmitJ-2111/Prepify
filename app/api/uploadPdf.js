export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { pdf_base64 } = req.body;

    if (!pdf_base64) {
      return res.status(400).json({ error: "Missing PDF data" });
    }

    // Call AWS API Gateway
    const response = await fetch(
      "https://6pl3u5ztvf.execute-api.us-east-2.amazonaws.com/default/pdf",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_base64 }),
      }
    );

    if (!response.ok) {
      throw new Error("AWS API Gateway returned an error");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error processing PDF" });
  }
}
