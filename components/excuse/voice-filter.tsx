"use client"

import { Button } from "@/components/ui/button"

interface VoiceFilterProps {
  activeVoice: string | null
  setActiveVoice: (voice: string | null) => void
}

export function VoiceFilter({ activeVoice, setActiveVoice }: VoiceFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full px-4 ${
          activeVoice === null ? "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900" : ""
        }`}
        onClick={() => setActiveVoice(null)}
      >
        All
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full px-4 ${
          activeVoice === "soprano"
            ? "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200 hover:text-pink-900"
            : ""
        }`}
        onClick={() => setActiveVoice("soprano")}
      >
        Soprano
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full px-4 ${
          activeVoice === "alto"
            ? "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 hover:text-purple-900"
            : ""
        }`}
        onClick={() => setActiveVoice("alto")}
      >
        Alto
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full px-4 ${
          activeVoice === "tenor"
            ? "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
            : ""
        }`}
        onClick={() => setActiveVoice("tenor")}
      >
        Tenor
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full px-4 ${
          activeVoice === "bass"
            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
            : ""
        }`}
        onClick={() => setActiveVoice("bass")}
      >
        Bass
      </Button>
    </div>
  )
}
