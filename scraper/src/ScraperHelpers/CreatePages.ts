import { Browser, Page } from 'puppeteer'

interface createPagesParams {
  browser: Browser
  batchsize: number
}

/**
 * Creates browser pages to then use to scrape the website
 *
 * @param {Browser} browser - browser object (window) in which to create new pages
 * @param {number} batchsize - Number of pages to be created
 * @returns {Promise<Page[]>}
 */
const createPages = async ({
  browser,
  batchsize,
}: createPagesParams): Promise<Page[]> => {
  // List of pages
  const pages: Page[] = []
  for (let pageno = 0; pageno < batchsize; pageno++) {
    const singlepage = await browser.newPage()
    // Block all js, css, fonts and images for speed
    await singlepage.setRequestInterception(true)
    singlepage.on('request', request => {
      const type = request.resourceType()
      if (type === 'document') {
        request.continue()
      } else {
        request.abort()
      }
    })
    pages.push(singlepage)
  }
  return pages
}

export { createPages }
