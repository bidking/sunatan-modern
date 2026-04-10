const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    // 1. Baca file index.html asli dari folder dist (hasil build)
    const filePath = path.join(process.cwd(), 'dist', 'index.html');
    let html = fs.readFileSync(filePath, 'utf8');

    // 2. Ambil data terbaru dari Admin (Firebase)
    const projectId = "sunatan-azam";
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/global`;
    const response = await fetch(firestoreUrl);
    const data = await response.json();

    // 3. Siapkan data default jika data Admin kosong
    let title = "Undangan Tasyakuran Khitan";
    let desc = "Kami mengundang Anda untuk merayakan momen spesial tasyakuran khitan putra kami.";
    let image = "https://justbluenyellow.my.id/galeri/248471-1775842851801-10041416.jpg";
    let favicon = "https://justbluenyellow.my.id/galeri/242929-1775842592916-116545060.gif";

    if (data.fields) {
      const fields = data.fields;
      title = fields.ogTitle?.stringValue || title;
      desc = fields.ogDescription?.stringValue || desc;
      image = fields.ogImage?.stringValue || image;
      favicon = fields.faviconUrl?.stringValue || favicon;
    }

    // 4. Deteksi Nama Tamu (?to=nama-tamu)
    const guestSlug = req.query.to;
    if (guestSlug) {
      const guestName = guestSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      title = title.replace("{{name}}", guestName);
      if (!title.includes(guestName)) title = `Undangan Spesial Untuk ${guestName}`;
      desc = desc.replace("{{name}}", guestName);
    }

    // 5. Suntikkan (Inject) data ke dalam Meta Tags
    html = html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(/property="og:title" content=".*?"/g, `property="og:title" content="${title}"`)
      .replace(/property="og:description" content=".*?"/g, `property="og:description" content="${desc}"`)
      .replace(/property="og:image" content=".*?"/g, `property="og:image" content="${image}"`)
      .replace(/property="twitter:title" content=".*?"/g, `property="twitter:title" content="${title}"`)
      .replace(/property="twitter:description" content=".*?"/g, `property="twitter:description" content="${desc}"`)
      .replace(/property="twitter:image" content=".*?"/g, `property="twitter:image" content="${image}"`)
      .replace(/id="favicon" rel="icon" type="image\/png" href=".*?"/, `id="favicon" rel="icon" type="image/gif" href="${favicon}"`);

    // 6. Kirim HTML yang sudah "Sakti" ke pengunjung/WhatsApp
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    console.error("SEO Error:", error);
    // Jika error, kirim file asli saja
    const filePath = path.join(process.cwd(), 'dist', 'index.html');
    return res.status(200).sendFile(filePath);
  }
};
