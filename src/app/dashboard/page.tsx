"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Doc {
  id: string;
  title: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const createDoc = async () => {
    const res = await fetch("/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Document" }),
    });
    const doc = await res.json();
    router.push(`/docs/${doc.id}`);
  };

  const startMeeting = async () => {
    const res = await fetch("/api/meet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const meet = await res.json();
    router.push(`/meet/${meet.code}`);
  };

  const deleteDoc = async (id: string) => {
    await fetch(`/api/docs/${id}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-teal-700">Lit</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.user?.name}</span>
          <button onClick={() => signOut()} className="text-sm text-red-500 hover:underline">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Documents</h2>
          <div className="flex gap-3">
            <button onClick={createDoc} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              + New Doc
            </button>
            <button onClick={startMeeting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Start Meeting
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : docs.length === 0 ? (
          <p className="text-gray-500">No documents yet. Create one!</p>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                <Link href={`/docs/${doc.id}`} className="text-teal-700 font-medium hover:underline">
                  {doc.title}
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                  <button onClick={() => deleteDoc(doc.id)} className="text-red-400 hover:text-red-600 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
