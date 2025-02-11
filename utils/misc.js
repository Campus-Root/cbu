
import { URL } from 'url';
import psl from 'psl';
// import axios from 'axios';
// import xml2js from 'xml2js';
import axios from 'axios';
import { Parser, parseStringPromise } from 'xml2js';
import puppeteer from 'puppeteer';

export const processUrls = async (urls, mainUrl) => {
    const urlSet = new Set();
    const sitemapResults = await Promise.all(urls.map(url => getAllUrlsFromSitemap(url, mainUrl)));
    sitemapResults.flat().forEach(url => urlSet.add(url));
    console.log(`Total ${urlSet.size} URLs to be processed`);
    return Array.from(urlSet);
}
export const sitemapGenerator = async (url) => {
    try {
        const urlObj = new URL(url);
        console.log("got url");
        const parsedDomain = psl.parse(urlObj.hostname);
        let baseUrl = parsedDomain.domain || urlObj.hostname;
        console.log(baseUrl);
        // Attempt to fetch robots.txt
        let sitemapUrls = [];
        try {
            const response = await axios.get(`https://${baseUrl}/robots.txt`);
            const match = response.data.match(/Sitemap:\s*(.+)/gi);
            if (match) {
                sitemapUrls = match.map(line => line.replace(/Sitemap:\s*/, '').trim());
            }
        } catch (err) {
            console.warn(`No robots.txt found for ${url}, trying default sitemap paths.`);
        }

        if (sitemapUrls.length === 0) {
            const commonPaths = [
                '/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml', '/sitemap.php',
                '/sitemap.txt', '/sitemap.xml.gz', '/sitemap/', '/sitemap/sitemap.xml',
                '/sitemapindex.xml', '/sitemap/index.xml', '/sitemap1.xml'
            ];
            await Promise.all(commonPaths.map(async (path) => {
                try {
                    const sitemapResponse = await axios.get(`https://${baseUrl}${path}`);
                    if (sitemapResponse.status === 200) sitemapUrls.push(`https://${baseUrl}${path}`);
                } catch (error) {
                    console.log(`error at ${path}`);

                }

            }))
        }
        if (sitemapUrls.length === 0) {
            console.error(`No sitemap found for ${url}`);
            return [];
        }
        console.log(sitemapUrls);

        return { sitemapUrls, mainUrl: `https://${baseUrl}/` };
    } catch (error) {
        console.error(`Error processing ${url}:`, error.message);
    }
};
// async function getAllUrlsFromSitemap(sitemapUrl, visitedSitemaps = new Set()) {
//     if (visitedSitemaps.has(sitemapUrl)) return [];
//     try {
//         const response = await axios.get(sitemapUrl, {
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//                 'Referer': 'https://www.google.com/',
//             }
//         });
//         visitedSitemaps.add(sitemapUrl);
//         const parser = new xml2js.Parser();
//         const result = await parser.parseStringPromise(response.data);
//         let urls = [];
//         if (result.urlset && result.urlset.url) urls = result.urlset.url.map(entry => entry.loc[0]);
//         if (result.sitemapindex && result.sitemapindex.sitemap) {
//             for (const sitemap of result.sitemapindex.sitemap) {
//                 const nestedUrls = await getAllUrlsFromSitemap(sitemap.loc[0], visitedSitemaps);
//                 urls.push(...nestedUrls);
//             }
//         }
//         return urls;
//     } catch (error) {
//         console.error(`Error fetching sitemap: ${sitemapUrl}`, error);
//         return [];
//     }
// }
export const attempt1 = async (url) => {
    const { sitemapUrls, mainUrl } = await sitemapGenerator(url);
    if (sitemapUrls.length === 0) {
        console.error(`No sitemap found for ${url}`);
        return [];
    }
    let sublinks = await processUrls(sitemapUrls, mainUrl);
    if (sublinks.length === 0) {
        console.log(`No sublinks found for ${sitemapUrls}`);
        return [];
    }
    return sublinks
}
export const attempt2 = async (url) => {
    try {
        let response = await fetch("https://api.droxy.ai/auth/login", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://app.droxy.ai/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": "{\"email\":\"gehawi7086@nike4s.com\",\"password\":\"Gehawi7086@nike4s\"}",
            "method": "POST"
        });
        const { accessToken } = await response.json();
        console.log("fetched access token");
        let encodedUrl = encodeURIComponent(url);
        response = await fetch(`https://api.droxy.ai/website/sub-links?url=${encodedUrl}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "authorization": `Bearer ${accessToken}`,
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://app.droxy.ai/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });
        const data = await response.json();
        return data
    } catch (error) {
        throw new Error("error with api.droxy.ai error:", error);
    }
}



const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const fetchWithRetry = async (url, retries = 3, delayMs = 2000, mainUrl) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'application/xml,text/xml;q=0.9,*/*;q=0.8',
                    'Referer': mainUrl,
                }
            });
            writeFileSync("resp.txt", response);
            return response.data;
        } catch (error) {
            console.warn(`Attempt ${attempt} failed for ${url}: ${error.message}`);
            if (attempt < retries) await new Promise(res => setTimeout(res, delayMs));
            if (attempt === retries) {
                console.log(`Axios failed after ${retries} attempts. Falling back to Puppeteer...`);
                return fetchWithPuppeteer(url, mainUrl);
            }
        }
    }
    console.error(`Failed to fetch ${url} after ${retries} attempts.`);
    return null;
};
const fetchWithPuppeteer = async (url, mainUrl) => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    let content
    try {
        await page.goto(url);
        content = await page.content();
    } catch (error) {
        console.error(`Puppeteer failed for ${url}: ${error.message}`);
        return null;
    } finally {
        await browser.close();
        return content;
    }
};

const getAllUrlsFromSitemap = async (sitemapUrl, mainUrl, visitedSitemaps = new Set()) => {
    if (visitedSitemaps.has(sitemapUrl)) return [];
    console.log(`Fetching: ${sitemapUrl}`);
    const xmlData = await fetchWithRetry(sitemapUrl, 1, 5000, mainUrl);
    if (!xmlData) return [];
    visitedSitemaps.add(sitemapUrl);
    const parser = new Parser();
    const result = await parser.parseStringPromise(xmlData);
    let urls = [];
    if (result.urlset?.url) {
        urls = result.urlset.url.map(entry => entry.loc[0]);
    }
    if (result.sitemapindex?.sitemap) {
        for (const sitemap of result.sitemapindex.sitemap) {
            const nestedUrls = await getAllUrlsFromSitemap(sitemap.loc[0], visitedSitemaps);
            urls.push(...nestedUrls);
        }
    }

    return urls;
};
