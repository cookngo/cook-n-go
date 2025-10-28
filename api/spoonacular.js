export default async function request(req, res) {
    const allowedOrigins = ['http://127.0.0.1:5500', 'https://cookngo.github.io'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { path, ...query } = req.query;
    const queryString = new URLSearchParams(query).toString();
    const apiUrl = `https://api.spoonacular.com/${path}?${queryString}&apiKey=${process.env.SPOONACULAR_API_KEY}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}