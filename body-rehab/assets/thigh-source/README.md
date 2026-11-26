# 大腿來源模型試作

這組全身前後視圖、大腿放大區及點選資料均來自同一組 BodyParts3D 原始幾何。正式頁與舊試作頁沒有被此版本取代；入口是專案根目錄的 `thigh-source-preview.html`。

來源：[BodyParts3D 下載頁](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)。4.0 幾何版本（來源更新日 2013-06-19），使用供應者提供的 `isa_BP3D_4.0_obj_99.zip`；官方將此資料稱為 99% polygon-reduction 版本，不能將它宣稱為原始影像精度。

**BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International**

[來源授權頁](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)於 2025-02-27 更新為 CC BY 4.0。本組衍生模型視圖、識別圖及來源清單依此授權提供，改動已記載於 `manifest.json`。模型為成年男性參考；來源明確提醒可能有解剖、重建與概念指派錯誤。本試作不代表已經解剖教師審訂。

## 如何建立

```powershell
node scripts/fetch-bp3d.mjs
node scripts/render-thigh-source.mjs
node scripts/check-thigh-source.mjs
node scripts/preview.mjs
```

在 <http://127.0.0.1:4173/thigh-source-preview.html> 開啟。下載快取放在被 Git 忽略的 `.anatomy-cache/bp3d/`；正常預覽只需要本目錄的 PNG 與 `model-data.js`，不需要重新下載 143 MB 的來源壓縮檔。

## 幾何與點選

- 606 個來源骨骼、肌肉及肌肉分部／頭部模型維持同一組座標；沒有個別移動、變形或重新描邊。總計 2,817,384 個來源三角形。
- 前視相機沿來源負 Y 方向觀察；正 Z 朝上。人體右側在來源負 X，前視畫面的左邊是人體右側。後視翻轉畫面水平方向。
- 顏色、光影、構造邊界描深及選取色是顯示處理；光影不能用來教授肌纖維走向。未加入生成式紋理。
- 每個像素的可見表面與物件識別碼由同一次深度比較決定。`*-ids.png` 的 R、G 通道分別儲存低、高位元組，識別碼在 `manifest.json` 對應回模型 ID 及 FMA ID。
- 深面視圖只省略雙側股直肌（FJ1433、FJ1433M），沒有移動股中間肌。縫匠肌等周圍肌肉保留，仍會遮擋其下方構造。
- 大腿放大圖裁切自目前的同一張前視圖，維持等比縮放；點選時逆轉同一個裁切與縮放換算。沒有另外手繪的點選多邊形。
- 股四頭肌的八個左右側構造有明確來源 ID；其餘全身構造作為背景定位，這次未擴展成完整教學互動。

`check-thigh-source.mjs` 驗證四組視圖／識別圖每個像素的外形一致、八個大腿構造的左右側、隱藏肌肉不可被選中、深面顯露增加及檔案校驗。程式測試不能取代解剖學內容審查。
