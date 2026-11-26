// The source's two orbicularis oculi parts are reversed spatially: its
// "orbital" object is the thin inner eyelid loop, while its "palpebral" object
// is the larger peripheral ring over the bony orbital margin. Correct the
// concept assignment, preserving source ID, name, bytes and coordinates.
export const modelConceptCorrections={
 FMA46782:{fma:'FMA46785',name:'palpebral part of right orbicularis oculi'},
 FMA46783:{fma:'FMA46786',name:'palpebral part of left orbicularis oculi'},
 FMA46785:{fma:'FMA46782',name:'orbital part of right orbicularis oculi'},
 FMA46786:{fma:'FMA46783',name:'orbital part of left orbicularis oculi'},
};
export const correctionEvidence=[
 ['Gray’s Anatomy for Students・Orbital and palpebral parts','https://elsevier-elibrary.com/contents/fullcontent/58090/epubcontent_v2/OEBPS/B9780443069529000138A.htm'],
 ['屍體解剖研究・Orbicularis oculi inner and outer fascicles（2024）','https://pubmed.ncbi.nlm.nih.gov/39621066/'],
];
