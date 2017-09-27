xpi: common/l10n.js common/Configs.js options/Options.js clean
	zip -q -r -0 reload-on-idle-we.xpi *.json *.js common options _locales

clean:
	rm -f *.xpi

common/l10n.js: extlib
	cp -p ../extlib/webextensions-lib-l10n/l10n.js $@

common/Configs.js: extlib
	cp -p ../extlib/webextensions-lib-configs/Configs.js $@

options/Options.js: extlib
	cp -p ../extlib/webextensions-lib-options/Options.js $@

extlib:
	git submodule update --init

.PHONY: xpi clean extlib
