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
	// var UNDO_BUFFER_SIZE = 25;

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

	var sourceEditorController = {
		/**
		 * @memberOf hifive.templateEditor.controller.SourceEditorController
		 */
		__name: 'hifive.templateEditor.controller.SourceEditorController',

		_aceEditorController: hifive.templateEditor.controller.AceEditorController,

		_textChangeDelayTimer: null,

		__ready: function() {
			// $(this.rootElement).attr('contentEditable', true);

			this._undoBuffer = [];
			this._redoBuffer = [];
			// Ace Editor
			this._aceEditorController.createEditor(this.$find('.sourceText')[0], 'ejs');

			// h5-ejs用にカスタマイズ
			var editor = this._aceEditorController.getAceEditor();
			var session = editor.getSession();
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
			this.focus();
		},

		_sourceText: null,

		_undoBuffer: null,

		_redoBuffer: null,

		_editor: hifive.templateEditor.sourceEditor,

		setText: function(text) {
			var converted = text.replace(/\x09/g, '    ').replace(/\x0D/g, '');
			this._sourceText = converted;
			this._aceEditorController.setText(converted);
			this.focus();
		},

		getText: function() {

			// 改行を考慮するinnerTextを使用
			// var raw = this.rootElement.innerText;
			var raw = this._aceEditorController.getValue();

			// ノード中の空白(&nbsp;)を空白文字に変更
			var text = raw.replace(/\xA0/g, ' ');
			return text;
		},

		getSrcText: function() {
			return this._sourceText;
		},

		getUndoBuffer: function() {
			return this._undoBuffer;
		},

		getRedoBuffer: function() {
			return this._redoBuffer;
		},

		/**
		 * 現在の表示サイズに要素を調整
		 */
		adjustSize: function() {
			this._aceEditorController.adjustSize();
		},

		focus: function() {
			this._aceEditorController.focus();
		}

	// '{rootElement} keydown': function(context) {
	// var ev = context.event.originalEvent;
	// var keyCode = ev.keyCode;
	//
	// var needsPreventDefault = false;
	//
	// switch (keyCode) {
	// case 9:
	// // Chromeの場合、連続する空白文字は強制的に"&nbsp;\x20"の組で表現される。
	// // そのため、getText()時に&nbsp;を通常のスペースに置換して返している
	// hifive.editor.u.execInsertTextCommand(' ');
	// needsPreventDefault = true;
	// break;
	// }
	//
	// if (needsPreventDefault) {
	// context.event.preventDefault();
	// }
	//
	// // 入力される度、内容を保存
	// // this._undoBuffer.push(this.getText());
	// // if (this._undoBuffer.length > UNDO_BUFFER_SIZE) {
	// // this._undoBuffer.shift();
	// // }
	//
	// },

	// '{rootElement} paste': function(context) {
	// var ev = context.event.originalEvent;
	//
	// var raw = ev.clipboardData.getData('Text');
	//
	// var text = raw.replace(/\x09/g, ' ').replace(/\x0D/g, '');
	//
	// hifive.editor.u.execInsertTextCommand(text);
	// context.event.preventDefault();
	// }


	/**
	 * 行番号を追加します（Ch）
	 * <p>
	 * 1度目の行番号の付加時、1行目の文字列のみdivでwrapされていないのでwrapします
	 */
	// addLineNumCh: function() {
	// // <ol>タグがあれば除去します。その子要素は残します
	// var $ol = this.$find('ol');
	// $ol.each(function() {
	// var $children = $(this).children();
	//
	// $(this).after($children);
	//
	// $(this).remove();
	// });
	//
	// var $root = $(this.rootElement);
	//
	// var liTxt = $root.children('li').text();
	// if (liTxt.length === 0) {
	// // <li>でwrapされた要素がなければ1度目の行番号付加
	// // 1行目の文字列を取得してdivでwrapする
	// var $divClone = $root.children('div').clone();
	//
	// var srcTxt = $root.text();
	// var divTxt = $root.children('div').text();// １行目のテキスト
	// var diffTxt = srcTxt.replace(divTxt, '');// テキストの差分
	//
	// var $el = $('<div></div>').text(diffTxt);
	// $el = $('<li></li>').append($el);
	//
	// $root.text('');
	//
	// $root.append($el);
	// $divClone.each(function() {
	// var $temp = $('<li></li>').append($(this));
	// $root.append($temp);
	// });
	//
	// } else {
	// var $div = $root.children('div');
	//
	// $div.each(function() {
	// $(this).wrap('<li></li>');
	// });
	// }
	//
	// $root.children().wrapAll('<ol></ol>');
	// },
	/**
	 * 行番号を追加します(FF)
	 */
	// addLineNumFF: function() {
	// // <ol>タグがあれば除去します。その子要素は残します
	// var $ol = this.$find('ol');
	// $ol.each(function() {
	// var $children = $(this).children();
	//
	// $(this).after($children);
	//
	// $(this).remove();
	// });
	//
	// var $root = $(this.rootElement);
	//
	// var $li = $root.children('li');
	// if ($li.length === 0) {
	// // 行番号の付加が初回の時の処理
	// var html = $root.html();
	// var rows = html.split('<br>');
	//
	// var retHtml = '';
	// for (var i = 0, len = rows.length; i < len; i++) {
	// retHtml = retHtml + '<li>' + rows[i] + '<br /></li>';
	// }
	//
	// $root.html(retHtml);
	//
	// } else {
	// var $p = $root.children('p');
	//
	// $p.each(function() {
	// var html = $(this).html();
	// var row = html.split('<br>');
	//
	// var $li = $('<li>' + row[0] + '</li>');
	//
	// $(this).after($li);
	// $(this).remove();
	// });
	// }
	//
	// $root.children().wrapAll('<ol></ol>');
	// },
	/**
	 * 行番号を追加します(IE8-11)
	 */
	// addLineNumIE: function() {
	// // <ol>タグがあれば除去します。その子要素は残します
	// var $ol = this.$find('ol');
	// $ol.each(function() {
	// var $children = $(this).children();
	//
	// $(this).after($children);
	//
	// $(this).remove();
	// });
	//
	// var $root = $(this.rootElement);
	//
	// var $p = $root.children('p');
	//
	// $p.each(function() {
	// var html = $(this).html();
	// var rows = html.split('<br>');
	//
	// for (var i = 0, len = rows.length; i < len; i++) {
	// $(this).append('<li><p>' + rows[i] + '</p></li>');
	// }
	//
	// var $li = $(this).children('li');
	// $(this).after($li);
	//
	// $(this).remove();
	// });
	//
	// $root.children().wrapAll('<ol></ol>');
	// }
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
