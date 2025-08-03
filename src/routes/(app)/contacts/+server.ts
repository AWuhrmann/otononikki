// src/routes/contacts/+server.ts
import fs from 'fs';
import path from 'path';
import { json } from '@sveltejs/kit';

const contactsDir = 'vault/contacts';
const picturesDir = 'vault/contacts/pictures';

export async function GET() {
  try {
    // Read the list of files in the contacts directory
    const files = await fs.promises.readdir(contactsDir);

    // Filter for .md files and map to contact names
    const contactNames = files
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace('.md', ''));

    // Check for each contact's profile picture
    const contactsWithPictures = await Promise.all(
      contactNames.map(async (name) => {
        const picturePathPng = path.join(picturesDir, `${name}.png`);
        const picturePathJpg = path.join(picturesDir, `${name}.jpg`);

        // Check if a .png or .jpg picture exists for the contact
        try {
          await fs.promises.access(picturePathPng, fs.constants.F_OK);
          return { name, picture: `/contacts/pictures/${name}.png` };
        } catch {
          try {
            await fs.promises.access(picturePathJpg, fs.constants.F_OK);
            return { name, picture: `/contacts/pictures/${name}.jpg` };
          } catch {
            return { name, picture: null };
          }
        }
      })
    );

    return json(contactsWithPictures);
  } catch (error) {
    console.error("Error processing contacts", error);
    return new Response("Error processing contacts", { status: 500 });
  }
}
