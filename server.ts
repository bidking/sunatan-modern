import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3005;

  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "galeri");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${path.parse(file.originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) cb(null, true);
      else cb(new Error('Only images and audio files are allowed'));
    }
  });

  app.use(cors());
  app.use(express.json());

  app.post("/api/resolve-map", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      const longUrl = response.url;
      const placeMatch = longUrl.match(/\/place\/([^/]+)/);
      if (placeMatch) {
        const address = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).split('/@')[0];
        const coordMatch = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        return res.json({ address, coordinates: coordMatch ? `${coordMatch[1]}, ${coordMatch[2]}` : null });
      }
      res.status(404).json({ error: "Not found" });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
  });

  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    res.json({ url: `${process.env.BASE_URL || "/galeri"}/${req.file.filename}` });
  });

  app.use("/galeri", express.static(uploadDir));

  // --- DYNAMIC SEO ENGINE ---
  const injectSEO = async (html: string, guest: string) => {
    try {
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/sunatan-azam/databases/(default)/documents/settings/global`);
      const data = await response.json();
      
      let title = "Undangan Tasyakuran Khitan";
      let desc = "Kami mengundang Anda untuk merayakan momen spesial tasyakuran khitan putra kami.";
      let image = "";
      let favicon = "/vite.svg";

      if (data.fields) {
        title = data.fields.ogTitle?.stringValue || title;
        desc = data.fields.ogDescription?.stringValue || desc;
        image = data.fields.ogImage?.stringValue || image;
        favicon = data.fields.faviconUrl?.stringValue || favicon;
      }

      // Add Guest Name to SEO
      if (guest) {
        title = title.replace("{{name}}", guest);
        if (!title.includes(guest)) title = `Undangan Spesial Untuk ${guest}`;
        desc = desc.replace("{{name}}", guest);
      }

      return html
        .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace(/property="og:title" content=".*?"/g, `property="og:title" content="${title}"`)
        .replace(/property="og:description" content=".*?"/g, `property="og:description" content="${desc}"`)
        .replace(/property="og:image" content=".*?"/g, `property="og:image" content="${image}"`)
        .replace(/property="twitter:title" content=".*?"/g, `property="twitter:title" content="${title}"`)
        .replace(/property="twitter:description" content=".*?"/g, `property="twitter:description" content="${desc}"`)
        .replace(/property="twitter:image" content=".*?"/g, `property="twitter:image" content="${image}"`)
        .replace(/id="favicon" rel="icon" type="image\/png" href=".*?"/, `id="favicon" rel="icon" type="image/png" href="${favicon}"`);
    } catch (e) { return html; }
  };

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    app.use("*", async (req, res) => {
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const guest = (req.query.to as string || "").split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        res.status(200).set({ "Content-Type": "text/html" }).end(await injectSEO(template, guest));
      } catch (e) { res.status(500).end(e); }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));
    app.get("*", async (req, res) => {
      try {
        const template = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
        const guest = (req.query.to as string || "").split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        res.status(200).set({ "Content-Type": "text/html" }).end(await injectSEO(template, guest));
      } catch (e) { res.status(500).end("Error"); }
    });
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}
startServer();
