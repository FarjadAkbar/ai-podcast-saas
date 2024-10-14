'use client';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Voice } from "@aws-sdk/client-polly";
import { useAction } from "convex/react";
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';

// Define the schema using Zod
const createPodcastSchema = z.object({
  voice: z.string(),
  audioPrompt: z.string(),
});

type CreatePodcastFormValues = z.infer<typeof createPodcastSchema>;



export default function CreatePodcastPage() {
  const [voices, setVoices] = useState<Voice[]>([]);  
  const [audioSrc, setAudioSrc] = useState<string | null | undefined>(null);
  const [isPending, startTransition] = useTransition();

  const fetchVoicesMutation = useAction(api.action.fetchVoices);
  const generateAudioMutation = useAction(api.action.generateAudio);

  const form = useForm<CreatePodcastFormValues>({
    resolver: zodResolver(createPodcastSchema),
  });

  useEffect(() => {
    const fetchVoicesFromPolly = async () => {
      try {
        const fetchedVoices = await fetchVoicesMutation();
        setVoices(fetchedVoices);
      } catch (error) {
        console.error("Failed to fetch voices:", error);
      }
    };

    fetchVoicesFromPolly();
  }, []);


  const handleGenerateAudio = async () => {
    const formData = form.getValues(); // Assuming you're using a form here

    if (formData.voice && formData.audioPrompt) {
      try {
        const audioFile = await generateAudioMutation({ voiceId: formData.voice, audioPrompt: formData.audioPrompt });
        
        // Immediately start the transition for non-urgent UI updates
        startTransition(() => {
          const timer = setTimeout(() => {
            setAudioSrc(audioFile.outputUri); // Set the audio source after 3 seconds
          }, 2000);

          // Ensure timer cleanup outside of startTransition (to avoid memory leaks)
          const cleanup = () => clearTimeout(timer);
          cleanup();
        });
      } catch (error) {
        console.error("Failed to generate audio:", error);
      }
    }
  };
  


  const onSubmit = (data: CreatePodcastFormValues) => {
    console.log('Podcast Data:', data);
  };

  return (
    <section>
      <h1>Create Podcast</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voices</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Voices</SelectLabel>
                        {voices.map((voice) => (
                          <SelectItem key={voice.Id} value={voice.Id ?? ''}>
                            {`${voice.LanguageName} - ${voice.Name} (${voice.Gender})`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                {form.formState.errors.voice && (
                  <FormDescription className="text-red-500">
                    {form.formState.errors.voice.message}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audioPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter voice prompt"
                  />
                </FormControl>
                {form.formState.errors.audioPrompt && (
                  <FormDescription className="text-red-500">
                    {form.formState.errors.audioPrompt.message}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='button' disabled={isPending} onClick={() => handleGenerateAudio()}>Generate Voice</Button>

          {audioSrc && (
            <audio controls src={audioSrc}></audio>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isPending}>Submit</Button>
        </form>
      </Form>
    </section>
  );
}
