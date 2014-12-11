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
	 * データ編集部分のコントローラ
	 *
	 * @class
	 * @name hifive.templateEditor.controller.DataEditorController
	 */
	var dataEditorController = {

		/**
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 */
		__name: 'hifive.templateEditor.controller.DataEditorController',

		/**
		 * Aceエディタコントローラ
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 * @private
		 * @type {hifive.templateEditor.controller.AceEditorController}
		 */
		_aceEditorController: hifive.templateEditor.controller.AceEditorController,

		/**
		 * パラメータ編集コントローラ
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 * @private
		 * @type {hifive.templateEditor.controller.ParameterEditController}
		 */
		_parameterEditController: hifive.templateEditor.controller.ParameterEditController,

		/**
		 * コントローラメタ定義
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 * @private
		 */
		__meta: {
			_parameterEditController: {
				rootElement: '.parameter-input'
			}
		},

		/**
		 * 初期化処理
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 * @private
		 */
		__ready: function() {
			// Ace Editor
			this._aceEditorController.createEditor(this.$find('.dataText')[0], 'json');
		},

		/**
		 * パラメータ入力ポップ画面を表示
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 */
		'.data-parameter click': function() {
			$(this._parameterEditController.rootElement).removeClass('hidden');
		},

		/**
		 * 指定されたurlでデータオブジェクトを取得します
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 */
		'.load-data submit': function(context, $el) {
			context.event.preventDefault();
			var url = $.trim($el.find('input').val());
			if (!url) {
				// URLが未入力であればメッセージを表示します
				$(this.rootElement).trigger('showMessage', {
					msg: 'URLを指定してください',
					target: this.$find('.data-alert')
				});
				return;
			}
			// パラメータを取得
			var param = this._parameterEditController.getParameter();

			// 送信方法(GET/POST)を取得
			var type = $('.sendType:checked').val();

			// データを取得
			this.parentController.loadData(url, type, param).then(this.own(function(data) {
				// データをエディタに反映
				this.setTextByObject(data);
				this.focus();

				$(this.rootElement).trigger('showMessage', {
					msg: 'データの取得が完了しました',
					target: this.$find('.data-msg')
				});
			}), this.own(function(xhr, textStatus) {
				// 取得に失敗したらエラーメッセージを表示
				var msg = 'status:' + xhr.status;
				msg += (textStatus === 'parsererror') ? '\nJSONへのパースに失敗しました' : '\nデータの取得に失敗しました';
				$(this.rootElement).trigger('showMessage', {
					msg: msg,
					target: this.$find('.data-alert')
				});
			}));
		},

		/**
		 * エディタに入力された内容をフォーマット
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 */
		'.format-button click': function() {
			var data = this._aceEditorController.getValue();

			try {
				if (!data) {
					data = null;
				} else {
					data = $.parseJSON(data);
				}

				this.setDataText(data);
				this.focus();
			} catch (e) {
				// エラー時は何もしない
			}
		},

		/**
		 * データ入力テキストを取得
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 * @returns {String}
		 */
		getText: function() {
			return this._aceEditorController.getValue();
		},

		/**
		 * データオブジェクトをJSON文字列にしてエディタにセットします
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 * @param {Object} data
		 */
		setTextByObject: function(data) {
			this.setText(JSON.stringify(data, null, '  '));
		},

		/**
		 * 文字列をエディタにセットします。
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 * @param {String} str
		 */
		setText: function(str) {
			this._aceEditorController.setValue(str);
		},

		/**
		 * 現在の表示サイズにエディタのサイズを調整
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 */
		adjustSize: function() {
			this._aceEditorController.adjustSize();
		},

		/**
		 * エディタにフォーカスします
		 *
		 * @memberOf hifive.templateEditor.controller.DataEditorController
		 */
		focus: function() {
			this._aceEditorController.focus();
		}
	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(dataEditorController);

})(jQuery);