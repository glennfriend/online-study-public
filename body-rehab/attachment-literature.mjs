// Additional studies read in the regional review; their scope is field-specific.
export const attachmentLiterature={
 forearm2008:['原始屍體／組織學研究・深層前臂肌在骨間膜的起源（11具，2008）','https://pubmed.ncbi.nlm.nih.gov/18333822/'],
 anterior2017:['原始屍體研究・脛前肌止點形態及內側／蹠側分布（41足，2017）','https://pmc.ncbi.nlm.nih.gov/articles/PMC5474259/'],
 posterior2022:['原始3D掃描屍體研究・脛後肌腱附著及變異（100足，2022）','https://www.mdpi.com/1660-4601/19/24/16510'],
 thumb2017:['原始屍體研究・拇短屈肌深頭止點變異（80手，2017）','https://pmc.ncbi.nlm.nih.gov/articles/PMC5679560/'],
 patellar2001:['原始解剖研究・髕腱附著與伸膝裝置（22膝，2001）','https://pubmed.ncbi.nlm.nih.gov/11269580/'],
 gemelli2012:['原始解剖研究・短外旋肌共同腱與大轉子附著（2012）','https://pmc.ncbi.nlm.nih.gov/articles/PMC3348305/'],
 plantae2019:['原始解剖研究・足底方肌與屈肌腱連接（116下肢，2019）','https://pubmed.ncbi.nlm.nih.gov/30989352/'],
 coccyx:['NCBI Bookshelf・Coccyx anatomy','https://www.ncbi.nlm.nih.gov/books/NBK549870/'],
};
export function attachmentFieldEvidence(e){
 const origin=['extensor indicis','extensor pollicis longus','extensor pollicis brevis','abductor pollicis longus','flexor pollicis longus','flexor digitorum profundus'].includes(e.base)?['forearm2008']:[];
 const insertion=e.base==='tibialis anterior'?['anterior2017']:e.base==='tibialis posterior'?['posterior2022']:e.key==='deep head of flexor pollicis brevis'?['thumb2017']:['rectus femoris','vastus lateralis','vastus medialis','vastus intermedius'].includes(e.base)?['patellar2001']:['superior gemellus','inferior gemellus','obturator internus'].includes(e.base)?['gemelli2012']:e.base==='quadratus plantae'?['plantae2019']:[];
 return {origin,insertion};
}
