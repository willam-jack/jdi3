﻿//初始化
function init() {
	//筛选
	new Filter('初始化', '加载').set();
	//初始化属性栏
	new Propertybar($("#propertybar")).init(false, null);
	//初始化工作区
	var $workspace = $("#workspace");
	$workspace.css({
		"width": $("#width").val(),
		"height": $("#height").val(),
		"background-color": $("#bgColor").val()
	});
	//初始化下拉列表
	new CommonService().getFile("/profile/category.json", function (result) {
		if (DataType.isObject(result)) {
			var data = result["子分类"].map(function (item) {
				return {name: item, value: item};
			});
			Common.fillRadio($("#model_resource_subCategory"), "model_resource_subCategory", data);
			//模板资源提交表单
			Common.fillSelect($('[name="template_category"]'), null, result["模板分类"], null, true);
			Common.fillRadio($("#template_subCategory"), "template_subCategory", data);
			//模型资源提交表单
			Common.fillSelect($('[name="model_category"]'), null, result["模型分类"], null, true);
			Common.fillSelect($('[name="model_userGrade"]'), null, result["模型用户级别"], null, true);
			Common.fillSelect($('[name="model_feature"]'), null, result["模型特性"], null, true);
		}
	});
	//右键菜单
	new ContextMenu().done(1, $workspace);
	// add at 2017/12/27
	$(".modal .modal-dialog .modal-content").draggable({handle: ".modal-header"});
}

//导航栏
function navbar() {
	//资源
	var resourceModal = new ResourceModal();
	resourceModal.create();
	resourceModal.open();
	
	//产品
	var productModal = new ProductModal();
	productModal.receive();
	productModal.open();
	
	//数据库定义
	var dbDefineModal = new DbDefineModal($("#dbDefineModal"));
	dbDefineModal.execute();
	dbDefineModal.bindEvents();
	
	//发布模型
	var publishModal = new PublishModal($("#publishModal"));
	publishModal.execute();
	publishModal.bindEvents();
	
	//工作区设置
	var workspaceModal = new WorkspaceModal($("#workspaceModal"));
	workspaceModal.execute();
	
	//数据库设计器
	var dbDesignerModal = new DbDesignerModal($("#dbDesignerModal"));
	dbDesignerModal.execute();
	
	//产品记录查看器
	var recordModal = new RecordModal($("#recordModal"));
	recordModal.execute();
	
	//插入函数
	var insertFnModal = new InsertFnModal($("#insertFunctionModal"));
	insertFnModal.execute();
	
	//保存
	(function save() {
		$("#save").click(function () {
			new Workspace().save(true);
		});
	})();
	
	//提交
	var submitModal = new SubmitModal($("#submitModal"), $("#submit"));
	submitModal.execute();
	submitModal.bindEvents();
	
	//删除
	(function remove() {
		$("#delete").click(function () {
			new Control().remove();
		});
	})();
	
	//重新调用模板
	(function recall() {
		$("#recall").click(function () {
			var $workspace = $("#workspace"),
				id = $workspace.attr("data-id"),
				name = $workspace.attr("data-name"),
				type = $workspace.attr("data-type"),
				subtype = $workspace.attr("data-subtype");
			if (id && type === "资源" && subtype === "模型") {
				var result = confirm("确定要重新调用模板吗？");
				if (!result) return;
				
				new ResourceService().recall(id, function (result) {
					Common.handleResult(result, function (data) {
						if (data !== id) return alert("调用失败！");
						
						//此处的relTemplate参数不需要的原因，data-relTemplate已经绑定
						new Workspace().load(id, name, "资源", "模型", null, null, null);
						new Main().open();
					});
				});
			}
		});
	})();
	
	//预览
	(function preview() {
		$("#preview").click(function () {
			var id = $("#workspace").attr("data-id");
			if (!id) return;
			
			var href = "http://36.33.216.13:3001/home/model?id=" + id + "&type=preview";
			$(this).attr("href", href);
		});
	})();
	
	//编号查看器
	$("#viewer").numViewer({
		$source: $("#workspace"),
		selector: ".workspace-node"
	});
}

