"use client";

import { useState } from "react";
import Image from "next/image";

const slides = [
  {
    image: "/screenshots/session.jpg",
    description: "Easily lock in your focus and track your productivity.",
  },
  {
    image: "/screenshots/session_tracked.jpg",
    description: "Monitor tab and window activity for maximum efficiency.",
  },
  {
    image: "/screenshots/feed.jpg",
    description: "Connect with a community of focused individuals.",
  },
  {
    image: "/screenshots/leaderboard.jpg",
    description: "Compete with others to find who is the most Locked In.",
  },
];

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full" style={{ height: "400px" }}>
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="min-w-full flex flex-col items-center">
            <div className="relative w-full max-w-xs rounded-xl overflow-hidden aspect-[9/16]">
              <Image
                src={slide.image}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-lg text-center px-4">
              {slide.description}
            </p>
          </div>
        ))}
      </div>
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full"
        aria-label="Previous Slide"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full"
        aria-label="Next Slide"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {/* Dot Indicators */}
      <div className="mt-4 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-blue-500" : "bg-gray-400"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
