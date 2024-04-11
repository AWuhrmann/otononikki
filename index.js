const express = require('express');
const multer = require('multer');
const app = express();
require('dotenv').config();
const fs = require('fs')
const path = require('path');

const port = 3000;

const { Configuration, OpenAI } = require("openai");
const contactsDir = path.join(process.cwd(), 'vault', 'contacts');


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

const { exec } = require('child_process');

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
        // Remove the .md extension and send the names
        const contactNames = files.map(file => file.replace('.md', ''));
        res.json(contactNames);
    });
});


app.post('/upload', upload.single('audioFile'), async (req, res) => {
    if (req.file) {
        const inputPath = req.file.path;
        const outputPath = inputPath + '.mp3'; // Define the output path

        // Convert the audio file to MP3
        convertAudio(inputPath, outputPath, async (error, convertedFilePath) => {
            if (error) {
                res.status(500).send("Failed to convert audio file.");
                return;
            }

            // At this point, the file is converted and available at `convertedFilePath`
            // Now, you can proceed to send this converted file to OpenAI for transcription

            try {
                // Example placeholder: Replace with actual OpenAI transcription code
                const translation = await openai.audio.transcriptions.create({
                    file: fs.createReadStream(outputPath),
                    model: "whisper-1",
                });
            
                console.log(`Translation text : ${translation.text}`);
                
                console.log('Transcription successful');
                res.send(translation.text);
            } catch (transcriptionError) {
                console.error('Transcription error:', transcriptionError);
                res.status(500).send('Error transcribing file');
            }
        });

        
        
    } else {
        res.status(400).send('No file uploaded.');
    }
  });

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
