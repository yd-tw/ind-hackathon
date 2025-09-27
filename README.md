<div align="center">
  <a href="https://ind-hackathon.ydtw.net/">
    <picture>
      <img alt="logo" src="https://ind-hackathon.ydtw.net/logo.png" height="64">
    </picture>
  </a>
  <h1>海洋大學 IND 黑客松 - 校園儀表板</h1>
  <a href="https://github.com/yd-tw/ind-hackathon/blob/main/README.md"><img alt="version" src="https://img.shields.io/badge/黑客松競賽-第一名-green"></a>
  <a href="https://github.com/yd-tw/ind-hackathon/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/badge/license-MIT-green"></a>
  <a href="https://github.com/yd-tw/ind-hackathon/blob/main/package.json"><img alt="version" src="https://img.shields.io/badge/Next.js-15-blue"></a>
  <a href="https://github.com/yd-tw/ind-hackathon/blob/main/package.json"><img alt="version" src="https://img.shields.io/badge/React-19-blue"></a>
  <a href="https://github.com/yd-tw/ind-hackathon/blob/main/package.json"><img alt="version" src="https://img.shields.io/badge/TailwindCSS-4-blue"></a>
</div>

本專案為 2025 年海大網路發展學會校園黑客松競賽作品，採用 MIT 開源。系統提供豐富多樣的面板供使用者選擇，包含公車動態、天氣預報等，並通過 Tronclass API 獲取即時的代辦事項和課程列表，你也可以自訂義課表獲通過腳本來產生課程配置，達到融合課程、社團、補強活動為一體的體驗。

## 系統架構

網站使用 Next.js 搭配 Firebase 作為資料庫。課程功能使用 Tronclass API 獲取資料，我們不會保存你的帳號密碼到資料庫中，但為了克服瀏覽器限制伺服器將代理您執行請求。系統完全開源，也就意味著你可以自己部屬一個。

- React
- Next.js
- Firbase

## 文件網站

自動解析課表 PDF 檔案的腳本與範例測試資料，我們使用「程式貓文件中心」提供。

> https://docs.codecat.tw/ntou

## 自行部屬

1. 使用任何系統部屬這個專案(推薦使用 Vercel)
2. 至 Firebase 創建資料庫
3. 配置環境變數
```
NEXT_PUBLIC_FIREBASE_API_KEY = 
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 
NEXT_PUBLIC_FIREBASE_PROJECT_ID = 
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 
NEXT_PUBLIC_FIREBASE_APP_ID = 
```

## 支持與貢獻

如果喜歡這個專案可以給我一顆星星，我會很開心的！或者也可以追縱我的 Github 帳號

作為黑客松項目，專案不免有些許問題。歡迎提交 PR 協助修復或改進，若有實際在使用本服務並希望增加功能也歡迎聯繫我
