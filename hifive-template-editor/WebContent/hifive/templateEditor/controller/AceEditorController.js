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

	// =========================================================================
	//
	// スコープ内定数
	//
	// =========================================================================
	/** エディタの入力内容が変更された時に上げるイベント名 */
	var EVENT_TEXT_CHANGE = 'textChange';

	/** EVENT_TEXT_CHANGEイベントを遅延させる時間(ms) */
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

	/**
	 * Aceエディタを扱うコントローラ
	 *
	 * @class
	 * @name hifive.templateEditor.controller.AceEditorController
	 */
	var aceEditorController = {
		/**
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 */
		__name: 'hifive.templateEditor.controller.AceEditorController',

		/**
		 * textChange待機用タイマーID
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 */
		_textChangeDelayTimer: null,

		/**
		 * Aceエディタインスタンス
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 */
		_editor: null,

		/**
		 * Aceエディタを作成する
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 */
		createEditor: function(element, mode) {
			var editor = this._editor = ace.edit(element);
			if (mode) {
				this.setMode(mode);
			}
			// イベントのバインド
			editor.on('change', this.own(this._change));
		},

		/**
		 * Aceエディタインスタンスの取得
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 * @returns {Editor}
		 */
		getAceEditor: function() {
			return this._editor;
		},

		/**
		 * エディタのモードを設定('html','js','ejs'など)
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 * @param {String} mode
		 */
		setMode: function(mode) {
			this._editor.getSession().setMode('ace/mode/' + mode);
		},

		/**
		 * エディタに文字列を入力する
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 * @param {String} val
		 */
		setValue: function(val) {
			this._editor.setValue(val, 1);
		},

		/**
		 * エディタに入力された文字列を取得
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 * @returns {String}
		 */
		getValue: function() {
			return this._editor.getValue();
		},

		/**
		 * 現在の表示サイズに要素を調整
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 */
		adjustSize: function() {
			this._editor.resize(true);
		},

		/**
		 * エディタにフォーカスを合わせる
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 */
		focus: function() {
			this._editor.focus();
		},

		/**
		 * エディタの内容が変更された時のハンドラ(createEditor時にイベントハンドリングする関数)
		 * <p>
		 * 変更時にこのコントローラからtextChangeイベントをあげる
		 * </p>
		 *
		 * @memberOf hifive.templateEditor.controller.AceEditorController
		 * @private
		 */
		_change: function() {
			// textChangeイベントを遅延させてあげる
			// (setValue時やペースト時にエディタのchangeイベントが連続して発生するため)
			if (this._textChangeDelayTimer) {
				clearTimeout(this._textChangeDelayTimer);
			}
			this._textChangeDelayTimer = setTimeout(this.own(function() {
				this._textChangeDelayTimer = null;
				this.trigger(EVENT_TEXT_CHANGE);
			}), TEXT_CHANGE_DELAY);
		}
	};
	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================
	h5.core.expose(aceEditorController);
})(jQuery);
