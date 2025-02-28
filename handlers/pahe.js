const axios = require("axios");
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
      headless: "new",
      devtools: 0,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreDefaultArgs: ["--disable-extensions"],
      timeout: 120000,
    });
  }
  return browser;
};

const extract_kwik = async (url) => {
  return limiter.schedule(async () => {
    try {
      if (!url?.length) return null;
      console.log("getting", url);
      // let { data } = await axios.get(url, {
      //   headers: { referer: "https://animepahe.ru" },
      // });
      // let func = eval(`(${data?.match(/eval\(.*\)/)[0].split("eval(")[2]}`);
      // let source = func?.match(/source='([^']+)'/)[1];
      // if (source) return source || null;
      const browser = await initBrowser();
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(120000);
      await page.setDefaultTimeout(120000);
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
        timeout: 120000,
      });
      await page.close();
      return m3u8Url || null;
    } catch (error) {
      console.log("Error extracting m3u8 URL:", error?.message);
      return null;
    }
  });
};

module.exports = { extract_kwik };
