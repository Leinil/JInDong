import { Builder, By } from "selenium-webdriver";

const targetUrl = "https://item.jd.com/10070625520377.html";
const refreshTiming = 1000;
const gapTiming = 2000;
const buyXpath = [`\/\/*[@id="InitCartUrl"]`, `\/\/*[@id="choose-btn-ko"]`];
const shopCarXpath = `\/\/*[@id="GotoShoppingCart"]`;
const orderXpath = `\/\/*[@id="cart-body"]/div[2]/div[5]/div/div[2]/div/div/div/div[2]/div[2]/div/div[1]/a`;
const submitXpath = `\/\/*[@id="order-submit"]`;
const payXpath = `\/\/*[@id="indexBlurId"]/div[2]/div[1]/div[2]/div/div[2]/div[2]/div[2]/div/div/div[1]`;

const loginPath = "passport.jd.com";
const itemPath = "item.jd.com";
const cardPath = "cart.jd.com";
const pathSet = [loginPath, itemPath, cardPath];

const loginStatus = {
  enterLoginPage: false,
  afterLogin: false,
};

(async function main() {
  const driver = await new Builder().forBrowser("chrome").build();
  await driver.get(targetUrl);
  judgePath(driver);
})();

const judgePath = async (driver) => {
  const currentUrl = await driver.getCurrentUrl();
  const path = pathSet.find((path) => currentUrl.includes(path));

  switch (path) {
    case loginPath:
      inLoginPage(driver);
      break;
    case itemPath:
      handleClickAddItem(driver);
      break;
    case cardPath:
      handleClickGotoCard(driver);
    default:
      judgePath(driver);
  }
};

const inLoginPage = (driver) => {
  const loginIntevel = setInterval(async () => {
    const currentUrl = await driver.getCurrentUrl();

    if (currentUrl.includes(loginPath)) {
      loginStatus.enterLoginPage = true;
    } else if (loginStatus.enterLoginPage) {
      loginStatus.afterLogin = true;
    }

    if (loginStatus.afterLogin) {
      judgePath(driver);
      clearInterval(loginIntevel);
    }
  }, 1000);
};

// 尝试加入购物车
const handleClickAddItem = async (driver) => {
  let found = false;
  let pathIndex = 0;

  while (!found) {
    try {
      for (let i = pathIndex; i < buyXpath.length; i++) {
        const button = await driver.findElement(By.xpath(buyXpath[i]));
        await button.click();
        found = true;
        judgePath(driver);
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
};

// 按钮”去购物车结算“
const handleClickGotoCard = async (driver) => {
  // 到购物车
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(shopCarXpath)).click();
  await handleSubmitOrder(driver);
};

const handleSubmitOrder = async (driver) => {
  // 提交订单
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(orderXpath)).click();
  await handleGotoPayment(driver);
};

const handleGotoPayment = async (driver) => {
  // 准备付钱
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(submitXpath)).click();
  await handlePayment(driver);
};

const handlePayment = async (driver) => {
  // 选择支付方式之后 立即支付
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(payXpath)).click();
};