//控件栏
function controlbar() {
	//draggable
	(function dragControl() {
		$("#controlbar .control-item:not([data-type='img'],[data-type='div'])").draggable({
			helper: function () {
				var type = $(this).data("type");
				return new Control().getControl(type);
			},
			cursorAt: {left: 0, top: 0}
		});
	})();
	
	//测试添加图片
	/*(function testAddImage() {
		$("#testbtn").click(function () {
			// jdi.fileApi.uploadToServer("123456").then(o=>console.log(o)).catch(err=>console.log(err));
			jdi.fileApi.downloadFromServer("123456").then(o=>console.log(o)).catch(err=>console.log(err))
			// jdi.saveImage({resourceId: $("#workspace").attr("data-id"), name: "123456.jpg"});
			//var name = jdi.saveFile({resourceId: $("#workspace").attr("data-id"), name: '1234.txt', content: '你好'});
		})
	})();*/
	
	//添加图片
	(function addImage() {
		$("#controlbar .control-item[data-type='img']").click(function () {
			$("#imgFile").click();
		});
		$("#imgFile").change(function () {
			var formData = new FormData($("#imgForm")[0]),
				id = $("#workspace").attr("data-id"),
				img = new Control().createNumber("img") + ".jpg";
			if (!id) return alert("无法上传没有编号的图片！");
			
			new CommonService().upload(id, img, formData, function (result) {
				Common.handleResult(result, function () {
					var control = new Control();
					control.setControl("img", function ($node) {
						var number = control.createNumber("img");
						$node.attr({
							"id": number,
							"name": number,
							"src": "/lib/" + id + "/res/" + img
						}).css({
							"left": "5px",
							"top": "5px"
						});
						new ContextMenu().done(1, $node);
						$("#workspace").append($node);
						new Property().setDefault(number);
					});
				});
			});
		});
	})();
	
	//添加子模块
	(function addChild() {
		$('#controlbar .control-item[data-type="div"]').click(function () {
			var arrs = [
				"channelmode=no",
				"directories=no",
				"location=no",
				"menubar=no",
				"resizable=yes",
				"scrollbars=no",
				"status=no",
				"titlebar=no",
				"toolbar=no",
				"width=1000px",
				"height=700px",
				"top=100px",
				"left=200px"
			];
			let editor = window.open("./editor.html", "_blank", arrs.join(", "));
			// timer = null,
			// html = null;
			// timer = setInterval(function(){
			//     if (editor.closed) {
			//         html = localStorage.cache
			//         back(html)
			//         clearInterval(timer)
			//    }
			// }, 500);
		});
	})();
}


