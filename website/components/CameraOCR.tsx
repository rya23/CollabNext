// import React, { useCallback, useRef, useState } from 'react';
// import { createWorker, createScheduler } from 'tesseract.js';
// import { Button } from '@/components/ui/button';
// import { Camera, FileText, Loader2, Trash } from 'lucide-react';

// interface OCRResult {
//     text: string;
//     confidence: number;
// }

// const CameraOCR = () => {
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
//     const [previewImage, setPreviewImage] = useState<string | null>(null);
//     const [progress, setProgress] = useState(0);

//     const preprocessImage = async (file: File): Promise<HTMLCanvasElement> => {
//         return new Promise((resolve) => {
//             const img = new Image();
//             img.onload = () => {
//                 const canvas = document.createElement('canvas');
//                 const ctx = canvas.getContext('2d')!;

//                 // Set canvas size to match image
//                 canvas.width = img.width;
//                 canvas.height = img.height;

//                 // Draw original image
//                 ctx.drawImage(img, 0, 0);

//                 // Get image data
//                 const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//                 const data = imageData.data;

//                 // Apply image preprocessing
//                 for (let i = 0; i < data.length; i += 4) {
//                     // Convert to grayscale
//                     const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

//                     // Increase contrast
//                     const contrast = 1.5;
//                     const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
//                     const color = factor * (avg - 128) + 128;

//                     // Apply threshold
//                     const threshold = 128;
//                     const final = color > threshold ? 255 : 0;

//                     data[i] = data[i + 1] = data[i + 2] = final;
//                 }

//                 ctx.putImageData(imageData, 0, 0);
//                 resolve(canvas);
//             };
//             img.src = URL.createObjectURL(file);
//         });
//     };

//     const handleCapture = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         // Create preview
//         setPreviewImage(URL.createObjectURL(file));
//         setIsProcessing(true);
//         setProgress(0);

//         try {
//             // Preprocess image
//             const processedCanvas = await preprocessImage(file);

//             // Create scheduler for better performance
//             const scheduler = createScheduler();
//             const worker = await createWorker('eng', 1, {
//                 logger: (m) => {
//                     if (m.status === 'recognizing text') {
//                         setProgress(Math.floor(m.progress * 100));
//                     }
//                 },
//             });

//             await scheduler.addWorker(worker);

//             // Recognize text with confidence score
//             const result = await scheduler.addJob('recognize', processedCanvas.toDataURL());
//             setOcrResult({
//                 text: result.data.text,
//                 confidence: result.data.confidence,
//             });

//             await scheduler.terminate();
//         } catch (error) {
//             console.error('OCR Error:', error);
//         } finally {
//             setIsProcessing(false);
//         }
//     }, []);

//     const resetCapture = () => {
//         setPreviewImage(null);
//         setOcrResult(null);
//         setProgress(0);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     return (
//         <div className="w-full max-w-xl mx-auto p-4">
//             <input
//                 type="file"
//                 accept="image/*"
//                 capture="environment"
//                 onChange={handleCapture}
//                 ref={fileInputRef}
//                 className="hidden"
//             />

//             <div className="rounded-lg overflow-hidden bg-[#0a0a0a] border border-purple-900/20 min-h-[200px] flex items-center justify-center relative">
//                 {previewImage ? (
//                     <>
//                         <img src={previewImage} alt="Captured" className="w-full h-auto" />
//                         <Button
//                             onClick={resetCapture}
//                             className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600"
//                             size="icon"
//                         >
//                             <Trash className="h-4 w-4" />
//                         </Button>
//                     </>
//                 ) : (
//                     <div className="text-center p-8 text-[#858192]">
//                         <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                         <p>Tap the button below to take a photo</p>
//                     </div>
//                 )}
//             </div>

//             <div className="mt-4 flex gap-4 justify-center">
//                 <Button
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={isProcessing}
//                     className="bg-gradient-to-r from-purple-600 to-blue-600"
//                 >
//                     {isProcessing ? (
//                         <>
//                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             Processing... {progress}%
//                         </>
//                     ) : (
//                         <>
//                             <Camera className="mr-2 h-4 w-4" />
//                             Take Photo & Extract Text
//                         </>
//                     )}
//                 </Button>
//             </div>

//             {ocrResult && (
//                 <div className="mt-6 p-4 rounded-lg bg-[#0a0a0a] border border-purple-900/20">
//                     <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center gap-2">
//                             <FileText className="h-4 w-4 text-purple-400" />
//                             <h3 className="text-white font-semibold">Extracted Text</h3>
//                         </div>
//                         <span className="text-xs text-[#858192]">Confidence: {Math.round(ocrResult.confidence)}%</span>
//                     </div>
//                     <p className="text-[#858192] text-sm whitespace-pre-wrap">{ocrResult.text}</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CameraOCR;
