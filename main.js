import inquirer from 'inquirer';
import { readFileSync, writeFileSync } from 'fs';

import { encrypt } from './crypto.js';

const userInfoStr = readFileSync('./user.json', 'utf-8') || '{}';
const userInfo = JSON.parse(userInfoStr);
const passValidation =
  userInfo.userName && userInfo.loginPassword && userInfo.payPassword;

const shoppingMethod = [
  {
    type: 'list',
    name: 'shoppingMethod',
    message: '你想用什么方式完成这次购买',
    choices: [
      {
        key: 'auto',
        name: '全自动 --->>> 需要提供密码,系统会加密不会直接存储明文',
        value: 'auto',
      },
      {
        key: 'half-auto',
        name:
          '半自动 --->>> 只帮助抢购不涉及任何密码操作，PS：如果之前提供过密码，选择之后将清除',
        value: 'half-auto',
      },
    ],
  },
];

const setUserInfo = [
  {
    type: 'confirm',
    name: 'reset',
    message: '重录账户信息？',
    default: false,
    when: (answer) => answer.shoppingMethod === 'auto' && passValidation,
  },
  {
    type: 'input',
    name: 'userName',
    message: '输入你的京东账号',
    when: (answer) =>
      answer.shoppingMethod === 'auto' && (answer.reset || !userInfo.userName),
    validate: (name) => !!name,
  },
  {
    type: 'password',
    name: 'loginPassword',
    message: '输入京东登陆密码',
    mask: '*',
    when: (answer) =>
      answer.shoppingMethod === 'auto' &&
      (answer.reset || !userInfo.loginPassword),
  },
  {
    type: 'password',
    name: 'payPassword',
    message: '输入付款密码',
    mask: '*',
    when: (answer) =>
      answer.shoppingMethod === 'auto' &&
      (answer.reset || !userInfo.payPassword),
  },
  {
    type: 'password',
    name: 'secretKey',
    mask: '*',
    message: '输入用于加密你所有密码的secretKey',
    when: (answer) => answer.shoppingMethod === 'auto' && !userInfo.secretKey,
  },
];

const getJDItemUrl = [
  {
    type: 'input',
    name: 'jdUrl',
    message: '输入需要抢购的商品url',
    default: userInfo.jdUrl,
    validate: (url) => !!url,
  },
];

inquirer
  .prompt([...shoppingMethod, ...setUserInfo, ...getJDItemUrl])
  .then((answers) => {
    const { shoppingMethod, ...rest } = { ...answers, ...userInfo };
    const { secretKey, loginPassword, payPassword, ...otherInfo } = rest;
    try {
      const data =
        shoppingMethod === 'auto'
          ? {
              ...rest,
              loginPassword: encrypt(loginPassword, secretKey),
              payPassword: encrypt(payPassword, secretKey),
            }
          : otherInfo;

      writeFileSync('./user.json', JSON.stringify(data), 'utf-8');
    } catch {
      console.log(' ========= Opps!! 存储用户数据出现问题 ======= ');
    }
  });
