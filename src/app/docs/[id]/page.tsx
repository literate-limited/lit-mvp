"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface Page {
  id: string;
  kind: "text" | "translation";
  title: string;
  content: Record<string, string>;
}

interface Doc {
  id: string;
  title: string;
  pages: Page[];
  fromLanguage: string;
  toLanguage: string;
  sharedToken?: string | null;
  updatedAt: string;
}

export default function DocEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetch(`/api/docs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const pages = Array.isArray(data.pages) && data.pages.length > 0
          ? data.pages
          : [{ id: crypto.randomUUID(), kind: "translation" as const, title: "Translation 1", content: { native: "", target: "" } }];
        setDoc({ ...data, pages });
        setActivePageId(pages[0]?.id || null);
      });
  }, [id]);

  const scheduleSave = useCallback((nextDoc: Doc) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch(`/api/docs/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nextDoc.title, pages: nextDoc.pages }),
        });
        const updated = await res.json();
        setDoc((prev) => prev ? { ...prev, updatedAt: updated.updatedAt } : prev);
      } finally {
        setSaving(false);
      }
    }, 2000);
  }, [id]);

  const updateDoc = useCallback((updater: (d: Doc) => Doc) => {
    setDoc((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  const activePage = doc?.pages.find((p) => p.id === activePageId) || doc?.pages[0];

  const addPage = (kind: "text" | "translation") => {
    const page: Page = {
      id: crypto.randomUUID(),
      kind,
      title: kind === "translation" ? "Translation" : "Page",
      content: kind === "translation" ? { native: "", target: "" } : { text: "" },
    };
    updateDoc((d) => ({ ...d, pages: [...d.pages, page] }));
    setActivePageId(page.id);
  };

  const updatePageContent = (patch: Record<string, string>) => {
    if (!activePage) return;
    updateDoc((d) => ({
      ...d,
      pages: d.pages.map((p) => p.id === activePage.id ? { ...p, content: { ...p.content, ...patch } } : p),
    }));
  };

  const translate = async () => {
    if (!activePage || activePage.kind !== "translation") return;
    const text = activePage.content.native?.trim();
    if (!text) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: doc?.fromLanguage || "fr", to: doc?.toLanguage || "en" }),
      });
      const data = await res.json();
      updatePageContent({ target: data.translation });
    } finally {
      setTranslating(false);
    }
  };

  const share = async () => {
    const res = await fetch(`/api/docs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generateShareToken: true }),
    });
    const updated = await res.json();
    setDoc((prev) => prev ? { ...prev, sharedToken: updated.sharedToken } : prev);
    const url = `${window.location.origin}/shared/${updated.sharedToken}`;
    navigator.clipboard.writeText(url).catch(() => {});
    alert(`Share link copied: ${url}`);
  };

  if (!doc) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-gray-700">← Back</button>
          <input
            value={doc.title}
            onChange={(e) => updateDoc((d) => ({ ...d, title: e.target.value }))}
            className="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none px-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm">
            <button onClick={() => setFontSize((f) => Math.max(12, f - 2))} className="px-2 py-1 rounded hover:bg-gray-100">A-</button>
            <span className="text-gray-400">{fontSize}px</span>
            <button onClick={() => setFontSize((f) => Math.min(56, f + 2))} className="px-2 py-1 rounded hover:bg-gray-100">A+</button>
          </div>
          <button onClick={share} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Share</button>
          {saving && <span className="text-xs text-gray-400">Saving...</span>}
        </div>
      </header>

      {/* Page tabs */}
      <div className="bg-white border-b px-6 py-2 flex items-center gap-2 overflow-x-auto">
        {doc.pages.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePageId(p.id)}
            className={`px-3 py-1 rounded text-sm ${p.id === activePage?.id ? "bg-teal-100 text-teal-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {p.title}
          </button>
        ))}
        <button onClick={() => addPage("translation")} className="px-2 py-1 text-sm text-teal-600 hover:bg-teal-50 rounded">+ Translation</button>
        <button onClick={() => addPage("text")} className="px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded">+ Text</button>
      </div>

      {/* Editor */}
      <main className="max-w-6xl mx-auto p-6">
        {activePage?.kind === "translation" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-2 border-b text-sm font-medium text-gray-600">{doc.fromLanguage.toUpperCase()}</div>
              <textarea
                style={{ fontSize }}
                className="w-full h-[65vh] p-4 resize-none outline-none"
                placeholder="Type in source language..."
                value={activePage.content.native || ""}
                onChange={(e) => updatePageContent({ native: e.target.value })}
              />
            </div>
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="px-4 py-2 border-b text-sm font-medium text-gray-600">{doc.toLanguage.toUpperCase()}</div>
              <textarea
                style={{ fontSize }}
                className="w-full h-[65vh] p-4 resize-none outline-none"
                placeholder="Translation..."
                value={activePage.content.target || ""}
                onChange={(e) => updatePageContent({ target: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm">
            <textarea
              style={{ fontSize }}
              className="w-full h-[70vh] p-6 resize-none outline-none"
              placeholder="Start typing..."
              value={activePage?.content.text || ""}
              onChange={(e) => updatePageContent({ text: e.target.value })}
            />
          </div>
        )}

        {activePage?.kind === "translation" && (
          <div className="mt-4">
            <button
              onClick={translate}
              disabled={translating}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {translating ? "Translating..." : "Translate →"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
