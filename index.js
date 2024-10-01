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
const statusFile = path.join(__dirname, 'pull_status.txt');


const mentionRoutes = require('./routes/mentionRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/contacts/pictures', express.static(picturesDir));

const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

app.post('/login', (req, res) => { // When user tries to localhost:3000/login, goes first here
    console.log('Login asked');
    // Check if the password matches
    if (req.body.password === process.env.USER_PASSWORD) {
      console.log('password checked and same.');
      const accessToken = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ accessToken });
    } else {
      res.status(401).send('Unauthorized');
    }
});

const protectedRoutes = require('./routes/protected');
app.use('/api', protectedRoutes); // /api/protected goes there
app.use('/api/mentions', mentionRoutes);
app.use('/api/stats', statsRoutes);

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

app.post('/verifyToken', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      res.sendStatus(200);
    });
  });

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
                    prompt: `Adrien Alex Alyssa Amy Ardit Berta Carine Caspar Chiara Christine Daniel Dheesh Eiji Elissa Emile Emilie Emma Felix Holly Hugo Jil Josh Julie Julie Karin Kevin Koki Léna Léo Lochlan Lou Louis Louna Lucas Lucas Luis Maé Maman Mathis Matilda Matthew Max Mehdi Mizuki Moeka Moritz Nadège Noah Nora Norah Olga Papa Paul Pierce Roy Sacha Scarlet Sebastian Sebastiano Sébastien Selina Tamiris Tanishka Thierry Vincent Zac`});

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
    let contactText = '';
    if (contacts.length > 0) {
        contactText = '\n*Contacts seen today: ${contacts}*'
    }
    const content = `\n\n## Entry at ${timeNow}${contactText}\n${translation}`;


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

    } catch (fileError) {
        console.error('File creation/upload error:', fileError);
        res.status(500).send('Error creating or uploading file');
    }
    exec("./git_sync.sh", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            res.status(500).send('Script execution failed');
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Output: ${stdout}`);
        res.send('Script executed successfully');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} :D`);
});