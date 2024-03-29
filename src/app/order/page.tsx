'use client'

import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(1)

  return (
    <main className="min-h-screen max-w-screen-xl bg-gradient-to-t from-pink-300 to bg-pink-200 flex flex-col justify-between">
      <header className="min-w-full flex justify-center items-center py-3">
        <img src="./Logo.svg" />
      </header>

      <div className="ae-drop-container">

      </div>

      <footer className="ae-order-footer">
        <span>꒰ა 𝑳𝒆𝒕 𝒖𝒔 𝒆𝒎𝒃𝒓𝒂𝒄𝒆 𝒚𝒐𝒖𝒓 𝒈𝒊𝒓𝒍𝒚 𝒈𝒊𝒓𝒍 ໒꒱</span>
      </footer>
    </main>
  );
}
