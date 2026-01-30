describe('NScyberLab Smoke Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the home screen', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should navigate to library screen', async () => {
    await element(by.id('library-button')).tap();
    await expect(element(by.id('library-screen'))).toBeVisible();
  });

  it('should navigate to beam calculator', async () => {
    await element(by.id('beam-button')).tap();
    await expect(element(by.id('reaction-screen'))).toBeVisible();
  });

  it('should navigate to terminal screen', async () => {
    await element(by.id('terminal-button')).tap();
    await expect(element(by.id('terminal-screen'))).toBeVisible();
  });
});
