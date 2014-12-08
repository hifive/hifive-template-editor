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
	var TEXT_CHANGE_DELAY = 100;

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

	var aceEditorController = {
		/**
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 */
		__name: 'hifive.templateEditor.controller.AceEditorController',

		/**
		 * textChange待機用タイマーID
		 */
		_textChangeDelayTimer: null,

		/**
		 * Aceエディタインスタンス
		 */
		_editor: null,

		createEditor: function(element, mode) {
			var editor = this._editor = ace.edit(element);
			if (mode) {
				this.setMode(mode);
			}
			// イベントのバインド
			editor.on('change', this.own(this._change));
		},
		setMode: function(mode) {
			var session = this._editor.getSession();
			if (mode === 'ejs') {
				// h5-ejs用にカスタマイズ
				session.on('changeMode', function() {
					var mode = session.getMode();
					var m = mode;
					mode.HighlightRules.call(mode.$highlightRules, '(?:\\[%|\\[\\?|{{)',
							'(?:%\\]|\\?\\]|}})');
					mode.$tokenizer = mode.$tokenizer.constructor(mode.$highlightRules.getRules());
				});
			}
			session.setMode('ace/mode/' + mode);
		},
		_change: function() {
			if (this._textChangeDelayTimer) {
				clearTimeout(this._textChangeDelayTimer);
			}
			this._textChangeDelayTimer = setTimeout(this.own(function() {
				this._textChangeDelayTimer = null;
				this.trigger('textChange');
			}), TEXT_CHANGE_DELAY);
		},
		setValue: function(val) {
			this._editor.setValue(val, 1);
		},
		getValue: function() {
			return this._editor.getValue();
		},
		/**
		 * 現在の表示サイズに要素を調整
		 */
		adjustSize: function() {
			this._editor.resize(true);
		},
		focus:function(){
			this._editor.focus();
		}
	};
	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(aceEditorController);

})(jQuery);
