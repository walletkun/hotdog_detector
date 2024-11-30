"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DogIcon as Hotdog, Camera, Award, Frown } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        setLoading(true);
        console.log("Attempting to load profile for user:", user.id);

        // Fetch user profile data
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Fetch error details:", fetchError);
          throw fetchError;
        }

        if (!existingProfile) {
          console.log("Creating new profile for user:", user.id);

          const defaultProfile = {
            id: user.id,
            name: user.email?.split("@")[0] || "Hotdog Enthusiast",
            title: "Novice Wiener Spotter",
            hotdogs_detected: 0,
            not_hotdogs_detected: 0,
            achievements: [],
            recent_stories: [],
          };

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([defaultProfile])
            .select()
            .single();

          if (insertError) {
            console.error("Insert error details:", insertError);
            throw insertError;
          }

          console.log("Successfully created profile:", newProfile);
          setProfileData(newProfile);
        } else {
          console.log("Found existing profile:", existingProfile);
          setProfileData(existingProfile);
        }
      } catch (error) {
        console.error("Profile error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Set fallback profile data
        setProfileData({
          name: user.email?.split("@")[0] || "Hotdog Enthusiast",
          title: "Novice Wiener Spotter",
          hotdogs_detected: 0,
          not_hotdogs_detected: 0,
          achievements: [],
          recent_stories: [],
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl font-bold text-red-600">Loading Hotdogs...</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {profileData.name}&apos;s Hotdog Hall of Fame
          </CardTitle>
          <p className="text-center text-xl font-semibold text-muted-foreground">
            {profileData.title}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 mb-4">
            <Badge variant="secondary" className="text-lg py-1 px-3">
              <Hotdog className="mr-2" />
              {profileData.hotdogs_detected} Hotdogs Detected
            </Badge>
            <Badge variant="destructive" className="text-lg py-1 px-3">
              <Frown className="mr-2" />
              {profileData.not_hotdogs_detected} Imposters Exposed
            </Badge>
          </div>
          <div className="flex justify-center flex-wrap gap-2 mb-4">
            {profileData.achievements?.map((achievement, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-md py-1 px-2"
              >
                <Award className="mr-1" size={16} />
                {achievement}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4 text-center">
        Recent Hotdog Adventures
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profileData.recent_stories?.map((story, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="relative w-full h-48">
              <Image
                src={story.imageUrl || "/api/placeholder/400/300"}
                alt={story.isHotdog ? "A majestic hotdog" : "A hotdog imposter"}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <Badge
                variant={story.isHotdog ? "default" : "destructive"}
                className="mb-2"
              >
                {story.isHotdog ? "Certified Hotdog" : "Imposter Alert"}
              </Badge>
              <p className="text-sm italic">{story.story}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button
          size="lg"
          className="text-xl px-8 py-6 bg-red-600 hover:bg-red-700"
          onClick={() => router.push("/detect")}
        >
          <Camera className="mr-2" /> Snap Another Wiener!
        </Button>
      </div>

      <p className="mt-8 text-center text-muted-foreground italic">
        Remember: With great hotdog power comes great hotdog responsibility.
      </p>
    </div>
  );
}
