// Literature content review, 2026-11-26. These are anatomical localizations,
// not a claim that the source mesh's entire attachment surface is validated.
const positions=`
diaphragm|肩胸背|胸、腹腔之間的穹隆狀肌性隔膜，肌纖維向中央腱匯集。
external abdominal oblique|腹腰與骨盆|腹前外側壁最淺的扁肌；腹直肌位於其腱膜形成的鞘內。
sternohyoid|頭頸|頸前舌骨下肌淺層，胸骨柄與舌骨之間。
omohyoid|頭頸|頸外側至頸前的舌骨下肌，兩肌腹以中間腱相連。
sternothyroid|頭頸|胸骨舌骨肌深面，胸骨柄至甲狀軟骨之間。
thyrohyoid|頭頸|甲狀軟骨與舌骨之間，屬舌骨下肌群。
latissimus dorsi|肩胸背|下背至腋窩後襞的廣大淺層肌；上內側部分被斜方肌覆蓋。
pectoralis minor|肩胸背|胸大肌深面，第三至第五肋骨向上外側連至喙突。
rectus abdominis|腹腰與骨盆|腹前壁中線兩旁、腹直肌鞘內，從恥骨至胸廓下緣。
rhomboideus major|肩胸背|斜方肌深面，胸椎棘突至肩胛棘根部以下的肩胛骨內側緣。
rhomboideus minor|肩胸背|大菱形肌上方、斜方肌深面，連至肩胛棘根部的內側緣。
posterior scalene|頭頸|頸外側深層，位於中斜角肌後方並連至第二肋骨。
middle scalene|頭頸|頸外側深層，前斜角肌後方；臂叢及鎖骨下動脈經兩肌之間。
anterior scalene|頭頸|頸外側深層，頸椎橫突前結節至第一肋骨斜角肌結節。
serratus anterior|肩胸背|胸廓外側，肌束經肩胛骨與胸壁之間至肩胛骨內側緣肋面。
serratus posterior superior|肩胸背|菱形肌深面、固有背肌淺面，上胸椎至第二至第五肋。
serratus posterior inferior|肩胸背|闊背肌深面、固有背肌淺面，胸腰交界至第九至第十二肋。
sternocleidomastoid|頭頸|頸前外側淺層，胸骨柄與鎖骨內側至乳突。
subclavius|肩胸背|鎖骨下方與第一肋骨之間，位於胸大肌深面。
subscapularis|肩胸背|肩胛骨肋面，位於肩胛骨與胸廓之間；肌腱位於肩關節前方。
internal abdominal oblique|腹腰與骨盆|腹前外側壁中間肌層，在腹外斜肌深面、腹橫肌淺面。
anal sphincter, external|腹腰與骨盆|會陰肛門三角內、環繞肛管的隨意骨骼肌，與肛門內括約肌不同。
iliacus|腹腰與骨盆|髂窩內，與腰大肌共同經腹股溝韌帶深面至小轉子。
obturator internus|髖臀與大腿|起於骨盆內側壁，肌腱繞坐骨小切跡、經坐骨小孔轉至臀部深層。
obturator externus|髖臀與大腿|閉孔膜外面、大腿近端深層，肌腱經股骨頸後方至轉子窩。
gluteus maximus|髖臀與大腿|臀部主要淺層肌，覆蓋臀中肌後部與深層外旋肌。
gluteus medius|髖臀與大腿|臀大肌深面及其上外側，髂骨外面至大轉子外側與上面。
gluteus minimus|髖臀與大腿|臀中肌深面，髂骨外面至大轉子前面，鄰近髖關節囊。
superior gemellus|髖臀與大腿|臀部深層，在閉孔內肌腱上側，與其共用遠端附著。
inferior gemellus|髖臀與大腿|臀部深層，在閉孔內肌腱下側、股方肌上方。
quadratus femoris|髖臀與大腿|臀大肌深面，坐骨結節至股骨轉子間嵴附近，位於下孖肌下方。
piriformis|髖臀與大腿|薦骨前面起，經坐骨大孔至大轉子上緣，是臀部深層肌。
psoas major|腹腰與骨盆|後腹壁、腰椎兩側；經骨盆前緣與腹股溝韌帶深面至小轉子。
transversus abdominis|腹腰與骨盆|腹前外側壁最深的扁肌，位於腹內斜肌深面。
pyramidalis|腹腰與骨盆|下腹前壁，腹直肌前方、腹直肌鞘內；可先天缺如。
quadratus lumborum|腹腰與骨盆|後腹壁深層，位於豎脊肌前方、腰大肌外側，連接髂嵴與第十二肋。
sartorius|髖臀與大腿|大腿前側淺層，由髂前上棘斜行至膝內側，跨髖與膝。
semitendinosus|髖臀與大腿|大腿後側內側淺層，遠端長腱繞膝內側至鵝足。
tensor fasciae latae|髖臀與大腿|髖部前外側、筋膜闊鞘內，遠端匯入髂脛束。
semimembranosus|髖臀與大腿|大腿後側內側，主要位於半腱肌深面，遠端至脛骨內側髁後方。
pectineus|髖臀與大腿|大腿近端前內側、股三角底部，位於髂腰肌內側。
adductor brevis|髖臀與大腿|大腿內側近端，長收肌與恥骨肌深面、大收肌前方。
adductor longus|髖臀與大腿|大腿內側淺層，構成股三角內側界。
adductor magnus|髖臀與大腿|大腿內側與後側之間的大肌，含收肌部及坐骨髁部。
tibialis anterior|小腿與足|小腿前室、脛骨外側；肌腱經踝前方到足內側。
extensor hallucis longus|小腿與足|小腿前室深部，脛前肌與趾長伸肌之間，肌腱至拇趾背側。
extensor digitorum longus|小腿與足|小腿前室外側，肌腱經踝前方分至第二至第五趾背側。
fibularis (peroneus) tertius|小腿與足|小腿前室遠端外側，經踝前方至第五蹠骨背側，並非外側室肌。
fibularis (peroneus) longus|小腿與足|小腿外側室淺層，肌腱經外踝後方、骰骨溝與足底至第一蹠骨。
fibularis (peroneus) brevis|小腿與足|小腿外側室，近端在腓骨長肌深面；經外踝後方至第五蹠骨底。
soleus|小腿與足|小腿後室淺層肌群中，位於腓腸肌深面；不跨膝。
plantaris|小腿與足|膝後外側的小肌腹，細長肌腱沿腓腸肌與比目魚肌之間向下。
popliteus|小腿與足|膝後深層，股骨外側髁至脛骨比目魚肌線以上的後面。
splenius cervicis|頭頸|頸後外側、斜方肌深面，從上胸椎至上位頸椎橫突。
splenius capitis|頭頸|頸後外側、斜方肌深面，頭半棘肌淺面，向乳突與枕骨外側走行。
iliocostalis|肩胸背|豎脊肌最外側縱柱，鄰近肋角；分頸、胸、腰部。
longissimus|肩胸背|豎脊肌中間縱柱，在髂肋肌內側、棘肌外側；分頭、頸、胸部。
spinalis|肩胸背|豎脊肌最內側縱柱，緊鄰棘突；分部及肌束存在變異。
semispinalis|肩胸背|橫突棘肌群較淺部，位於夾肌及豎脊肌深面；分頭、頸、胸部。
multifidus|肩胸背|固有背肌深層、棘突兩旁；腰部較發達，肌束跨數個椎節。
rotatores|肩胸背|多裂肌深面的短橫突棘肌束，通常跨一或兩個椎節，胸段較發達。
rectus capitis posterior major|頭頸|枕下區深層，從樞椎棘突至下項線外側部，構成枕下三角內上界。
rectus capitis posterior minor|頭頸|枕下區最內側，寰椎後結節至下項線內側，部分被頭後大直肌覆蓋。
obliquus capitis superior|頭頸|枕下區外上側，從寰椎橫突至枕骨，構成枕下三角外上界。
obliquus capitis inferior|頭頸|枕下區下側，樞椎棘突至寰椎橫突；不直接連至顱骨。
levator scapulae|頭頸|頸後外側，胸鎖乳突肌及斜方肌深面，向肩胛骨上內角走行。
supraspinatus|肩胸背|肩胛棘上方的棘上窩，肌腱經肩峰下方至肱骨大結節上面。
infraspinatus|肩胸背|肩胛棘下方的棘下窩，肌腱位於肩關節後方。
teres major|肩胸背|肩胛骨下外側緣至肱骨前內側，與闊背肌構成腋窩後襞。
teres minor|肩胸背|棘下肌下方、大圓肌上方，肩胛外側緣至肩關節後方。
trapezius|肩胸背|頸後與上背淺層，從枕骨及脊柱向鎖骨、肩峰與肩胛棘展開。
deltoid|肩胸背|覆蓋肩關節前、外、後方，三分部在肱骨三角肌粗隆匯合。
pectoralis major|肩胸背|前胸壁淺層，向肱骨近端匯合並構成腋窩前襞。
abductor pollicis brevis|前臂與手|魚際隆起的淺層、拇指橈掌側。
opponens pollicis|前臂與手|魚際深層，在拇指短外展肌深面，沿第一掌骨橈側。
abductor digiti minimi (hand)|前臂與手|小魚際最尺側的淺層肌。
flexor digiti minimi brevis (hand)|前臂與手|小魚際淺層，位於小指外展肌橈側。
opponens digiti minimi|前臂與手|小魚際深層，沿第五掌骨尺側，位於淺層小魚際肌深面。
abductor hallucis|小腿與足|足底第一層最內側，沿足內側緣至拇趾。
flexor digitorum brevis|小腿與足|足底第一層中央，足底腱膜深面。
abductor digiti minimi (foot)|小腿與足|足底第一層外側，沿足外側緣至小趾。
quadratus plantae|小腿與足|足底第二層，連接跟骨與趾長屈肌腱。
flexor digiti minimi brevis (foot)|小腿與足|足底第三層外側，沿第五蹠骨至第五趾近節趾骨。
lumbricals (foot)|小腿與足|足底第二層，從趾長屈肌腱走向第二至第五趾內側。
coracobrachialis|上臂|上臂近端前內側，肱二頭肌短頭深面；肌皮神經通常穿過肌腹。
brachialis|上臂|上臂前室，位於肱二頭肌深面，跨肘而不跨肩。
biceps brachii|上臂|上臂前室淺層，兩頭近端起於肩胛骨，遠端至橈骨。
triceps brachii|上臂|上臂後室，三頭匯入肘後鷹嘴；內側頭較深，長頭跨肩。
anconeus|上臂|肘後外側小三角肌，肱骨外上髁至鷹嘴外側及近端尺骨。
plantar interosseous|小腿與足|足底第四層、第三至第五蹠骨內側；以第二趾為內收參考軸。
pronator quadratus|前臂與手|前臂遠端掌側最深層，橫跨尺骨至橈骨。
flexor carpi radialis|前臂與手|前臂前室淺層橈側，遠端肌腱至第二掌骨底為主。
palmaris longus|前臂與手|前臂前室淺層中央，長腱至掌腱膜；常有缺如變異。
flexor digitorum profundus|前臂與手|前臂前室深層，經腕隧道分至第二至第五指遠節指骨。
flexor pollicis longus|前臂與手|前臂前室深層橈側，經腕隧道至拇指遠節指骨。
brachioradialis|前臂與手|前臂外側淺層，雖由橈神經支配，主要作用是屈肘。
extensor carpi radialis longus|前臂與手|前臂後外側淺層，肌腱與橈側伸腕短肌同經第二伸肌腱室。
extensor carpi radialis brevis|前臂與手|前臂後外側，近端在橈側伸腕長肌深面，遠端至第三掌骨底。
extensor carpi ulnaris|前臂與手|前臂後室淺層尺側，肌腱經第六伸肌腱室至第五掌骨底。
extensor digitorum|前臂與手|前臂後室淺層中央，分腱至第二至第五指伸肌腱膜。
extensor digiti minimi|前臂與手|前臂後室淺層，指伸肌與尺側伸腕肌之間，肌腱經第五伸肌腱室。
supinator|前臂與手|前臂近端後外側深層，繞橈骨頸及近端橈骨，橈神經深支穿行其間。
abductor pollicis longus|前臂與手|前臂後室深層，肌腱經第一伸肌腱室至第一掌骨底。
extensor pollicis brevis|前臂與手|前臂後室深層，與拇指長外展肌同經第一伸肌腱室。
extensor pollicis longus|前臂與手|前臂後室深層，肌腱繞橈骨背側結節、經第三伸肌腱室至拇指遠節。
extensor indicis|前臂與手|前臂後室深層遠端，肌腱經第四伸肌腱室至食指伸肌腱膜。
pronator teres|前臂與手|前臂前室近端淺層，斜向橈骨中段；正中神經通常經兩頭之間。
flexor carpi ulnaris|前臂與手|前臂前室淺層尺側，尺神經於肘部經兩頭之間向前臂走行。
flexor digitorum superficialis|前臂與手|前臂前室中間層，肌腱經腕隧道，再分叉讓深指屈肌腱通過。
rectus femoris|髖臀與大腿|大腿前側中央淺層，覆蓋股中間肌；是股四頭肌中跨髖與膝者。
vastus lateralis|髖臀與大腿|大腿前外側，位於股直肌外側，止於髕骨外側及相關腱膜。
vastus medialis|髖臀與大腿|大腿前內側，遠端肌束靠近髕骨內上方。
vastus intermedius|髖臀與大腿|股骨前外面、股直肌深面，肌腱形成股四頭肌腱深層。
lumbrical (hand)|前臂與手|手掌深部，從深指屈肌腱繞至第二至第五指橈側伸肌腱膜。
palmar interosseous|前臂與手|手掌深層掌骨間，主要位於第二、第四與第五掌骨掌側。
dorsal interosseous (hand)|前臂與手|掌骨間深層，雙羽狀肌腹在手背較易辨識；以第三指為外展參考軸。
gracilis|髖臀與大腿|大腿內側最表淺的長條肌，跨髖及膝，遠端加入鵝足。
adductor minimus|髖臀與大腿|大腿近端深層、大收肌上部鄰近股方肌；獨立分界有明顯變異。
platysma|頭頸|頸部皮下薄肌，在深頸筋膜淺面，由上胸至下頜及下臉皮膚。
stylohyoid|頭頸|二腹肌後腹旁，遠端肌腱通常分叉包繞二腹肌中間腱。
pubococcygeus|腹腰與骨盆|提肛肌前內側部，從恥骨後面向會陰體、肛尾縫及尾骨方向。
puborectalis|腹腰與骨盆|提肛肌最內側的 U 形吊帶，繞過肛直腸交界後方。
iliococcygeus|腹腰與骨盆|提肛肌後外側的較薄肌板，起於提肛肌腱弓及坐骨棘。
biceps femoris|髖臀與大腿|大腿後側外側，遠端在膝外側至腓骨頭；長頭跨髖，短頭不跨髖。
gastrocnemius|小腿與足|小腿後方最淺的兩頭肌，跨膝及踝，覆蓋比目魚肌。
flexor hallucis brevis|小腿與足|足底第三層拇趾側，兩頭肌腱分別經拇趾內外側籽骨。
adductor hallucis|小腿與足|足底第三層；斜頭由蹠骨底走向拇趾，橫頭跨蹠趾關節前方。
flexor pollicis brevis|前臂與手|魚際隆起、拇指短外展肌尺側，淺深頭分界與支配有變異。
adductor pollicis|前臂與手|手掌深層、拇指與掌骨之間，位於長屈肌腱等構造深面。
longus colli|頭頸|頸椎及上胸椎椎體前方的椎前深肌，分上斜、垂直、下斜三部。
digastric|頭頸|下頜骨下方的舌骨上肌，前、後肌腹以舌骨旁中間腱相連。
longus capitis|頭頸|椎前肌群，頸長肌上外側，頸椎橫突至枕骨基底部。
rectus capitis anterior|頭頸|寰枕關節前方的短深肌，位於頭長肌深面。
rectus capitis lateralis|頭頸|寰枕關節外側的短深肌，寰椎橫突至枕骨頸靜脈突附近。
mylohyoid|頭頸|口底主要肌板，二腹肌前腹深面、頦舌骨肌淺面。
geniohyoid|頭頸|下頜舌骨肌上方、頦舌肌下方，緊鄰中線的成對舌骨上肌。
coccygeus|腹腰與骨盆|骨盆膈後部，提肛肌後方，與薦棘韌帶相鄰或融合。
frontalis|頭頸|額部皮下，帽狀腱膜與眉部皮膚之間。
occipitalis|頭頸|枕部頭皮，枕骨及乳突附近至帽狀腱膜。
temporoparietalis|頭頸|耳上方淺層，顳筋膜與帽狀腱膜相連；肌腹可很薄或缺如。
orbicularis oculi|頭頸|環繞眼眶與眼瞼的顏面表情肌，眶部、瞼部功能不同。
corrugator|頭頸|眉內側深層，在額肌與眼輪匝肌深面附近。
levator labii superioris alaque nasi|頭頸|鼻側縱走的表情肌，由上頜骨額突至鼻翼與上唇。
levator labii superioris|頭頸|眶下區至上唇的表情肌，位於提口角肌淺面。
zygomaticus major|頭頸|顴骨至口角的斜行表情肌，位於顴小肌外側。
zygomaticus minor|頭頸|顴大肌內側，顴骨至上唇的較細表情肌。
depressor labii inferioris|頭頸|下唇與下頜骨之間，降口角肌內側及深面附近。
levator anguli oris|頭頸|上頜骨犬齒窩至口角的深層表情肌，位於提上唇肌深面。
mentalis|頭頸|下頜前面正中兩側、下唇下方的短表情肌。
depressor anguli oris|頭頸|下頜骨外面至口角的三角形表情肌，降下唇肌外側。
buccinator|頭頸|頰壁深層，位於口腔黏膜外側、咬肌前方；腮腺管穿過肌腹。
risorius|頭頸|口角外側的淺薄表情肌，橫行於頰部筋膜至口角。
orbicularis oris|頭頸|環繞口裂、構成嘴唇的複合表情肌，與周圍表情肌交織。
masseter|頭頸|下頜支外側的咀嚼肌，從顴弓至下頜角及下頜支。
temporalis|頭頸|顳窩內的扇形咀嚼肌，肌腱經顴弓深面至下頜冠突。
medial pterygoid|頭頸|下頜支內側的咀嚼肌，與咬肌形成托住下頜角的肌性吊帶。
lateral pterygoid|頭頸|顳下窩深部，橫行至下頜頸及顳下頜關節盤／囊。
extensor digitorum brevis|小腿與足|足背外側、長伸肌腱深面；本地圖另列拇趾短伸肌。
extensor hallucis brevis|小腿與足|足背趾短伸肌的內側部分，肌腱至拇趾近節趾骨背側。
nasalis|頭頸|鼻背與鼻翼的淺層表情肌，橫部與翼部的作用不同。
depressor septi|頭頸|鼻小柱基底與上唇交界的短肌，與口輪匝肌等有變異性連續。
procerus|頭頸|鼻根正中淺層，向上連至眉間皮膚。
flexor hallucis longus|小腿與足|小腿後室深層外側，肌腱經內踝後方、距骨後方至拇趾足底。
flexor digitorum longus|小腿與足|小腿後室深層內側，肌腱經內踝後方、足底至第二至第五趾。
tibialis posterior|小腿與足|小腿後室最深層，脛腓骨與骨間膜後面，肌腱經內踝後方至足內側。
interspinales|肩胸背|相鄰椎骨棘突之間的短深肌，頸、腰段較發達，胸段可稀少。
intertransversarii|肩胸背|相鄰椎骨橫突之間的短肌，頸、腰段分部與神經供應不同。
levatores costarum|肩胸背|胸椎旁深層，椎骨橫突斜向下外側至肋骨結節與肋角之間。
dorsal interosseous (foot)|小腿與足|足底第四層、相鄰蹠骨間的四條雙羽狀肌；以第二趾為外展參考軸。
opponens digiti minimi of foot|小腿與足|足底外側深層、第五蹠骨旁，常與小趾短屈肌連續或缺如。
external intercostal|肩胸背|肋間肌最外層；由肋結節區至肋軟骨交界，向前下方走行。
internal intercostal|肩胸背|肋間肌中層，神經血管束主要位於其與最內肋間肌之間。
innermost intercostal|肩胸背|肋間肌最內層、主要見於胸壁外側，深於肋間神經血管束。
transversus thoracis|肩胸背|前胸壁內面，由胸骨後面向外上方至第二至第六肋軟骨。
`.trim();
export const reviewPositions=Object.fromEntries(positions.split('\n').map(line=>{const [base,region,position]=line.split('|');return [base,{region,position}];}));

