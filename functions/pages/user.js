exports.follow = async (page, username) => {
  await page.goto(`https://www.instagram.com/${username}`, {
    waitUntil: "networkidle2",
  });

  try {
    const followButton = await page.waitForXPath(
      "//button[contains(text(),'Follow')]"
    );
    await followButton.click();
    await page.waitFor(2500);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
