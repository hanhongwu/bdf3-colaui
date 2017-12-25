(function() {
	cola(function(model) {
		var errorCount, login, loginCallback, longPollingTimeOut, showLoginMessage;
		model.describe("menus", {
			provider : {
				url : App.prop("service.menus")
			}
		});
		// model.describe("user", {
		// provider: {
		// url: App.prop("service.user.detail")
		// }
		// });
		model.dataType({
			name : "Login",
			properties : {
				userName : {
					validators : {
						$type : "required",
						message : ""
					}
				},
				password : {
					validators : {
						$type : "required",
						message : ""
					}
				}
			}
		});
		model.describe("login", "Login");
		model.set("login", {});
		model.set("messages", {});
		errorCount = 0;
		longPollingTimeOut = null;
		window.refreshMessage = function() {
			var options;
			options = {};
			if (longPollingTimeOut) {
				clearTimeout(longPollingTimeOut);
			}
			if (App.prop("longPollingTimeout")) {
				options.timeout = App.prop("longPollingTimeout");
			}
			return $.ajax(App.prop("service.messagePull"), options).done(
					function(messages) {
						var i, len, message;
						if (messages) {
							errorCount = 0;
							for (i = 0, len = messages.length; i < len; i++) {
								message = messages[i];
								model.set("messages." + message.type,
										message.content);
							}
						}
						if (App.prop("liveMessage")) {
							return longPollingTimeOut = setTimeout(
									refreshMessage, App
											.prop("longPollingInterval"));
						}
					}).error(
					function(xhr, status, ex) {
						if (App.prop("liveMessage")) {
							if (status === "timeout") {
								return longPollingTimeOut = setTimeout(
										refreshMessage, App
												.prop("longPollingInterval"));
							} else {
								errorCount++;
								return longPollingTimeOut = setTimeout(
										refreshMessage, 5000 * Math.pow(2, Math
												.min(6, errorCount - 1)));
							}
						}
					});
		};
		longPollingTimeOut = setTimeout(refreshMessage, 1000);
		refreshMessage();
		loginCallback = null;
		window.login = function(callback) {
			cola.widget("loginDialog").show();
			if (callback && typeof callback === "function") {
				return loginCallback = callback;
			}
		};
		login = function() {
			var data;
			data = model.get("login");
			cola.widget("containerSignIn").addClass("loading");
			return $.ajax({
				type : "POST",
				url : App.prop("service.login"),
				data : JSON.stringify(data.toJSON()),
				contentType : "application/json"
			}).done(function(result) {
				var callback;
				cola.widget("containerSignIn").removeClass("loading");
				if (!result.type) {
					showMessage(result.message);
					return;
				}
				cola.widget("loginDialog").hide();
				if (loginCallback) {
					callback = loginCallback;
					loginCallback = null;
					return callback();
				}
			}).fail(function() {
				cola.widget("containerSignIn").removeClass("loading");
			});
		};
		model.widgetConfig({
			loginDialog : {
				$type : "dialog",
				width : 400
			},
			subMenuTree : {
				$type : "tree",
				autoExpand : true,
				bind : {
					expression : "menu in subMenu",
					child : {
						recursive : true,
						expression : "menu in menu.children"
					}
				},
				itemClick : function(self, arg) {
					var data, menus;
					data = arg.item.get("data").toJSON();
					menus = data.children;
					if (menus && menus.length > 0) {
						return;
					} else {
						App.open(data.path, data);
						cola.widget("subMenuLayer").hide();
					}
				}
			},
			subMenuLayer : {
				beforeShow : function() {
					return $("#viewTab").parent().addClass("lock");
				},
				beforeHide : function() {
					return $("#viewTab").parent().removeClass("lock");
				}
			}
		});
		showLoginMessage = function(content) {
			return cola.widget("formSignIn").setMessages([ {
				type : "error",
				text : content
			} ]);
		};
		model.action({
			signIn : function() {
				var data;
				cola.widget("formSignIn").setMessages(null);
				data = model.get("login");
				if (data.validate()) {
					return login();
				} else {
					return showLoginMessage("用户名或密码不能为空！");
				}
			},
			dropdownIconVisible : function(item) {
				var menus, result;
				menus = item.get("children");
				result = false;
				if (menus && menus.entityCount > 0) {
					result = true;
				}
				return result;
			},
			showUserSidebar : function() {
				return cola.widget("userSidebar").show();
			},
			menuItemClickParent : function(item) {
				var data = item.toJSON();
				if (data.path && data.path != '') {
					if (!data.children.children) {
						cola.widget("subMenuLayer").hide();
					}
					return App.open(data.path, data);
				}
			},
			menuItemClickChildren : function(item) {
				 var data, i, len, menu, menus, recursive;
				 data = item.toJSON();
				 menus = data.children;
				 recursive = function(d) {
				 	var i, len, ref, results;
				 	if (d.menus && d.menus.length > 0) {
				 		ref = d.menus;
				 		results = [];
				 		for (i = 0, len = ref.length; i < len; i++) {
				 			item = ref[i];
				 			results.push(recursive(item));
				 		}
				 		return results;
				 	} else {
				 		d.menus = null;
				 		return d.hasChild = false;
				 	}
				 };
				 if (menus && menus.length > 0) {
				 	for (i = 0, len = menus.length; i < len; i++) {
				 		menu = menus[i];
				 		recursive(data);
				 	}
				 	model.set("subMenu", menus);
				 	model.set("currentMenu", data);
				 	return cola.widget("subMenuLayer").show();
				 } else {
				 	model.set("subMenu", []);
				 	cola.widget("subMenuLayer").hide();
				 	return App.open(data.path, data);
				 }
			},
			hideSubMenuLayer : function() {
				return cola.widget("subMenuLayer").hide();
			},
			toggleSidebar : function() {
				var $dom, className;
				className = "collapsed";
				$dom = $("#frameworkSidebarBox");
				return $dom.toggleClass(className, !$dom.hasClass(className));
			},
			messageBtnClick : function() {
				var action;
				action = App.prop("message.action");
				if (action && typeof action === "object") {
					App.open(action.path, action);
				}
			},
			taskBtnClick : function() {
				var action;
				action = App.prop("task.action");
				if (action && typeof action === "object") {
					App.open(action.path, action);
				}
			},
			closeTab : function() {
				var keycode = event.keyCode == null ? event.which
						: event.keyCode;
				var viewTab = cola.widget("viewTab");
				if (keycode === 87) { // 快捷键w,关闭当前标签页
					viewTab.removeTab(viewTab.get("currentTab"));
				}
			}
		});
		$("#frameworkSidebar").accordion({
			exclusive : false
		}).delegate(
				".menu-item",
				"click",
				function() {
					$("#frameworkSidebar").find(".menu-item.current-item")
							.removeClass("current-item");
					return $fly(this).addClass("current-item");
				});
		// 菜单提示tip
		tipLabel = function($dom, event) {
			// 当菜单收缩后启用提示功能
			if (!$("#frameworkSidebarBox").hasClass("collapsed"))
				return;
			var _this = $($dom);
			var _parentDom = $($dom).parent();
			var tooltip = $("<div class='just-tooltip'><div class='just-con'>"
					+ _this.text() + "</div>"
					+ "<span class='just-right'></span></div>");
			$("body").append(tooltip);
			var div = $("div.just-tooltip");
			div.css({
				"top" : (_this.offset().top) + "px",
				"left" : (_parentDom.outerWidth() + 10) + "px",
				"opacity" : 0.6
			});
			div.animate({
				left : (_parentDom.outerWidth()) + "px",
				opacity : '0.9'
			}, "normal");
		};

		tipLabelOut = function() {
			$("div.just-tooltip").remove();
		};

		return $("#rightContainer>.layer-dimmer").on("click", function() {
			return cola.widget("subMenuLayer").hide();
		});
	});

	cola.ready(function() {
		var workbench;
		workbench = App.prop("workbench");
		if (workbench) {
			return App.open(workbench.path, workbench);
		}
	});

}).call(this);

