"use client"

import { useState } from "react"
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Radio, Video, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

interface MediaItem {
  id: number
  title: string
  artist?: string
  duration: string
  thumbnail: string
  type: "music" | "radio" | "video"
}

export function StreamingContent() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  const mediaItems: MediaItem[] = [
    {
      id: 1,
      title: "In Too Deep",
      artist: "Sum 41",
      duration: "3:27",
      thumbnail: "/placeholder.svg?height=60&width=60",
      type: "music",
    },
    {
      id: 2,
      title: "Complicated",
      artist: "Avril Lavigne",
      duration: "4:05",
      thumbnail: "/placeholder.svg?height=60&width=60",
      type: "music",
    },
    {
      id: 3,
      title: "Numb",
      artist: "Linkin Park",
      duration: "3:07",
      thumbnail: "/placeholder.svg?height=60&width=60",
      type: "music",
    },
    {
      id: 4,
      title: "Alternative Rock Radio",
      artist: "Live Stream",
      duration: "24/7",
      thumbnail: "/placeholder.svg?height=60&width=60",
      type: "radio",
    },
    {
      id: 5,
      title: "Top 40 Hits",
      artist: "Live Stream",
      duration: "24/7",
      thumbnail: "/placeholder.svg?height=60&width=60",
      type: "radio",
    },
    {
      id: 6,
      title: "Matrix Reloaded Trailer",
      duration: "2:30",
      thumbnail: "/placeholder.svg?height=60&width=60",
      type: "video",
    },
    {
      id: 7,
      title: "Friends S09E05",
      duration: "22:15",
      thumbnail: "/placeholder.svg?height=60&width=60",
      type: "video",
    },
    {
      id: 8,
      title: "MTV Music Videos",
      duration: "Live",
      thumbnail: "/placeholder.svg?height=60&width=60",
      type: "video",
    },
  ]

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const handleProgressChange = (value: number[]) => {
    setCurrentProgress(value[0])
  }

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media)
    setIsPlaying(true)
    setCurrentProgress(0)
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "music":
        return <Music className="w-4 h-4" />
      case "radio":
        return <Radio className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      default:
        return <Music className="w-4 h-4" />
    }
  }

  return (
    <div className="border border-[#D4D0C8] rounded-md overflow-hidden bg-white h-full flex flex-col">
      <Tabs defaultValue="music" className="flex flex-col h-full">
        <div className="bg-[#ECE9D8] border-b border-[#D4D0C8] p-2">
          <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8]">
            <TabsTrigger value="music" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <Music className="w-3 h-3 mr-1" />
              Music
            </TabsTrigger>
            <TabsTrigger value="radio" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <Radio className="w-3 h-3 mr-1" />
              Radio
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <Tv className="w-3 h-3 mr-1" />
              Video
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 flex flex-col md:flex-row">
          <div className="md:w-2/3 p-4 overflow-y-auto">
            <TabsContent value="music" className="m-0 h-full">
              <h3 className="text-md font-semibold mb-3">Music Library</h3>
              <div className="space-y-2">
                {mediaItems
                  .filter((item) => item.type === "music")
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMediaSelect(item)}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedMedia?.id === item.id ? "bg-[#D9E7F5]" : "hover:bg-[#EBE8D8]"
                      }`}
                    >
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        className="w-10 h-10 rounded-md border border-[#D4D0C8]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.artist}</div>
                      </div>
                      <div className="text-xs text-gray-500">{item.duration}</div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="radio" className="m-0 h-full">
              <h3 className="text-md font-semibold mb-3">Radio Stations</h3>
              <div className="space-y-2">
                {mediaItems
                  .filter((item) => item.type === "radio")
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMediaSelect(item)}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedMedia?.id === item.id ? "bg-[#D9E7F5]" : "hover:bg-[#EBE8D8]"
                      }`}
                    >
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        className="w-10 h-10 rounded-md border border-[#D4D0C8]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.artist}</div>
                      </div>
                      <div className="text-xs text-gray-500">{item.duration}</div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="video" className="m-0 h-full">
              <h3 className="text-md font-semibold mb-3">Video Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mediaItems
                  .filter((item) => item.type === "video")
                  .map((item) => (
                    <Card
                      key={item.id}
                      onClick={() => handleMediaSelect(item)}
                      className={`cursor-pointer border-[#D4D0C8] ${
                        selectedMedia?.id === item.id ? "bg-[#D9E7F5]" : "hover:bg-[#EBE8D8]"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-video bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                          <Play className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.duration}</div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </div>

          <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-[#D4D0C8] bg-[#F5F4EA] p-4 flex flex-col">
            <div className="flex-1">
              {selectedMedia ? (
                <div className="flex flex-col items-center">
                  <div className="bg-[#D4D0C8] rounded-md p-1 mb-4 w-full max-w-[200px] aspect-square flex items-center justify-center">
                    {selectedMedia.type === "video" ? (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-50" />
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={selectedMedia.thumbnail || "/placeholder.svg"}
                          alt={selectedMedia.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {getMediaIcon(selectedMedia.type)}
                        </div>
                      </div>
                    )}
                  </div>

                  <h3 className="text-md font-semibold text-center">{selectedMedia.title}</h3>
                  {selectedMedia.artist && <p className="text-sm text-gray-600 text-center">{selectedMedia.artist}</p>}

                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>0:00</span>
                      <span>{selectedMedia.duration}</span>
                    </div>
                    <Slider
                      value={[currentProgress]}
                      max={100}
                      step={1}
                      onValueChange={handleProgressChange}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Music className="w-12 h-12 mb-2" />
                  <p>Select media to play</p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#F5F4EA] border-[#D4D0C8]">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  onClick={togglePlay}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-[#F5F4EA] border-[#D4D0C8]"
                  disabled={!selectedMedia}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#F5F4EA] border-[#D4D0C8]">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-gray-500" />
                <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
