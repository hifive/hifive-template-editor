/*
 * Copyright (C) 2013-2014 NS Solutions Corporation
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
 *
 */

(function($) {

	// =========================================================================
	//
	// 外部定義のインクルード
	//
	// =========================================================================

	// TODO 別ファイルで定義されている定数・変数・関数等を別の名前で使用する場合にここに記述します。
	// 例：var getDeferred = h5.async.deferred;

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

	// TODO このスコープで共有される変数（クラス変数）を記述します。
	// 例：var globalCounter = 0;

	// var DEFAULT_TARGET = parent.$(window);

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


	var resultEditorController = {

		/**
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 */
		__name: 'hifive.templateEditor.controller.ResultEditorController',

		_applyTarget: null,// テンプレート適用先

		_hasJQM: null,// jQuery Mobile 1.3.0が読み込まれているとtrue

		__ready: function() {
			this._applyTarget = $('.templateApplicationRoot')[0];

			this._sendMessage({
				eventName: 'applyLibrary'
			});
		},


		/**
		 * postMessageを受け取った時のイベントハンドラ。
		 *
		 * @param context
		 */
		'{window} message': function(context) {
			var ev = context.event.originalEvent;
			var myOrigin = location.protocol + '//' + location.host;

			if (ev.origin === myOrigin) {

				// TODO:eventNameはデバッグでのみ使用している。後で消すこと
				this.log.debug('result.jsで「' + ev.data.eventName + '」イベントをトリガする');

				var type = $.type(ev.data.data);

				if (type === 'array') {
					// ライブラリが渡された場合
					this._beginLoadLibrary(ev.data.data);

				} else if (type === 'string') {
					// プレビューするデータが渡された場合
					this._preview(ev.data.data);
				}

			} else {
				this.log.warn('originが一致していません');
			}
		},


		/**
		 * テンプレートを反映します
		 *
		 * @param data
		 */
		_preview: function(data) {
			this._applyTarget.innerHTML = data;

			if (this._hasJQM) {
				$('body').trigger('create');
			}

			this._sendMessage({
				eventName: 'applyTemplateComp'
			});
		},


		/**
		 * チェックされたライブラリをロードします
		 *
		 * @param context
		 */
		_beginLoadLibrary: function(path) {

			if ($.type(path) !== 'array') {
				path = [path];
			}

			this._hasJQM = false;
			for (var i = 0, len = path.length; i < len; i++) {
				if (path[i].name === 'jQuery Mobile 1.3.0') {
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

			var loadJS = h5.u.loadScript(jsPaths);

			// js,cssをロードします
			h5.async.when(loadJS, this._loadCSS(cssPaths)).done(this.own(function() {
				this.log.debug('result.jsで「beginLoadLibrary」イベント ロードできた');

				this._sendMessage({
					eventName: 'loadLibraryComp'
				});
			}));
		},


		/**
		 * CSSファイルをロードします
		 *
		 * @param cssPaths
		 * @returns
		 */
		_loadCSS: function(cssPaths) {
			var def = h5.async.deferred();
			for (var i = 0, len = cssPaths.length; i < len; i++) {
				var css = document.createElement('link');
				css.href = cssPaths[i];
				css.type = 'text/css';
				css.rel = 'stylesheet';
				css.media = 'screen';
				$('head')[0].appendChild(css);
				def.resolve();
			}
			return def;
		},


		/**
		 * postMessageを送ります
		 *
		 * @param data
		 */
		_sendMessage: function(data) {
			var myOrigin = location.protocol + '//' + location.host;

			parent.postMessage(data, myOrigin);
		}

	};

	h5.core.expose(resultEditorController);

})(jQuery);

// ---Init--- //
$(function() {
	h5.core.controller('body', hifive.templateEditor.controller.ResultEditorController);
});