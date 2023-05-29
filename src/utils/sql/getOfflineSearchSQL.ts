export const getOfflineSearchSQL = (searchTerm: string) => {
    const subquery = /[a-zA-Z]+/.test(searchTerm) ? 
    `SELECT DISTINCT word_sense.wordId FROM word_gloss
	INNER JOIN word_sense ON word_gloss.senseId = word_sense."id" 
	INNER JOIN word_kanji ON word_kanji.wordId = word_sense.wordId
	WHERE instr( word_gloss."text" , $searchTerm)
	ORDER BY length(word_gloss."text") ASC, word_kanji.common DESC LIMIT 20`
    : /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]+$/.test(searchTerm) ?
     `SELECT DISTINCT word_kana."wordId" FROM word_kana
	INNER JOIN word_kanji ON word_kana.wordId = word_kanji.wordId AND (word_kana.appliesToKanji = "*" OR instr(word_kana.appliesToKanji, word_kanji."text") )
	WHERE instr( word_kana."text" , $searchTerm)
	ORDER BY word_kanji.common DESC, word_kana.common DESC, length(word_kana."text") ASC LIMIT 20`
    : `SELECT DISTINCT word_kanji."wordId" FROM word_kanji
	WHERE instr( word_kanji."text" ,  $searchTerm)
	ORDER BY word_kanji.common DESC, length(word_kanji."text") ASC LIMIT 20`
    return `SELECT temp."wordId", word_kanji."text" as "kanji",  word_kanji.common as "kanjiCommon", word_kana.common as "kanaCommon", word_kana."text" as "kana", partOfSpeech, antonym, related, field, misc, info, word_gloss.senseId,word_gloss.id as "glossId", word_gloss."type", word_gloss."text" as "meaning" FROM 
	(${subquery}) AS temp
	 INNER JOIN word_kanji ON word_kanji.wordId = temp.wordId
     INNER JOIN word_kana ON word_kana.wordId = temp.wordId AND (word_kana.appliesToKanji = "*" OR instr(word_kana.appliesToKanji, word_kanji."text") )
     INNER JOIN word_sense ON word_sense.wordId = temp.wordId AND (word_sense.appliesToKanji = "*" OR instr(word_sense.appliesToKanji, word_kanji."text") ) AND (word_sense.appliesToKana = "*" OR instr(word_sense.appliesToKanji, word_kana."text") )
     INNER JOIN word_gloss ON word_gloss.senseId = word_sense.id 
     `
}