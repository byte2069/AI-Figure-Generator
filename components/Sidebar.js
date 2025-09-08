import { useState, useEffect } from "react";
import Image from "next/image";
import favicon from "../public/favicon.png";

export default function Sidebar({ setPrompt }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const prompts = [
    { title: "Prompt 1", value: "Prompt example 1" },
    { title: "Prompt 2", value: "Một bức tượng thần thoại Hy Lạp bằng đồng" },
    { title: "Prompt 3", value: "Nhân vật anime phong cách Studio Ghibli" },
    { title: "Prompt 4", value: "Robot chiến binh đứng trên núi tuyết" },
    { title: "Prompt 5", value: "Chân dung phong cách tranh sơn dầu" },
  ];

  // Auto mở PC, đóng mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 768) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }
  }, []);

  return (
    <>
      {/* Overlay cho mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar cho mobile */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-neutral-900 text-white shadow-lg border-r border-neutral-800
          transform transition-transform duration-300 ease-in-out z-50 md:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent
          open={open}
          setOpen={setOpen}
          prompts={prompts}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          setPrompt={setPrompt}
        />
      </div>

      {/* Sidebar cho desktop */}
      <div
        className={`
          hidden md:flex md:flex-col md:h-screen md:static md:z-auto bg-neutral-900 text-white shadow-lg border-r border-neutral-800
          transition-all duration-300 ease-in-out flex-shrink-0
          ${open ? "md:w-64" : "md:w-16"}
        `}
      >
        <SidebarContent
          open={open}
          setOpen={setOpen}
          prompts={prompts}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          setPrompt={setPrompt}
        />
      </div>

      {/* ✅ Nút toggle riêng cho mobile khi sidebar đóng */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-neutral-900 rounded hover:bg-neutral-800 transition md:hidden"
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

/* Nội dung sidebar (dùng lại cho mobile + desktop) */
function SidebarContent({
  open,
  setOpen,
  prompts,
  activeIndex,
  setActiveIndex,
  setPrompt,
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <Image src={favicon} alt="Logo" width={28} height={28} />
          {open && (
            <span className="font-semibold text-sm hidden md:inline">datnh</span>
          )}
        </div>

        {/* Toggle button trong header (chỉ hiện khi sidebar mở) */}
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
              if (window.innerWidth < 768) setOpen(false); // mobile auto đóng
            }}
            title={item.value}
          >
            {open && <span className="truncate">{item.title}</span>}
          </li>
        ))}
      </ul>
    </>
  );
}
