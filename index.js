const { Builder, By } = require('selenium-webdriver');

const targetUrl = 'https://item.jd.com/10036178660064.html';
const refreshTiming = 1000;
const gapTiming = 2000;
const buyXpath = [`\/\/*[@id="InitCartUrl"]`, `\/\/*[@id="choose-btn-ko"]`];
const shopCarXpath = `\/\/*[@id="GotoShoppingCart"]`;
const orderXpath = `\/\/*[@id="cart-body"]/div[2]/div[5]/div/div[2]/div/div/div/div[2]/div[2]/div/div[1]/a`;
const submitXpath = `\/\/*[@id="order-submit"]`;
const payXpath = `\/\/*[@id="indexBlurId"]/div[2]/div[1]/div[2]/div/div[2]/div[2]/div[2]/div/div/div[1]`;

let currentUrl = '';

(async function helloSelenium() {
  const driver = await new Builder().forBrowser('chrome').build();
  await driver.get(targetUrl);

  const urlInterval = setInterval(async () => {
    currentUrl = await driver.getCurrentUrl();

    if (currentUrl === targetUrl) {
      clearInterval(urlInterval);
      inBuyPage(driver);
    }
  }, 2000);
})();

const inBuyPage = async (driver) => {
  let found = false;
  let pathIndex = 0;

  while (!found) {
    try {
      for (let i = pathIndex; i < buyXpath.length; i++) {
        const button = await driver.findElement(By.xpath(buyXpath[i]));
        await button.click();
        found = true;
      }
    } catch (err) {
      pathIndex++;
      if (pathIndex === buyXpath.length) {
        pathIndex = 0;
        await driver.manage().setTimeouts({ implicit: refreshTiming });
        await driver.navigate().refresh();
      }
    }
  }

  // 到购物车
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(shopCarXpath)).click();

  // 提交订单
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(orderXpath)).click();

  // 准备付钱
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(submitXpath)).click();

  // 选择支付方式之后 立即支付
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(payXpath)).click();
};
