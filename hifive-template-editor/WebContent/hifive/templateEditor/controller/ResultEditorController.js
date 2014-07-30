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
			this._applyTarget = $('.preview')[0];

			this._sendMessage({
				type: 'applyLibrary'
			});
		},


		/**
		 * postMessageを受け取った時のイベントハンドラ。
		 *
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
		 * @param data
		 */
		_preview: function(data) {

			if (!this._applyTarget) {
				// TODO: エラーメッセージ
				this.log.debug('error');
				return;
			}

			this._applyTarget.innerHTML = data.template;

			// jqmを読み込んでいる場合、要素追加後に初期化処理を促します
			if (this._hasJQM) {
				$('body').trigger('create');
			}

			this._sendMessage({
				type: 'applyTemplateComp'
			});
		},


		/**
		 * チェックされたライブラリをロードします
		 *
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

			var loadJS = h5.u.loadScript(jsPaths);

			// js,cssをロードします
			h5.async.when(loadJS, this._loadCSS(cssPaths)).done(this.own(function() {
				this._sendMessage({
					type: 'loadLibraryComp'
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
		 * テンプレートの適用先を変更し、再描画します
		 *
		 * @param
		 */
		_changeTarget: function(data) {

			// 変更前のテンプレートを除去
			if (this._applyTarget) {
				this._applyTarget.innerHTML = '';
			}

			var el = $(data.selector)[0];
			if (!el) {
				// 指定されたセレクタがない
				var data = {
					type: 'notFoundSelector',
					msg: '指定された要素が見つかりません'
				};

				this._sendMessage(data);
				return;
			}

			// テンプレートの適用先を更新
			this._applyTarget = el;

			var data = {
				type: 'applyTemplate'
			};

			this._sendMessage(data);
		},


		/**
		 * postMessageを送ります
		 *
		 * @param data
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