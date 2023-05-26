import omit from 'lodash/omit';
import {
  DictionaryGloss,
  DictionaryKana,
  DictionaryKanji,
  DictionarySense,
  DictionaryWord,
  JMDictFile,
} from '../types/jmdict';

export const normalizeDictionary = (dict: JMDictFile) => {
  const kanjis: DictionaryKanji[] = [];
  const kanas: DictionaryKana[] = [];
  const senses: DictionarySense[] = [];
  const glosses: DictionaryGloss[] = [];
  const words: DictionaryWord[] = [];

  dict.words.forEach((word) => {
    const {
      id: wordId, kanji, kana, sense,
    } = word;
    const newKanjis: DictionaryKanji[] = kanji.map((k, idx) => ({
      ...k,
      id: `${wordId}-${idx}`,
      wordId,
    }));
    const newKanas: DictionaryKana[] = kana.map((k, idx) => ({
      ...omit(k, 'appliesToKanji'),
      id: `${wordId}-${idx}`,
      wordId,
      kanjiIds:
        k.appliesToKanji[0] === '*'
          ? newKanjis.map((k) => k.id)
          : (k.appliesToKanji
            .map((kanji) => newKanjis.find((a) => a.text == kanji)?.id)
            .filter((i) => !!i) as string[]),
    }));

    const newSenses: DictionarySense[] = sense.map((k, idx) => {
      const senseId = `${wordId}-${idx}`;

      const gloss = k.gloss.map((s, idx) => ({
        id: `${wordId}-${idx}`,
        wordId,
        senseId,
        ...s,
      }));

      glosses.push(...gloss);

      return {
        ...omit(k, ['appliesToKana', 'appliesToKanji']),
        id: `${wordId}-${idx}`,
        wordId,
        kanjiIds:
          k.appliesToKanji[0] === '*'
            ? newKanjis.map((k) => k.id)
            : (k.appliesToKanji
              .map((kanji) => newKanjis.find((a) => a.text == kanji)?.id)
              .filter((i) => !!i) as string[]),
        kanaIds:
          k.appliesToKana[0] === '*'
            ? newKanas.map((k) => k.id)
            : (k.appliesToKana
              .map((kana) => newKanas.find((a) => a.text == kana)?.id)
              .filter((i) => !!i) as string[]),
        senseIds: gloss.map((g) => g.id),
      };
    });

    const newWord = {
      id: wordId,
      kanjiIds: newKanjis.map((n) => n.id),
      kanaIds: newKanas.map((n) => n.id),
      senseIds: newSenses.map((n) => n.id),
    };

    kanjis.push(...newKanjis);
    kanas.push(...newKanas);
    senses.push(...newSenses);
    words.push(newWord);
  });
  return {
    kanjis, kanas, senses, glosses, words,
  };
};
