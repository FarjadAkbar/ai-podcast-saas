'use client';
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
import { PollyClient, DescribeVoicesCommand, Voice, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { useEffect } from 'react';
import { useState } from 'react';

// Define the schema using Zod
const createPodcastSchema = z.object({
  voice: z.string(),
  audioPrompt: z.string(),
});

type CreatePodcastFormValues = z.infer<typeof createPodcastSchema>;

const config = {
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!, 
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
};

const client = new PollyClient(config);

export default function CreatePodcastPage() {
  const [voices, setVoices] = useState<Voice[]>([]);  // State to store the fetched voices
  const form = useForm<CreatePodcastFormValues>({
    resolver: zodResolver(createPodcastSchema),
  });

  useEffect(() => {
    // Function to fetch the voices from AWS Polly API
    const fetchVoices = async () => {
      
      try {
      const command = new DescribeVoicesCommand({
        Engine: 'standard',
        LanguageCode: 'en-US',
        IncludeAdditionalLanguageCodes: true
      });
      const response = await client.send(command);
      setVoices(response.Voices || []);
    } catch (error) {
      console.log(error, "erro..........")
    }
    };

    console.log("newwe", "..........")
    fetchVoices();
  }, []); // Run this effect on component mount

  const generateAudio = async () => {
    const formData = form.getValues();
    console.log(formData, "formdata")
    if(formData.voice && formData.audioPrompt) {
      const command = new SynthesizeSpeechCommand({
        Engine: "standard",
        LanguageCode: "en-US",
        OutputFormat: "mp3",
        VoiceId: formData.voice as Voice["Id"],
        Text: formData.audioPrompt,
      })
      const response = await client.send(command)
      console.log(response, "responsesssss")
    }
  }

  const onSubmit = (data: CreatePodcastFormValues) => {
    console.log('Podcast Data:', data);
  };

  return (
    <section>
      <h1>Create Podcast</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Voices Select */}
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
          <Button type='button' onClick={() => generateAudio()}>Generate Voice</Button>

          {/* Submit Button */}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </section>
  );
}
