import { IStaticMethods } from 'preline/src/static/interfaces';

interface HSStaticMethods {
	autoInit: () => void;
}

declare global {
	interface Window {
		HSStaticMethods: IStaticMethods;
	}
}