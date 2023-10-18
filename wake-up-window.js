import { Builder, By } from 'selenium-webdriver';
import { readFileSync } from 'fs';

const userInfoStr = readFileSync('./user.json', 'utf-8') || '{}';
const userInfo = JSON.parse(userInfoStr);

const targetUrl = userInfo.jdUrl;
const pagePollingTiming = 1000;

const buyButtonXpath = [
  `\/\/*[@id="InitCartUrl"]`,
  `\/\/*[@id="choose-btn-ko"]`,
];
const goToCartXpath = `\/\/*[@id="GotoShoppingCart"]`;
const goToSubmitXpath = `\/\/*[@id="cart-body"]/div[2]/div[5]/div/div[2]/div/div/div/div[2]/div[2]/div/div[1]/a`;
const submitXpath = `\/\/*[@id="order-submit"]`;
const payXpath = `\/\/*[@id="indexBlurId"]/div[2]/div[1]/div[2]/div/div[2]/div[2]/div[2]/div/div/div[1]`;

const loginPage = 'passport.jd.com';
const itemInfoPage = 'item.jd.com';
const addToCartPage = 'cart.jd.com/addToCart';
const orderInfoPage = 'cart.jd.com/cart_index';
const checkPage = 'trade.jd.com';
const paymentPage = 'payc.m.jd.com';
const pathSet = [
  loginPage,
  itemInfoPage,
  addToCartPage,
  orderInfoPage,
  checkPage,
  paymentPage,
];

const loginStatus = {
  enterLoginPage: false,
  afterLogin: false,
};

const judgePage = async (driver, hasConfirmedPage) => {
  let page;

  if (hasConfirmedPage) {
    page = hasConfirmedPage;
  } else {
    const currentUrl = await driver.getCurrentUrl();
    page = pathSet.find((path) => currentUrl.includes(path));
  }

  switch (page) {
    case loginPage:
      inLoginPage(driver);
      break;
    case itemInfoPage:
      inItemInfoPage(driver);
      break;
    case addToCartPage:
      inAddToCartPage(driver);
      break;
    case orderInfoPage:
      inOrderInfoPage(driver);
      break;
    case checkPage:
      inCheckPage(driver);
      break;
    case paymentPage:
      inPaymentPage(driver);
      break;
    default:
      judgePage(driver);
      break;
  }
};

const pagePolling = (driver, expected) => {
  const pollingInterval = setInterval(async () => {
    const currentUrl = await driver.getCurrentUrl();
    const page = pathSet.find((path) => currentUrl.includes(path));
    if (page === expected) {
      clearInterval(pollingInterval);
      judgePage(driver, page);
    }
  }, pagePollingTiming);
};

const inLoginPage = (driver) => {
  const loginInterval = setInterval(async () => {
    const currentUrl = await driver.getCurrentUrl();

    if (currentUrl.includes(loginPage)) {
      loginStatus.enterLoginPage = true;
    }

    if (
      loginStatus.enterLoginPage &&
      pathSet.filter((p) => p !== loginPage).some((p) => currentUrl.includes(p))
    ) {
      loginStatus.afterLogin = true;
    }

    if (loginStatus.afterLogin) {
      judgePage(driver);
      clearInterval(loginInterval);
    }
  }, 1000);
};

// 尝试加入购物车
const inItemInfoPage = async (driver) => {
  let found = false;
  let pathIndex = 0;

  while (!found) {
    try {
      for (let i = pathIndex; i < buyButtonXpath.length; i++) {
        const button = await driver.findElement(By.xpath(buyButtonXpath[i]));
        await button.click();
        found = true;
        judgePage(driver);
      }
    } catch (err) {
      pathIndex++;
      if (pathIndex === buyButtonXpath.length) {
        pathIndex = 0;
        await driver.navigate().refresh();
        judgePage(driver);
      }
    }
  }
};

// 按钮”去购物车结算“
const inAddToCartPage = async (driver) => {
  try {
    await driver.findElement(By.xpath(goToCartXpath)).click();
    judgePage(driver);
  } catch {
    pagePolling(driver, addToCartPage);
  }
};

// 按钮“去结算”
const inOrderInfoPage = async (driver) => {
  try {
    await driver.findElement(By.xpath(goToSubmitXpath)).click();
    judgePage(driver);
  } catch {
    pagePolling(driver, orderInfoPage);
  }
};

const inCheckPage = async (driver) => {
  // 准备付钱
  try {
    await driver.findElement(By.xpath(submitXpath)).click();
    judgePage(driver);
  } catch {
    pagePolling(driver, checkPage);
  }
};

const inPaymentPage = async (driver) => {
  // 选择支付方式之后 立即支付
  try {
    await driver.manage().setTimeouts({ implicit: gapTiming });
    await driver.findElement(By.xpath(payXpath)).click();
    judgePage(driver);
  } catch {
    pagePolling(driver, paymentPage);
  }
};

(async function main() {
  const driver = await new Builder().forBrowser('chrome').build();
  await driver.get(targetUrl);
  judgePage(driver);
})();
