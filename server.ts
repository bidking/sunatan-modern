import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Configure Multer for file uploads
  // Default to a local 'public/galeri' folder for dev
  // On Alibaba server, the user should set UPLOAD_DIR=/home/esta/galeri
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "galeri");
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      // Clean filename: remove spaces and special chars
      const originalName = path.parse(file.originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      cb(null, `${originalName}-${uniqueSuffix}${ext}`);
    },
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Construct the URL
    // In production on Alibaba, the user wants https://justbluenyellow.my.id/galeri/filename
    // If BASE_URL is not set, we use a relative path /galeri/filename
    const baseUrl = process.env.BASE_URL || "/galeri";
    const fileUrl = `${baseUrl}/${req.file.filename}`;

    res.json({ url: fileUrl });
  });

  // Serve the uploaded files statically
  // On Alibaba, Nginx handles /galeri, but for dev we need it.
  app.use("/galeri", express.static(uploadDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Upload directory: ${uploadDir}`);
  });
}

startServer();
