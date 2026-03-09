"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/translate",
    label: "Translate",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill={active ? "#00BFA5" : "none"}
        stroke={active ? "#00BFA5" : "#9CA3AF"}
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 23h8" />
      </svg>
    ),
  },
  {
    href: "/phrasebook",
    label: "Phrases",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill="none"
        stroke={active ? "#00BFA5" : "#9CA3AF"}
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill="none"
        stroke={active ? "#00BFA5" : "#9CA3AF"}
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="max-w-md mx-auto flex items-center">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/translate" && pathname === "/translate");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-3 gap-1"
            >
              {item.icon(active)}
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-[#00BFA5]" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
