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
	 * ソース(テンプレート)編集コントローラ
	 *
	 * @class
	 * @name hifive.templateEditor.controller.SourceEditorController
	 */
	var sourceEditorController = {
		/**
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 */
		__name: 'hifive.templateEditor.controller.SourceEditorController',

		/**
		 * Aceエディタコントローラ
		 *
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 * @private
		 */
		_aceEditorController: h5.ui.components.aceEditor.controller.AceEditorController,

		/**
		 * コントローラメタ定義
		 *
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 * @private
		 */
		__meta: {
			_aceEditorController: {
				rootElement: '.sourceText'
			}
		},

		/**
		 * 初期化処理
		 *
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 * @private
		 */
		__ready: function() {
			// Aceエディタの設定
			var editor = this._aceEditorController.editor;
			var session = this._aceEditorController.getSession();
			// h5-ejs用にカスタマイズ
			session.on('changeMode', function() {
				var mode = session.getMode();
				var start = '(?:\\[%|\\[\\?|{{)';
				var end = '(?:%\\]|\\?\\]|}})';
				// 開始と終了の区切り文字設定
				mode.HighlightRules.call(mode.$highlightRules, start, end);
				// [%# %]をコメントにする設定と、[%%と%%]([% %]のエスケープ) の設定
				var $rules = mode.$highlightRules.$rules;
				$rules['start'].unshift({
					next: 'ejs-comment',
					token: 'comment.doc',
					regex: '\\[%#'
				}, {
					next: 'start',
					token: 'comment',
					regex: '\\[%%'
				});
				mode.$highlightRules.addRules({
					'ejs-comment': [{
						next: 'start',
						token: 'comment.doc',
						regex: '([^%]|^)%\\]'
					}, {
						defaultToken: 'comment.doc'
					}]
				});
				mode.$tokenizer = mode.$tokenizer.constructor(mode.$highlightRules.getRules());
			});
			// ejsモードに設定
			this._aceEditorController.setMode('ejs');
			// フォーカス
			editor.focus();
		},

		/**
		 * 文字列をエディタにセットします
		 *
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 * @param {String} text
		 */
		setText: function(text) {
			var converted = text.replace(/\x09/g, '    ').replace(/\x0D/g, '');
			this._aceEditorController.setValue(converted);
			this._aceEditorController.editor.focus();
		},

		/**
		 * エディタに入力された文字列を取得します
		 *
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 * @param {String} text
		 */
		getText: function() {
			return this._aceEditorController.getValue();
		},

		/**
		 * 現在の表示サイズに要素を調整
		 *
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 */
		adjustSize: function() {
			this._aceEditorController.adjustSize();
		},

		/**
		 * エディタにフォーカスする
		 *
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 */
		focus: function() {
			this._aceEditorController.editor.focus();
		}
	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(sourceEditorController);

})(jQuery);
