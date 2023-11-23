export const getKanjiCrossPrompt = () => `
    SELECT firstKanji, word_kanji."text" FROM 
	(SELECT tmp.firstKanji, word_kanji."text" FROM 
		(SELECT firstKanji.literal as firstKanji FROM word_kanji 
			INNER JOIN kanji as firstKanji ON SUBSTR(word_kanji."text",1,1) = firstKanji.literal
			INNER JOIN kanji as secondKanji ON SUBSTR(word_kanji."text",2,2) = secondKanji.literal
			WHERE length(word_kanji."text") = 2 and word_kanji.common = 1
			ORDER BY RANDOM() LIMIT 2) as tmp
	LEFT JOIN word_kanji ON ((SUBSTR(word_kanji."text",1,1) = tmp.firstKanji OR SUBSTR(word_kanji."text",2,2) = tmp.firstKanji) AND length(word_kanji."text") = 2 and word_kanji.common = 1)
	GROUP BY tmp.firstKanji
	HAVING COUNT(tmp.firstKanji) > 4
	ORDER BY RANDOM() LIMIT 1) as t
LEFT JOIN word_kanji ON ((SUBSTR(word_kanji."text",1,1) = t.firstKanji OR SUBSTR(word_kanji."text",2,2) = t.firstKanji) AND length(word_kanji."text") = 2 and word_kanji.common = 1)
ORDER BY RANDOM() LIMIT 4;
    `
