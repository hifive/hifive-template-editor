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

	// var getComponentCreator = hifive.editor.u.getComponentCreator;

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

	var dataAreaController = {

		/**
		 * @memberOf hifive.templateEditor.controller.dataAreaController
		 */
		__name: 'hifive.templateEditor.controller.DataAreaController',

		__meta: {
			_parameterEditController: {
				rootElement: '.parameter-input'
			}
		},

		_editor: null,

		_parameterEditController: hifive.templateEditor.controller.ParameterEditController,

		__init: function() {

			var editor = this._editor = ace.edit(this.$find('.dataText')[0]);
			editor.getSession().setMode('ace/mode/json');
			h5.u.obj.expose('hifive.templateEditor', {
				dataEditor: editor
			});
			editor.on('change', this.own(this._change));
		},

		/**
		 * パラメータ入力ポップ画面を表示します
		 */
		'.data-parameter click': function() {
			this.$find('.parameter-input').css('display', 'block');
		},


		_change: function() {
			this.trigger('textChange');
		},


		/**
		 * データタブのラジオボタンが切り替わった時、もう一方のラジオボタンも切り替えます
		 *
		 * @param context
		 * @param $el
		 */
		'.sendType change': function(context, $el) {
			var type = $el[0].value;

			this.$find('.sendType[value="' + type + '"]').each(function() {
				$(this).prop('checked', 'checked');
			});
		},


		/**
		 * 指定されたurlでデータオブジェクトを取得します
		 */
		'.load-data submit': function(context, $el) {
			context.event.preventDefault();

			var url = $el.find('input').val();

			if (url === '') {
				// URLが未入力であればメッセージを表示します
				$(this.rootElement).trigger('showMessage', {
					'msg': 'URLを指定してください',
					'$el': this.$find('.data-alert')
				});

				return;
			}

			var param = this._parameterEditController.getParameter();// パラメータを取得します

			var type = null;
			var $elm = $('.sendType');

			// 送信方法を取得(GET/POST)します
			for (var i = 0, len = $elm.length; i < len; i++) {
				if ($($elm[i]).prop('checked')) {
					type = $elm[i].value;
					break;
				}
			}

			// データを取得します
			this.parentController.loadData(url, type, param).then(this.own(function(data) {

				this.setDataText(data);// データをテキストエリアに反映します

				// this.createTemplate();
				$(this.rootElement).trigger('createTemplate');

				$(this.rootElement).trigger('showMessage', {
					'msg': 'データの取得が完了しました',
					'$el': this.$find('.data-msg')
				});

			}), this.own(function(xhr, textStatus) {
				// 取得に失敗したらエラーメッセージを表示します
				var msg = 'status:' + xhr.status;

				msg += (textStatus === 'parsererror') ? '\nJSONへのパースに失敗しました' : '\nデータの取得に失敗しました';

				$(this.rootElement).trigger('showMessage', {
					'msg': msg,
					'$el': this.$find('.data-alert')
				});
			}));
		},


		/**
		 * データオブジェクトをフォーマットします
		 */
		'.format-button click': function() {
			var data = this._editor.getValue();

			try {
				if (!data || data === '') {
					data = null;
				} else {
					data = $.parseJSON(data);
				}

				this.setDataText(data);

			}
			catch (e) {
				$(this.rootElement).trigger('showMessage', {
					'msg': 'JSONのパースに失敗しました\n' + e.stack,
					'$el': this.$find('.data-alert')
				});
			}
		},

		/**
		 * データ入力テキストを取得
		 */
		getText: function() {
			return this._editor.getValue();
		},

		/**
		 * データオブジェクトをテキストエリアに反映します。
		 *
		 * @param json
		 */
		setDataText: function(data) {
			this._editor.setValue(JSON.stringify(data, null, '  '));
		}
	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(dataAreaController);

})(jQuery);