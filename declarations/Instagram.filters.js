import puppeteer from 'puppeteer';

export const replaceInfoImageWithEmoji = document => {
  const infoImages = document.querySelectorAll('img[src*="/851547_537948159656190_540847388_n.png?"]');

  infoImages.forEach(infoImage => {
    infoImage.replaceWith('ℹ️');
  });
};

export function removeTrackingIDs(document) {
  document.querySelectorAll('a').forEach(el => {
    const href = el.getAttribute('href');
    const params = new URLSearchParams(href);

    if (params.has('h')) {
      params.set('h', 'removed');
      el.setAttribute('href', params.toString());
    }
  });
}

export async function getModalContent(document, { fetch }) {
  const subpageLinks = document.querySelectorAll('a[href*="subpage="]');
  const annotationLinks = document.querySelectorAll('a[href*="annotations["]');

  let browser;

  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(fetch);

    for (const link of [ ...annotationLinks, ...subpageLinks ]) {
      console.log(link.href);
      const linkSelector = `a[href="${link.href.replace('https://privacycenter.instagram.com/', '/')}"]`;

      await page.waitForSelector(linkSelector);
      await page.click(linkSelector);

      const contentSelector = "[role='dialog'] [role='main']";

      await page.waitForSelector(contentSelector);
      const mainContent = await page.$(contentSelector);

      const newItem = document.createElement('div');

      newItem.innerHTML = `<hr/>${(await mainContent.getProperty('innerHTML')).toString()}<hr/>`;
      link.parentNode.replaceChild(newItem, link);
      await page.click('[role="dialog"] [aria-label="Close"]');
    }
  } catch (e) {
    await browser.close();
    throw e;
  }
}
