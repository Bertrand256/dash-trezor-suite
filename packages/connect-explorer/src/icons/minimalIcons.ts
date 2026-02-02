// Minimal icon set for connect-explorer webextension build
// This file is type-checked against the full icon set to avoid typos.

import type { IconName as FullIconName } from '@suite-common/icons/src/icons-types';

export const requiredIconNames = [
    'plus',
    'x',
    'check',
    'xCircle',
    'question',
    'caretDown',
    'bookOpenText',
    'book',
    'lightning',
    'newspaper',
    'arrowLineUpRight',
] as const satisfies readonly FullIconName[];

export type IconName = (typeof requiredIconNames)[number];

export const icons = {
    plus: require('../../../../suite-common/icons/assets/plus.svg'),
    x: require('../../../../suite-common/icons/assets/x.svg'),
    check: require('../../../../suite-common/icons/assets/check.svg'),
    xCircle: require('../../../../suite-common/icons/assets/xCircle.svg'),
    question: require('../../../../suite-common/icons/assets/question.svg'),
    caretDown: require('../../../../suite-common/icons/assets/caretDown.svg'),
    bookOpenText: require('../../../../suite-common/icons/assets/bookOpenText.svg'),
    book: require('../../../../suite-common/icons/assets/book.svg'),
    lightning: require('../../../../suite-common/icons/assets/lightning.svg'),
    newspaper: require('../../../../suite-common/icons/assets/newspaper.svg'),
    arrowLineUpRight: require('../../../../suite-common/icons/assets/arrowLineUpRight.svg'),
} as const satisfies Record<IconName, string>;
