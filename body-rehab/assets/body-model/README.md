# BodyParts3D 全身模型衍生資產

來源：官方 [BodyParts3D 3.0，2011-09-15](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/) 的 `BodyParts3D_3.0_obj_99.zip`，SHA-256 `2125f6d761b14ead4ee64f71713f56f3f0f29982693ff20aac63474470cb92f4`。

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.

本目錄幾何及二進位衍生資產依原始版本的 [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en) 散布。來源各肌肉的 FMA、原始名稱、OBJ hash、邊界、頂點及索引偏移皆見 `manifest.json`。原始座標無平移、縮放、擬合或鏡射；除兩個白名單錯側碎片清理外，保留三角形的拓撲不變；`geometryCorrection` 保存完整原索引對照。轉 float32 的最大座標差異見 `format.maxCoordinateRounding`。顯示法線重新計算並以 int8 儲存，只用於光影，不能據此推論肌束方向。

四個 `.gzpart` 必須按 manifest 順序連接，然後 gzip 解壓；不是四個各自獨立的 gzip 檔。各片及完整串流均附 SHA-256。來源原本已是 OBJ 99% 簡化版，本專案未作額外視覺簡化；已移除經分區交叉覆核的 18 張錯側退化面。

`knowledge.json` 是可追溯的解剖事實整理，引用各條目所列醫學院教學表、研究及補充資料，不以模型形狀推測神經或作用。只整理附著、動作與神經等事實，不收錄來源表的教學備註、圖片或血管欄；手工整理的中文摘要與分部資料保留在原始碼。原始解剖表內容 hash、精確條目名稱與引用一併記錄。

650 個物件（424 個肌肉、203 個骨骼、23 個解剖背景），共 219 個肌肉／分部／肌群名稱，並不代表完整人體構造；來源含合併肌群、未分側模型與單一男性參考的限制。採用同版本全身骨骼與肌肉，沒有把 3.0、4.0 的不同幾何混合。模型與解剖文字尚未經解剖學教師逐項認證。

此次補入 BP44–BP47 的尺側伸腕肌雙側肌頭、胸骨三部分與雙側肋軟骨。BP 物件保留其來源編號；另附未分側 FMA 概念，不虛構側別 FMA。眼輪匝肌來源物件 FMA46782/46783（內側薄環）與 FMA46785/46786（外周較大環）的眶部／瞼部標籤重新對應：`sourceFma`、`sourceName` 與 `mesh` 保留原始資料，`fma`、`name` 為修正概念，`conceptCorrection` 記錄依據。這四個眼輪匝肌物件的幾何與三角形不變。

`anatomy-review-log.json` 記錄各名稱的文獻核對、修正前後、欄位引用與實際取得之來源 hash。`movement.json` 保留原 24 個動作、9 種運動及 66 個構造的互動資料；動作參與顏色與負荷情境不是肌電比例、個別處方或診斷。內容核對與程式回歸檢查分開說明，詳見專案根目錄 `ANATOMY-REVIEW.md`。

2026-11-27 再補入 FMA55099 甲狀軟骨及 FMA258850／FMA264840 舌骨旁中間腱，全部保留 3.0 原座標。`attachment-review.json` 記錄 424 個側別物件的三方向區域／連接核對，來源未分割的足印與軟組織逐條註記。`injury-review-log.json` 記錄 28 個傷害情境的前後修訂與每條來源。`evidence-source-versions.json` 保存 15 個新增研究的 NCBI 書目及摘要取得批次 hash；摘要全文只存私有暫存。

附著背景再補入雙側長蹠韌帶 FMA44249／FMA44250，供足底方肌與小趾對蹠肌核對；它與足底筋膜不同，不用來替代缺少的足底筋膜物件。提肛肌腱弓原已載入，本輪修正其附著核對背景對應。

本輪分區調查與實際修正公開於 `regional-review.json`。右翼內肌 FMA49012 刪除原始 faces 1480–1487（24 點），左腰方肌 FMA22349 刪除 faces 0–9（30 點）；保留頂點位置不變且有原索引對照。補回白線 FMA11336、骨間膜 FMA23707/23708/35192/35193 及直腸 FMA14544。FMA16202 原始名稱仍記錄為 sacrum，顯示與選取更正為薦骨及尾骨合併表面。
