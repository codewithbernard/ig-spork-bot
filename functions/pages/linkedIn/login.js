exports.login = async (page, username, password) => {
  await page.goto(
    "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin",
    {
      waitUntil: "networkidle2",
    }
  );

  // Fill username
  const usernameInput = await page.waitForXPath("//input[@id='username']");
  await usernameInput.type(username);

  // Fill password
  const passwordInput = await page.waitForXPath("//input[@id='password']");
  await passwordInput.type(password);

  // Press submit
  const submitButton = await page.waitForXPath("//button[@type='submit']");
  await submitButton.click();
  await page.waitForXPath("//button[@type='submit']", { hidden: true });
};
