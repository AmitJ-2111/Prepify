export async function POST(req) {
    try {
      const { pdf_base64 } = await req.json();
  
      if (!pdf_base64) {
        return new Response(JSON.stringify({ error: "Missing PDF data" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
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
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Error processing PDF" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  