import type {GcpRegion} from '../pricing/gcp-regions';

export const DEFAULT_REGION: GcpRegion = 'us-east1';
export const BINARY_NAME = 'remotion cloudrun';

export const REMOTION_BUCKET_PREFIX = 'remotioncloudrun-';
export const RENDER_SERVICE_PREFIX = 'remotion';

export const getSitesKey = (siteId: string) => `sites/${siteId}`;

export const DEFAULT_MAX_RETRIES = 1;

export const inputPropsKey = (hash: string) => {
	return `input-props/${hash}.json`;
};

export type Privacy = 'public' | 'private';
export const DEFAULT_OUTPUT_PRIVACY: Privacy = 'public';

export const permissionsPath =
	'https://storage.googleapis.com/remotion-sa/sa-permissions.json';
