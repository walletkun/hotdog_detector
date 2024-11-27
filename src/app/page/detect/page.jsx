"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  DogIcon as Hotdog,
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

  useEffect(() => {
    if (!user) {
      router.push("/page/auth");
    }
  }, [user, router]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async (isHotdog, story) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      const newStory = {
        isHotdog,
        story,
        timestamp: new Date().toISOString(),
        imageUrl: image, // In a real app, you'd upload this to storage first
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
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const detectHotdog = () => {
    setLoading(true);
    setDetectionCount((prevCount) => prevCount + 1);
    // Simulating API call with setTimeout
    setTimeout(async () => {
      const isHotdog = Math.random() > 0.5;
      setResult(isHotdog);
      const story = getHotdogStory(isHotdog);
      await updateProfile(isHotdog, story);
      setLoading(false);
    }, 2000);
  };

  const getHotdogStory = (isHotdog) => {
    const hotdogStories = [
      "This hotdog has seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time, like ketchup in rain.",
      "Born in a food truck, raised in a bun, this hotdog dreamed of becoming a gourmet meal. Now it's living its best life as the star of your photo.",
      "This hotdog is actually an undercover vegetable on a secret mission. Don't blow its cover!",
      "Legend has it, this hotdog was forged in the fires of Mount Doom, one wiener to rule them all!",
      "This hotdog just finished its PhD in Quantum Mechanics. It's both a particle and a wave... of flavor!",
    ];

    const notHotdogStories = [
      "Nice try, but that's not a hotdog. That's clearly a submarine sandwich in disguise. We're onto you, sub!",
      "That's not a hotdog, that's just a very long meatball. Don't let it fool you!",
      "Hotdog? More like hot-nope! This imposter probably thinks a bun is a type of hairstyle.",
      "Our AI has detected a rare species: the elusive 'Notdogus Maximus'. National Geographic is on their way!",
      "This is the worst hotdog costume I've ever seen. It's like it's not even trying to be a hotdog!",
    ];

    const stories = isHotdog ? hotdogStories : notHotdogStories;
    return stories[Math.floor(Math.random() * stories.length)];
  };

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
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
          </div>

          {image && (
            <div className="mb-6">
              <Image
                src={image}
                alt="Uploaded image"
                width={400}
                height={300}
                className="w-full h-64 object-cover rounded-md"
              />
            </div>
          )}

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
              <p className="text-center italic">{getHotdogStory(result)}</p>
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
          Remember: In the world of hotdog detection, we don't make
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
