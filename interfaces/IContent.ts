import { ISentence } from './ISentence'

export interface IContent {
    maximumSentences?: number // The parameter used to filter the maximum sentences quantity
    searchTerm?: string // The search term that the user types
    prefix?: string // The prefix the user selects
    sourceContentOriginal?: string // The original content that was fetched from wikipedia
    sourceContentSanitized?: string // The wikipedia content after it is sanitized
    sentences?: ISentence[] // The broken sentences found on wikipedia
}
