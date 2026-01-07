import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true, // This allows Vite to be accessible on your local network
		allowedHosts: [
		  "skaldak.home.simcic.at"
		]
	  }
});
