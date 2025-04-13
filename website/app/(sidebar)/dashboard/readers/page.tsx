"use client";

import React, { useState } from "react";
import { Download, FileText, BookOpen, Calendar, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import PDFViewerModal from "@/components/PDFViewerModal";

// Interface for PDF file metadata
interface PDFFile {
  id: string;
  name: string;
  path: string;
  pages?: number;
  description?: string;
  dateAdded: string;
}

const PDFReader = () => {
  const [pdfFiles] = useState<PDFFile[]>([
    {
      id: "1",
      name: "Comic 1",
      path: "/books/comic-panels-1744500235574.pdf",
      description: "Single page comic panel",
      dateAdded: "2024-04-13",
    },
    {
      id: "2",
      name: "Comic 2",
      path: "/books/comic-panels-1744500562340.pdf",
      description: "Two panel comic sequence",
      dateAdded: "2024-04-12",
    },
    {
      id: "3",
      name: "Comic 3",
      path: "/books/comic-panels-1744497577315.pdf",
      description: "Six panel comic story",
      dateAdded: "2024-04-10",
    },
  ]);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<PDFFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = (file: PDFFile) => {
    setDownloadingId(file.id);

    const link = document.createElement("a");
    link.href = file.path;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show download animation for 1.5 seconds
    setTimeout(() => {
      setDownloadingId(null);
    }, 1500);
  };

  const handleCardClick = (file: PDFFile) => {
    setSelectedPdf(file);
    setIsModalOpen(true);
  };

  // Animation variants for framer-motion
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 15 } }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Comic Panel Library</h1>
          <p className="text-gray-500">Browse and download your comic panel PDFs</p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pdfFiles.map((file) => (
            <motion.div
              key={file.id}
              variants={item}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" 
              }}
              className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleCardClick(file)}
            >
              {/* Card header with gradient */}
              <div className="h-3 bg-gradient-to-r from-[#979d57] via-[#edd8da] to-[#e6e5e4]"></div>
              
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div className="p-3 bg-indigo-50 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">{file.name}</h2>
                    <p className="text-gray-500 text-sm">{file.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{file.dateAdded}</span>
                  </div>
                  {file.pages && (
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{file.pages} pages</span>
                    </div>
                  )}
                </div>
                
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors ${
                    downloadingId === file.id
                      ? "bg-green-500 text-white"
                      : "bg-[#979d57] text-white cursor-pointer"
                  }`}
                >
                  {downloadingId === file.id ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Download PDF
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <PDFViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pdfPath={selectedPdf?.path || ""}
          fileName={selectedPdf?.name || ""}
        />

        {pdfFiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-10 text-center shadow-md"
          >
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No PDFs available</h3>
            <p className="text-gray-500 mb-6">
              Your PDF library is empty. Upload some PDFs to get started.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PDFReader;