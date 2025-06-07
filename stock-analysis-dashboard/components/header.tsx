"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#2FA5D4]/20 bg-[#191A1A] px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-white hover:bg-[#2FA5D4]/10 hover:text-[#2FA5D4]"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-[#2FA5D4]"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-lg font-bold text-white">Stock Analysis Dashboard</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button className="bg-[#2FA5D4] hover:bg-[#2FA5D4]/80 text-white">Run New Analysis</Button>
      </div>
    </header>
  )
}
