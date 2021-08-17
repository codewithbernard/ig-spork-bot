exports.follow = async (page, username) => {
  await page.goto(`https://www.instagram.com/${username}`, {
    waitUntil: "networkidle2",
  });

  const followButton = await page.waitForXPath(
    "//button[contains(text(),'Follow')]"
  );
  await followButton.click();
  await page.waitFor(2500);
};

exports.userRemoved = async (page) => {
  try {
    await page.waitForXPath("//div[contains(text(),'have been removed')]");
    return true;
  } catch (error) {
    return false;
  }
};
