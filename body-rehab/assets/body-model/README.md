# BodyParts3D 全身模型衍生資產

來源：官方 [BodyParts3D 3.0，2011-09-15](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/) 的 `BodyParts3D_3.0_obj_99.zip`，SHA-256 `2125f6d761b14ead4ee64f71713f56f3f0f29982693ff20aac63474470cb92f4`。

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.

本目錄幾何及二進位衍生資產依原始版本的 [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en) 散布。來源各肌肉的 FMA、原始名稱、OBJ hash、邊界、頂點及索引偏移皆見 `manifest.json`。原始座標無平移、縮放、擬合或鏡射；三角形拓撲不變。轉 float32 的最大座標差異見 `format.maxCoordinateRounding`。顯示法線重新計算並以 int8 儲存，只用於光影，不能據此推論肌束方向。

四個 `.gzpart` 必須按 manifest 順序連接，然後 gzip 解壓；不是四個各自獨立的 gzip 檔。各片及完整串流均附 SHA-256。來源原本已是 OBJ 99% 簡化版，本專案未再減面。

`knowledge.json` 是可追溯的解剖事實整理，引用各條目所列醫學院教學表、研究及補充資料，不以模型形狀推測神經或作用。只整理附著、動作與神經等事實，不收錄來源表的教學備註、圖片或血管欄；手工整理的中文摘要與分部資料保留在原始碼。原始解剖表內容 hash、精確條目名稱與引用一併記錄。

630 個物件並不代表完整人體構造；來源含合併肌群、未分側模型與單一男性參考的限制。採用同版本全身骨骼與肌肉，沒有把 3.0、4.0 的不同幾何混合。模型與解剖文字尚未經解剖學教師逐項認證。
