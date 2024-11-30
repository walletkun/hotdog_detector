"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  Dog as Hotdog,
  XCircle,
  Upload,
  Loader2,
  Sandwich,
  Carrot,
  Pizza,
} from "lucide-react";

export default function DetectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [generatedStory, setGeneratedStory] = useState(null);

  console.log(user);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file.");
      }

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(
          "Image file is too large. Please upload an image under 5MB."
        );
      }

      // Create unique file name with timestamp
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Log before upload
      console.log("Attempting to upload:", {
        fileName,
        fileSize: file.size,
        fileType: file.type,
      });

      const { data, error: uploadError } = await supabase.storage
        .from("hotdog-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", data);

      const {
        data: { publicUrl },
        error: urlError,
      } = supabase.storage.from("hotdog-images").getPublicUrl(fileName);

      if (urlError) {
        console.error("URL generation error:", urlError);
        throw urlError;
      }

      console.log("Public URL generated:", publicUrl);
      setImage(publicUrl);
    } catch (error) {
      console.error("Error handling image upload:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      alert(error.message || "Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (isHotdog, story) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) throw fetchError;

      const newStory = {
        isHotdog,
        story,
        timestamp: new Date().toISOString(),
        imageUrl: image,
      };

      const updates = {
        recent_stories: [...(profile.recent_stories || []), newStory].slice(-5),
        hotdogs_detected: isHotdog
          ? profile.hotdogs_detected + 1
          : profile.hotdogs_detected,
        not_hotdogs_detected: !isHotdog
          ? profile.not_hotdogs_detected + 1
          : profile.not_hotdogs_detected,
      };

      // Check for achievements
      const totalDetections =
        updates.hotdogs_detected + updates.not_hotdogs_detected;
      const achievements = [...(profile.achievements || [])];

      if (totalDetections >= 10 && !achievements.includes("Novice Detective")) {
        achievements.push("Novice Detective");
      }
      if (
        updates.hotdogs_detected >= 5 &&
        !achievements.includes("Mustard Master")
      ) {
        achievements.push("Mustard Master");
      }
      if (
        updates.not_hotdogs_detected >= 5 &&
        !achievements.includes("Imposter Hunter")
      ) {
        achievements.push("Imposter Hunter");
      }

      updates.achievements = achievements;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const detectHotdog = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    try {
      setLoading(true);
      console.log("Detecting hotdog...", image);

      const detectResponse = await fetch("/api/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: image }),
      });

      if (!detectResponse.ok) {
        throw new Error(`HTTP error! status: ${detectResponse.status}`);
      }

      const detectData = await detectResponse.json();
      console.log("Detection data:", detectData);

      const storyResponse = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isHotdog: detectData.isHotdog,
          labels: detectData.labels,
        }),
      });

      if (!storyResponse.ok) {
        throw new Error("Failed to generate story");
      }

      const { story } = await storyResponse.json();
      console.log("Generated story:", story);

      setResult(detectData.isHotdog);
      setGeneratedStory(story);
      await updateProfile(detectData.isHotdog, story);
      setDetectionCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error in detection process:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const getHotdogStory = (isHotdog) => {
  //   const hotdogStories = [
  //     "This hotdog has seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time, like ketchup in rain.",
  //     "Born in a food truck, raised in a bun, this hotdog dreamed of becoming a gourmet meal. Now it's living its best life as the star of your photo.",
  //     "This hotdog is actually an undercover vegetable on a secret mission. Don't blow its cover!",
  //     "Legend has it, this hotdog was forged in the fires of Mount Doom, one wiener to rule them all!",
  //     "This hotdog just finished its PhD in Quantum Mechanics. It's both a particle and a wave... of flavor!",
  //   ];

  //   const notHotdogStories = [
  //     "Nice try, but that's not a hotdog. That's clearly a submarine sandwich in disguise. We're onto you, sub!",
  //     "That's not a hotdog, that's just a very long meatball. Don't let it fool you!",
  //     "Hotdog? More like hot-nope! This imposter probably thinks a bun is a type of hairstyle.",
  //     "Our AI has detected a rare species: the elusive 'Notdogus Maximus'. National Geographic is on their way!",
  //     "This is the worst hotdog costume I've ever seen. It's like it's not even trying to be a hotdog!",
  //   ];

  //   const stories = isHotdog ? hotdogStories : notHotdogStories;
  //   return stories[Math.floor(Math.random() * stories.length)];
  // };

  const getRandomLoadingMessage = () => {
    const messages = [
      "Consulting the Council of Wieners...",
      "Analyzing bun-to-sausage ratio...",
      "Checking for illegal condiments...",
      "Measuring mustard molecules...",
      "Calibrating ketchup sensors...",
      "Scanning for sneaky pickles...",
      "Interrogating nearby hot dog stands...",
      "Reviewing hot dog history books...",
      "Consulting the Oracle of Oscar Mayer...",
      "Performing quantum entanglement with relish particles...",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        The Moment of Truth: Hotdog or Not?
      </h1>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <Label
              htmlFor="image-upload"
              className="text-lg font-semibold mb-2 block"
            >
              Upload Your Suspect Image
            </Label>

            <div className="space-y-4">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
                className="cursor-pointer"
              />

              {loading && (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin inline-block" />
                  <p className="text-sm text-gray-500 mt-2">
                    Uploading image...
                  </p>
                </div>
              )}

              {/* Image Preview */}
              {image && !loading && (
                <div className="relative">
                  <Image
                    src={image}
                    alt="Uploaded image"
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImage(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={detectHotdog}
            disabled={!image || loading}
            className="w-full text-xl py-6 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {getRandomLoadingMessage()}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Unleash the Hotdog Oracle!
              </>
            )}
          </Button>

          {result !== null && !loading && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <div className="flex items-center justify-center mb-4">
                {result ? (
                  <Hotdog className="text-green-500 h-16 w-16 animate-bounce" />
                ) : (
                  <XCircle className="text-red-500 h-16 w-16 animate-spin" />
                )}
              </div>
              <p className="text-xl font-bold text-center mb-2">
                {result
                  ? "It's a bonafide hotdog!"
                  : "Not a hotdog! The disappointment is immeasurable."}
              </p>
              {generatedStory && (
                <p className="text-center italic">{generatedStory}</p>
              )}
            </div>
          )}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Hotdog Detection Attempts: {detectionCount}
            </p>
            {detectionCount > 5 && (
              <p className="text-xs text-red-500 mt-2">
                Warning: Excessive hotdog detection may lead to uncontrollable
                cravings and spontaneous visits to ballparks.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground italic mb-4">
          Remember: In the world of hotdog detection, we don&apos;t make
          mistakes—just happy little condiments.
        </p>
        <div className="flex justify-center space-x-4">
          <Sandwich className="text-yellow-600" />
          <Pizza className="text-red-500" />
          <Carrot className="text-orange-500" />
        </div>
        <p className="text-xs mt-2">
          Other foods are available, but why bother?
        </p>
      </div>
    </div>
  );
}
