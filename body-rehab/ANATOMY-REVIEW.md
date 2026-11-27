# 肌肉內容核對紀錄 · 2026-11-26

本頁保留第一輪核對範圍；2026-11-27 已續核對 424 個側別模型的附著區域與 28 個傷害情境，見 [ATTACHMENT-INJURY-REVIEW.md](ATTACHMENT-INJURY-REVIEW.md) 與 `evidence-review.html`。以下「尚未完成」指第一輪結束時的狀態。

核對對象是地圖中的 **219 個肌肉、肌頭／分部或合併肌群名稱**，左右側共用的文字事實合併核對；不是人體全部肌肉的清單。每條核對位置／層次、起點、止點、神經支配及作用，並修正分部誤套整肌作用的情形。65 個條目的 123 個附著／神經／作用欄位有修正、補充或限定，包含新補入條目的資料，不代表 123 個獨立解剖錯誤。

可開啟 `anatomy-review.html` 搜尋每條來源與修訂前後，或讀取 `assets/body-model/anatomy-review-log.json`。主地圖的每條資料也有欄位來源及該條核對紀錄連結。

## 文獻與判讀方法

先閱讀原有 217 個條目的有效分部資料，再對照 [Loyola LUMEN Master Muscle List](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/region.htm)、[University of Washington Muscle Atlas](https://www.rad.washington.edu/muscle-atlas) 與 TTUHSC 區域表；對神經根差異、變異或功能證據另查原始屍體研究及解剖專章。共取得 304 份大學教學頁，實際引用頁的網址與 SHA-256 收錄在核對紀錄中。沒有把大學網站的每個儲存格都視為正確：例如 UW 閉孔外肌的神經欄誤植其他肌肉資料，已排除作為該欄依據。

各欄引用列出對照來源，來源的神經根範圍或分部慣例若不同，以文字明示變異。沒有從模型外觀推算神經、功能或人體固定形態。來源教學表與個別研究各有範圍，不能將屍體研究中的變異當成每個人的固定構造。

## 具體修正例子

| 條目 | 修正重點 | 依據 |
|---|---|---|
| 甲狀舌骨肌 | C1 纖維隨舌下神經同行，不能寫成頸神經袢支配 | [LUMEN](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/thyh.htm) |
| 胸骨甲狀肌 | 作用是下降喉部，不是直接下降舌骨 | [LUMEN](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/sthr.htm) |
| 上後鋸肌 | 附著第 2–5 肋、T2–T5 肋間神經；呼吸功能以傳統描述與功能證據分開表達 | [LUMEN](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/sps.htm)、[功能研究](https://pubmed.ncbi.nlm.nih.gov/11424195/) |
| 股外側肌 | 髕支持帶為外側，區分股四頭肌腱—髕骨—髕韌帶的連接 | [UW](https://www.rad.washington.edu/muscle-atlas/vastus-lateralis) |
| 拇趾長屈肌 | 拇趾只有一個趾間關節，不能套用其他趾的 PIP／DIP | 各條 LUMEN／UW 引用 |
| 三角肌、胸大肌、肱三頭肌 | 依所選肌頭顯示功能，避免各頭都寫成整肌的全部作用 | 各條 LUMEN／UW 引用 |
| 肋提肌長部／短部 | 長部越過一肋、連到下二肋，與短部相鄰一肋區分 | 各條區域表及解剖圖譜引用 |
| 眼輪匝肌 | 外周眶部與內側瞼部的原始模型標籤對調，修正概念而保留幾何 | [Gray’s Anatomy for Students](https://elsevier-elibrary.com/contents/fullcontent/58090/epubcontent_v2/OEBPS/B9780443069529000138A.htm)、[2024 屍體研究](https://pubmed.ncbi.nlm.nih.gov/39621066/) |

## 模型位置與來源修正

以程式產生 10 張逐肌正反面及骨骼對照表，再逐張檢視 219 個名稱的粗略身體區域、前後側、肌頭分部與鄰近骨骼關係。這個檢視發現上述眼輪匝肌概念標籤問題；沒有為了配合文字任意移動模型頂點。模型中細小或被骨骼遮擋的附著面，不能據這些投影宣稱已完成驗證。

原匯入流程只接受 FMA 物件，遺漏 BP44–BP47 尺側伸腕肌的雙側肌頭，現已補入其來源原座標及 2 個名稱條目。另補入同版胸骨柄、胸骨體、劍突及雙側肋軟骨，保留胸部骨性背景。BP 編號與一般未分側 FMA 概念分列。眼輪匝肌修正則保留 `mesh`、`sourceName`、`sourceFma`、原始 OBJ hash 與座標；來源異常及修正對照皆可追查。

## 復健與運動功能

主地圖恢復 24 個復健動作、9 種運動與 66 個相關構造的語意連動。點擊構造名稱連到此次核對的肌肉資料；模型缺少的 ACL、MCL、足底筋膜等不畫假定位。動作顏色是概略參與分類，並非每個動作的肌電量測。傷害情境保留為可能相關負荷，修正幾項過度單一因果及固定減傷百分比的敘述；**運動傷害與非肌肉構造尚未完成本次同範圍的逐條文獻審核**。相關訓練教材是補充閱讀，不表示每個動作變式均已由該來源驗證。

## 驗證界線

程式回歸檢查用來防止來源、欄位、側別、分部與連動在修改後遺失；逐頂點／索引比對只證明打包過程保留官方模型。這些測試不能證明醫學正確。本次已完成上述範圍的文獻與粗略位置核對，尚未經解剖學教師逐項審訂，也未完成全部 3D 附著面的專業驗證，不應標示為醫學院教材認證。

此次工程驗證通過 `check-body-map.mjs`、`check-content-review.mjs`、`check-anatomy.mjs` 與 `check-thigh-source.mjs`。瀏覽器實際 WebGL 的 13 項渲染／點選檢查通過；另實際操作復健橋式→臀大肌、跳躍落地情境→ACL 無模型說明、甲狀舌骨肌修正資料、眼輪匝肌來源識別及核對頁修訂前後展開。這些結果與前述解剖文獻審查分開記錄。
