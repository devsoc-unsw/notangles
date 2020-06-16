/**
 * Extracts the elements hrefs that contain urls from the html element array
 * @param { Element[] } elements: Elements on the page
 * @returns { string[] }: Hrefs of all 'a' tags in the elements list
 */
const extractHrefsFromPage = (elements: Element[]): string[] => {
  return elements
    .filter((ele): ele is HTMLAnchorElement => 'href' in ele)
    .map(element => element.href)
}

export { extractHrefsFromPage }
