"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ImageUploader, { type ImageDetails } from '@/components/image-uploader';
import HtmlTagDisplay from '@/components/html-tag-display';
import { generateAltText, type GenerateAltTextInput } from '@/ai/flows/generate-alt-text';

export default function Home() {
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [altText, setAltText] = useState<string>('');
  const [isGeneratingAltText, setIsGeneratingAltText] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');

  const handleImageUpload = useCallback(async (details: ImageDetails) => {
    setImageDetails(details);
    setAltText(''); 
    setGeneratedHtml('');
    setError(null); 
    setIsGeneratingAltText(true);

    try {
      const aiInput: GenerateAltTextInput = { photoDataUri: details.dataUrl };
      const response = await generateAltText(aiInput);
      setAltText(response.altText);
    } catch (err: any) {
      console.error("Error generating alt text:", err);
      setError(err.message || "Failed to generate alt text.");
    } finally {
      setIsGeneratingAltText(false);
    }
  }, []);

  useEffect(() => {
    if (imageDetails && (altText || !isGeneratingAltText)) {
      const html = `<img src="${imageDetails.name}" alt="${altText.replace(/"/g, '&quot;')}" width="${imageDetails.width}" height="${imageDetails.height}" />`;
      setGeneratedHtml(html);
    } else {
      setGeneratedHtml('');
    }
  }, [imageDetails, altText, isGeneratingAltText]);

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-3xl min-h-screen flex flex-col items-center justify-center">
      <div className="w-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
            Image Tag Wizard <Sparkles className="h-8 w-8 text-accent" />
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload an image to generate clean HTML tags with AI alt text.
          </p>
        </header>

        <Card className="shadow-lg border-primary/10 rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-10 space-y-8">
            <ImageUploader onImageUpload={handleImageUpload} isProcessing={isGeneratingAltText} />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {imageDetails && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-lg font-semibold mb-3">Preview</h2>
                  <div className="border rounded-xl overflow-hidden bg-muted/20 flex justify-center p-4">
                    <Image
                      src={imageDetails.dataUrl}
                      alt="Uploaded preview"
                      width={imageDetails.width}
                      height={imageDetails.height}
                      className="rounded-lg shadow-sm object-contain max-w-full h-auto"
                      style={{ maxHeight: '320px' }}
                    />
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    Alt Text
                    {isGeneratingAltText && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </h2>
                  <Textarea
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Enter image description..."
                    disabled={isGeneratingAltText}
                    rows={4}
                    className="resize-none"
                  />
                </section>

                {generatedHtml && (
                  <section>
                    <h2 className="text-lg font-semibold mb-3">HTML Tag</h2>
                    <HtmlTagDisplay htmlTag={generatedHtml} />
                  </section>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
