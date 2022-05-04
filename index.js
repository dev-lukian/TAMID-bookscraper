const puppeteer = require("puppeteer");
const fs = require("fs");

const homeLink = "http://books.toscrape.com/index.html";
let browser;

// categoryLinks: array of the URLs for the first page of each category
// There are 50 categories, so the size of categoryLinks is 50
const fetchCategories = async (page) => {
  let categoryLinks = [];
  let selector = "ul.nav.nav-list > li > ul > li > a";
  await page.waitForSelector(selector);
  // .$$ function returns an array of all the elements matching the selector
  let categories = await page.$$(selector);
  for (let i = 0; i < categories.length; i++) {
    const link = await page.evaluate((el) => el.href, categories[i]);
    categoryLinks.push(link);
  }
  return categoryLinks;
};

// Returns all the book data on a given category, regardless of number of pages
const fetchAllPages = async (page, link) => {
  let categoryData = [];

  // e.g. http://books.toscrape.com/catalogue/category/books/travel_2/index.html ->
  // http://books.toscrape.com/catalogue/category/books/travel_2/ (remove 'index.html')
  let rootLink = link.slice(0, -10);

  // Grabs number of pages a given category has
  let pageCount;
  let selector = "li.current";
  // After 2 seconds (implying there are no other pages), multiple pages = false
  const multiplePages = await page
    .waitForSelector(selector, { timeout: 2000 })
    .catch((error) => {
      return false;
    });
  if (multiplePages == false) {
    pageCount = 1;
  } else {
    // e.g. Page 1 of 2
    pageCount = await page.$eval(selector, (el) => el.innerText);
    // e.g. Page 1 of 2 -> 2
    pageCount = await pageCount.slice(pageCount.length - 2, pageCount.length);
  }

  // Grabs category title on first page
  const category = await page.$eval("h1", (el) => el.innerText);

  // Loops through each page to gather all book data
  for (let i = 1; i <= parseInt(pageCount); i++) {
    if (i != 1) {
      await page.goto(`${rootLink}page-${i}.html`, {
        waitUntil: "networkidle0",
      });
    }
    const pageData = await fetchBooksOnPage(page, category);
    categoryData = categoryData.concat(pageData);
  }

  return categoryData;
};

// Returns all book data on a given page as a object
const fetchBooksOnPage = async (page, category) => {
  let pageData = [];

  // Creates an array matching the thumbnail selector
  let selector = "img.thumbnail";
  await page.waitForSelector(selector);
  let thumbnails = await page.$$(selector);

  for (let i = 0; i < thumbnails.length; i++) {
    // 1) Click on book thumbnail to go to its corresponding page
    await thumbnails[i].click();
    // 2) Scrape the book's information
    const bookData = await fetchBook(page);
    // 3) Turn array of information into book object (category gets passed in from function argument)
    let book = {
      title: bookData[0],
      price: bookData[1],
      upc: bookData[2],
      rating: bookData[3],
      category: category,
    };
    // 4) Push book object to pageData array
    pageData.push(book);
    // 5) Go back to previous page showing all the other pages
    await page.goBack();
    // 6) Refresh thumbnails array
    thumbnails = await page.$$(selector);
  }

  return pageData;
};

// Returns [title, price, upc, rating]
// e.g. ["It's Only the Himalayas", "£45.17", "a22124811bfa8350", "Two"]
const fetchBook = async (page) => {
  return await Promise.all([
    fetchTitle(page),
    fetchPrice(page),
    fetchUPC(page),
    fetchRating(page),
  ]);
};

// Returns title
// e.g. "It's Only the Himalayas"
const fetchTitle = async (page) => {
  await page.waitForSelector("h1");
  const title = await page.$eval("h1", (el) => el.innerText);
  return title;
};

// Returns price
// e.g. "£45.17"
const fetchPrice = async (page) => {
  await page.waitForSelector("p.price_color");
  const price = await page.$eval("p.price_color", (el) => el.innerText);
  return price;
};

// Returns upc
// e.g. "a22124811bfa8350"
const fetchUPC = async (page) => {
  await page.waitForSelector("table.table-striped");
  const table = await page.$("table.table-striped");
  const UPC = await table.$eval("td", (el) => el.innerText);
  return UPC;
};

// Returns rating
// e.g. "Two"
const fetchRating = async (page) => {
  await page.waitForSelector("p.star-rating");
  // Rating is retrieved from the 2nd class name
  // All selectors have .start-rating class, but the second can be any in ["One", "Two", "Three", "Four", "Five"]
  const rating = await page.$eval(
    "p.star-rating",
    (el) => [...el.classList][1]
  );
  return rating;
};

(async () => {
  // Launches a headless browser (browser without GUI)
  browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(homeLink, { waitUntil: "networkidle0" });
  const categoryLinks = await fetchCategories(page);

  let allBooks = [];

  // Opens up a new page for each category, scrapes all book data in that category, and pushes to allBooks array
  // Done in parallel using 50 pages (nodes) to be scrape data much faster than doing if done synchronously (one at a time)
  await Promise.all(
    categoryLinks.map(async (categoryLink) => {
      const page = await browser.newPage();
      await page.goto(categoryLink, { waitUntil: "networkidle0" });
      await fetchAllPages(page, categoryLink).then((response) => {
        console.log(response.length);
        console.log(categoryLink);
        allBooks = allBooks.concat(response);
      });
    })
  );

  await fs.writeFileSync("books.json", await JSON.stringify(allBooks));
})()
  .catch((error) => console.log(error))
  .finally(async () => await browser.close());
