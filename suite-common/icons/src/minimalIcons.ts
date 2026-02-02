// Minimal icon set for connect-explorer webextension build
// This file includes only the icons actually used in connect-explorer
// to avoid bundling 2,677 unused SVG files

export const icons = {
    plus: require('../assets/plus.svg'),
    x: require('../assets/x.svg'),
    check: require('../assets/check.svg'),
    xCircle: require('../assets/xCircle.svg'),
    question: require('../assets/question.svg'),
    caretDown: require('../assets/caretDown.svg'),
    bookOpenText: require('../assets/bookOpenText.svg'),
    book: require('../assets/book.svg'),
    lightning: require('../assets/lightning.svg'),
    arrowLineUpRight: require('../assets/arrowLineUpRight.svg'),
} as const;

export type IconName = keyof typeof icons;
