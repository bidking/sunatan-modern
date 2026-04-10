const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    // 1. Baca file index.html asli
    // Di Vercel, file index.html biasanya ada di folder 'dist' atau root setelah build
    let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), 'index.html');
    }
    let html = fs.readFileSync(htmlPath, 'utf8');

    // 2. Ambil data dari Firebase Admin
    const projectId = "sunatan-azam";
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/global`;
    const response = await fetch(firestoreUrl);
    const data = await response.json();

    // 3. Default Data
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

    // 4. Deteksi Tamu
    const guestSlug = req.query.to;
    if (guestSlug) {
      const guestName = guestSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      title = title.replace("{{name}}", guestName);
      if (!title.includes(guestName)) title = `Undangan Spesial Untuk ${guestName}`;
      desc = desc.replace("{{name}}", guestName);
    }

    // 5. Ganti semua penanda {{...}} dengan data asli
    const finalHtml = html
      .replace(/{{TITLE}}/g, title)
      .replace(/{{DESC}}/g, desc)
      .replace(/{{IMAGE}}/g, image)
      .replace(/{{FAVICON}}/g, favicon);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(finalHtml);
  } catch (error) {
    console.error("SEO Error:", error);
    // Jika gagal, kirim file apa adanya tanpa penggantian
    return res.status(200).send("Error loading SEO tags");
  }
};
