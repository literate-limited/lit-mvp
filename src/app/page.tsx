import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-white">
      <h1 className="text-5xl font-bold text-teal-700 mb-4">Lit</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
        Language teaching platform. Create documents, translate, and teach live.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
          Get Started
        </Link>
        <Link href="/login" className="px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
}
