"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface SharedDoc {
  title: string;
  pages: Array<{ id: string; kind: string; title: string; content: Record<string, string> }>;
  fromLanguage: string;
  toLanguage: string;
}

export default function SharedDocPage() {
  const { token } = useParams<{ token: string }>();
  const [doc, setDoc] = useState<SharedDoc | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/docs/shared/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setDoc(data);
      });
  }, [token]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!doc) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{doc.title}</h1>
      {doc.pages.map((page) => (
        <div key={page.id} className="mb-6 bg-white rounded-xl border p-4">
          <h3 className="font-medium text-gray-600 mb-2">{page.title}</h3>
          {page.kind === "translation" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">{doc.fromLanguage.toUpperCase()}</div>
                <div className="whitespace-pre-wrap">{page.content.native}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">{doc.toLanguage.toUpperCase()}</div>
                <div className="whitespace-pre-wrap">{page.content.target}</div>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{page.content.text}</div>
          )}
        </div>
      ))}
    </div>
  );
}
