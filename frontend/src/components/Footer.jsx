import React from "react";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
import logo from "../assets/logo.png"; // adjust path if needed

export default function Footer() {
  return (
    <footer className="w-full bg-[#124511]">
      <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center text-center">

        {/* Logo */}
        <img
          src={logo}
          alt="For Now"
          className="w-44 mb-8"
        />

        {/* Tagline */}
        <p className="text-sm text-white/80 max-w-md">
          Anonymous, but human — for now.
        </p>

        {/* Social icons */}
        <div className="flex gap-6 mt-8 text-white">
          <FaInstagram size={22} />
          <FaTwitter size={22} />
          <FaFacebookF size={22} />
        </div>

        {/* Divider */}
        <div className="w-full border-t border-white/20 my-10" />

        <p className="text-xs text-white/60">
          © {new Date().getFullYear()} forNow
        </p>
      </div>
    </footer>
  );
}