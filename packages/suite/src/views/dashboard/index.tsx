import { Column } from '@trezor/components';
import { spacings } from '@trezor/theme';

import { useLayout } from 'src/hooks/suite';
import { PageHeader } from 'src/components/suite/layouts/SuiteLayout';

import { AssetsView } from './AssetsView/AssetsView';
import { PortfolioCard } from './PortfolioCard/PortfolioCard';
import { PromoBanner } from './PromoBanner';
import { StakeEthCard } from './StakeEthCard/StakeEthCard';
import { DashboardPassphraseBanner } from './DashboardPassphraseBanner';

export const Dashboard = () => {
    useLayout('Home', <PageHeader />);

    return (
        <Column gap={spacings.xxxxl} data-testid="@dashboard/index">
            <DashboardPassphraseBanner />
            <PortfolioCard />
            <AssetsView />
            <StakeEthCard />
            <PromoBanner />
        </Column>
    );
};
