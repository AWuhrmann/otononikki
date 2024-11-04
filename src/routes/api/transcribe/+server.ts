// src/routes/api/transcribe/+server.ts
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFileSync, createReadStream, unlinkSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

// Create OpenAI client
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

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

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
    let inputPath = '';
    let outputPath = '';
    
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

        // Transcribe with OpenAI
        const translation = await openai.audio.transcriptions.create({
            file: createReadStream(outputPath),
            model: "whisper-1",
            prompt: namesPrompt
        });

        // Clean up files
        cleanupFiles(inputPath, outputPath);

        return json({
            transcription: translation.text
        });

    } catch (err) {
        // Clean up files in case of error
        if (inputPath || outputPath) {
            cleanupFiles(inputPath, outputPath);
        }

        console.error('Transcription error:', err);
        throw error(500, 'Failed to process transcription request');
    }
};