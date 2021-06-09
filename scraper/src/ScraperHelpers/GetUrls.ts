import { Page } from 'puppeteer'
import { TimetableUrl } from '../interfaces'

import { extractHrefsFromPage } from '../PageScraper/PageHelpers/GetHrefs'
import { filterUrls } from '../PageScraper/PageHelpers/FilterUrls'

interface GetUrlsParams {
  page: Page
  regex: RegExp
}

/**
 * Gets all the urls in the data class on page: page matching regex
 * Each url will have the prefix: base.
 * @param { puppeteer.Page } page Page to scrape urls from
 * @param { string } base string each url has to be prefixed with
 * @param { RegExp } regex regex to check each url
 * @returns { Promise<TimetableUrl[]> }: The list of urls on the page, prefixed with @param base
 */
const getUrls = async ({
  page,
  regex,
}: GetUrlsParams): Promise<TimetableUrl[]> => {
  const elements = await page.$$eval('.data a', extractHrefsFromPage)
  return filterUrls({ elements, regex })
}

export { getUrls, GetUrlsParams }
