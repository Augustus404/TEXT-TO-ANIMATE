const textInput = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const generatedVideo = document.getElementById('generatedVideo');
const downloadBtn = document.getElementById('downloadBtn');

const API_KEY = 'YOUR_RUNWAY_API_KEY'; // Replace with your Runway ML API key
const API_URL = 'https://api.runwayml.com/v1/image_to_video'; // Or use text-to-video if available; adjust based on Runway docs

generateBtn.addEventListener('click', async () => {
    const prompt = textInput.value.trim();
    if (!prompt) {
        alert('Please enter a descriptive prompt.');
        return;
    }

    loading.style.display = 'block';
    generateBtn.disabled = true;

    try {
        // Step 1: Generate an initial image from text (using Runway's image gen, if needed)
        const imageResponse = await fetch('https://api.runwayml.com/v1/text_to_image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                model: 'gen-2', // Or latest model
                width: 1024,
                height: 576,
            }),
        });

        if (!imageResponse.ok) throw new Error('Image generation failed.');

        const imageData = await imageResponse.json();
        const imageUrl = imageData.output[0]; // Assuming response structure

        // Step 2: Use the image to generate a video (animate it)
        const videoResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gen-2',
                prompt_image: imageUrl, // Use generated image as base
                prompt_text: prompt, // Add motion description
                duration: 5, // Seconds (max 10)
                ratio: '16:9',
            }),
        });

        if (!videoResponse.ok) throw new Error('Video generation failed.');

        const videoData = await videoResponse.json();
        const videoUrl = videoData.output[0]; // Video URL from API

        // Display the video
        generatedVideo.src = videoUrl;
        generatedVideo.style.display = 'block';
        downloadBtn.style.display = 'block';

        // Download button
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = 'animated-video.mp4';
            a.click();
        };

    } catch (error) {
        alert('Error generating video: ' + error.message);
    } finally {
        loading.style.display = 'none';
        generateBtn.disabled = false;
    }
});