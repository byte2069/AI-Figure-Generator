import { useState } from "react";
import Image from "next/image";
import favicon from "../public/favicon.png";

export default function Sidebar({ setPrompt }) {
  const [open, setOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const prompts = [
    {
      title: "Prompt 1",
      value:
        "Use the nano-banana model to create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base with no text. On the computer screen, show the ZBrush modeling process of the figure. Beside the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.",
    },
    { title: "Prompt 2", value: "Một bức tượng thần thoại Hy Lạp bằng đồng" },
    { title: "Prompt 3", value: "Nhân vật anime phong cách Studio Ghibli" },
    { title: "Prompt 4", value: "Robot chiến binh đứng trên núi tuyết" },
    { title: "Prompt 5", value: "Chân dung phong cách tranh sơn dầu" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-neutral-900 text-white shadow-lg border-r border-neutral-800
        transition-all duration-300 ease-in-out
        ${open ? "w-64" : "w-16"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.location.reload()} // Reload toàn bộ trang như F5
        >
          <Image src={favicon} alt="Logo" width={28} height={28} />
          {open && <span className="font-semibold text-sm">datnh</span>}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-neutral-800 rounded transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
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
            }}
            title={item.value}
          >
            {open && <span className="truncate">{item.title}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
