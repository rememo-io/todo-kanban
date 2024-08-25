export const TODO_REGEX = /TODO:|TODO-\w+:/g;
export const FIXME_REGEX = /FIXME:|FIXME-\w+:/g;
export const FIX_REGEX = /FIX:|FIX-\w+:/g;
export const ID_REGEX = /TODO-(\w+):|FIX-(\w+):|FIXME-(\w+):/;
export const TITLE_REGEX = /title:\s*(.*?)(?=\s*description:|$)/i;
export const DESCRIPTION_REGEX = /description:\s*(.*)/i;
