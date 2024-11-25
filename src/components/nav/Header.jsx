import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed w-full top-0 left-0 z-50 bg-white bg-opacity-90 shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-red-600">
          HotdogAI 2.0
        </Link>
        <nav>
          <Button variant="outline" className="mr-2">
            Sign In
          </Button>
          <Button>Register</Button>
        </nav>
      </div>
    </header>
  );
}
