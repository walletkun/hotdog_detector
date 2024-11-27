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
      if (!user) return;

      try {
        //Fetch user profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        //If no profile data, create one with default values
        if (!data) {
          const defaultProfile = {
            user_id: user.id,
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

          if (insertError) throw insertError;
          setProfileData(newProfile);
        } else {
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);

        // Use mock data as fallback for now
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
  }, [user]);
  // Mock data - in a real app, this would come from a database
  //   const user = {
  //     name: "Hotdog Enthusiast",
  //     title: "Certified Wiener Wizard",
  //     hotdogsDetected: 42,
  //     notHotdogsDetected: 13,
  //     achievements: ["Mustard Master", "Bun Connoisseur", "Ketchup King"],
  //     recentStories: [
  //       {
  //         image: "/hotdog1.jpg",
  //         story:
  //           "This brave little hotdog survived the great Condiment War of '22. It's been seeking revenge on ketchup bottles ever since.",
  //         isHotdog: true,
  //       },
  //       {
  //         image: "/not-hotdog1.jpg",
  //         story:
  //           "Nice try, banana. Your curved shape doesn't fool me. You're no hotdog, just a wannabe wiener.",
  //         isHotdog: false,
  //       },
  //       {
  //         image: "/hotdog2.jpg",
  //         story:
  //           "This hotdog was raised in a vegetarian household. It's having an existential crisis.",
  //         isHotdog: true,
  //       },
  //     ],
  //   };

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
            {profileData.name}'s Hotdog Hall of Fame
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
            <Image
              src="/api/placeholder/400/300"
              alt={story.isHotdog ? "A majestic hotdog" : "A hotdog imposter"}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
            />
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
