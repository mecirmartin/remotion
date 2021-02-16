import {OutputFormat} from 'remotion';

export type FrameFormat = 'png' | 'jpeg';

export const getFrameFormat = (format: OutputFormat): FrameFormat => {
	if (format === 'mp4' || format === 'webm-v8' || format === 'webm-v9') {
		return 'jpeg';
	}
	if (format === 'png-sequence') {
		return 'png';
	}
	throw new Error('Unrecognized render mode ' + format);
};