// (function () {
// cola(function (model) {
// var errorCount, longPollingTimeOut, service, initSkin;
//
// service = {
// messagePull: messagePullPath,
// messageTotalPull: messageTotalPullPath,
// loadMenus: "./api/menus",
// getLoginUser: "./api/user/detail"
// };
//        
// refreshSkin = function() {
// $("#topMenu").css({
// background: topBarBackground,
// color: topBarColor
// });
// $("#topMenu a.icon.item").css({
// color: topBarColor
// }).hover(function() {
// $(this).css({
// background: topBarHoverBackground,
// color: topBarHoverColor
// });
// }, function() {
// $(this).css({
// background: "",
// color: topBarColor
// });
// });
//        	
// $("#logo").css({
// background: topLeftCornerBackground,
// color: topLeftCornerColor
// }).hover(function() {
// $(this).css({
// background: topLeftCornerHoverBackground,
// color: topLeftCornerHoverColor
// });
// }, function() {
// $(this).css({
// background: topLeftCornerBackground,
// color: topLeftCornerColor
// });
// });
//        	
// $("#menu").css({
// background: leftBarBackground
// });
//        	
// $("#menu > .item > .search.icon").css({
// color: menuSearchColor
// }).hover(function() {
// $(this).css({
// color: menuSearchHoverColor
// });
// }, function() {
// $(this).css({
// color: menuSearchColor
// });
// });
//        	
// $("#userCenter").css({
// background: userCenterBackground
// })
// };
//        
// refreshSkin();
//
// model.set("searching", false);
// model.describe("menus", {
// provider: {
// url: service.loadMenus
// }
// });
//
// model.describe("loginUser", {
// provider: {
// url: service.getLoginUser,
// success: function() {
// model.set("applicationName", model.get("loginUser.organization.name") ||
// applicationName);
// }
// }
// });
//
// model.get("menus", function(menus) {
// var urls, parseMenus, temp, children, path, current;
// urls = [];
// if (window.location.hash) {
// path = window.location.hash.substring(1);
// }
// parseMenus = function(menus, level) {
// if (menus) {
// menus.each(function(menu) {
// temp = menu.toJSON({simpleValue: true});
// temp.level = level;
// temp.hasChild = false;
// urls.push(temp);
// children = menu.get("children");
// if (path === menu.get("path") && !current) {
// current = menu;
// }
// if (children && children.entityCount > 0) {
// temp.hasChild = true;
// menu.set("hasChild", true);
// parseMenus(menu.get("children"), level + 1);
// }
// });
// }
// };
// parseMenus(menus, 0);
// model.set("allUrls", urls);
// model.set("urls", urls);
// model.action("expandAndOpenPage")(current || path);
//
// if ($.cookie('switchBarExpand') === "true") {
// model.action("switchBar")();
// }
// });
//
// window.onpopstate = function() {
// if (window.location.hash) {
// path = window.location.hash.substring(1);
// if (model.get("currentUrl.path") !== path) {
// model.action("expandAndOpenPage")(path);
// }
// }
// };
//
//
// model.action({
// openMe: function() {
// model.action("expandAndOpenPage")("me");
// },
// openUserCenter: function() {
// $("#userCenter").sidebar("toggle");
// },
// searchUrl: function () {
// var searchKey, result, name, desc, url;
// searchKey = model.get("searchUrlKey");
// model.set("urls", []);
// result = model.get("urls");
// model.get("allUrls", function(urls) {
// var processUrls = function(urls) {
// if (!urls) return;
// urls.each(function(u) {
// name = u.get("name");
// desc = u.get("description");
// if (name && name.indexOf(searchKey) !== -1) {
// url = result.insert(u.toJSON({
// simpleValue: true
// }));
// }
// });
// };
// if (searchKey) {
// model.set("searching", true);
// processUrls(urls);
// } else {
// model.set("searching", false);
// model.set("urls", model.get("allUrls").toJSON());
// }
// });
//
// },
// showMenuBar: function() {
// var menu, width, switchBar;
// menu = $("#menuWrapper");
// switchBar = $("#switchBar .icon");
// if (switchBar.hasClass("rotated")) {
// width = "184px";
// } else {
// width ="54px";
// }
// if (menu.width() === 0) {
// menu.animate({width: "+=" + width}, "fast");
// $("#main").animate({
// "padding-left": width
// }, "fast");
// } else {
// menu.animate({width: "-=" + width}, "fast");
// $("#main").animate({
// "padding-left": "0px"
// }, "fast");
// }
// },
// switchBar: function() {
// var switchBar, menu;
// switchBar = $("#switchBar .icon");
// menu = $("#menuWrapper");
// if (menu.width() === 0) return;
// if (switchBar.hasClass("rotated")) {
// switchBar.removeClass("rotated");
// menu.animate({width: "-=130px"}, "fast");
// switchBar.parent().removeClass("expand").animate({width: "54px"}, "fast");
// $("#main").animate({
// "padding-left": "54px"
// }, "fast");
// $.cookie('switchBarExpand', false, { expires: 10000000 });
// } else {
// switchBar.addClass("rotated");
// menu.animate({width: "+=130px"}, "fast");
// switchBar.parent().addClass("expand").animate({width: "184px"}, "fast");
// $("#main").animate({
// "padding-left": "184px"
// }, "fast");
// $.cookie('switchBarExpand', true, { expires: 10000000 });
// }
// },
// refreshPage: function() {
// var url, iframe;
// url = model.get("currentUrl");
// if (url && url.get("path")) {
// iframe = $("#url_" + url.get("id"));
// iframe.attr("src", url.get("path"));
// }
// },
// expandAndOpenPage: function(current) {
// var expandPath;
// if (!current) return;
// if (typeof current === "string") {
// model.get("urls").each(function(url) {
// if (url.get("path") === current || url.get("name") === current) {
// current = url;
// return false;
// }
// });
// }
// if (current instanceof cola.Entity) {
// expandPath = function(url) {
// if (url && url.parent.parent.parent) {
// expandPath(url.parent.parent);
// }
// model.action("expandChildren")(url);
// };
// expandPath(current);
// model.action("openPage")(current);
// } else {
// model.action("openPage")(current);
// }
//
// },
// openPage: function(url) {
// var iframe, active;
// if (!url) return;
// if (typeof url === "string") {
// url = {
// id: "temp_" + new Date().getTime(),
// name: "当前",
// path: url
// };
// }
// model.set("currentUrl", url);
// url = model.get("currentUrl");
// if (url.get("path")) {
// iframe = $("#url_" + url.get("id"));
// active = $("#main > .active");
//
// if (iframe.length > 0) {
// if (active.attr("id") !== iframe.attr("id")) {
// active.removeClass("active").hide();
// iframe.addClass("active").show();
// }
//
// } else {
// active.removeClass("active").hide();
// iframe = $('<iframe class="active" allowtransparency="true" frameborder="0"
// scrolling="0" width="100%" height="100%"></iframe>')
// .prop({
// src: url.get("path"),
// id: "url_" + url.get("id")
//
// });
//
// iframe.appendTo("#main");
// }
// }
// $("#menu > .item.active").removeClass("active");
// $("#menu > .item[my-id='"+ url.get("id") +"']").addClass("active");
// if (url.get("path")) {
// window.location.hash = "#" + url.get("path");
// }
// },
// menuItemClick: function(url) {
// model.action("openPage")(url);
// model.action("toggleChildren")(url);
//
// },
// expandChildren: function(url) {
// var icon, current;
// current = $("#menu > .item[my-id='"+ url.get("id") +"']");
// icon = current.find(".icon");
// if (!icon.hasClass("rotated")) {
// model.action("toggleChildren")(url);
// }
//
// },
// toggleChildren: function(url) {
// var findChildren, children, urlId, current, icon;
// children = [];
// current = $("#menu > .item[my-id='"+ url.get("id") +"']");
//
// if (url.get("hasChild")) {
// findChildren = function($url) {
// urlId = $url.attr("my-id");
// $("#menu > .item[parent-id='"+ urlId +"']").each(function() {
// children.push(this);
// if ($(this).is(":has(.rotated)")) {
// findChildren($(this));
// }
// });
//
// };
// icon = current.find(".icon");
// findChildren(current);
// if (icon.hasClass("rotated")) {
// $(children).transition({
// animation : 'scale',
// interval : 50
// });
// icon.removeClass("rotated");
// } else {
// $(children).transition({
// animation : 'pulse',
// reverse : "auto",
// interval : 50,
// displayType: "block"
// });
// icon.addClass("rotated");
// }
//
//
// }
// },
// parseTime: function (time) {
// var result;
// var minute = 1000 * 60;
// var hour = minute * 60;
// var day = hour * 24;
// var week = day * 7;
// var month = day * 30;
// var year = day * 365;
//
// var now = new Date().getTime();
// var diffValue = now - time;
//
// var yearC = diffValue / year;
// var monthC = diffValue / month;
// var weekC = diffValue / week;
// var dayC = diffValue / day;
// var hourC = diffValue / hour;
// var minC = diffValue / minute;
// if (yearC >= 1) {
// result = model.action("formatDate")(time, "yyyy-MM-dd hh:mm");
// } else if (monthC >= 6) {
// result = model.action("formatDate")(time, "MM-dd hh:mm");
// } else if (monthC >= 1) {
// result = Math.floor(monthC) + "个月前";
// } else if (weekC >= 1) {
// result = Math.floor(weekC) + "周前";
// } else if (dayC >= 1) {
// result = Math.floor(dayC) + "天前";
// } else if (hourC >= 1) {
// result = Math.floor(hourC) + "个小时前";
// } else if (minC >= 1) {
// result = Math.floor(minC) + "分钟前";
// } else {
// result = "刚刚";
// }
// return result;
//
// },
// getContentText: function(message) {
// var title = message.get("title") || message.get("content");
// return $("<p>" + title + "</p>").text().replace(/\s+/g, " ");
// },
// getIconClass: function(message) {
// var notifyType = message.get("type");
// if (notifyType === "Message") {
// return "green comment outline icon"
// } else if (notifyType === "Announce") {
// return "brown announcement icon"
// }
// return "blue alarm outline icon";
// },
// openDetail: function(message) {
// var notifyType = message.get("type");
// if (notifyType === "Message") {
// model.action("openPage")({
// id: "message_" + message.get("group"),
// name: "私信详情",
// path: "chat/" + message.get("group")
//
// });
// } else if (notifyType === "Announce") {
// model.action("openPage")({
// id: "announce_" + message.get("id"),
// name: "公告详情",
// path: "announce/detail/" + message.get("id")
// });
// }
//
// }
// });
//
// errorCount = 0;
// longPollingTimeOut = null;
// window.refreshMessage = function() {
// var options;
// options = {};
// if (longPollingTimeOut) {
// clearTimeout(longPollingTimeOut);
// }
// if (longPollingTimeout) {
// options.timeout = longPollingTimeout;
// }
// return $.ajax(service.messagePull, options).done(function(messages) {
// model.set("messages", messages);
// var messageTotal = messages.length;
// model.set("messageTotal", messageTotal);
// if (messageTotal > 0) {
// $("#messageTotal").css("display", "inline-block").text(messageTotal > 100 ?
// "99+" : messageTotal);
// } else {
// $("#messageTotal").css("display", "none");
// }
//
// if (liveMessage) {
// return longPollingTimeOut = setTimeout(refreshMessage, longPollingInterval);
// }
// }).error(function(xhr, status, ex) {
// if (liveMessage) {
// if (status === "timeout") {
// return longPollingTimeOut = setTimeout(refreshMessage, longPollingInterval);
// } else {
// errorCount++;
// return longPollingTimeOut = setTimeout(refreshMessage, 5000 * Math.pow(2,
// Math.min(6, errorCount - 1)));
// }
// }
// });
// };
// if (!messageDisabled) {
// longPollingTimeOut = setTimeout(refreshMessage, 1000);
// refreshMessage();
// }
//
// window.openPage = model.action("openPage");
//        
// window.refreshPage = model.action("refreshPage");
//
// window.expandAndOpenPage = model.action("expandAndOpenPage");
//
// window.refreshSkin = refreshSkin;
// });
//
// }).call(this);
