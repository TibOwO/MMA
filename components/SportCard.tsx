"use client";
// src/components/SportCard.tsx
import React from "react";
import { useRouter } from "next/navigation";

interface SportCardProps {
  name: string;
  description: string;
  imageUrl: string;
  link: string;
}

const SportCard: React.FC<SportCardProps> = ({ name, description, imageUrl, link }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(link)}
      className="relative rounded-xl overflow-hidden shadow-lg h-64 cursor-pointer transform hover:scale-105 transition-transform duration-300"
      style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/40 transition-colors hover:bg-black/60"></div>
      <div className="absolute bottom-0 p-6 text-white">
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="mt-1 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default SportCard;