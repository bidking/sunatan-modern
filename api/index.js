import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export default async (req, res) => {
  let html = '';
  try {
    // 1. Baca file index.html asli
    let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), 'index.html');
    }
    html = fs.readFileSync(htmlPath, 'utf8');

    // 2. Default Data
    let title = "Undangan Tasyakuran Khitan";
    let desc = "Kami mengundang Anda untuk merayakan momen spesial tasyakuran khitan putra kami.";
    let image = "https://justbluenyellow.my.id/galeri/248471-1775842851801-10041416.jpg";
    let favicon = "https://justbluenyellow.my.id/galeri/242929-1775842592916-116545060.gif";

    // 3. Ambil data dari Firebase Admin
    try {
      const projectId = "sunatan-azam";
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/global`;
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.fields) {
          const fields = data.fields;
          title = fields.ogTitle?.stringValue || title;
          desc = fields.ogDescription?.stringValue || desc;
          image = fields.ogImage?.stringValue || image;
          favicon = fields.faviconUrl?.stringValue || favicon;
        }
      }
    } catch (dbError) {
      console.error("Firestore Fetch Error:", dbError);
    }

    // 4. Deteksi URL dan Tamu
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const fullUrl = `${protocol}://${host}${req.url}`;
    
    // Handle both ?to=name and ?to+name (common typo)
    let guestSlug = req.query.to;
    if (!guestSlug) {
      // Try to find if any query key starts with 'to ' or contains 'to '
      const keys = Object.keys(req.query);
      const toKey = keys.find(key => key.startsWith('to ') || key === 'to');
      if (toKey && toKey !== 'to') guestSlug = toKey.substring(3).trim();
    }

    if (guestSlug) {
      const guestName = guestSlug.split(/[-+ ]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      
      if (title.includes("{{name}}")) {
        title = title.replace(/{{name}}/g, guestName);
      } else {
        title = `Undangan Khitan ${guestName} - ${title}`;
      }
      
      if (desc.includes("{{name}}")) {
        desc = desc.replace(/{{name}}/g, guestName);
      }
    }

    // Ensure Absolute URLs for SEO
    if (image && image.startsWith('/')) image = `${protocol}://${host}${image}`;
    if (favicon && favicon.startsWith('/')) favicon = `${protocol}://${host}${favicon}`;

    // 5. Ganti semua penanda {{...}} dengan data asli
    const finalHtml = html
      .replace(/{{TITLE}}/g, title)
      .replace(/{{DESC}}/g, desc)
      .replace(/{{IMAGE}}/g, image)
      .replace(/{{FAVICON}}/g, favicon)
      .replace(/{{URL}}/g, fullUrl);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    return res.status(200).send(finalHtml);
  } catch (error) {
    console.error("Main SEO Error:", error);
    if (html) {
        return res.status(200).send(html);
    }
    return res.status(500).send("Internal Server Error");
  }
};
