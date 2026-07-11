"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HtmlTagDisplayProps {
  htmlTag: string;
}

const HtmlTagDisplay: React.FC<HtmlTagDisplayProps> = ({ htmlTag }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlTag);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "The HTML tag has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="relative group">
      <pre className="bg-muted p-4 pr-12 rounded-md overflow-x-auto text-sm text-muted-foreground border">
        <code>{htmlTag}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-8 w-8"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default HtmlTagDisplay;
