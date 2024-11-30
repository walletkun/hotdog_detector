import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();

    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations;

    const hotdogRelatedLabels = [
      "hot dog",
      "hotdog",
      "wiener",
      "knackwurst",
      "bratwurst",
      "frankfureter",
      "sausage",
      "hot dog bun",
      "vienna sausage",
    ];

    let totalScore = 0;
    let maxScore = 0;

    labels.forEach((label) => {
      const normalizedLabel = label.description.toLowerCase();

      // Give higher weight to direct matches
      if (normalizedLabel === "hot dog" || normalizedLabel === "hotdog") {
        totalScore += label.score * 2;
        maxScore = Math.max(maxScore, label.score * 2);
      }
      // Give medium weight to close matches
      else if (
        ["frankfurter", "wiener", "knackwurst"].includes(normalizedLabel)
      ) {
        totalScore += label.score * 1.5;
        maxScore = Math.max(maxScore, label.score * 1.5);
      }
      // Give lower weight to related terms
      else if (hotdogRelatedLabels.includes(normalizedLabel)) {
        totalScore += label.score;
        maxScore = Math.max(maxScore, label.score);
      }
    });

    const isHotdog = maxScore > 0.6 || totalScore > 1.2;

    return NextResponse.json({
      isHotdog,
      confidence: maxScore * 100,
      labels: labels.map((label) => ({
        description: label.description,
        score: label.score * 100,
      })),
      debug: {
        totalScore,
        maxScore,
        threshold: 0.6,
      },
    });
  } catch (error) {
    console.error("Vision API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
