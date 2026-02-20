# 部署到 GitHub

本地已完成 `git init` 和首次提交。按下面步骤把主页推到 GitHub 并开启 Pages。

## 1. 在 GitHub 上建仓库

1. 打开 https://github.com/new
2. **Repository name** 填：`personal-homepage`（或你喜欢的名字）
3. 选 **Public**，**不要**勾选 “Add a README” / “Add .gitignore”
4. 点 **Create repository**

## 2. 添加远程并推送

在终端进入本仓库目录，把 `YOUR_USERNAME` 换成你的 GitHub 用户名后执行：

```bash
cd /Users/lmgzsPro01/Nexis/MyLTStudio/personal-homepage

git remote add origin https://github.com/YOUR_USERNAME/personal-homepage.git
git branch -M main
git push -u origin main
```

若已用 SSH，可改为：

```bash
git remote add origin git@github.com:YOUR_USERNAME/personal-homepage.git
git push -u origin main
```

## 3. 开启 GitHub Pages

1. 仓库页 **Settings** → 左侧 **Pages**
2. **Build and deployment** 里 **Source** 选 **GitHub Actions**
3. 保存后，等 workflow “Daily build and deploy” 跑完（可到 **Actions** 里看）
4. 若 workflow 成功，Pages 会从 `site/out` 部署，访问地址为：  
   `https://YOUR_USERNAME.github.io/personal-homepage/`

（若仓库名为 `YOUR_USERNAME.github.io`，则根地址即为你的主页。）

## 4. 可选：配置密钥以每日拉数据

在仓库 **Settings** → **Secrets and variables** → **Actions** 里添加：

- `YOUTUBE_API_KEY`：YouTube Data API v3
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`：需要 Reddit 数据时再配

未配置也能部署，首屏会使用自带的 sample 数据。
