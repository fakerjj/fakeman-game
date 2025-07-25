export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { model, contents, generationConfig } = req.body;
        
        // 从服务器的环境变量中安全地获取API密钥
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured on server.' });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: generationConfig,
            }),
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            console.error('Gemini API Error:', errorData);
            return res.status(geminiResponse.status).json({ error: 'Failed to fetch from Gemini API.', details: errorData });
        }

        const data = await geminiResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
} 