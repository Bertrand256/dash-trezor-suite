import { Locator, Page } from '@playwright/test';

import { step } from '../common';

export class AnalyticsSection {
    readonly heading: Locator;
    readonly continueButton: Locator;
    readonly toggleSwitch: Locator;

    private static readonly ANALYTICS_HOST = 'data.trezor.io';

    constructor(private readonly page: Page) {
        this.continueButton = page.getByTestId('@analytics/continue-button');
        this.heading = page.getByTestId('@analytics/consent/heading');
        this.toggleSwitch = page.getByTestId('@analytics/toggle-switch');
    }

    private async waitForAnalyticsRequest(filter: (url: URL) => boolean, timeout?: number) {
        const request = await this.page.waitForRequest(
            req => {
                const url = new URL(req.url());

                if (url.hostname !== AnalyticsSection.ANALYTICS_HOST) return false;

                return filter(url);
            },
            { timeout },
        );

        return Object.fromEntries(new URL(request.url()).searchParams);
    }

    @step()
    async waitForAnalytics(params: Record<string, string>, timeout?: number) {
        return await this.waitForAnalyticsRequest(
            url => Object.entries(params).every(([k, v]) => url.searchParams.get(k) === v),
            timeout,
        );
    }

    @step()
    async waitForMultipleAnalytics(eventTypes: string[], timeout?: number) {
        return await Promise.all(
            eventTypes.map(type =>
                this.waitForAnalyticsRequest(
                    url => url.searchParams.get('c_type') === type,
                    timeout,
                ),
            ),
        );
    }

    @step()
    async passThroughAnalytics() {
        await this.continueButton.click();
        await this.continueButton.click();
    }
}
