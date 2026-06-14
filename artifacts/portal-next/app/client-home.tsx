"use client";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@/pages/home"), { ssr: false });

export default function ClientHome() {
  return <Home />;
}
