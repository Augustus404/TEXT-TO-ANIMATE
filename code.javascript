const textInput = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');
const exportBtn = document.getElementById('exportBtn');
const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
const previewVideo = document.getElementById('previewVideo');

let animationTimeline;
let recordedFrames = [];

// Function to generate TTS audio (optional, using ElevenLabs)
async function generateTTS(text) {
    const apiKey = 'YOUR_ELEVENLABS_API_KEY'; // Replace with your key
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
        },
        body: JSON.stringify({ text }),
    });
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
}

// Function to animate text on canvas
function animateText(text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    const words = text.split(' ');
    let y = 100;
    animationTimeline = anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000,
    });

    words.forEach((word, index) => {
        animationTimeline.add({
            targets: { x: canvas.width / 2, y: y },
            x: canvas.width / 2,
            y: y,
            update: function(anim) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillText(word, anim.animatables[0].target.x, anim.animatables[0].target.y);
            },
            duration: 500,
        });
        y += 50;
    });

    // Record frames for video export
    let frameCount = 0;
    const recordInterval = setInterval(() => {
        recordedFrames.push(canvas.toDataURL());
        frameCount++;
        if (frameCount > 100) clearInterval(recordInterval); // Stop after ~3 seconds
    }, 30);
}

// Generate button event
generateBtn.addEventListener('click', async () => {
    const text = textInput.value;
    if (!text) return alert('Please enter text.');

    // Optional: Generate audio
    const audioUrl = await generateTTS(text);
    const audio = new Audio(audioUrl);
    audio.play();

    // Animate
    animateText(text);
    exportBtn.disabled = false;
});

// Export as video using FFmpeg.js
exportBtn.addEventListener('click', async () => {
    const { createFFmpeg } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    // Create input files from frames
    for (let i = 0; i < recordedFrames.length; i++) {
        const data = recordedFrames[i].replace(/^data:image\/png;base64,/, '');
        ffmpeg.FS('writeFile', `frame${i}.png`, Uint8Array.from(atob(data), c => c.charCodeAt(0)));
    }

    // Run FFmpeg to create video
    await ffmpeg.run('-framerate', '30', '-i', 'frame%d.png', '-c:v', 'libx264', 'output.mp4');

    // Download video
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animated-video.mp4';
    a.click();
});
