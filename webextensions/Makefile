PACKAGE_NAME = reload-on-idle

NPM_MOD_DIR := $(CURDIR)/node_modules
NPM_BIN_DIR := $(NPM_MOD_DIR)/.bin

.PHONY: xpi install_dependency lint format update_extlib install_extlib clean

all: xpi

install_dependency:
	npm install

lint:
	$(NPM_BIN_DIR)/eslint . --ext=.js --report-unused-disable-directives

format:
	$(NPM_BIN_DIR)/eslint . --ext=.js --report-unused-disable-directives --fix

xpi: update_extlib install_extlib lint clean
	zip -q -r -0 $(PACKAGE_NAME)-we.xpi *.json *.js common options _locales >/dev/null -x '*/.*' 2>/dev/null

clean:
	rm -f *.xpi

update_extlib:
	cd .. && git submodule update --init

install_extlib:
	cp ../extlib/webextensions-lib-configs/Configs.js common/
	cp ../extlib/webextensions-lib-l10n/l10n.js common/
	cp ../extlib/webextensions-lib-options/Options.js options/

