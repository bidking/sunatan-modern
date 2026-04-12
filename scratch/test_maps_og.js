async function test() {
    const url = "https://www.google.com/maps/place/Warung+Jalil/@-6.4822011,106.8650663,16z/data=!4m6!3m5!1s0x2e69c1006afbba89:0x42433b2d6220855a!8m2!3d-6.4822097!4d106.8677678!16s%2Fg%2F11x1g6sr_x?entry=ttu";
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
        }
    });
    const text = await res.text();
    const ogDesc = text.match(/property="og:description" content="([^"]+)"/);
    console.log("OG Description:", ogDesc ? ogDesc[1] : "Not found");
}
test();
