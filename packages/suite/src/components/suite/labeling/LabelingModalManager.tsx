import { selectShowEnableSuiteSyncModal } from 'src/actions/suiteSync/suiteSyncSelectors';
import { updateShowEnableSuiteSyncModal } from 'src/actions/suiteSync/suiteSyncSlice';
import { useDispatch, useSelector } from 'src/hooks/suite';

import { TurnOnSuiteSyncModal } from './TurnOnSecureSyncModal';

export const LabelingModalManager = () => {
    const dispatch = useDispatch();
    const showEnableSuiteSyncModal = useSelector(selectShowEnableSuiteSyncModal);

    const onClose = () => {
        dispatch(updateShowEnableSuiteSyncModal({ show: false }));
    };

    if (!showEnableSuiteSyncModal) return null;

    return <TurnOnSuiteSyncModal onClose={onClose} />;
};
