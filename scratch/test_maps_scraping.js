async function test() {
    const url = "https://www.google.com/maps/place/Warung+Jalil/@-6.4822011,106.8650663,16z/data=!4m6!3m5!1s0x2e69c1006afbba89:0x42433b2d6220855a!8m2!3d-6.4822097!4d106.8677678!16s%2Fg%2F11x1g6sr_x?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D";
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const text = await res.text();
    console.log("Text length:", text.length);
    console.log("Contains 'Jawa Barat'?", text.includes("Jawa Barat"));
    console.log("Contains 'Karang Asem Bar'?", text.includes("Karang Asem Bar"));
    
    // Find where "Jawa Barat" is
    const index = text.indexOf("Jawa Barat");
    if (index !== -1) {
        console.log("Snippet around Jawa Barat:", text.substring(index - 100, index + 100));
    }
}
test();
