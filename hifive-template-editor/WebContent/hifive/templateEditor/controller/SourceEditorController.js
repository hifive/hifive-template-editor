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

	var sourceEditorController = {
		/**
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 */
		__name: 'hifive.templateEditor.controller.SourceEditorController',

		__init: function() {
			$(this.rootElement).attr('contentEditable', true);
		},

		setText: function(text) {
			var converted = text.replace(/\x09/g, '    ').replace(/\x0D/g, '');

			$(this.rootElement).text('').focus();

			hifive.editor.u.execInsertTextCommand(converted);
		},

		getText: function() {
			// 改行を考慮するinnerTextを使用
			var raw = this.rootElement.innerText;
			if (raw === undefined) {
				// innerTextのない場合(Firefox)、textNodeのtextContentを取得し、<br>を改行にする
				raw = '';
				$(this.rootElement).contents().each(function() {
					if (this.nodeType === 3) {
						raw += this.textContent;
						return;
					} else if (this.nodeName === 'BR') {
						raw += '\n';
					}
				});
			}

			// ノード中の空白(&nbsp;)を空白文字に変更
			var text = raw.replace(/\xA0/g, ' ');
			return text;
		},

		'{rootElement} keydown': function(context) {
			var ev = context.event.originalEvent;
			var keyCode = ev.keyCode;

			var needsPreventDefault = false;

			switch (keyCode) {
			case 9:
				// Chromeの場合、連続する空白文字は強制的に"&nbsp;\x20"の組で表現される。
				// そのため、getText()時に&nbsp;を通常のスペースに置換して返している
				hifive.editor.u.execInsertTextCommand('    ');
				needsPreventDefault = true;
				break;
			}

			if (needsPreventDefault) {
				context.event.preventDefault();
			}

		},

		'{rootElement} keyup': function() {
			this.trigger('textChange');

		},

		'{rootElement} paste': function(context) {
			var ev = context.event.originalEvent;

			var raw = ev.clipboardData.getData('Text');

			var text = raw.replace(/\x09/g, '    ').replace(/\x0D/g, '');

			hifive.editor.u.execInsertTextCommand(text);
			context.event.preventDefault();
		}

	// コピー時にSpace -> Tab変換する、等
	// '{rootElement} copy': function(context) {
	// var ev = context.event.originalEvent;
	// }
	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(sourceEditorController);

})(jQuery);
