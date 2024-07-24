const express = require('express');
const multer = require('multer');

const app = express();
app.use(express.json());

require('dotenv').config();
const fs = require('fs')
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
const exists = promisify(fs.exists);
const { exec } = require('child_process');



const port = 3000;

const { Configuration, OpenAI } = require("openai");
const openai = new OpenAI();
const contactsDir = path.join(process.cwd(), 'vault', 'contacts');
const picturesDir = path.join(contactsDir, 'pictures');
const notesDirectory = path.join(process.cwd(), 'vault', 'notes');

app.use('/contacts/pictures', express.static(picturesDir));



// Multer setup (ensure you've configured Multer here)
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

const upload = multer({ storage: storage });


function convertAudio(inputPath, outputPath, callback) {
    exec(`ffmpeg -i ${inputPath} -codec:a libmp3lame ${outputPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return callback(error);
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        callback(null);
    });
}

// Serve static files from the 'public' directory
app.use(express.static('public'));


app.get('/contacts', (req, res) => {
    fs.readdir(contactsDir, (err, files) => {
        if (err) {
            console.error("Error reading directory", err);
            res.status(500).send("Error reading directory");
            return;
        }

        const contactNames = files.filter(file => file.endsWith('.md')).map(file => file.replace('.md', ''));

        // Create an array of promises to check for the existence of each profile picture
        const contactsWithPictures = contactNames.map(name => {
            const picturePathPng = path.join(picturesDir, `${name}.png`);
            const picturePathJpg = path.join(picturesDir, `${name}.jpg`);
            return new Promise((resolve) => {
                fs.access(picturePathPng, fs.constants.F_OK, (err) => {
                    if (!err) {
                        resolve({
                            name,
                            picture: `/contacts/pictures/${name}.png`
                        });
                    } else {
                        fs.access(picturePathJpg, fs.constants.F_OK, (err) => {
                            resolve({
                                name,
                                picture: err ? null : `/contacts/pictures/${name}.jpg`
                            });
                        });
                    }
                });
            });
        });

        Promise.all(contactsWithPictures).then(results => {
            res.json(results);
        }).catch(error => {
            console.error("Error processing contacts", error);
            res.status(500).send("Error processing contacts");
        });
    });
});

app.post('/add-contact', (req, res) => {
    const { name } = req.body;
    const filePath = path.join(contactsDir, `${name}.md`);
    const content = `# ${name}\n\nContact details here...`;

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error("Error writing new contact file", err);
            res.json({ success: false });
            return;
        }
        res.json({ success: true });
    });
});


// Only transcribe the audio file, and does not put the transcription neither in the file nor on the drive
app.post('/transcribe', upload.single('audioFile'), async(req, res) => {
    if (req.file) {
        const inputPath = req.file.path;
        const outputPath = inputPath + '.mp3'; // Define the output path

        // Convert the audio file to MP3
        convertAudio(inputPath, outputPath, async(error, convertedFilePath) => {
            if (error) {
                res.status(500).send("Failed to convert audio file.");
                return;
            }

            try {
                const contacts = req.body.contacts;
                const translation = await openai.audio.transcriptions.create({
                    file: fs.createReadStream(outputPath),
                    model: "whisper-1",
                });

                res.send({ transcription: translation.text });
            } catch (transcriptionError) {
                console.error('Transcription error:', transcriptionError);
                res.status(500).send('Error transcribing file');
            }
        });
    } else {
        res.status(400).send('No file uploaded.');
    }
});


// Only upload the text given on the file, and in the drive.
app.post('/uploadTranscription', async(req, res) => {
    const { translation, contacts, date } = req.body;

    if (!translation || !date) {
        res.status(400).send('Content and date are required.');
        return;
    }

    const notePath = path.join(notesDirectory, `${date}.md`);

    const timeNow = new Date().toLocaleTimeString(); // HH:MM:SS format
    const content = `\n\n## Entry at ${timeNow}\n*Contacts seen today: ${contacts}*\n${translation}`;


    try {
        // Check if the daily note already exists
        if (await exists(notePath)) {
            // If exists, append the new content
            await appendFile(notePath, content);
            console.log('Appended to daily note successfully.');
        } else {
            // If not, create a new file with a header
            await writeFile(notePath, `# Daily note of ${date}\n` + content);
            console.log('Daily note created successfully.');
        }

        await uploadFileOnDrive(notePath);
        res.send('File uploaded successfully.');
    } catch (fileError) {
        console.error('File creation/upload error:', fileError);
        res.status(500).send('Error creating or uploading file');
    }
});

function uploadFileOnDrive(filepath) {
    exec(`python3 scripts/main.py '${filepath.split("/").pop()}' '${filepath}' `, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Python drive upload script output: \n${stdout}`);
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} :D`);
});