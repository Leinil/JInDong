import ora from 'ora';

const spinner = ora({
  text: "链接网络中"
}).start(); // 开始状态 => 加载状态

setTimeout(() => {
  spinner.color = "yellow";
  spinner.text = "网速有点慢";
}, 1000); // 还是 加载状态, 更新文案和颜色

setTimeout(() => {
  spinner.succeed("下载成功"); // 加载状态 => 成功状态
}, 2000);