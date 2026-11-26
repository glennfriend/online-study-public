# 人體與復健：全身肌肉互動地圖

入口：`2026-11-26-body-map.html`。純 HTML/CSS/JavaScript，不需要安裝套件；需以 HTTP/HTTPS 提供，不能直接用 file:// 開啟。

## 全身互動地圖

- 同時顯示正反面，也可切為單一視角。630 個來源模型含 420 個有側別肌肉／分部／肌群物件、200 個骨骼及 10 個結締組織背景；共 217 種肌肉、分部或肌群名稱，不能視為人體肌肉總數。
- 表層／深層顯露、逐條隱藏與復原、單獨定位、骨骼背景開關。深層預設只是一組明列的移除清單，不假裝全身具有同一剝離平面。
- 左側支援按鈕、滾輪、雙指縮放、拖曳、放大所選與回到全身；鍵盤 `+`、`-`、方向鍵、`0` 也可操作。
- 右側局部以來源幾何在獨立相機與離屏 framebuffer 重新渲染，至少 600 像素寬；不是放大全身截圖。局部也可縮放。兩處點選都以相同可見物件、相機和深度緩衝判定，沒有手繪命中區域。
- 中文／英文／FMA 搜尋、側別與部位清單。全部模型肌肉都有起點、止點、神經、作用與引用；分部另有專屬附著與神經／作用欄，肌群合併情形明示。部分欄位保留英文解剖事實，沒有以自動生成文字填空。

全身採用官方 **BodyParts3D 3.0、OBJ 99%** 的一致座標與拓撲。已接受的大腿試作使用 4.0；4.0 缺少腹直肌、闊背肌等構造，而且兩版骨骼位置不同，因此全身版沒有把兩版肌肉混貼。原始版本本身已是簡化模型，不代表 MRI 的原始解析度，亦不呈現真實肌纖維紋理。模型仍為單一成年男性參考，並不含全部人體構造與變異。

`body-renderer.js` 處理幾何與 picking；`body-map.js` 處理操作；`muscle-catalogue.mjs` 是明確的名稱對照；`part-anatomy.mjs` 是分部事實；`assets/body-model/knowledge.json` 含 217 個條目與逐條來源。模型分四片供應，合計約 53 MB gzip；只打包原始座標與索引，位置轉 float32 的最大差異小於 0.00006 個來源座標單位，沒有額外減面或調整解剖位置。

## 本機預覽與檢查

```powershell
node scripts/preview.mjs
node scripts/check-body-map.mjs
node scripts/check-anatomy.mjs
node scripts/check-thigh-source.mjs
```

預覽網址：<http://127.0.0.1:4173>。部署時保留本目錄的腳本、CSS、`sw.js` 及所有 assets。資料讀取與 WebGL 2 需現代瀏覽器；無 WebGL 時仍可用肌肉清單閱讀資料。獨立瀏覽器 GPU 檢查頁為 `/scripts/render-check.html`，檢查前後面、左右、深度遮擋、隱藏後不可點選、縮放／平移與局部清晰度獨立性。

`offline-cache.js` 註冊本資料夾 scope 的 service worker，不改父站 worker。頁面與資料先快取，模型在完整載入後快取；頁腳確認可離線使用後，才代表本機已有模型。外部引用網站不在離線範圍。HTTPS 或 localhost 才有 service worker／Cache API；一般 HTTP 仍可線上看模型。

重新取得與建置（需要網路／暫存約 200 MB，原始 ZIP 不進 git）：

```powershell
node scripts/fetch-body-sources.mjs
node scripts/build-body-model.mjs
node scripts/build-muscle-knowledge.mjs
```

原始 archive、名稱對照與解剖表版本以 SHA-256 鎖定。來源若更改必須先重新審查。`check-body-map.mjs` 逐頂點、逐索引與官方 OBJ 比對，並驗證每個肌肉／分部的資料、引用、側別及容易漏列的主要肌肉；程式檢查不能取代解剖教師審校。

## 動作參考與先前試作

`movement-reference.html` 保留原有 24 個動作、9 種運動與補充教材圖譜。它的舊 SVG 是概略導覽，不是全身主地圖的幾何來源。`thigh-source-preview.html` 保留已接受的 4.0 大腿來源模型試作，幾何與圖像均另有出處及授權。

### 補充教材圖像的界線

- `anatomy-data.js` 是 42 個肌肉／肌群項目的解剖文字來源：位置、起止點、主要運動神經、作用、肌束描述、成員及逐項參考文獻。神經根、血管與全部變異尚未完整收錄。
- 教材圖為 OpenStax 歷史版本、由 Wikimedia Commons 保存的插圖。保留英文標籤；部分使用 Wikimedia 等比例縮圖，沒有生成或重繪解剖構造。全身前、後視圖為 CFCF 版本，CC BY-SA 4.0；其餘七張為 OpenStax，CC BY 4.0。各圖依自己的授權散布，詳見頁面署名及 `assets/anatomy/manifest.json`。
- 原 SVG 僅為可點擊的部位定位圖，不可用來測量附著點、肌肉邊界、角度、比例或推論完整剝離層次。深部定位逐一顯示所選構造相對骨骼的投影。
- 圖譜上的切除、剝離側與觀察方向須依標籤判讀。圖譜不提供逐肌自動高亮；搜尋成員名稱會找到所屬肌群，不代表該成員已在 SVG 上獨立分割。
- 大腿原圖的膝上肌腱括註含容易混淆的 “patellar tendon”；頁面附註區分股四頭肌腱與膝下的髕韌帶／髕腱，並指出股中間肌未在該圖單獨展示。
- 復健動作的肌肉顏色是概略參與分類，不是肌電量測或個人處方。原有骨骼與運動傷害內容仍屬概略衛教，尚未完成相同範圍的逐條文獻審核。

## 核對與維護

公開資料核對日期：2026-11-26。來源包括 UAMS 醫學院肌肉表、TTUHSC El Paso Medical Gross Anatomy、NCBI Bookshelf 的相關解剖專章；逐項連結在 `ANATOMY_SOURCES` 與各卡片的 `sources` 中。肌肉組織的外觀紋理、宏觀肌束排列與顯微鏡下肌節橫紋不能互換。

資料目前未經解剖學教師逐項審訂，尚不應宣稱完成醫學院課程教材認證。後續內容審查應逐項核對名稱、骨性標誌、起止點、神經、層次、關節位置與變異；不能以程式測試通過代替專業內容審查。

`check-anatomy.mjs` 檢查 JavaScript 語法、肌肉資料覆蓋、運動引用、來源鍵、幾個重要例外的資料完整性，以及九張圖的授權對應及 SHA-256；這些檢查不能證明醫學內容全部正確。

重新取得圖檔可執行 `node scripts/fetch-anatomy-atlas.mjs`（需網路）。程式核對逐圖授權、略過已校驗的檔案、記錄來源與縮放情況；若服務回傳 429，依 Retry-After 等待後再執行。不要直接用現行 OpenStax 網站圖片替換，現行版本的授權可能不同。
