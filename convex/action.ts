import { action } from "./_generated/server";
import { v } from "convex/values";
import { PollyClient, DescribeVoicesCommand, VoiceId, StartSpeechSynthesisTaskCommand } from "@aws-sdk/client-polly";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const config = {
  region: process.env.AWS_ACCESS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

const client = new PollyClient(config);
const s3Client = new S3Client(config);

// Convex Action to Fetch Voices
export const fetchVoices = action({
  handler: async () => {
    try {
        const command = new DescribeVoicesCommand({
          Engine: 'standard',
          LanguageCode: 'en-US',
          IncludeAdditionalLanguageCodes: true,
        });
        
        const response = await client.send(command);
        return response.Voices || [];
      } catch (error) {
        console.error("Error fetching voices:", error);
        throw error;
      }
  }
});



export const generateAudio = action({
  args: { voiceId: v.string(), audioPrompt: v.string() },

  handler: async (ctx, args) => {
    try {
      const command = new StartSpeechSynthesisTaskCommand({
        Engine: 'standard',
        LanguageCode: 'en-US',
        OutputFormat: 'mp3',
        OutputS3BucketName: process.env.AWS_S3_BUCKET,
        OutputS3KeyPrefix: 'audio',
        VoiceId: args.voiceId as VoiceId,
        Text: args.audioPrompt
      });

      const response = await client.send(command);

      if (response.SynthesisTask) {
        const { TaskId, OutputUri, TaskStatus } = response.SynthesisTask;

        return {
          taskId: TaskId,
          outputUri: OutputUri,
          status: TaskStatus
        };
      } else {
        throw new Error('SynthesisTask is undefined');
      }
      // if (response.AudioStream instanceof ReadableStream) {
      //   const audioBuffer = await convertStreamToBuffer(response.AudioStream);
      //   return audioBuffer;
      // } else {
      //   console.error('AudioStream is undefined or not a valid stream.');
      //   throw new Error('Invalid AudioStream');
      // }
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }
});

const convertStreamToBuffer = async (stream: ReadableStream): Promise<ArrayBuffer> => {
    const reader = stream.getReader();
    let chunks = [];
    let done: boolean = false;
  
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        chunks.push(value);
      }
      done = readerDone;
    }
    const flattened = chunks.reduce((acc, chunk) => {
        acc.push(...chunk);
        return acc;
      }, []);
      return new Uint8Array(flattened).buffer;

    // const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    // const result = new Uint8Array(totalLength);
    // let offset = 0;
    // chunks.forEach((chunk) => {
    //   result.set(chunk, offset);
    //   offset += chunk.length;
    // });
  
    // return result.buffer;
  };
