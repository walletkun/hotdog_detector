import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function GET() {
  try {
    const client = new vision.ImageAnnotatorClient({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    });

    const [result] = await client.labelDetection({
        image: {
            source: {
                imageUri: "https://cloud.google.com/vision/docs/images/bicycle_example.png"
            }
        }
    })

    return NextResponse.json({
        status: 'Credentials is working!',
        labels: result.labelAnnotations.map(label => label.description)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
