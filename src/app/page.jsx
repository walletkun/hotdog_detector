import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-yellow-100">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 text-red-600 animate-bounce">
          AI Hotdog Detector 2.0: The Revenge
        </h1>
        <div className="relative flex place-items-center mb-8">
          <Image
            src="/hotdog-meme.jpg"
            alt="Hotdog Meme"
            width={500}
            height={300}
            className="rounded-lg shadow-2xl"
          />
        </div>
        <p className="text-2xl text-center mb-8 font-bold text-gray-800">
          "It's not just a hotdog detector... it's a hotdog life story
          generator!"
        </p>
        <div className="flex justify-center">
          <Button
            size="lg"
            className="text-xl px-8 py-6 bg-red-600 hover:bg-red-700"
          >
            Detect Hotdogs Now!
          </Button>
        </div>
        <p className="mt-8 text-center text-gray-600 italic">
          Warning: May cause uncontrollable laughter and intense cravings for
          mustard.
        </p>
      </div>
    </main>
  );
}
