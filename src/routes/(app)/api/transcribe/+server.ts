// src/routes/api/transcribe/+server.ts
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFileSync, createReadStream, unlinkSync, readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { INFOMANIAK_API_KEY, INFOMANIAK_PRODUCT_ID } from '$env/static/private';

type STTResponse = {
  batch_id: string;
}

// Convert exec to promise-based
const execPromise = promisify(exec);

// Convert audio function
const convertAudio = async (inputPath: string, outputPath: string): Promise<void> => {
    try {
        const { stdout, stderr } = await execPromise(`ffmpeg -i ${inputPath} -codec:a libmp3lame ${outputPath}`);
        console.log('Conversion stdout:', stdout);
        console.log('Conversion stderr:', stderr);
    } catch (error) {
        console.error('Conversion error:', error);
        throw error;
    }
};

// Helper to clean up files
const cleanupFiles = (...filePaths: string[]) => {
    filePaths.forEach(path => {
        try {
            unlinkSync(path);
        } catch (error) {
            console.error(`Failed to delete ${path}:`, error);
        }
    });
};

async function waitForFinished(batch_id: string, maxAttempts = 30): Promise<string> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const response = await fetch(
        `https://api.infomaniak.com/1/ai/${INFOMANIAK_PRODUCT_ID}/results/${batch_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Fixed condition - using AND instead of OR
      if (result.status !== "processing" && result.status !== "pending") {
        console.log(`Transcription finished with status=${result.status}`);
        
        if (result.status === "success") {
          // The data field contains a stringified JSON, so parse it
          const transcriptionData = result.data || result.text || result.transcription || result.result;
          
          // If it's a string that looks like JSON, parse it
          if (typeof transcriptionData === 'string' && transcriptionData.startsWith('{')) {
            try {
              const parsed = JSON.parse(transcriptionData);
              return parsed.text || parsed.transcription || transcriptionData;
            } catch (e) {
              // If parsing fails, return as is
              return transcriptionData;
            }
          }
          
          // If it's already an object, extract the text
          if (typeof transcriptionData === 'object' && transcriptionData !== null) {
            return transcriptionData.text || transcriptionData.transcription || JSON.stringify(transcriptionData);
          }
          
          return transcriptionData;
        } else {
          throw new Error(`Transcription failed with status: ${result.status}, message: ${result.message || 'No error message'}`);
        }
      }
      
      console.log(`Transcription still processing... (attempt ${attempts}/${maxAttempts})`);
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error);
      if (attempts >= maxAttempts) throw error;
    }
  }
  
  throw new Error("Transcription timeout - exceeded maximum attempts");
}

export const POST: RequestHandler = async ({request, locals}) => {
    let inputPath = '';
    let outputPath = '';
    
    const session = await locals.getSession();
    if (!session?.user) { 
      return json({success: false, error: "failed to get user in session"}, {status: 403});
    }

    try {
        const formData = await request.formData();
        const audioFile = formData.get('audioFile') as File;
        const contacts = formData.get('contacts') as string;

        if (!audioFile) {
            throw error(400, 'No audio file provided');
        }

        // Create unique filenames
        const timestamp = Date.now();
        inputPath = `/tmp/audio_${timestamp}`;
        outputPath = `${inputPath}.mp3`;

        // Write the uploaded file to disk
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        writeFileSync(inputPath, buffer);

        // Convert the audio to MP3
        await convertAudio(inputPath, outputPath);

        // Names prompt for better transcription
        const namesPrompt = `Adrien Alex Alyssa Amy Ardit Berta Carine Caspar Chiara Christine Daniel Dheesh Eiji Elissa Emile Emilie Emma Felix Holly Hugo Jil Josh Julie Julie Karin Kevin Koki Léna Léo Lochlan Lou Louis Louna Lucas Lucas Luis Maé Maman Mathis Matilda Matthew Max Mehdi Mizuki Moeka Moritz Nadège Noah Nora Norah Olga Papa Paul Pierce Roy Sacha Scarlet Sebastian Sebastiano Sébastien Selina Tamiris Tanishka Thierry Vincent Zac`;

        // Read the MP3 file for upload
        const audioBuffer = readFileSync(outputPath);
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        
        // Create FormData for file upload
        const uploadFormData = new FormData();
        uploadFormData.append('file', audioBlob, 'audio.mp3');
        uploadFormData.append('model', 'whisper');
        uploadFormData.append('prompt', namesPrompt);

        const response = await fetch(
          `https://api.infomaniak.com/1/ai/${INFOMANIAK_PRODUCT_ID}/openai/audio/transcriptions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
              // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
            },
            body: uploadFormData,
          },
        );
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`LLM API request failed: ${response.statusText} - ${errorText}`);
        }
    
        const data: STTResponse = await response.json();
        console.log('Received batch ID:', data.batch_id);
        
        // Wait for transcription to complete
        const transcription = await waitForFinished(data.batch_id);

        // Clean up temporary files
        cleanupFiles(inputPath, outputPath);

        console.log(`Transcription: ${transcription}`)

        return json({
            success: true,
            transcription: transcription
        });

    } catch (err) {
        // Clean up files in case of error
        if (inputPath || outputPath) {
            cleanupFiles(inputPath, outputPath);
        }

        console.error('Transcription error:', err);
        
        // Return more detailed error information
        return json({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to process transcription request'
        }, { status: 500 });
    }
};