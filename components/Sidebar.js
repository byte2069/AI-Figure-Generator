import { useState, useEffect } from "react";
import Image from "next/image";
import favicon from "../public/favicon.png";

export default function Sidebar({ setPrompt }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const prompts = [
    { title: "New Prompt", value: "" },
    { title: "3D Model Printing", value: "Use the nano-banana model to create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base with no text. On the computer screen, show the ZBrush modeling process of the figure. Beside the computer screen, place a BANDAI-style toy packaging box printed with the original artwork." },
    { title: "Career Toy Maker", value: "A full-figure action figure of a [GENDER] displayed in its original blister pack packaging. 3D toy style. On the top packaging card, the name '[NAME]' is written prominently, with the role '[CAREER]' written below it. The figure represents [TÊN_NGƯỜI] and is wearing [OUTFIT]. Inside the blister pack, next to the figure, are the following accessories: [ACCESSORIES]. The packaging card has a [BOX_DESIGN]. [OPTIONAL_STYLE]. Photorealistic rendering, studio lighting, clear focus on the packaging and figure. --ar 2:3" },
    { title: "3D Isometric", value: "Create image A 3D isometric figure doll house-style diorama scene of a [Giới Tính] character resembling the uploaded face image, wearing [Trang phục], standing confidently in a cozy miniature office space with [robot hút bụi, laptop, đồ trang trí, tranh biểu đồ,...anh em muốn thêm gì thêm]. The character is holding [phụ kiện cầm trên tay nhân vật như ly cà phê, sổ tay,...]. A small fantasy creature stands near her foot, inspired by [pixar (nếu thích cái khác thì cứ đổi nhé]. Wooden-textured floor and walls, custom nameplate reading [NgocVy] and [Reviewer]. Warm ambient lighting, subtle shadows, diorama framing. Created Using: blender sculpting, rendering, cinematic light, Pixar tone, handcrafted detail, soft DOF, f/2.8 simulated lens, photoreal texture --ar 1:1" },
    { title: "Underwater", value: "Underwater people, underwater lighting, realistic bubbles and water refraction effects. Hyper-realistic and natural shadows. Ensure people stay true to the original photo, fully integrated into the underwater environment, preserving facial and body details" },
    ];

 // Auto mở trên PC, đóng trên mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 768) {
        setOpen(true); // PC auto mở
      } else {
        setOpen(false); // Mobile auto đóng
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
          hidden md:flex md:flex-col md:h-screen md:static md:top-0 md:left-0
    bg-neutral-900 text-white shadow-lg border-r border-neutral-800
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

      {/* Nút toggle mobile khi sidebar đóng */}
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
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <Image src={favicon} alt="Logo" width={28} height={28} />
          {open && (
            <span className="font-semibold text-sm hidden md:inline">datnh</span>
          )}
        </div>
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
              if (window.innerWidth < 768) setOpen(false);
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


