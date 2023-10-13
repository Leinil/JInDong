有没有什么办法能 直接用import啊 比如说在main.js 中直接用import { Input } from '@inquirer/prompts'; 想用babel之类的东西转一下
    Deal: package.json 中type:"module"

需求:
    part1: 自动化购买
    part2:抢购

逻辑:
    前置需要： userName, password, secretKey, paymentPassword, jdItemUrl
    1.userName输入之后可以写在program中
    2.加密之后的密码也可以写在program中，
        2.1: 每次执行的时候需要secretKey
        2.2: 可以选择替换各种密码
    3.jdItemUrl 每次都是必须的

## input
interface {
    secretKey:string,
    jdItemUrl:string,

    userName?:string,
    password?:string,
    paymentPassword?:string
}

已经注入过密码？
    YES/No

    YES -> input:secretKey -> input:jdItemUrl -> run
    NO ->passwords ->.... ->run

## 10.13
    