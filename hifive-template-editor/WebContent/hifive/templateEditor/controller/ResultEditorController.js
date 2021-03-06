/*
 * Copyright (C) 2013-2015 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

(function($) {

	// =========================================================================
	//
	// 外部定義のインクルード
	//
	// =========================================================================


	// =========================================================================
	//
	// スコープ内定数
	//
	// =========================================================================


	// =========================================================================
	//
	// スコープ内静的プロパティ
	//
	// =========================================================================

	// =============================
	// スコープ内静的変数
	// =============================

	// =============================
	// スコープ内静的関数
	// =============================


	// =========================================================================
	//
	// スコープ内クラス
	//
	// =========================================================================

	// =========================================================================
	//
	// メインコード（コントローラ・ロジック等）
	//
	// =========================================================================
	/**
	 * プレビュー画面のコントローラ
	 *
	 * @class
	 * @name hifive.templateEditor.controller.ResultEditorController
	 */
	var resultEditorController = {
		/**
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 */
		__name: 'hifive.templateEditor.controller.ResultEditorController',

		/**
		 * テンプレート適用先
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @private
		 */
		_$target: null,

		/**
		 * jQuery Mobileが読み込まれているとtrue
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @private
		 */
		_hasJQM: null,

		/**
		 * 初期化処理
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @private
		 */
		__ready: function() {
			//TODO: bodyにするとjqm1.3.0でcreateイベントをトリガしたときにエラーが起こる
			this._$target = $('.dummy');
			this._sendMessage({
				type: 'getLibraryPath'
			});
		},

		/**
		 * postMessageを受け取った時のイベントハンドラ。
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @param context
		 */
		'{window} message': function(context) {
			var ev = context.event.originalEvent;
			var data = ev.data;
			if ($.type(data) === 'string') {
				data = h5.u.obj.deserialize(data);
			}

			var myOrigin = location.protocol + '//' + location.host;

			if (ev.origin === myOrigin) {

				switch (data.type) {

				case 'preview':
					this._preview(data);
					break;

				case 'beginLoadLibrary':
					this._beginLoadLibrary(data);
					break;

				case 'changeTarget':
					this._changeTarget(data);
					break;

				default:
					this.log.warn('messageが不正です');
				}

			} else {
				this.log.warn('originが一致していません');
			}
		},

		/**
		 * テンプレートを反映します
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @private
		 * @param data
		 */
		_preview: function(data) {

			// テンプレートを流し込みます
			this._$target.html(data.template);

			// jqmを読み込んでいる場合、要素追加後に初期化処理を促します
			if (this._hasJQM) {
				$('body').trigger('create');
			}

			this._sendMessage({
				type: 'previewComp'
			});
		},


		/**
		 * チェックされたライブラリをロードします
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @private
		 * @param context
		 */
		_beginLoadLibrary: function(data) {
			var path = data.path;
			if ($.type(path) !== 'array') {
				path = [path];
			}

			this._hasJQM = false;
			for (var i = 0, len = path.length; i < len; i++) {
				if (/jqm/.test(path[i].name)) {
					this._hasJQM = true;
					break;
				}
			}

			var jsPaths = [];
			var cssPaths = [];
			for (var i = 0, len = path.length; i < len; i++) {

				// jsファイルのパスを格納
				for (var j = 0, jsLen = path[i]['js'].length; j < jsLen; j++) {
					jsPaths.push(path[i]['js'][j]);
				}

				// cssファイルのパスを格納
				for (var k = 0, cssLen = path[i]['css'].length; k < cssLen; k++) {
					cssPaths.push(path[i]['css'][k]);
				}
			}

			this._loadCSS(cssPaths).then(this.own(function() {
				h5.u.loadScript(jsPaths).then(this.own(function() {
					this._sendMessage({
						type: 'loadLibraryComp'
					});
				}), this.own(function() {
					this._sendMessage({
						type: 'loadLibraryFail'
					});
				}));
			}));
		},


		/**
		 * CSSファイルをロードします
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @private
		 * @param cssPaths
		 * @returns {Promise}
		 */
		_loadCSS: function(cssPaths) {
			var def = h5.async.deferred();
			var numLoaded = 0;

			for (var i = 0, len = cssPaths.length; i < len; i++) {
				var path = cssPaths[i];
				var $head = $('head');
				if ($head.find('link[href="' + path + '"]').length) {
					// 読み込み済みのcssは読み込まない
					continue;
				}

				var css = document.createElement('link');

				$(css).load(function() {
					numLoaded++;
					if (numLoaded === cssPaths.length) {
						def.resolve();
					}
				});

				$(css).error(this.own(function(e) {
					numLoaded++;
					if (numLoaded === cssPaths.length) {
						def.resolve();
					}
					this._sendMessage({
						type: 'loadLibraryFail'
					});
				}));

				$head[0].appendChild(css);
				css.type = 'text/css';
				css.rel = 'stylesheet';
				css.href = cssPaths[i];
			}
			return def.promise();
		},


		/**
		 * テンプレートの適用先を変更し、再描画します
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @private
		 * @param {Object} data
		 */
		_changeTarget: function(data) {
			var temp = this._$target.html();

			// テンプレートで追加されたDOMをセレクタの検索対象から外すため、テンプレートを除去します
			if (this._$target) {
				this._$target.empty();
			}

			var $el;
			var selector = data.selector;

			if (selector === '') {
				$el = $(this.rootElement);
			} else {
				$el = this.$find(selector);
			}

			if ($el.length === 0) {
				// 指定されたセレクタに該当する要素がない
				this._sendMessage({
					type: 'showMessage',
					msg: '指定された要素が見つかりません',
					target: '.template-alert'
				});
				// 除去したテンプレートを戻します
				this._$target.html(temp);
				return;
			}

			// テンプレートの適用先を更新
			this._$target = $el;

			this._sendMessage({
				type: 'applyTemplate'
			});
		},

		/**
		 * postMessageを送ります
		 *
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 * @private
		 * @param {Object} data
		 */
		_sendMessage: function(data) {
			var myOrigin = location.protocol + '//' + location.host;

			parent.postMessage(h5.u.obj.serialize(data), myOrigin);
		}
	};
	h5.core.expose(resultEditorController);
})(jQuery);

// ---Init--- //
$(function() {
	h5.core.controller('body', hifive.templateEditor.controller.ResultEditorController);
});