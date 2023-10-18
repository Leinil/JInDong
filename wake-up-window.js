import { Builder, By, until } from "selenium-webdriver";
import { readFileSync } from "fs";

const userInfoStr = readFileSync("./user.json", "utf-8") || "{}";
const userInfo = JSON.parse(userInfoStr);

const targetUrl = userInfo.jdUrl;
const maxPendingPage = 5000;

const buyButtonXpath = [
  `\/\/*[@id="InitCartUrl"]`,
  `\/\/*[@id="choose-btn-ko"]`,
];
const goToCartXpath = `\/\/*[@id="GotoShoppingCart"]`;
const goToSubmitXpath = `\/\/*[@id="cart-body"]/div[2]/div[5]/div/div[2]/div/div/div/div[2]/div[2]/div/div[1]/a`;
const submitXpath = `\/\/*[@id="order-submit"]`;
const payXpath = `\/\/*[@id="indexBlurId"]/div[2]/div[1]/div[2]/div/div[2]/div[2]/div[2]/div/div/div[1]`;

const loginPage = "passport.jd.com";
const itemInfoPage = "item.jd.com";
const addToCartPage = "cart.jd.com/addToCart";
const orderInfoPage = "cart.jd.com/cart_index";
const checkPage = "trade.jd.com";
const paymentPage = "payc.m.jd.com";
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

const judgePage = async (driver) => {
  const currentUrl = await driver.getCurrentUrl();
  const page = pathSet.find((path) => currentUrl.includes(path));

  console.log(page);

  switch (page) {
    case loginPage:
      inLoginPage(driver);
      break;
    case itemInfoPage:
      inItemInfoPage(driver);
      break;
    case addToCartPage:
      findButtonAndClick(driver, goToCartXpath, addToCartPage);
      break;
    case orderInfoPage:
      findButtonAndClick(driver, goToSubmitXpath, orderInfoPage);
      break;
    case checkPage:
      findButtonAndClick(driver, submitXpath, checkPage);
      break;
    case paymentPage:
      findButtonAndClick(driver, payXpath, paymentPage);
      break;
    default:
      judgePage(driver);
      break;
  }
};

const findButtonAndClick = async (driver, xpath) => {
  try {
    const targetDom = await driver.findElement(By.xpath(xpath));
    await driver.wait(until.elementIsEnabled(targetDom), maxPendingPage);
    targetDom.click();
    judgePage(driver);
  } catch {
    await driver.navigate().refresh();
    judgePage(driver);
  }
};

const inLoginPage = (driver) => {
  const loginInterval = setInterval(async () => {
    const currentUrl = await driver.getCurrentUrl();
    console.log(loginStatus, currentUrl);
    if (loginStatus.afterLogin) {
      judgePage(driver);
      clearInterval(loginInterval);
    }

    if (currentUrl.includes(loginPage)) {
      loginStatus.enterLoginPage = true;
    }

    if (
      loginStatus.enterLoginPage &&
      pathSet.filter((p) => p !== loginPage).some((p) => currentUrl.includes(p))
    ) {
      loginStatus.afterLogin = true;
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

(async function main() {
  const driver = await new Builder().forBrowser("chrome").build();
  await driver.get(targetUrl);
  judgePage(driver);
})();
