yarn:
	yarn

serve: 
	yarn
	hugo server \
		--buildDrafts \
		--buildFuture \
		--disableFastRender

production-build:
	hugo \
		--minify

preview-build:
	hugo \
		--baseURL $(DEPLOY_PRIME_URL) \
		--buildDrafts \
		--buildFuture \
		--minify

open:
	open https://dexidp.netlify.com
