'use client'

import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function Home() {
const [count, setCount] = useState(1)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-base">
      <Navbar />

    </main>
  );
}
