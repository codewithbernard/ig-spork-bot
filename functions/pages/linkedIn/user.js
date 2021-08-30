exports.follow = async (page, profileUrl, fullName) => {
  await page.goto(profileUrl, {
    waitUntil: "networkidle2",
  });

  // Click on More Button
  const moreButton = await page.waitForXPath(
    "//button[@aria-expanded='false' and contains(@class, 'pvs-profile-actions__action')]"
  );
  await moreButton.click();

  // Click on connect
  const connectButton = await page.waitForXPath(
    "//div[@data-control-name='connect']"
  );
  await connectButton.click();

  // Click on connect in modal
  const connectModalButton = await page.waitForXPath(
    "//div[contains(@class,'send-invite')]//div[contains(@class, 'artdeco-modal__actionbar')]/button[1]"
  );
  await connectModalButton.click();

  // Wait a little
  page.waitFor(2500);

  // Click on note
  const leftNoteButton = await page.waitForXPath(
    "//div[contains(@class, 'artdeco-modal__actionbar')]//button[1]"
  );
  await leftNoteButton.click();

  // Click on note
  const messageTextArea = await page.waitForXPath(
    "//textarea[@name='message']"
  );
  await messageTextArea.type(
    `Hey ${
      fullName.split(" ")[0]
    }! You built an impressive resume. I am developer myself, looking to connect with like minded people and share to our knowledge.`
  );

  // Click on submit
  const submitButton = await page.waitForXPath(
    "//div[contains(@class, 'artdeco-modal__actionbar')]/button[2]"
  );
  await submitButton.click();
  await page.waitFor(5000);
};