// Only fields that need correction / qualification are overridden. Unchanged
// fields are still compared in the per-entry audit and retain precise citations.
export const baseCorrections={
 supraspinatus:{insertion:'肱骨大結節上面前內側的肌腱附著區，與關節囊交織；附著範圍有變異，這是非關節性的肌腱附著面，不是肱骨頭關節面。'},
 infraspinatus:{insertion:'肱骨大結節中面，亦可向上面外側延伸；與棘上肌的腱性邊界有交織及變異，不是肱骨頭關節面。'},
 'teres minor':{insertion:'肱骨大結節下面的肌腱附著區，並與肩關節囊相連；不是肱骨頭關節面。'},
 diaphragm:{origin:'胸骨部：劍突後面；肋部：下六肋及肋軟骨內面；腰部：弓狀韌帶與膈腳，右腳通常至 L1–L3，左腳通常至 L1–L2。'},
 sternothyroid:{action:'降低並穩定甲狀軟骨與喉；它不直接附著舌骨。'},
 thyrohyoid:{nerve:'C1 脊神經前支纖維隨舌下神經行走後形成甲狀舌骨肌神經；不是頸袢，也不是舌下神經本身的運動纖維。'},
 'anterior scalene':{nerve:'頸脊神經前支的直接肌支；常列 C4–C6，來源對根節範圍記載有差異，不應簡稱為「臂叢」。'},
 'middle scalene':{nerve:'頸脊神經前支的直接肌支（常列 C3–C8）；不是一條名為臂叢的終末肌神經。'},
 'posterior scalene':{nerve:'下位頸脊神經前支的直接肌支；常列 C6–C8，根節及附著椎節有個體差異。',origin:'中下位頸椎橫突後結節，常列 C4–C6 或 C5–C7；資料間有椎節範圍差異。'},
 'serratus posterior superior':{origin:'項韌帶下部、C7 至上胸椎棘突及棘上韌帶（通常 T1–T3）。',insertion:'第二至第五肋骨肋角外側的上緣。',nerve:'第二至第五肋間神經（T2–T5 前支）。',action:'傳統附著推論為上提上位肋骨；直接呼吸作用的實證不足，本體感覺可能較重要，不能標為已證實的主要吸氣肌。'},
 'serratus posterior inferior':{action:'傳統附著推論為向下牽引下位肋骨；直接呼吸作用的實證不足，可能參與本體感覺，不能僅憑附著確定其呼吸功能。'},
 subclavius:{nerve:'鎖骨下肌神經，由臂叢上幹發出（C5–C6）。',action:'下壓並穩定鎖骨。'},
 'psoas major':{origin:'T12 至腰椎椎體外側及相關椎間盤、L1–L5 橫突；椎體與椎間盤附著範圍存在變異。',nerve:'腰脊神經前支的直接肌支；教科書常列 L1–L3，屍體研究亦記錄 L1–L4，不能當成固定無變異的根節範圍。',action:'屈髖；固定股骨時參與軀幹／髖的相對運動與腰椎控制，力矩隨姿勢改變。'},
 semitendinosus:{nerve:'坐骨神經的脛神經部分（肌支在大腿發出）；不是小腿的脛神經再回頭支配。',action:'伸髖、屈膝；屈膝位使小腿內旋。'},
 semimembranosus:{nerve:'坐骨神經的脛神經部分。',insertion:'脛骨內側髁後面，並有膕斜韌帶等腱性擴展。',action:'伸髖、屈膝；屈膝位使小腿內旋。'},
 'adductor longus':{origin:'恥骨體前面、恥骨嵴下方，鄰近恥骨聯合外側。',insertion:'股骨粗線中段內側唇。',action:'主要為髖內收，協助屈髖；旋轉力矩隨髖位而變，不固定標為單一內旋或外旋肌。'},
 'adductor brevis':{action:'髖內收、協助屈髖；旋轉作用依髖位及纖維方向而變。'},
 'adductor magnus':{nerve:'收肌部主要為閉孔神經後支；坐骨髁部為坐骨神經的脛神經部分。',action:'主要髖內收；收肌部可協助屈髖，坐骨髁部可伸髖，不能把全肌當成同一作用與支配。'},
 'adductor minimus':{action:'主要協助髖內收；常作為大收肌上部／分部描述，獨立性與旋轉作用有變異。'},
 'fibularis (peroneus) brevis':{origin:'腓骨外側面遠端約三分之二及鄰近肌間隔；不是僅遠端三分之一。'},
 'fibularis (peroneus) tertius':{insertion:'第五蹠骨底及鄰近近端骨幹背側。',action:'踝背屈並協助足外翻。'},
 'extensor hallucis longus':{action:'伸拇趾趾間及蹠趾關節，協助踝背屈。'},
 'extensor digitorum longus':{action:'伸第二至第五趾蹠趾與趾間關節，協助踝背屈。'},
 'splenius cervicis':{origin:'上位胸椎棘突及棘上韌帶，通常 T3–T6；不能套用頭夾肌的項韌帶起點。',action:'伸頸、同側側屈及同側旋轉。'},
 'splenius capitis':{origin:'項韌帶下部、C7 至上胸椎棘突（常列 T1–T3／T4）及棘上韌帶。'},
 'obliquus capitis superior':{action:'伸展頭部並使頭同側側屈；不以軸向旋轉作為其主要作用。'},
 brachialis:{insertion:'尺骨粗隆及冠突。',nerve:'主要為肌皮神經；外側部分常另有橈神經肌支。'},
 'biceps brachii':{insertion:'橈骨粗隆，另經肱二頭肌腱膜連至前臂筋膜。',action:'屈肘與前臂旋後，並可協助屈肩；不能把某一肌頭的作用直接套成另一肌頭的獨有功能。'},
 'flexor digiti minimi brevis (hand)':{action:'主要屈小指掌指關節；第五掌骨的對掌旋轉主要由小指對掌肌完成。'},
 'flexor digitorum profundus':{origin:'尺骨近端前面、內側面及鄰近骨間膜。',nerve:'第二、第三指側主要為正中神經的前骨間神經；第四、第五指側主要為尺神經，存在交疊及變異。'},
 'flexor pollicis longus':{nerve:'正中神經的前骨間神經。'},
 'palmaris longus':{insertion:'掌腱膜與屈肌支持帶。',action:'張緊掌腱膜並協助屈腕。'},
 'palmar interosseous':{origin:'通常三條，起於第二、第四、第五掌骨掌側／側面。',insertion:'第二指尺側、第四及第五指橈側的近節指骨底與伸肌腱膜。',action:'使第二、第四、第五指向第三指軸內收，並協助屈掌指、伸近側及遠側指間關節。'},
 'vastus lateralis':{origin:'股骨大轉子及其基部、粗線外側唇、臀肌粗隆附近及外側肌間隔。',insertion:'經股四頭肌腱至髕骨外側，參與外側髕支持帶；力量再經髕韌帶傳至脛骨粗隆。'},
 'vastus medialis':{insertion:'經股四頭肌腱至髕骨內側，參與內側髕支持帶；再經髕韌帶傳至脛骨粗隆。'},
 'vastus intermedius':{insertion:'形成股四頭肌腱深層，連至髕骨，再經髕韌帶傳至脛骨粗隆。'},
 'rectus femoris':{insertion:'經股四頭肌腱至髕骨，再經髕韌帶連至脛骨粗隆；膝上與膝下的腱／韌帶不混為同一構造。'},
 gracilis:{action:'髖內收、屈膝；屈膝時使小腿內旋，而非把膝部內旋寫成大腿內旋。'},
 pubococcygeus:{insertion:'會陰體、肛尾縫及尾骨周圍等附著，部分纖維與鄰近骨盆腔器官相連；不能只寫尾骨。'},
 coccygeus:{nerve:'薦神經前支的肌支，常列 S4–S5；不同資料可記錄相鄰節段貢獻。'},
 occipitalis:{origin:'枕骨上項線外側部與顳骨乳突附近。',action:'向後牽引並穩定頭皮；抬眉主要為額肌作用。'},
 'extensor digitorum brevis':{insertion:'第二至第四趾的長伸肌腱／伸肌腱膜；第一趾部分在本地圖另列為拇趾短伸肌。',action:'協助伸第二至第四趾。'},
 'flexor hallucis longus':{action:'屈拇趾唯一的趾間關節及蹠趾關節，協助踝蹠屈；拇趾沒有近、遠兩個趾間關節。'},
 'external intercostal':{origin:'上方肋骨下緣。',insertion:'下一肋骨上緣，肌束大致向前下方走行。',action:'穩定肋間隙並參與吸氣時肋骨上提；力矩依胸壁區域而異。'},
 'internal intercostal':{origin:'上方肋骨肋溝／下緣內面。',insertion:'下一肋骨上緣，肌束大致向後下方走行，與肋間外肌交叉。',action:'骨間部主要協助用力呼氣、下壓肋骨；肋軟骨間部可協助吸氣，不能將整肌概括為同一呼吸作用。'},
 'innermost intercostal':{origin:'上方肋骨內面、肋溝附近。',insertion:'下一肋骨內面，走向與肋間內肌相近。',action:'協助穩定肋間隙，通常與肋間內肌骨間部共同參與用力呼氣。'},
};
export const partCorrections={
 'clavicular part of deltoid':{action:'主要屈肩與內旋；也參與肩關節穩定，不能照抄三角肌後部的伸肩／外旋作用。'},
 'acromial part of deltoid':{action:'主要肩外展，並參與肩關節穩定。'},
 'spinal part of deltoid':{action:'主要伸肩、外旋與水平外展，並參與肩關節穩定。'},
 'clavicular part of pectoralis major':{action:'肩內收、內旋，並主要協助屈肩。'},
 'sternocostal part of pectoralis major':{action:'肩內收、內旋；可將已屈曲／上舉的肱骨向下伸展，不能一律寫成屈肩。'},
 'abdominal part of pectoralis major':{action:'協助肩內收、內旋及由上舉位向下牽引肱骨；效果依肩位而異。'},
 'medial head of triceps brachii':{action:'伸肘；本頭不跨肩，不能套用長頭的肩關節作用。'},
 'lateral head of triceps brachii':{action:'伸肘；本頭不跨肩。'},
 'long head of triceps brachii':{action:'伸肘，並可協助肩伸展、內收及肩關節穩定。'},
 'long head of biceps femoris':{action:'伸髖、屈膝；屈膝位使小腿外旋。'},
 'short head of biceps brachii':{action:'屈肘與前臂旋後，並協助屈肩。'},
 'long head of biceps brachii':{action:'屈肘與前臂旋後，並參與肩部控制及協助屈肩。'},
 'set of levatores costarum longi':{origin:'下位胸椎橫突，由下方數組肋提肌分出的長肌束。',insertion:'跨過一條肋骨，連至再下一條肋骨肋結節與肋角之間；與短肋提肌跨一個肋間不同。'},
 'set of levatores costarum breves':{origin:'C7–T11 橫突。',insertion:'下一條肋骨肋結節與肋角之間，跨一個肋間。'},
};
export const reviewNotes={
 'palmar interosseous':'標準教學通常列三條掌側骨間肌；部分歷史命名另計拇指的附加骨間肌。模型合併肌群不適合用來判定每人的肌肉數量。',
 'adductor minimus':'屍體研究顯示其存在及與大收肌的分界有變異；模型的獨立名稱不表示所有人都有同樣的獨立肌。',
 'obturator externus':'交叉來源中，UW 此頁神經欄出現大收肌／膕繩肌部文字；本條神經依 LUMEN 與區域解剖表核對，未沿用該欄。',
 'adductor pollicis':'UW 此頁作用欄與對掌肌描述混淆；內收作用依 LUMEN 與區域解剖表核對。',
 'pectoralis minor':'UW 此頁神經欄附有不適用於胸小肌的 clavicular head 字樣；本條採胸內側神經並以 LUMEN 交叉確認。',
 'extensor pollicis brevis':'UW 此頁作用欄關節名稱有不一致；主要伸掌指關節依 LUMEN 及區域解剖表確認。',
 'puborectalis':'提肛肌支配有來源及解剖變異，不能將女性屍體的單一研究直接當作所有性別與個體唯一模式。',
};
