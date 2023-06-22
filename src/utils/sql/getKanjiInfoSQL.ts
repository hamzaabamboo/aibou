export const getKanjiInfoSQL = () => {
  return `
    SELECT kanji.literal, kanji_reading.type, group_concat(distinct kanji_reading.value), kanji_reading_meaning_group.id, group_concat(distinct kanji_meaning."value"), group_concat(distinct kanji_radicals_radical.radicalCharacter), jlptLevel, grade, radicalNames, frequency, strokeCounts FROM kanji
	INNER JOIN kanji_reading_meaning_group on kanji.literal = kanji_reading_meaning_group.readingMeaningId
	INNER JOIN kanji_reading_meanings on kanji.literal = kanji_reading_meanings.id
	INNER JOIN kanji_reading on kanji_reading.groupId = kanji_reading_meaning_group.id
	INNER JOIN kanji_meaning on kanji_meaning.groupId = kanji_reading_meaning_group.id
	INNER JOIN kanji_radicals_radical on kanji.literal = kanji_radicals_radical.kanjiLiteral
	INNER JOIN kanji_misc on kanji.literal = kanji_misc.id
	WHERE kanji.literal = $searchTerm AND (kanji_reading.type = "ja_on" OR kanji_reading.type = "ja_kun" )
	GROUP BY kanji.literal, kanji_reading."type", kanji_reading_meaning_group.id
	ORDER BY jlptLevel DESC
    `
}
