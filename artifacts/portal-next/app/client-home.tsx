"use client";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@/views/home"), { ssr: false });

export default function ClientHome() {
  return <Home />;
}
