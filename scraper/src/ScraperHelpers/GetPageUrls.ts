import { getUrls, GetUrlsParams } from './GetUrls'

interface getPageUrlsParams extends GetUrlsParams {
  url: string
}

/**
 * Gets all the urls on the current page matching the given regex
 * (This function is only an async puppeteer wrapper)
 *
 * @param { string } url - Url of the page to scrape
 * @param { puppeteer.Page } page - page to be used for scraping
 * @param { string } base - prefix for each scraped url
 * @param { RegExp } regex - regex to check each scraped url
 * @returns { Promise<string[]> } List of all urls on @param page . Each url is prefixed by @param base
 * @example
 *    const browser = await puppeteer.launch()
 *    const urls = getPageUrls('http://timetable.unsw.edu.au/2019/COMP1511.html', await browser.newPage(), 'http://timetable.unsw.edu.au/2019/', /html$/)
 * Expect: [ '.*html' ]*
 */
const getPageUrls = async ({
  url,
  page,
  regex,
}: getPageUrlsParams): Promise<string[]> => {
  await page.goto(url, {
    waitUntil: 'networkidle2',
  })

  // Then, get each data url on that page
  const getDataUrlsParams: GetUrlsParams = {
    page: page,
    regex: regex,
  }
  return await getUrls(getDataUrlsParams)
}

export { getPageUrls }
