"use client";

import React, { useState, useCallback, DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface ImageDetails {
  dataUrl: string;
  width: number;
  height: number;
  name: string;
  file: File;
}

interface ImageUploaderProps {
  onImageUpload: (details: ImageDetails) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file) {
      setError("No file selected.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError("Invalid file type. Please upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const originalDataUrl = e.target.result;
        const img = new window.Image();
        img.onload = () => {
          // Resize image to ensure it stays well under payload limits (target ~800px)
          const canvas = document.createElement('canvas');
          const MAX_DIM = 800; 
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Use lower quality to ensure small payload while preserving vision clarity
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            onImageUpload({ dataUrl, width: img.naturalWidth, height: img.naturalHeight, name: file.name, file });
          } else {
            setError("Could not process image.");
          }
        };
        img.onerror = () => {
          setError("Could not load image. The file might be corrupted.");
        };
        img.src = originalDataUrl;
      } else {
        setError("Error reading file.");
      }
    };
    reader.onerror = () => {
      setError("Error reading file.");
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing && !isDragging) setIsDragging(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "w-full p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 group",
          isProcessing ? "bg-muted cursor-not-allowed border-muted" :
          isDragging ? "border-primary bg-primary/10 scale-[0.98]" : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
        role="button"
        tabIndex={0}
        aria-label="Image upload dropzone"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/*"
          className="hidden"
          disabled={isProcessing}
        />
        <UploadCloud className={cn(
            "mx-auto h-16 w-16 mb-4 transition-transform duration-300 ease-in-out group-hover:scale-110",
            isProcessing ? "text-muted-foreground animate-pulse" : "text-primary"
        )} />
        <p className={cn("font-bold text-xl mb-1", isProcessing ? "text-muted-foreground" : "text-foreground")}>
          {isProcessing ? "Conjuring Alt Text..." : "Drop your image here"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isProcessing ? "Brewing pixels into words." : "or click to browse your gallery"}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-4 italic">Optimized for clean HTML & Markdown generation</p>
      </div>
      {error && (
        <Alert variant="destructive" className="w-full animate-in fade-in slide-in-from-top-2">
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageUploader;
