// src/routes/contacts/pictures/[file]/+page.server.ts
import fs from 'fs';
import path from 'path';
import { error } from '@sveltejs/kit';

export async function GET({ params }) {

	const file = params.slug;
	const filePathPng = path.resolve('vault/contacts/pictures', `${file}`);
	const filePathJpg = path.resolve('vault/contacts/pictures', `${file}`);

	console.log(filePathPng)
	
	try {
		// Check for .png file first, then fallback to .jpg
		let fileBuffer;
		let mimeType = '';

		if (fs.existsSync(filePathPng)) {
		fileBuffer = await fs.promises.readFile(filePathPng);
		mimeType = 'image/png';
		} else if (fs.existsSync(filePathJpg)) {
		fileBuffer = await fs.promises.readFile(filePathJpg);
		mimeType = 'image/jpeg';
		} else {
		throw error(404, 'File not found');
		}        

        // Return the image with appropriate headers
        return new Response(fileBuffer, {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
            }
        });
	} catch (err) {
		console.error('Error loading file:', err);
		throw error(500, 'Error loading file');
	}
};
