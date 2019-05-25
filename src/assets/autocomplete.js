const keys = require('../../keys')

export const autocomplete = ({
  language,
  textToBaseOn,
  basedOnFrontText,
  front: startFront,
  back: startBack,
}) => {
  if (language === 'ja') {
    return new Promise(resolve => {
      const japaneseRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/
      const isJapanese = japaneseRegex.test(textToBaseOn)
      const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/
      const hasKanji = kanjiRegex.test(textToBaseOn)

      try {
        fetch(
          `https://cors-anywhere.herokuapp.com/https://jisho.org/api/v1/search/words?keyword=${textToBaseOn}`
        )
          .then(res => res.json())
          .then(data => data.data[0])
          .then(entry => {
            if (!entry) {
              if (basedOnFrontText)
                resolve({
                  front: '',
                  back: `Couldn't find a definition for that!`,
                })
              resolve({
                back: '',
                front: `Couldn't find a definition for that!`,
              })
            }
            // console.log(entry)
            let isCommon = entry.is_common
            let front = startFront
            let back = startBack
            let shouldAutoSetImage = false
            const definition = entry.senses
              .slice(0, 2)
              .reduce(
                (acc, sense) => [
                  ...acc,
                  ...sense.english_definitions.slice(0, 2),
                ],
                []
              )
              .join(', ')

            if (basedOnFrontText) {
              if (isJapanese) {
                if (hasKanji && entry.japanese[0].reading)
                  back = entry.japanese[0].reading
                else if (!hasKanji && entry.japanese[0].word)
                  back = entry.japanese[0].word
                back = back + '\n' + definition
              } else if (!isJapanese) {
                front = definition
                back =
                  (entry.japanese[0].word
                    ? entry.japanese[0].word + '\n'
                    : '') +
                  (entry.japanese[0].reading ? entry.japanese[0].reading : '')
                shouldAutoSetImage = true
              }
            } else if (!basedOnFrontText) {
              if (isJapanese) {
                front = definition
                back =
                  (entry.japanese[0].word
                    ? entry.japanese[0].word + '\n'
                    : '') +
                  (entry.japanese[0].reading ? entry.japanese[0].reading : '')
                shouldAutoSetImage = true
              } else if (!isJapanese) {
                front = entry.japanese[0].word
                  ? entry.japanese[0].word
                  : entry.japanese[0].reading
                  ? entry.japanese[0].reading
                  : `Whoops, couldn't find that one.`
                back =
                  (entry.japanese[0].reading
                    ? entry.japanese[0].reading + '\n'
                    : '') + definition
              }
            }
            back += isCommon ? '' : '\n_(uncommon word)_'
            resolve({
              front,
              back,
              shouldAutoSetImage,
            })
          })
      } catch (e) {
        resolve({
          front: basedOnFrontText ? textToBaseOn : `Error in fetching data!`,
          back: !basedOnFrontText ? textToBaseOn : `Error in fetching data!`,
        })
      }
    })
  } else if (language === 'es') {
    return new Promise(resolve => {
      try {
        fetch(
          //`https://od-api.oxforddictionaries.com/api/v2/translations/EN-US/ES/${textToBaseOn.toLowerCase()}`,
          `https://cors-anywhere.herokuapp.com/https://www.spanishdict.com/translate/${textToBaseOn}`
          // {
          //   headers: new Headers({
          //     app_id: keys.oxfordAppID,
          //     app_key: keys.oxfordApiKey,
          //   }),
          // }
        )
          .then(result => {
            console.log(result.status)
            return result.text()
          })
          .then(entry => {
            const [
              full,
              primaryTextLanguage,
              word,
              definition,
            ] = /<div id="headword-(en|es)" [^>]*>([^<]*)<\/div>.*<div .*quickdef[^>]*><a href="\/translate[^>]*>([^<]*)/g.exec(
              entry
            )
            console.log(primaryTextLanguage, word, definition)
            let front = basedOnFrontText ? word : definition
            let back = !basedOnFrontText ? word : definition
            let shouldAutoSetImage =
              (basedOnFrontText && primaryTextLanguage === 'en') ||
              (!basedOnFrontText && primaryTextLanguage === 'es')
            resolve({
              front,
              back,
              shouldAutoSetImage,
            })
          })
      } catch (e) {
        resolve({
          front: basedOnFrontText ? textToBaseOn : `Error in fetching data!`,
          back: !basedOnFrontText ? textToBaseOn : `Error in fetching data!`,
        })
      }
    })
  } else {
    resolve({
      front: basedOnFrontText
        ? textToBaseOn
        : `That language isn't supported yet!`,
      back: !basedOnFrontText
        ? textToBaseOn
        : `That language isn't supported yet!`,
    })
  }
}
