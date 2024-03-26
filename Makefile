dependencies:
	npm install -D

docsy: dependencies
	git submodule update --init --recursive
	cd themes/docsy/ && npm install

serve: docsy
	hugo server \
		--buildDrafts \
		--buildFuture \
		--disableFastRender

production-build: docsy
	hugo \
		--minify

preview-build: docsy
	hugo \
		--baseURL $(DEPLOY_PRIME_URL) \
		--buildDrafts \
		--buildFuture \
		--minify

open:
	open https://dexidp.netlify.com
