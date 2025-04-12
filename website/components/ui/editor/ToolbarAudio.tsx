import { Toolbar } from "@liveblocks/react-tiptap";
import { Editor } from "@tiptap/react";
import { useState, useRef, useCallback } from "react";
import { Mic, Download, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Popover } from "@/primitives/Popover";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Properties for the ToolbarAudio component.
 *
 * @property {Editor | null} editor The Tiptap editor instance.
 */
type Props = {
  editor: Editor | null;
};

export function ToolbarAudio({ editor }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const availableVoices = await getVoices();
        setVoices(availableVoices);

        // Set default voice if available
        if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].voice_id);
        }
      } catch (err) {
        console.error("Failed to fetch voices:", err);
        setError("Failed to load voices");
      }
    };

    fetchVoices();
  }, []);

  // Cleanup audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Update audio time display
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef.current]);

  const generateAudio = async () => {
    if (!editor) return;

    // Get text content from editor
    const text = editor.getText();

    if (!text.trim()) {
      setError("Please add some text to generate audio");
      toast.error("Please add some text to generate audio");
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Use toast.promise for better user feedback
    toast.promise(
      async () => {
        try {
          const blob = await textToSpeech({
            text,
            voiceId: selectedVoice || undefined,
          });

          // Save the blob for download option
          setAudioBlob(blob);

          // Create audio URL and setup audio element
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
          }

          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.load();

            // Set up event listener for duration
            audioRef.current.onloadedmetadata = () => {
              setDuration(audioRef.current?.duration || 0);
            };

            // Play the audio
            playAudio();
          }

          return true;
        } catch (err) {
          console.error("Error generating audio:", err);
          setError("Failed to generate audio. Please try again.");
          throw err;
        } finally {
          setIsGenerating(false);
        }
      },
      {
        loading: "Generating audio...",
        success: "Audio generated successfully!",
        error: "Failed to generate audio",
      }
    );
  };

  const playAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      const documentTitle = editor?.getText().slice(0, 20).trim() || "audio";

      // Create a download link
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle}.mp3`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success(`Audio downloaded as "${documentTitle}.mp3"`);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !progressRef.current) return;

      const progressRect = progressRef.current.getBoundingClientRect();
      const clickPositionRatio =
        (e.clientX - progressRect.left) / progressRect.width;
      const newTime = clickPositionRatio * duration;

      if (audioRef.current && !isNaN(newTime)) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration]
  );

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Popover
      content={
        <div className="w-96 overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Text to Speech
                </h3>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by ElevenLabs
                </p> */}
              </div>
            </div>
            {audioBlob && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Download Audio"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className="p-6">
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-400 text-sm rounded">
                {error}
              </div>
            )}

            {/* Voice Selector */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice
              </label>
              <div className="relative">
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="appearance-none w-full py-2.5 px-3.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  disabled={voices.length === 0 || isGenerating}
                >
                  {voices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <audio ref={audioRef} className="hidden" />

                {/* Controls and Time */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={handlePlayPause}
                    className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </button>

                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 cursor-pointer group relative"
                >
                  <div
                    className="absolute h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                  <div
                    className="opacity-0 group-hover:opacity-100 absolute h-3 w-3 rounded-full bg-indigo-600 shadow-md -mt-0.5 transition-opacity"
                    style={{
                      left: `calc(${(currentTime / duration) * 100}% - 6px)`,
                      display: duration ? "block" : "none",
                    }}
                  ></div>
                </div>

                {/* Volume control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateAudio}
              disabled={isGenerating || !editor}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>Generate Audio</>
              )}
            </button>
          </div>
        </div>
      }
    >
      <Toolbar.Toggle
        name="Generate Audio"
        icon={<Mic />}
        active={false}
        disabled={!editor}
      />
    </Popover>
  );
}
