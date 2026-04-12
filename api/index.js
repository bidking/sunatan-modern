import fs from 'fs';
import path from 'path';

export default async (req, res) => {
  let html = '';
  try {
    // 1. Cari file template HTML
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'app.html'),
      path.join(process.cwd(), 'app.html'),
      path.join('/var/task', 'dist', 'app.html'),
      path.join('/var/task', 'app.html')
    ];
    
    let htmlPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        htmlPath = p;
        break;
      }
    }
    
    if (!htmlPath) {
        throw new Error("Could not find index.html in any known paths");
    }
    
    html = fs.readFileSync(htmlPath, 'utf8');

    // 2. Default Data
    let title = "Undangan Tasyakuran Khitan";
    let desc = "Kami mengundang Anda untuk merayakan momen spesial tasyakuran khitan putra kami.";
    let image = "https://justbluenyellow.my.id/galeri/248471-1775842851801-10041416.jpg";
    let favicon = "https://justbluenyellow.my.id/galeri/242929-1775842592916-116545060.gif";

    // 3. Ambil data dari Firebase Admin (Gunakan native fetch)
    const projectId = "sunatan-azam";
    try {
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
    
    let guestSlug = req.query.to;
    if (!guestSlug) {
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

    // Ensure Absolute URLs
    if (image && image.startsWith('/')) image = `${protocol}://${host}${image}`;
    if (favicon && favicon.startsWith('/')) favicon = `${protocol}://${host}${favicon}`;

    // 5. Ganti placeholder (Gunakan regex yang lebih aman)
    let finalHtml = html
      .split('{{TITLE}}').join(title)
      .split('{{DESC}}').join(desc)
      .split('{{IMAGE}}').join(image)
      .split('{{FAVICON}}').join(favicon)
      .split('{{URL}}').join(fullUrl);

    // Tambahkan tanda bahwa ini di-render oleh fungsi
    finalHtml = finalHtml.replace('</head>', '  <!-- Rendered by SEO Bot -->\n  </head>');

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    return res.status(200).send(finalHtml);
  } catch (error) {
    console.error("Main SEO Error:", error);
    // Jika gagal, kirim HTML asli jika berhasil dibaca
    if (html) {
        return res.status(200).send(html + "<!-- SEO Error -->");
    }
    return res.status(500).send("Internal Server Error: " + error.message);
  }
};
