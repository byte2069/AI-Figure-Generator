import { useState, useEffect } from "react";
import Image from "next/image";
import favicon from "../public/favicon.png";

export default function Sidebar({ setPrompt }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  // Auto mở sidebar khi load trên PC
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setOpen(true);
    }
  }, []);

  const prompts = [
    { title: "Prompt 1", value: "Use the nano-banana model..." },
    { title: "Prompt 2", value: "Một bức tượng thần thoại Hy Lạp bằng đồng" },
    { title: "Prompt 3", value: "Nhân vật anime phong cách Studio Ghibli" },
    { title: "Prompt 4", value: "Robot chiến binh đứng trên núi tuyết" },
    { title: "Prompt 5", value: "Chân dung phong cách tranh sơn dầu" },
  ];

  return (
    <>
      {/* Overlay cho mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-neutral-900 text-white shadow-lg border-r border-neutral-800
          transform transition-transform duration-300 ease-in-out z-40
          ${open ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Image src={favicon} alt="Logo" width={28} height={28} />
            <span className="font-semibold text-sm">datnh</span>
          </div>
          {/* Nút đóng chỉ hiện trên mobile */}
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-neutral-800 rounded transition lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Prompt list */}
        <ul className="flex-1 overflow-y-auto p-2 text-sm space-y-1 h-[calc(100%-64px)]">
          {prompts.map((item, i) => (
            <li
              key={i}
              className={`px-3 py-2 rounded cursor-pointer truncate whitespace-nowrap transition
                ${
                  activeIndex === i
                    ? "bg-neutral-700 text-white"
                    : "hover:bg-neutral-800 text-gray-300"
                }`}
              onClick={() => {
                setPrompt(item.value);
                setActiveIndex(i);
                if (window.innerWidth < 1024) setOpen(false); // Mobile auto đóng
              }}
              title={item.value}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Nút toggle khi sidebar đóng (chỉ cho mobile) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-neutral-900 rounded hover:bg-neutral-800 transition lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
}
