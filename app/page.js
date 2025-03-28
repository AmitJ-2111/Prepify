import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <header className="mb-12 flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="Prepify Logo"
          width={120}
          height={120}
          className="rounded-full shadow-lg"
        />
        <h1 className="mt-4 text-4xl font-bold text-gray-800">Prepify</h1>
      </header>
      <main className="flex flex-col items-center gap-6">
        <Link
          href="/sign-in"
          className="w-48 text-center py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="w-48 text-center py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition duration-200"
        >
          Sign Up
        </Link>
      </main>
      <footer className="mt-12 text-gray-600 text-sm">
        © {new Date().getFullYear()} Prepify. All rights reserved.
      </footer>
    </div>
  );
}
