const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  
  // 1. Baca file asli sebagai cadangan
  let html = "";
  try {
    html = fs.readFileSync(indexPath, 'utf8');
  } catch (e) {
    return res.status(500).send("Build project first or check index.html path");
  }

  try {
    // 2. Ambil data dari Firebase
    const projectId = "sunatan-azam";
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/global`;
    
    // Timeout 3 detik agar WhatsApp tidak kelamaan nunggu
    const response = await fetch(firestoreUrl, { timeout: 3000 });
    const data = await response.json();

    let title = "Undangan Tasyakuran Khitan";
    let desc = "Kami mengundang Anda untuk merayakan momen spesial tasyakuran khitan putra kami.";
    let image = "https://justbluenyellow.my.id/galeri/248471-1775842851801-10041416.jpg";

    if (data.fields) {
      const fields = data.fields;
      title = fields.ogTitle?.stringValue || title;
      desc = fields.ogDescription?.stringValue || desc;
      image = fields.ogImage?.stringValue || image;
    }

    // 3. Nama Tamu
    const guestSlug = req.query.to;
    if (guestSlug) {
      const guestName = guestSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      title = title.replace("{{name}}", guestName);
      if (!title.includes(guestName)) title = `Undangan Spesial Untuk ${guestName}`;
      desc = desc.replace("{{name}}", guestName);
    }

    // 4. Suntikkan (Surgical Replace)
    html = html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(/property="og:title" content=".*?"/g, `property="og:title" content="${title}"`)
      .replace(/property="og:description" content=".*?"/g, `property="og:description" content="${desc}"`)
      .replace(/property="og:image" content=".*?"/g, `property="og:image" content="${image}"`)
      .replace(/name="twitter:title" content=".*?"/g, `name="twitter:title" content="${title}"`)
      .replace(/name="twitter:description" content=".*?"/g, `name="twitter:description" content="${desc}"`)
      .replace(/name="twitter:image" content=".*?"/g, `name="twitter:image" content="${image}"`);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error("SEO Injection failed, serving original index.html");
    // Jika gagal (misal koneksi firebase putus), tetap kirim HTML asli
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }
};
