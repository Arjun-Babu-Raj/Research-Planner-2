// src/lib/templates.ts

export const PIS_TEMPLATE = {
    english: `
Participant Information Sheet

Study Title: [STUDY_TITLE]
Investigator: [INVESTIGATOR_NAME]
Guide: [GUIDE_NAME]

Introduction:
[INTRODUCTION_SUMMARY]

Purpose of the Study:
[OBJECTIVE_SUMMARY]

Participation – What is involved?
[METHODOLOGY_SUMMARY]

How long will my participation in the study last?
[DURATION_ESTIMATE]

What are the potential benefits of being involved?
[POTENTIAL_BENEFITS]

Potential harms and risks of participation:
There are no major harms or risks anticipated due to the study. Despite all precautions to keep the information and data collected and their access secure, there will be a risk of breach of privacy or confidentiality of this information.

What will be done with the information collected about me?
All information collected will be kept strictly confidential and the findings from the study will not be shared with anyone else. They will be reported as group data and you will not be identified in any way.

What happens if I change my mind about participating in this study?
You have the full right to change your mind at any time during the study without any harm or penalty.

Who should I contact for more information or if I have any questions or concerns later?
If you would like any information or have any questions or concerns, you can contact the following numbers:
[CONTACT_INFO]
`,
    hindi: `
प्रतिभागी सूचना पत्र

अध्ययन का शीर्षक: [STUDY_TITLE]
अध्ययन जांचकर्ता: [INVESTIGATOR_NAME]
मार्गदर्शक (गाइड): [GUIDE_NAME]

परिचयः
[INTRODUCTION_SUMMARY]

अध्ययन का उद्देश्यः
[OBJECTIVE_SUMMARY]

भाग लेना – इसमें क्या शामिल है ?
[METHODOLOGY_SUMMARY]

अध्ययन में मेरी भागीदारी कब तक चलेगी ?
[DURATION_ESTIMATE]

इसमें शामिल होने से संभावित लाभ क्या है ?
[POTENTIAL_BENEFITS]

इसमें भाग लेने से संभावित हानि एवं जोखिम ।
अध्ययन के कारण किसी बड़ी हानि या जोखिम की पूर्व संभावना नहीं है। एकत्र की गई सूचना एवं आंकड़ों एवं इनकी एक्सेस को सुरक्षित रखने की सभी सावधानियों के बाद भी इन सूचनाओं की निजता अथवा गोपनीयता को क्षति पहुँचने का जोखिम रहेगा 

मेरे बारे में एकत्र की गई सूचना का क्या किया जाएगा ?
एकत्र की गई सभी सूचना पूर्णतः गोपनीय रखी जाएगी तथा अध्ययन से प्राप्त निष्कर्षों को अन्य किसी से साझा नहीं किया जाएगा । इन्हें ग्रुप आंकड़े के रूप मे रिपोर्ट किया जाएगा और किसी भी तरह से आपकी पहचान उजागर नहीं होगी । 

इस अध्ययन मे भाग लेने के लिए मेरे विचार बदलने पर क्या होगा ?
अध्ययन के दौरान किसी भी समय बिना किसी क्षति या दंड के आपको अपने विचार बदलने का पूरा	अधिकार है । 

इस संबंध मे अधिक जानकारी के लिए या बाद मे मेरे मन मे कोई प्रश्न या शंका होने पर मुझ किनसे संपर्क करना होगा ?
यदि आप कोई सूचना चाहते हैं या आपका कोई प्रश्न है या शंका है तो आप इन नंबरों पर संपर्क कर सकते:
[CONTACT_INFO]
`
};

