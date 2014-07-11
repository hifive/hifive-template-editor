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
	var resultEditorController = {

		/**
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 */
		__name: 'hifive.templateEditor.controller.ResultEditorController',

		_parentWindow: null,// postMessageを送ったwindowオブジェクトへの参照


		__ready: function() {
			var that = this;
			$(window).bind('message', function(e) {
				var ev = e.originalEvent;

				if (!that._parentWindow) {
					that._parentWindow = ev.source;
				}

				var myOrigin = location.protocol + '//' + location.host;
				if (ev.origin === myOrigin) {

					console.log('result.jsで「' + ev.data.eventName + '」イベントをトリガする');
					$(that.rootElement).trigger(ev.data.eventName, ev.data.data);
					// $('body').trigger(ev.data.eventName, ev.data.data);

				} else {
					console.log('originが一致していない');
				}
			});
		},


		/**
		 * テンプレートを反映します
		 *
		 * @param data
		 */
		'{rootElement} preview': function(context) {
			this.$find('.templateApplicationRoot')[0].innerHTML = context.evArg;
		},


		/**
		 * チェックされたライブラリをロードします
		 *
		 * @param context
		 */
		'{rootElement} beginLoadLibrary': function(context) {
			// TODO:この時点でpathがない(ライブラリが選択されていない)ケースは除外されているはず
			var path = context.evArg;

			// TODO:選択ライブラリが1つの場合、型がobjectになっている
			if ($.type(path) !== 'array') {
				path = [path];
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
				console.log('result.jsで「beginLoadLibrary」イベント ロードできた');
				var data = {
					eventName: 'loadLibraryComp'
				};
				this._sendMessage(data);
				// parent.$('#ejsEditorRoot').trigger('loadLibraryComp');
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
			this._parentWindow.postMessage(data, myOrigin);
		},


		/**
		 * postMessageを受け取ったときに呼ばれる関数です。渡されたイベント名をトリガします。
		 *
		 * @param e
		 */
		// _receiveMessage: function(e) {
		// var myOrigin = location.protocol + '//' + location.host;
		// if (e.origin === myOrigin) {
		//
		// console.log('result.jsで「' + e.data.eventName + '」イベントをトリガする');
		// this.$find(this.rootElement).trigger(e.data.eventName, e.data.data);
		// // $('body').trigger(e.data.eventName, e.data.data);
		//
		// } else {
		// console.log('originが一致していない');
		// }
		// }
		_testFunc: function() {
			console.log('test func');
		}
	};

	h5.core.expose(resultEditorController);

})(jQuery);

// ---Init--- //
$(function() {
	h5.core.controller('body', hifive.templateEditor.controller.ResultEditorController);
});