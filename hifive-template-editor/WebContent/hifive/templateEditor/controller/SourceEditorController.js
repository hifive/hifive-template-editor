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
	var UNDO_BUFFER_SIZE = 25;

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

		__init: function() {
			$(this.rootElement).attr('contentEditable', true);

			this._undoBuffer = [];
			this._redoBuffer = [];
		},

		_sourceText: null,

		_undoBuffer: null,

		_redoBuffer: null,


		setText: function(text) {
			var converted = text.replace(/\x09/g, '    ').replace(/\x0D/g, '');

			$(this.rootElement).text('').focus();

			this._sourceText = converted;

			hifive.editor.u.execInsertTextCommand(converted);
		},

		getText: function() {

			// 改行を考慮するinnerTextを使用
			var raw = this.rootElement.innerText;

			if (raw === undefined) {
				// innerTextのない場合(Firefox)、textNodeのtextContentを取得し、<br>を改行にする
				raw = '';
				var $rootClone = $(this.rootElement).clone();

				// <ol>タグがあれば除去します。その子要素は残します
				var $ol = $rootClone.children('ol');
				$ol.each(function() {
					var $children = $(this).children();

					$(this).after($children);

					$(this).remove();
				});

				// $rootの各子要素からテキストを取得します
				$rootClone.contents().each(function() {

					if (this.nodeType === 3) {
						raw += this.textContent;//テキストノードならばテキストを取得します

					} else if (this.nodeName === 'BR') {
						raw += '\n';

					} else {
						// <li>や<p>ならばその子要素を見ます
						$(this).contents().each(function() {
							if (this.nodeType === 3) {
								raw += this.textContent;

							} else if (this.nodeName === 'BR') {
								raw += '\n';
							}
						});
					}

				});
			}

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

			// 入力される度、内容を保存
			// this._undoBuffer.push(this.getText());
			// if (this._undoBuffer.length > UNDO_BUFFER_SIZE) {
			// this._undoBuffer.shift();
			// }

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
		},


		/**
		 * 行番号を追加します（Ch）
		 * <p>
		 * 1度目の行番号の付加時、1行目の文字列のみdivでwrapされていないのでwrapします
		 */
		addLineNumCh: function() {
			// <ol>タグがあれば除去します。その子要素は残します
			var $ol = this.$find('ol');
			$ol.each(function() {
				var $children = $(this).children();

				$(this).after($children);

				$(this).remove();
			});

			var $root = $(this.rootElement);

			var liTxt = $root.children('li').text();
			if (liTxt.length === 0) {
				// <li>でwrapされた要素がなければ1度目の行番号付加
				// 1行目の文字列を取得してdivでwrapする
				var $divClone = $root.children('div').clone();

				var srcTxt = $root.text();
				var divTxt = $root.children('div').text();// １行目のテキスト
				var diffTxt = srcTxt.replace(divTxt, '');// テキストの差分

				var $el = $('<div></div>').text(diffTxt);
				$el = $('<li></li>').append($el);

				$root.text('');

				$root.append($el);
				$divClone.each(function() {
					var $temp = $('<li></li>').append($(this));
					$root.append($temp);
				});

			} else {
				var $div = $root.children('div');

				$div.each(function() {
					$(this).wrap('<li></li>');
				});
			}

			$root.children().wrapAll('<ol></ol>');
		},


		/**
		 * 行番号を追加します(FF)
		 */
		addLineNumFF: function() {
			// <ol>タグがあれば除去します。その子要素は残します
			var $ol = this.$find('ol');
			$ol.each(function() {
				var $children = $(this).children();

				$(this).after($children);

				$(this).remove();
			});

			var $root = $(this.rootElement);

			var $li = $root.children('li');
			if ($li.length === 0) {
				// 行番号の付加が初回の時の処理
				var html = $root.html();
				var rows = html.split('<br>');

				var retHtml = '';
				for (var i = 0, len = rows.length; i < len; i++) {
					retHtml = retHtml + '<li>' + rows[i] + '<br /></li>';
				}

				$root.html(retHtml);

			} else {
				var $p = $root.children('p');

				$p.each(function() {
					var html = $(this).html();
					var row = html.split('<br>');

					var $li = $('<li>' + row[0] + '</li>');

					$(this).after($li);
					$(this).remove();
				});
			}

			$root.children().wrapAll('<ol></ol>');
		},


		/**
		 * 行番号を追加します(IE8-11)
		 */
		addLineNumIE: function() {
			// <ol>タグがあれば除去します。その子要素は残します
			var $ol = this.$find('ol');
			$ol.each(function() {
				var $children = $(this).children();

				$(this).after($children);

				$(this).remove();
			});

			var $root = $(this.rootElement);

			var $p = $root.children('p');

			$p.each(function() {
				var html = $(this).html();
				var rows = html.split('<br>');

				for (var i = 0, len = rows.length; i < len; i++) {
					$(this).append('<li><p>' + rows[i] + '</p></li>');
				}

				var $li = $(this).children('li');
				$(this).after($li);

				$(this).remove();
			});

			$root.children().wrapAll('<ol></ol>');
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
