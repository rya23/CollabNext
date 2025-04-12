"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Download, Loader2 } from 'lucide-react';

export default function TextToSpeechDemo() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        console.error('Failed to fetch voices:', err);
        setError('Failed to load voices. Please try again later.');
      }
    };

    fetchVoices();
  }, []);

  const handleConvertToSpeech = async () => {
    if (!text) {
      setError('Please enter some text to convert');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const blob = await textToSpeech({
        text,
        voiceId: selectedVoice || undefined,
      });
      
      setAudioBlob(blob);
      playAudio(blob);
    } catch (err) {
      console.error('Text to speech conversion failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert text to speech');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      downloadAudio(audioBlob, 'speech');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Text to Speech</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Text to convert
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            rows={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Voice
          </label>
          <Select 
            value={selectedVoice} 
            onValueChange={setSelectedVoice}
            disabled={voices.length === 0}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {voices.map((voice) => (
                <SelectItem key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button
            onClick={handleConvertToSpeech}
            disabled={isLoading || !text}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate & Play
              </>
            )}
          </Button>
          
          {audioBlob && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-gray-700 border-gray-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 