const Bottleneck = require("bottleneck");
const puppeteer = require("puppeteer");

const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100,
});

let browser;

const initBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
};

const extract_kwik = async (url) => {
  return limiter.schedule(async () => {
    try {
      if (!url?.length) return null;
      const browser = await initBrowser();
      const page = await browser.newPage();
      let m3u8Url = "";
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const requestUrl = request.url();
        if (requestUrl.includes("m3u8")) {
          m3u8Url = requestUrl;
          request.abort();
        } else {
          request.continue();
        }
      });
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        referer: "https://kwik.si/",
      });
      await page.close();
      return m3u8Url || null;
    } catch (error) {
      console.error("Error extracting m3u8 URL:", error.message);
      return null;
    }
  });
};

module.exports = { extract_kwik };
