exports.collectUsers = async (page, hashtag) => {
  const resultUsers = {};
  await page.goto(`https://www.instagram.com/explore/tags/${hashtag}`, {
    waitUntil: "networkidle2",
  });

  // Get 9 most popular posts
  const posts = await page.$x("//section//article/div[1]//div[a]");
  for (const post of posts) {
    // Click on post
    await post.click();

    try {
      // Wait for the modal to appear and click on likes
      const likesButton = await page.waitForXPath(
        "//article[@role='presentation']//a[contains(@href, 'liked_by')]/span"
      );
      await likesButton.click();

      await page.waitForXPath(
        "//div[@role='presentation']//div[@role='dialog']//div[@aria-labelledby]"
      );

      // Scroll down couple of times.
      // We could scroll all the way down in a list but the list may be too long.
      for (let i = 0; i < 15; i++) {
        const likers = await page.$x(
          "//div[@role='presentation']//div[@role='dialog']//div[@aria-labelledby]"
        );

        for (const liker of likers) {
          // Check if user posted story in last 24 hours.
          // This indicates that user is active and can be followed
          const hasStory = await liker.$('span[role="link"]');
          if (hasStory) {
            const likerLink = await liker.$("a[href]");
            const title = await likerLink.getProperty("title");
            resultUsers[title._remoteObject.value] = true;
          }
        }

        await likers[likers.length - 1].evaluate((lastNode) =>
          lastNode.scrollIntoView()
        );
        await page.waitFor(1500);
      }
    } catch (error) {
      console.log(error);
    }

    // Close current dialog
    await page.keyboard.press("Escape");
  }

  return Object.keys(resultUsers);
};