//属性栏
function propertybar() {
	//保存属性
	(function () {
		var eventList = [
			{type: "input focusout blur", selector: "#propertybar :text"},
			{type: "change", selector: "#propertybar select"},
			{type: "click", selector: "#propertybar :checkbox"}
		];
		for (var i = 0; i < eventList.length; i++) {
			var item = eventList[i];
			(function (item) {
				$(document).on(item.type, item.selector, function (event) {
					var id = $("#property_id").val();
					if (id) {
						var $workspace = $("#workspace");
						new Property().save(id === "BODY" ? $workspace : $workspace.find("#" + id), $(event.target));
					}
					//2017/09/08优化
					if (this.id === "property_controlType" && event.type === "change") {
						AccessControl.executeControlType($(this).val());
					}
					//2017/09/27优化
					if (this.id === "property_db_isSave" && event.type === "click") {
						AccessControl.executeIsSave($(this).is(":checked"));
					}
				});
			})(item);
		}
	})();
	
	//表达式配置
	(function () {
		function buildArgs($expr, staticGlobal, dynamicGlobal, localFunction, remoteFunction, insertFunction) {
			var global = {};
			if (DataType.isObject(staticGlobal)) {
				for (var key in staticGlobal) {
					var value = staticGlobal[key];
					global[value + "(静态)"] = "GLOBAL." + key;
				}
			}
			if (DataType.isObject(dynamicGlobal)) {
				for (var id in dynamicGlobal) {
					var property = dynamicGlobal[id];
					//此处过滤规则待优化
					if (property.cname !== id) {
						global[property.cname + "(动态)"] = "GLOBAL." + id;
					}
				}
			}
			$expr.exprGenerator({
				$source: $("#workspace"),
				$result: $("#property_expression"),
				hasBrace: true,
				toolbar: [
					{title: "类型转换", type: "cast", data: {"数字": "数字", "字符": "字符"}, style: "cpanel-type"},
					{
						title: "算术运算符",
						type: "normal",
						data: {"+": "+", "-": "-", "*": "*", "/": "/"},
						style: "cpanel-operator"
					},
					{title: "全局变量", type: "normal", data: global, style: "cpanel-global"},
					{title: "本地函数", type: "local", data: localFunction, style: "cpanel-local"},
					{title: "远程函数", type: "remote", data: remoteFunction, style: "cpanel-remote"},
					{title: "插入函数", type: "insert", data: insertFunction, style: "cpanel-insert"},
				],
				onSetProperty: function (expr) {
					var id = $("#property_id").val();
					if (id) {
						new Property().setValue(id, "expression", expr);
					}
				},
				onClearProperty: function () {
					var id = $("#property_id").val();
					if (id) {
						new Property().remove(id, "expression");
					}
				}
			});
		}
		
		$(document).on("click", "#propertybar .btn-expr", function () {
			var $expr = $(this),
				commonService = new CommonService();
			$.when(commonService.getAjax("/newapi/getprozz"),
				commonService.getAjax("/profile/global.json"),
				commonService.getAjax("/profile/local_function.json"),
				commonService.getAjax("/profile/remote_function.json"),
				commonService.getAjax("/profile/insert_function.json")).done(function (result1, result2, result3, result4, result5) {
				if (!result1 || !result2 || !result3 || !result4 || !result5) return;
				
				var data1 = result1[0],
					data2 = result2[0],
					data3 = result3[0],
					data4 = result4[0],
					data5 = result5[0];
				if (!data1 || !data2 || !data3 || !data4 || !data5) return;
				
				var globalId = data1.status === 0 ? (data1.result ? data1.result.id : null) : null,
					staticGlobal = data2,
					localFunction = data3,
					remoteFunction = data4,
					insertFunction = data5;
				
				// 关闭插入函数弹窗
				$("#insertFunctionArgsModal .close").trigger('click')
				
				if (globalId) {
					commonService.getFile("/publish/" + globalId + "/property.json", function (dynamicGlobal) {
						buildArgs($expr, staticGlobal, dynamicGlobal, localFunction, remoteFunction, insertFunction);
					});
				} else {
					buildArgs($expr, staticGlobal, null, localFunction, remoteFunction, insertFunction);
				}
			}).fail(function (err) {
				console.log(err);
				alert("表达式生成器参数数据生成失败！");
			});
		});
	})();
	
	//静态数据源配置
	var staticDSModal = new StaticDataSourceModal($("#dataSource_static_modal"), $("#property_dataSource_static"));
	staticDSModal.execute();
	
	//数据库数据源配置
	var dbDSModal = new DbDataSourceModal($("#dataSource_db_modal"), $("#property_dataSource_db"));
	dbDSModal.execute();
	
	//触发配置
	var eventsModal = new EventsModal($("#events_modal"), $("#property_events"));
	eventsModal.execute();
	eventsModal.bindEvents();
	
	//数据库查询
	var dbQueryModal = new DbQueryModal($("#query_db_modal"), $("#property_query_db"));
	dbQueryModal.execute();
	
	//存档路径
	var archivePathModal = new ArchivePathModal($("#archivePath_modal"), $("#property_archivePath"));
	archivePathModal.execute();
	archivePathModal.bindEvents();
}