export const CONSENT_TEMPLATE = {
    english: `
PARTICIPANT INFORMED CONSENT FORM (PICF)

Participant Identification Number for this Study: …………………………………………………………
Title of Project: [STUDY_TITLE]
Name of Student Investigator: [INVESTIGATOR_NAME]
Name of Thesis Guide: [GUIDE_NAME]

I have carefully read the information sheet version II dated [CURRENT_DATE] / it has been clearly explained to me in detail in a language I comprehend, and I have fully understood the contents. I confirm that I have had the opportunity to ask questions.

The nature and purpose of the study and its potential risks/benefits and expected duration of the study, and other relevant details of the study have been explained to me in detail. I understand that my participation is voluntary and that I am free to withdraw at any time, without giving any reason, without my medical care or legal right being affected.

I understand that the information collected about me from my participation in this research and sections of any of my medical notes may be looked at by responsible individuals from AIIMS. I give permission for these individuals to have access to my records.

If the participant is a child, his/her verbal or written assent has been obtained.

I agree to take part in the above study.

____________________________________
(Signature/Left Thumb Impression of Participant) 			
Date: …………………………… Place: …………....................................................				
Name of the participant: ………………………………………………...............
Son/Daughter/Spouse of: ………………………………………………….
Complete Postal Address: …………………………………………………….....

If illiterate:
The information sheet has been read and explained to the participant and given the opportunity to ask questions. I confirm that the individual has given consent freely. 

Signature of Legally acceptable representative or impartial witness
Date:
Name of LAR or impartial witness:
Address:

This is to certify that the above consent has been obtained in my presence.

_______________________
Signature of the student Investigator			Date: …………………	Place: …………………	

NB: Three copies should be made, for (1) Patient, (2) Researcher, (3) Institution.
`,
    hindi: `
प्रतिभागी सूचना सहमति प्रपत्र

इस अध्ययन के लिए प्रतिभागी का पहचान नंबरः ………………………………………………….................
Participant Identification Number for this Study: …………………………………………………………
अनुसंधान का शीर्षकः [STUDY_TITLE]
Title of Project : [STUDY_TITLE]
शोधकर्ता छात्र का नाम : [INVESTIGATOR_NAME]
Name of Student Investigator
शोध मार्गदर्शक का नाम  : [GUIDE_NAME]
Name of Thesis Guide :  [GUIDE_NAME]

मैंने दिनांक [CURRENT_DATE] के सूचना पत्रक संस्करण II में दिए गए सभी तथ्यों को सावधानीपूर्वक पढ़ लिया है/ मुझे अपनी भाषा में स्पष्ट रूप से विस्तारपूर्वक समझा दिया गया है, और मैंने तथ्यों को  पूर्णतः समझ लिया है। मैं पुष्टि करता/ करती हूँ, कि  मुझे सवाल पूछने  के अवसर प्रदान किए गए। The contents of the information sheet version II dated [CURRENT_DATE] that was provided have been read carefully by me / explained in detail to me, in a language that I comprehend, and I have fully understood the contents. I confirm that I have had the opportunity to ask questions.

मुझे इस अध्ययन की प्रकृति एवं उद्देश्‍य और इसके संभावित जोखिमों / लाभों तथा अध्ययन की अनुमानित अवधि एवं अन्य प्रासंगिक जानकारी के बारे में विस्तारपूर्वक समझा दिया गया है। मुझे पता है कि इस अध्य़यन में मेरी भागीदारी स्वैच्छिक है तथा मैं इस अध्ययन से किसी भी समय बिना कोई कारण बताए, अपना नाम वापस लेने के लिए स्वतंत्र हूं और नाम वापस लेने पर मेरी चिकित्सा देखभाल या कानूनी अधिकारों पर कोई प्रभाव नहीं पड़ेगा। The nature and purpose of the study and its potential risks/benefits and expected duration of the study, and other relevant details of the study have been explained to me in detail. I understand that my participation is voluntary and that I am free to withdraw at any time, without giving any reason, without my medical care or legal right being affected.

मैं समझता/समझती हूं कि इस अनुसंधान में मेरी भागीदारी से मेरे बारे में एकत्र की गई जानकारी और मेरे चिकित्सीय दस्तावेजों के किसी भी भाग को एम्स के जिम्मेदार व्यक्तियों द्वारा ही देखा जाएगा। मैं इन व्यक्तियों को मेरे रिकॉर्ड प्राप्त करने की अनुमति प्रदान करता/ करती हूँ। I understand that the information collected about me from my participation in this research and sections of any of my medical notes may be looked at by responsible individuals from AIIMS. I give permission for this individuals to have access to my records.

यदि प्रतिभागी बच्चा है तो उसकी मौखिक या लिखित सहमति प्राप्त की गई है। If participants is child, his/her verbal of written assent has been obtained.

मैं उक्त अध्ययन में भाग लेने के लिए सहमत हूं/I agree to take part in the above study.

____________________________________
(प्रतिभागी के हस्ताक्षर / बांए अंगूठे का निशान) (Signature/Left Thumb Impression)			
दिनांक/Date……………………………स्थान/Place …………....................................................				
प्रतिभागी का नाम/Name of the participant………………………………………………...............
पिता/पति/पत्नी का नाम /Son/Daughter/Spouse of………………………………………………….
डाक का पूरा पता /Complete Postal Address …………………………………………………….....

अगर अशिक्षित हों / If illiterate. 

सूचना पत्र को प्रतिभागी को पढ़ा और समझाया गया है और प्रश्न पूछने का अवसर दिया गया है। मैं पुष्टि करता हूं कि व्यक्ति ने स्वतंत्र रूप से अपनी सहमति दी है ।
The information sheet has been read and explained to the participant and given the opportunity to ask questions. I confirm that the individual has given consent freely. 

कानूनी रूप से स्वीकार्य प्रतिनिधि या निष्पक्ष गवाह के हस्ताक्षर
Signature of Legally acceptable representative or impartial witness.
दिनांक/Date 
एलएआर या निष्पक्ष गवाह का नाम / Name of LAR or impartial witness .
पता / Address :-

प्रमाणित किया जाता है कि उक्त सहमति मेरी उपस्थिति में प्राप्त की गई । 
This is to certify that the above consent has been obtained in my presence.

_______________________
छात्र शोधकर्ता के हस्ताक्षर 				दिनांक……………….	स्थान…………………
Signature of the student Investigator			Date …………………	Place …………………	
`
};
