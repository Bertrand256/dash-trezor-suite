import { TranslationKey } from '@suite/intl';
import { typedObjectValues } from '@trezor/utils';

export type LabelingSelectValue = 'off' | 'secure-sync' | 'legacy';

export type LabelingOption<T> = { label: T; value: LabelingSelectValue };
export type LabelingOptionTranslated = LabelingOption<TranslationKey>;

export const LABELING_SELECT_OPTIONS_MAP: Record<
    LabelingSelectValue,
    LabelingOption<TranslationKey>
> = {
    off: { label: 'TR_LABELING_OFF', value: 'off' },
    'secure-sync': { label: 'TR_LABELING_SECURE_SYNC', value: 'secure-sync' },
    legacy: { label: 'TR_LABELING_LEGACY', value: 'legacy' },
};

export const LABELING_LEGACY_OPTION_LABEL = 'TR_LABELING_ON';

export const LABELING_SELECT_OPTIONS = typedObjectValues(LABELING_SELECT_OPTIONS_MAP);

export type SuiteSyncServerTypeOption = {
    label: TranslationKey;
    value: SuiteSyncServerTypeSelectValue;
};

export type SuiteSyncServerTypeSelectValue = 'default' | 'custom';

export const SUITE_SYNC_SERVER_TYPE_OPTIONS_MAP: Record<
    SuiteSyncServerTypeSelectValue,
    SuiteSyncServerTypeOption
> = {
    default: { label: 'TR_SUITE_SYNC_SERVER_TREZOR_DEFAULT', value: 'default' },
    custom: { label: 'TR_SUITE_SYNC_SERVER_CUSTOM', value: 'custom' },
};

export const SUITE_SYNC_SERVER_TYPE_OPTIONS = typedObjectValues(SUITE_SYNC_SERVER_TYPE_OPTIONS_MAP);
