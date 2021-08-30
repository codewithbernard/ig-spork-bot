exports.getLikers = async (page, url) => {
  await page.goto(url, {
    waitUntil: "networkidle2",
  });

  // Click on likers button
  const likersButton = await page.waitForXPath(
    "//button[contains(@class, 'social-details-social-counts__count-value')][img]"
  );
  await likersButton.click({ waitUntil: "networkidle2" });

  const resultUsers = {};

  for (let i = 0; i < 35; i++) {
    const likers = await page.$x(
      "//div[@class='social-details-reactors-tab-body']//ul/li"
    );

    for (const liker of likers) {
      // Check if user posted story in last 24 hours.
      // This indicates that user is active and can be followed
      const nameElement = await liker.$(".artdeco-entity-lockup__title > span");

      // Get the link
      const linkElement = await liker.$("a[href]");
      const link = await linkElement.getProperty("href");

      // Get the name
      const title = await nameElement.getProperty("innerText");

      resultUsers[title._remoteObject.value] = link._remoteObject.value;
    }

    await likers[likers.length - 1].evaluate((lastNode) =>
      lastNode.scrollIntoView()
    );

    await page.waitFor(2500);
  }

  return Object.keys(resultUsers).map((name) => ({
    name,
    link: resultUsers[name],
  }));
};
