import { TimetableUrl } from '../../interfaces'

interface FilterUrlsParams {
  elements: string[]
  regex: RegExp
}

/**
 * Filters the urls from list of hrefs of 'a' tags using the regex
 * @param elements: Array of hrefs of 'a' tags that contain urls to extract
 * @param regex: Regexp to find the urls
 * @returns { TimetableUrl[] }: List of urls of urls matching the regex
 */
const filterUrls = ({ elements, regex }: FilterUrlsParams): TimetableUrl[] => {
  const urls: TimetableUrl[] = elements.filter(url => regex.test(url))
  const cleanUrls = new Set<TimetableUrl>(urls)
  return [...cleanUrls]
}

export { filterUrls }
