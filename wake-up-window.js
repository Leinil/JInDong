import { Builder, By } from 'selenium-webdriver';

const targetUrl = 'https://item.jd.com/10070625520377.html';
const itemRefreshTiming = 1000;
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
const inSubmitPage = 'cart.jd.com/cart_index';
const pathSet = [loginPage, itemInfoPage, addToCartPage, inSubmitPage];

const loginStatus = {
  enterLoginPage: false,
  afterLogin: false,
};

const judgePage = async (driver,hasConfirmedPage) => {
  let page

  if(hasConfirmedPage){
    page=hasConfirmedPage
  }else{
    const currentUrl = await driver.getCurrentUrl();
    page= pathSet.find((path) => currentUrl.includes(path));
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
    case inSubmitPage:
      inSubmitOrderPage(driver);
      break;
    default:
      judgePage(driver);
  }
};

const inLoginPage = (driver) => {
  const loginInterval = setInterval(async () => {
    const currentUrl = await driver.getCurrentUrl();

    if (currentUrl.includes(loginPage)) {
      loginStatus.enterLoginPage = true;
    } else if (loginStatus.enterLoginPage) {
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
        await driver.manage().setTimeouts({ implicit: itemRefreshTiming });
        judgePage(driver)
      }
    }
  }
};

// 按钮”去购物车结算“
const inAddToCartPage = async (driver) => {
  // 到购物车
  try{
    await driver.findElement(By.xpath(goToCartXpath)).click();
  }catch{
    pagePolling(driver,addToCartPage)
  }
};

// 按钮“去结算”
const inSubmitOrderPage = async (driver) => {
  // 提交订单
  try{
    await driver.findElement(By.xpath(goToSubmitXpath)).click();
  }catch{
    pagePolling(driver,inSubmitPage)
  }
};

const handleGotoPayment = async (driver) => {
  // 准备付钱
  try{
    await driver.findElement(By.xpath(submitXpath)).click();
  }catch{
    // pagePolling(driver,inSubmitPage)
  }
};

const handlePayment = async (driver) => {
  // 选择支付方式之后 立即支付
  await driver.manage().setTimeouts({ implicit: gapTiming });
  await driver.findElement(By.xpath(payXpath)).click();
};

const pagePolling=async (driver,expected)=>{
  const pollingInterval=setInterval(()=>{
    const currentUrl = await driver.getCurrentUrl();
    const page = pathSet.find((path) => currentUrl.includes(path));
    if(page===expected){
      clearInterval(pollingInterval);
      judgePage(driver,page)
    }
  },pagePollingTiming)
}

(async function main() {
  const driver = await new Builder().forBrowser('chrome').build();
  await driver.get(targetUrl);
  judgePage(driver);
})();