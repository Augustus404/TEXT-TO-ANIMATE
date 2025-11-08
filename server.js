   // server.js
   const express = require('express');
   const fetch = require('node-fetch');
   const cors = require('cors');
   const app = express();
   const PORT = process.env.PORT || 3000;

   app.use(cors());
   app.use(express.json());

   app.post('/generate-video', async (req, res) => {
       const { prompt } = req.body;
       // Call Runway API with your key safely here
       try {
           const response = await fetch('https://api.runwayml.com/v1/text_to_image', { // or your correct endpoint
               method: 'POST',
               headers: {
                   'Authorization': `Bearer YOUR_RUNWAY_API_KEY`,
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({ prompt: prompt, model: 'gen-2', width: 1024, height: 576 }),
           });
           const data = await response.json();
           res.json(data);
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   });

   app.listen(PORT, () => console.log(`Server running on ${PORT}`));
   
