export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    // Follow redirect to get the long URL
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    const longUrl = response.url;

    // Pattern for Google Maps place URLs
    // Example: https://www.google.com/maps/place/Nama+Tempat/@lat,long,zoom...
    const placeMatch = longUrl.match(/\/place\/([^/]+)/);
    
    if (placeMatch) {
      const address = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).split('/@')[0];
      const coordMatch = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      
      return res.status(200).json({
        address,
        coordinates: coordMatch ? `${coordMatch[1]}, ${coordMatch[2]}` : null
      });
    }

    // Fallback if the pattern is slightly different
    return res.status(404).json({ error: 'Could not resolve address from this URL' });
  } catch (error) {
    console.error('Resolve Map Error:', error);
    return res.status(500).json({ error: 'Failed to resolve map URL' });
  }
}
