/**
 * Copyright 2020 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {Browser} from './Browser';
import type {BrowserConnectOptions} from './BrowserConnector';
import type {BrowserFetcherOptions} from './BrowserFetcher';
import {BrowserFetcher} from './BrowserFetcher';
import type {ProductLauncher} from './Launcher';
import Launcher from './Launcher';
import type {
	BrowserLaunchArgumentOptions,
	LaunchOptions,
} from './LaunchOptions';
import type {Product} from './Product';
import {PUPPETEER_REVISIONS} from './revisions';

interface PuppeteerLaunchOptions
	extends LaunchOptions,
		BrowserLaunchArgumentOptions,
		BrowserConnectOptions {
	product?: Product;
	extraPrefsFirefox?: Record<string, unknown>;
}

export class PuppeteerNode {
	#lazyLauncher?: ProductLauncher;
	#productName?: Product;

	_preferredRevision: string;

	constructor(settings: {preferredRevision: string; productName?: Product}) {
		const {preferredRevision, productName} = settings;
		this.#productName = productName;
		this._preferredRevision = preferredRevision;

		this.launch = this.launch.bind(this);
		this.executablePath = this.executablePath.bind(this);
		this.createBrowserFetcher = this.createBrowserFetcher.bind(this);
	}

	get _productName(): Product | undefined {
		return this.#productName;
	}

	set _productName(name: Product | undefined) {
		this.#productName = name;
	}

	/**
	 * Launches puppeteer and launches a browser instance with given arguments
	 * and options when specified.
	 *
	 * @remarks
	 *
	 * @example
	 * You can use `ignoreDefaultArgs` to filter out `--mute-audio` from default arguments:
	 * ```js
	 * const browser = await puppeteer.launch({
	 *   ignoreDefaultArgs: ['--mute-audio']
	 * });
	 * ```
	 *
	 * **NOTE** Puppeteer can also be used to control the Chrome browser,
	 * but it works best with the version of Chromium it is bundled with.
	 * There is no guarantee it will work with any other version.
	 * Use `executablePath` option with extreme caution.
	 * If Google Chrome (rather than Chromium) is preferred, a {@link https://www.google.com/chrome/browser/canary.html | Chrome Canary} or {@link https://www.chromium.org/getting-involved/dev-channel | Dev Channel} build is suggested.
	 * In `puppeteer.launch([options])`, any mention of Chromium also applies to Chrome.
	 * See {@link https://www.howtogeek.com/202825/what%E2%80%99s-the-difference-between-chromium-and-chrome/ | this article} for a description of the differences between Chromium and Chrome. {@link https://chromium.googlesource.com/chromium/src/+/lkgr/docs/chromium_browser_vs_google_chrome.md | This article} describes some differences for Linux users.
	 *
	 * @param options - Set of configurable options to set on the browser.
	 * @returns Promise which resolves to browser instance.
	 */
	launch(options: PuppeteerLaunchOptions): Promise<Browser> {
		if (options.product) {
			this._productName = options.product;
		}

		return this._launcher.launch(options);
	}

	/**
	 * @remarks
	 *
	 * **NOTE** `puppeteer.executablePath()` is affected by the `PUPPETEER_EXECUTABLE_PATH`
	 * and `PUPPETEER_CHROMIUM_REVISION` environment variables.
	 *
	 * @returns A path where Puppeteer expects to find the bundled browser.
	 * The browser binary might not be there if the download was skipped with
	 * the `PUPPETEER_SKIP_DOWNLOAD` environment variable.
	 */
	executablePath(channel?: string): string {
		return this._launcher.executablePath(channel);
	}

	get _launcher(): ProductLauncher {
		if (
			!this.#lazyLauncher ||
			this.#lazyLauncher.product !== this._productName
		) {
			switch (this._productName) {
				case 'firefox':
					this._preferredRevision = PUPPETEER_REVISIONS.firefox;
					break;
				case 'chrome':
				default:
					this._preferredRevision = PUPPETEER_REVISIONS.chromium;
			}

			// eslint-disable-next-line new-cap
			this.#lazyLauncher = Launcher(this._preferredRevision, this._productName);
		}

		return this.#lazyLauncher;
	}

	/**
	 * The name of the browser that is under automation (`"chrome"` or `"firefox"`)
	 *
	 * @remarks
	 * The product is set by the `PUPPETEER_PRODUCT` environment variable or the `product`
	 * option in `puppeteer.launch([options])` and defaults to `chrome`.
	 * Firefox support is experimental.
	 */
	get product(): string {
		return this._launcher.product;
	}

	/**
	 * @param options - Set of configurable options to specify the settings
	 * of the BrowserFetcher.
	 * @returns A new BrowserFetcher instance.
	 */
	createBrowserFetcher(options: BrowserFetcherOptions): BrowserFetcher {
		return new BrowserFetcher(options);
	}
}
