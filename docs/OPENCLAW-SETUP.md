# OpenClaw 每日定时设置（路径 B）

在 OpenClaw 里添加定时任务，每天自动跑「热门分析」或「热门分析 + 推送」。

---

## 方式一：只跑分析（不自动推送）

每天到点执行分析，结果写在本地 `data/trending-videos/YYYY-MM-DD.json`。需要自己再 `git add`、`commit`、`push` 才会更新网站。

**在 OpenClaw 里添加：**

- **类型**：定时任务（或快捷指令）
- **执行命令**：
  ```bash
  /bin/bash /Users/lmgzsPro01/Nexis/MyLTStudio/personal-homepage/scripts/run-daily-trending-analysis.sh
  ```
- **时间**：每天固定时间（如 9:00）

把路径换成你本机 `personal-homepage` 的实际路径。

---

## 方式二：分析 + 自动推送（推荐）

每天到点执行分析，并自动把当日 data 提交、推送到 GitHub。push 后会自动触发 **Deploy only**，网站会更新。

**前提**：本机已能执行 `git push origin main`（SSH 或 token 已配置好）。

**在 OpenClaw 里添加：**

- **类型**：定时任务（或快捷指令）
- **执行命令**：
  ```bash
  /bin/bash /Users/lmgzsPro01/Nexis/MyLTStudio/personal-homepage/scripts/run-daily-trending-analysis-and-push.sh
  ```
- **时间**：每天固定时间（如 9:00）

同样把路径换成你本机 `personal-homepage` 的实际路径。

---

## 如何找到「定时任务」或「快捷指令」

不同版本 OpenClaw 入口可能不同，一般在：

- 设置 / 技能 / 定时任务
- 或：新建快捷指令 → 选择「运行脚本」/「执行命令」→ 填上面的命令 → 再设「每天 9:00」等

设好后，到点会自动执行对应脚本。
