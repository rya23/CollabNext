import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

interface SlideshowConfig {
  images: {
    url: string;
    filename: string;
  }[];
  duration: number;
  audio: string;
  createdAt: string;
}

export default function Slideshow() {
  const router = useRouter();
  const { id } = router.query;
  const [config, setConfig] = useState<SlideshowConfig | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch slideshow configuration
    fetch(`/slideshows/${id}/config.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load slideshow");
        return res.json();
      })
      .then((data) => {
        setConfig(data);
        // Start audio when config is loaded
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("Audio playback was prevented:", err);
            // Continue without audio if browser blocks autoplay
          });
        }
      })
      .catch((err) => {
        console.error("Error loading slideshow:", err);
        setError(
          "Could not load slideshow. It may have expired or been removed."
        );
      });
  }, [id]);

  useEffect(() => {
    if (!config || !isPlaying) return;

    // Set up timer for slideshow
    const timer = setTimeout(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === config.images.length - 1 ? 0 : prevIndex + 1
      );
    }, config.duration);

    return () => clearTimeout(timer);
  }, [currentImageIndex, config, isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current
          .play()
          .catch((err) => console.error("Error playing audio:", err));
      }
    }
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading slideshow...</span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Comic Slideshow</title>
        <meta property="og:title" content="My Comic Slideshow" />
        <meta property="og:image" content={config.images[0]?.url} />
        <meta
          property="og:description"
          content="Check out this comic slideshow I created!"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="bg-black min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center relative">
          {config.images.map((image, index) => (
            <div
              key={image.url}
              className={`absolute transition-opacity duration-500 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image.url}
                alt={`Slide ${index + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
          ))}

          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {config.images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-gray-500"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="bg-white rounded-full w-10 h-10 flex items-center justify-center"
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <div className="text-white">
              {currentImageIndex + 1} / {config.images.length}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(
                    window.location.href
                  )}`,
                  "_blank"
                )
              }
              className="p-2 bg-green-500 rounded-full"
              aria-label="Share on WhatsApp"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
            <button
              onClick={() =>
                navigator.clipboard
                  .writeText(window.location.href)
                  .then(() => alert("Link copied!"))
              }
              className="p-2 bg-blue-500 rounded-full"
              aria-label="Copy link"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={config.audio} loop className="hidden" />
    </>
  );
}
