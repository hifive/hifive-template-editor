(function() {

	var getFocusedPageController = hifive.editor.u.getFocusedPageController;


	/**
	 * @class hifive.templateEditor.controller.CSSEditorController
	 */
	var CSSEditorController = {
		__name: 'hifive.templateEditor.controller.CSSEditorController',

		__ready: function() {
		// CSSライブ編集用のテキストボックス表示。
		// TODO とりあえず動作確認用でhtmlに直接書いて仮置きしている


		},

		'{#editCSSPanel .apply} click': function(context, $target) {
			this._applyCss(this.$find('#styleDef').val());
		},

		'{#styleDef} keydown': function(context, $target) {
			var that = this;

			h5.ext.u.execSlippery('CSSEditor_keydown', function() {
				that._applyCss($target.val());
			}, 200);
		},

		_applyCss: function(str) {
			try {
				var pageController = getFocusedPageController();
				if (pageController) {
					pageController.setCustomCss(str);
				}
			}
			catch (e) {
				// エラーメッセージの表示
				this.view.update($('#cssErrorMessage'), 'tmp-cssErrorMessage', e);
				return;
			}
			// エラーメッセージの消去
			$('#cssErrorMessage').html('');
		},

		setCustomCss: function(cssText) {
			// パースに失敗すると例外が発生する
			var parseObj = hifive.editor.u.parseCSS(cssText);
			this._applyCSS(parseObj);

			this._lastValidCustomCssText = cssText;

			this._triggerPageContentsChange();
		},

		_applyCSS: function(cssObjArray) {
			var stylesheet = this._customStylesheet;

			if (!stylesheet) {
				// styleSheetがセットされていない(=ページロードされていない)
				// なら何もしない
				return;
			}
			// 現在適用中のスタイルを削除
			for (var i = (stylesheet.rules || stylesheet.cssRules).length - 1; i >= 0; i--) {
				stylesheet.deleteRule ? stylesheet.deleteRule(i) : stylesheet.removeRule(i);
			}

			for (var i = 0, l = cssObjArray.length; i < l; i++) {
				var cssObj = cssObjArray[i];
				var selector = cssObj.selector;
				var definitions = cssObj.definitions;
				var defStr;
				if (typeof definitions === 'string') {
					defStr = definitions;
				} else {
					defStr = '';
					for (var j = 0, len = definitions.length; j < len; j++) {
						var propValObj = definitions[j];
						defStr += propValObj.key + ':' + propValObj.value + ';';
					}
				}

				if (stylesheet.insertRule) {
					if (cssObj.isNoBracketDesc) {
						stylesheet.insertRule(selector + ' ' + defStr, stylesheet.length);
					} else {
						stylesheet.insertRule(selector + '{' + defStr + '}', stylesheet.length);
					}
				} else {
					stylesheet.addRule(selector, defStr);
				}
			}

			this._triggerPageViewChange();
		}


	};

	h5.core.expose(CSSEditorController);

})();
