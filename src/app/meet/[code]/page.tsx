"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

interface MeetInfo {
  code: string;
  docId?: string;
  sharedToken?: string;
}

export default function MeetRoomPage() {
  const { code } = useParams<{ code: string }>();
  const [meet, setMeet] = useState<MeetInfo | null>(null);
  const [error, setError] = useState("");
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [docVisible, setDocVisible] = useState(true);
  const [dragPos, setDragPos] = useState({ x: 20, y: 20 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`/api/meet/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setMeet(data);
      })
      .catch(() => setError("Failed to load meeting"));
  }, [code]);

  // Jitsi embed
  useEffect(() => {
    if (!meet || !jitsiRef.current) return;
    const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "jitsi.litsuite.app";
    const container = jitsiRef.current;
    container.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.src = `https://${domain}/${code}`;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.allow = "camera; microphone; fullscreen; display-capture";
    container.appendChild(iframe);

    return () => { container.innerHTML = ""; };
  }, [meet, code]);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setDragPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!meet) return <div className="p-6">Loading meeting...</div>;

  const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/meet/${code}`;

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Jitsi */}
      <div ref={jitsiRef} className="absolute inset-0" />

      {/* Join link */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-10">
        Join: <span className="font-mono select-all">{joinUrl}</span>
        <button onClick={() => { navigator.clipboard.writeText(joinUrl); }} className="ml-2 text-teal-300 hover:underline">Copy</button>
      </div>

      {/* Toggle doc button */}
      <button
        onClick={() => setDocVisible(!docVisible)}
        className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-20"
      >
        {docVisible ? "Hide Doc" : "Show Doc"}
      </button>

      {/* Floating doc viewer */}
      {docVisible && meet.sharedToken && (
        <div
          className="absolute z-10 bg-white rounded-xl shadow-2xl overflow-hidden"
          style={{ left: dragPos.x, top: dragPos.y, width: 500, height: 400 }}
        >
          <div
            onMouseDown={handleMouseDown}
            className="bg-gray-100 px-3 py-2 cursor-move text-sm text-gray-600 select-none border-b"
          >
            ⠿ Drag | Document Viewer
          </div>
          <iframe
            src={`/shared/${meet.sharedToken}`}
            className="w-full h-[calc(100%-36px)] border-none"
          />
        </div>
      )}
    </div>
  );
}
