"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Pass false to hide back button, or a custom ReactNode for the left slot */
  left?: React.ReactNode | false;
  right?: React.ReactNode;
}

function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
      aria-label="Go back"
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

export function Header({ title, subtitle, left, right }: HeaderProps) {
  const showBack = left === undefined; // default: show back button
  const leftNode = left === false ? <div className="w-9" /> : left ?? <BackButton />;

  return (
    <div className={`px-5 pt-14 ${subtitle ? "pb-6" : "pb-4"}`}>
      {subtitle ? (
        // Large title style (Settings-style)
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1C1C1E]">{title}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          {right && <div className="mt-1">{right}</div>}
        </div>
      ) : (
        // Compact nav style (Translate / Home style)
        <div className="flex items-center justify-between">
          {leftNode}
          <h2 className="text-base font-bold">{title}</h2>
          <div className="w-9 flex justify-end">{right ?? <div />}</div>
        </div>
      )}
    </div>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
