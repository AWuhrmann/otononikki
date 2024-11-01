// src/routes/images/[imageName]/+server.ts
import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import * as path from 'path';

// Define types for session and user
interface User {
    name: string;
    role: string;
	email: string;
}

interface Session {
    user: User | null;
}

// Define content types interface
interface ContentTypes {
    [key: string]: string;
}

// Define security headers interface
interface SecurityHeaders {
    'Content-Type': string;
    'Cache-Control': string;
    'Content-Security-Policy': string;
    'X-Content-Type-Options': string;
}

/**
 * Checks if a user has access to a specific image
 * @param session - The user's session
 * @param imageName - The name of the image to check
 * @returns Promise<boolean> - Whether the user has access
 */
async function hasImageAccess(session: Session | null, imageName: string): Promise<boolean> {
	console.log(session?.user);
	
	if (!session) {
		return false;
	}

    // Example permission checks - customize based on your needs:
    // 1. Check if user is admin
    if (session.user.role === 'admin') {
        return true;
	}

    return false;
}

/**
 * GET handler for image requests
 */
export async function GET({ params, locals, request }: RequestEvent): Promise<Response> {
    const imageName = params?.slug;

    // Type assertion for getSession method
    const getSession = locals.getSession as (() => Promise<Session | null>) | undefined;
    
    // Get session from locals
    const session = await getSession?.();

	console.log('test before');
	
    // Check if user has access to this image
    if (!await hasImageAccess(session, imageName)) {
		// Check if request accepts HTML
        const acceptsHtml = request.headers.get('accept')?.includes('text/html');
        
        if (acceptsHtml) {
			// Redirect to login if browser request
            throw redirect(303, `/login?returnTo=/images/${imageName}`);
        } else {
			// Return 401 for API/image requests
            throw error(401, 'Unauthorized');
        }
    }
	
    // Define your images directory - adjust path as needed
    const imagesDir: string = path.join(process.cwd(), 'vault', 'contacts', 'pictures');
	
    try {
		// Validate filename to prevent directory traversal

        if (!imageName || imageName.includes('..')) {
			throw error(400, 'Invalid image name');
        }		
        // Get the full path to the image
        const imagePath: string = path.join(imagesDir, imageName);
		
        // Read the image file
        const imageBuffer: Buffer = await fs.readFile(imagePath);
		
        // Determine content type based on file extension
        const ext: string = path.extname(imageName).toLowerCase();
        const contentTypes: ContentTypes = {
			'.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
		
        const contentType: string = contentTypes[ext] || 'application/octet-stream';
		
        // Add security headers
        const securityHeaders: SecurityHeaders = {
			'Content-Type': contentType,
            'Cache-Control': 'private, max-age=3600', // Reduced cache time for authenticated content
            'Content-Security-Policy': "default-src 'self'",
            'X-Content-Type-Options': 'nosniff'
        };
		
        // Log access (optional)
        console.log(`Image ${imageName} accessed by user ${session?.user?.id}`);
		
        return new Response(imageBuffer, {
			headers: securityHeaders
        });
    } catch (err) {
		// Type guard for NodeJS.ErrnoException
        if (err && typeof err === 'object' && 'code' in err) {
			if (err.code === 'ENOENT') {
				throw error(404, 'Image not found');
            }
        }
        
        console.error('Error serving image:', err);
        throw error(500, 'Server error');
    }
}