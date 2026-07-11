'use server';
/**
 * @fileOverview Generates alt text for images using Gemini 1.5 Flash.
 *
 * - generateAltText - A function that handles the alt text generation process.
 * - GenerateAltTextInput - The input type for the generateAltText function.
 * - GenerateAltTextOutput - The return type for the generateAltText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAltTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate alt text for, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z.string().describe('The generated descriptive alt text.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateAltTextPrompt',
  input: {schema: GenerateAltTextInputSchema},
  output: {schema: GenerateAltTextOutputSchema},
  system: 'You are an expert in accessibility and SEO. Your task is to provide clear, concise, and descriptive alt text for images.',
  prompt: 'Provide a concise alt text description for this image: {{media url=photoDataUri}}',
});

export const generateAltText = ai.defineFlow(
  {
    name: 'generateAltText',
    inputSchema: GenerateAltTextInputSchema,
    outputSchema: GenerateAltTextOutputSchema,
  },
  async (input): Promise<GenerateAltTextOutput> => {
    const { output } = await prompt(input);
    return output!;
  }
);
