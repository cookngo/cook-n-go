export default async function request(req, res) {
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