//工作区
function workspace() {
	new KeyEvent()
	//绘制标尺
	new Ruler().drawCoordinates()
	var $workspace = $("#workspace");
	
	//droppable
	$workspace.droppable({
		accept: ".control-item",
		drop: function (event, ui) {
			var type = ui.helper.data("type"),
				control = new Control();
			control.setControl(type, function ($node) {
				var number = control.createNumber(type),
					offset = $workspace.offset();
				$node.attr({
					"id": number,
					"name": number
				}).css({
					"left": event.pageX - offset.left,
					"top": event.pageY - offset.top
				});
				$workspace.append($node);
				new Property().setDefault(number);
			});
		}
	});
	
	//selectable
	$workspace.selectable({
		filter: ".workspace-node",
		delay: 50,
		// selected: function () {},//巨坑注意：此事件会被调用多次
		stop: function (event, ui) {
			if (!event.ctrlKey) {
				$workspace.find(".workspace-node").jresizable("destroy");
			}
			$workspace.find(".ui-selected").jresizable({
				mode: "region",
				$container: $("#workspace"),
				color: "#739fef",
				onStart: function () {
					$workspace.selectable("disable");
				},
				onStop: function () {
					$workspace.selectable("enable");
				}
			});
			new Property().clearDOM();
		}
	});
	
	//jresizable
	$workspace.on("click", ".workspace-node", function (event) {
		$("#delete").css('color','red')
		event.stopPropagation();
		$(this).jresizable({
			mode: "single",
			multi: event.ctrlKey,
			$container: $("#workspace"),
			color: "#739fef",
			onStart: function () {
				$workspace.selectable("disable");
			},
			onStop: function () {
				$workspace.selectable("enable");
			}
		});
		$workspace.find(".ui-selected").removeClass("ui-selected");
		if (event.ctrlKey) {
			new Property().clearDOM();
		}
	});
	
	//加载属性
	$workspace.on("click", '.workspace-node[data-type!="div"],.workspace-node[data-type="div"] :input', function (event) {
		if (!event.ctrlKey) {
			event.stopPropagation();
			new Property().load($(event.target));
		}
	});
	
	//清除样式
	$workspace.on("click", function (event) {
		$("#delete").css('color','white')
		var $target = $(event.target);
		if (!$target.is(".workspace-node")) {
			$workspace.find(".ui-selected").removeClass("ui-selected");
			new Property().clearDOM();
			$workspace.find(".workspace-node").jresizable("destroy");
		}
		$(".jcontextmenu:visible").hide();
	});
	
	//清除右键菜单
	$("#designer").on("click", function () {
		$(".jcontextmenu:visible").hide();
    });
}

//回调函数
function back(html) {
	var control = new Control(),
		contextMenu = new ContextMenu();
	control.setControl("div", function ($node) {
		var number = control.createNumber("div");
		$node.append(html).attr({
			"id": number,
			"name": number
		}).css({
			"left": "5px",
			"top": ($(window).scrollTop() + 5) + "px"
		});
		$("#workspace").append($node);
		contextMenu.done(2, $node);


        // 调整工作区的大小
        $node.height() > $("#workspace").height() && $("#workspace").height(Math.ceil($node.height()));
        $node.width() > $("#workspace").width() && $("#workspace").width(Math.ceil($node.width()));
		$node.find(":input").each(function () {
			var childNumber = control.createNumber("child");
			$(this).attr({
				"id": childNumber,
				"name": childNumber
			});
			new Property().setDefault(childNumber);
		});
		contextMenu.done(3, $node.find(":input"));
	});
}

$(document).ready(function () {
	init();
	navbar();
	controlbar();
	toolbar();
	propertybar();
	workspace();
	shortcut();
});