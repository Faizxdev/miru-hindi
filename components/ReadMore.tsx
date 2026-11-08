"use client";
import { useState } from "react";

export default function ReadMore({ text, max = 200 }: { text: string; max?: number }) {
  const [open, setOpen] = useState(false);
  if (!text || text.length <= max) return <p className="text-gray-300 text-sm leading-6">{text}</p>;
  return (
    <div className="text-sm leading-6 text-gray-300">
      {open ? text : text.slice(0, max) + '…'}
      <button className="ml-2 text-purple-400 hover:text-purple-300 hover:underline transition-colors" onClick={() => setOpen(!open)}>{open ? 'Show Less' : 'Read More'}</button>
    </div>
  );
}


