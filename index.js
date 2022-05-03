const puppeteer = require("puppeteer");

const mainURL = "http://books.toscrape.com/catalogue/category/books_1";
let browser;

const fetchAllPages = async (page) => {
  let selector = "li.current";
  await page.waitForSelector(selector);
  let pageCount = await page.$eval(selector, (el) => el.innerText);
  pageCount = pageCount.substring(pageCount.length - 2, pageCount.length);
  for (let i = 1; i <= parseInt(pageCount); i++) {
    if (i != 1) {
      await page.goto(`${mainURL}/page-${i}.html`, {
        waitUntil: "networkidle0",
      });
    }
    await fetchAllBooks(page);
  }
};

const fetchAllBooks = async (page) => {
  let selector = "img.thumbnail";
  await page.waitForSelector(selector);
  let thumbnails = await page.$$(selector);
  console.log(thumbnails.length);
  for (let i = 0; i < thumbnails.length; i++) {
    await thumbnails[i].click();
    await fetchBook(page).then((response) => console.log(response));
    await page.goBack();
    thumbnails = await page.$$(selector);
  }
};

const fetchBook = async (page) => {
  return Promise.all([
    fetchTitle(page),
    fetchPrice(page),
    fetchUPC(page),
    fetchRating(page),
  ]);
};

const fetchTitle = async (page) => {
  await page.waitForSelector("h1");
  const title = await page.$eval("h1", (el) => el.innerText);
  return title;
};

const fetchPrice = async (page) => {
  await page.waitForSelector("p.price_color");
  const price = await page.$eval("p.price_color", (el) => el.innerText);
  return price;
};

const fetchUPC = async (page) => {
  await page.waitForSelector("table.table-striped");
  const table = await page.$("table.table-striped");
  const UPC = await table.$eval("td", (el) => el.innerText);
  return UPC;
};

const fetchRating = async (page) => {
  await page.waitForSelector("p.star-rating");
  const rating = await page.$eval(
    "p.star-rating",
    (el) => [...el.classList][1]
  );
  return rating;
};

(async () => {
  browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${mainURL}/index.html`, { waitUntil: "networkidle0" });
  await fetchAllPages(page);
  // other actions...
})()
  .catch((error) => console.log(error))
  .finally(async () => await browser.close());
