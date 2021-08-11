exports.login = async (page, username, password) => {
  await page.goto("https://www.instagram.com/accounts/login", {
    waitUntil: "networkidle2",
  });

  try {
    // Cookie message my appear
    const cookiesButton = await page.waitForXPath(
      "//button[contains(text(),'Accept')]"
    );
    cookiesButton.click();
    await page.waitForXPath("//button[contains(text(),'Accept')]", {
      hidden: true,
    });
  } catch (error) {
    console.log("No cookie header");
  }

  // Fill username
  const usernameInput = await page.waitForXPath("//input[@name='username']");
  await usernameInput.type(username);

  // Fill password
  const passwordInput = await page.waitForXPath("//input[@name='password']");
  await passwordInput.type(password);

  // Press submit
  const submitButton = await page.waitForXPath("//button[@type='submit']");
  await submitButton.click();
  await page.waitForXPath("//button[@type='submit']", { hidden: true });
};
