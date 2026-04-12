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
    // Meta bot (facebookexternalhit) sometimes gets better URLs, but GET follow is usually enough
    const response = await fetch(url, { 
      method: 'GET', 
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const longUrl = response.url;

    // Pattern for Google Maps place URLs
    // Example: https://www.google.com/maps/place/Jl.+Lanbau,+Karang+Asem+Bar./@-6.482263,106.867975...
    const placeMatch = longUrl.match(/\/place\/([^/@?]+)/);
    const searchMatch = longUrl.match(/\/search\/([^/@?]+)/);
    const coordMatch = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    let address = "Lokasi Terpilih";
    let coordinates = coordMatch ? `${coordMatch[1]}, ${coordMatch[2]}` : null;

    const extractAddress = (match) => {
      if (!match) return null;
      const raw = decodeURIComponent(match[1].replace(/\+/g, ' '));
      // If it's just coordinates, it's not a human address
      if (/^-?\d+\.\d+,-?\d+\.\d+$/.test(raw.replace(/\s/g, ''))) return null;
      return raw.split(',')[0].includes('=') ? null : raw; // Avoid query-like strings
    };

    const foundAddress = extractAddress(placeMatch) || extractAddress(searchMatch);
    if (foundAddress) {
      address = foundAddress;
    }

    // Fallback: If no address found but we have coords, the address is just "Lokasi"
    if (address === "Lokasi Terpilih" && !coordinates) {
        return res.status(404).json({ error: 'Could not resolve address from this URL' });
    }

    return res.status(200).json({ address, coordinates });
  } catch (error) {
    console.error('Resolve Map Error:', error);
    return res.status(500).json({ error: 'Failed to resolve map URL' });
  }
}
