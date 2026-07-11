
"use client";

import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Helper function for syntax highlighting
function highlightSyntax(code: string, language: 'html' | 'markdown'): string {
  if (!code) return '';

  if (language === 'html') {
    // Match the img tag and its attributes part
    const tagParts = code.match(/^<img\s+(.*?)\s*\/?>$/i);

    if (!tagParts || !tagParts[1]) {
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="html-tag-name">$2</span>');
    }

    const attributesString = tagParts[1];

    const highlightedAttributes = attributesString.replace(
      /([a-zA-Z0-9\-]+)=(".*?")/g,
      (_match, name, valueWithQuotes) => {
        return `<span class="html-attr-name">${name}</span>=<span class="html-attr-value">${valueWithQuotes}</span>`;
      }
    );
    return `&lt;<span class="html-tag-name">img</span> ${highlightedAttributes} /&gt;`;
  } else if (language === 'markdown') {
    // Basic Markdown image syntax: ![alt text](url)
    const markdownParts = code.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (markdownParts) {
      const altText = markdownParts[1].replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const url = markdownParts[2].replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<span class="html-tag-name">![</span><span class="html-attr-value">${altText}</span><span class="html-tag-name">]</span>(<span class="html-attr-name">${url}</span><span class="html-tag-name">)</span>`;
    }
    // Fallback for non-matching or simple markdown
    return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Default: escape HTML characters
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


interface CodeBlockDisplayProps {
  code: string; // Raw code string
  language: 'html' | 'markdown';
}

const CodeBlockDisplay: React.FC<CodeBlockDisplayProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const highlightedDisplayCode = useMemo(() => highlightSyntax(code, language), [code, language]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code); // Copy the raw code
      setCopied(true);
      toast({
        title: "Copied!",
        description: `The ${language.toUpperCase()} code has been successfully copied to your clipboard.`,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy Failed",
        description: `Could not copy the ${language.toUpperCase()} code. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative group">
      <pre
        className="bg-muted p-4 pr-12 rounded-md overflow-x-auto text-sm text-muted-foreground border"
        aria-live="polite"
        aria-atomic="true"
      >
        <code dangerouslySetInnerHTML={{ __html: highlightedDisplayCode }} />
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
            "absolute top-3 right-3 h-8 w-8 p-1.5 rounded-lg shadow-md transition-all duration-150 ease-in-out",
            "opacity-90 group-hover:opacity-100 focus:opacity-100 hover:scale-105",
            copied
              ? "bg-accent hover:bg-accent/90 text-accent-foreground"
              : "bg-card hover:bg-muted text-card-foreground hover:text-primary"
        )}
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : `Copy ${language.toUpperCase()} code`}
        disabled={!code}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default CodeBlockDisplay;
