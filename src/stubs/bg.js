function validateEmail(emailText)
{
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	return reg.test(emailText);
}

function handleSubmit() 
{
	// validate email
	var val = $("#inputEmail").val();
	if (validateEmail(val)) {
		
		$("#inputEmail").removeClass("invalidEmail");
	} else {
		$("#inputEmail").addClass("invalidEmail");
	}
}


var monitorWindow = (function() {
		var _w = window.innerWidth,
			_h = window.innerHeight,
			_mtd = [];
		function _register(canvas, cam, width, height) {
			_mtd.push( {
				obj: canvas,
				w: width,
				h: height,
				camera: cam
			});
		}
		window.addEventListener('resize', function() {
			var entry, jqObj, w, h, wr, hr,
			    nratio = window.innerWidth / window.innerHeight;
			for (var i = 0, e = _mtd.length; i < e; ++i) {
				entry = _mtd[i];
				jqObj = $(entry.obj.domElement);
				w = jqObj.width() * window.innerWidth / _w;
				h = jqObj.height() * window.innerHeight / _h;
				entry.obj.setSize(w, h);
				entry.camera.aspect = w / h;
				entry.camera.updateProjectionMatrix();
			}
			_w = window.innerWidth;
			_h = window.innerHeight;
		}, false);
		return {
			register: _register
		};
})();


var tourNav = (function() {
	var _objs = [],
	    _curIdx = 0;

	function scrollTo(targetId) {
		var pos = $("#" + targetId).scrollTop();
		$(window).animate({scrollY: pos}, {duration: 400});
	}

	function _setInactive(idx) {
		if (idx >= 0 && idx < _objs.length) {
			var o = _objs[idx].obj;
			o.hide();
			o.pulsate("destroy");	
		}
	}

	function _setActive(idx) {
		if (idx < _objs.length) {
			var o = _objs[idx].obj,
				params = _objs[idx].params,
				pulseArgs = (params && params.pulseArgs) ? params.pulseArgs : {glow: false, color: "#ccc"};
			o.show();
			o.pulsate(pulseArgs);
		}
	}

	function _add(id, param) {
		var o = $("#" + id),
			cb = (param) ? param.click : undefined,
			st = (param) ? param.scrollTarget : undefined;

		_objs.push({
			obj: $("#" + id),
			params: param
		});

		var idx = _objs.length - 1;
		o.click(function() {
			_setInactive(idx);
			_setActive(idx+1);
			if (st) { scrollTo(st); }
			if (cb) { setTimeout(cb, 0); }
		});

		o.hide();
	}

	function _start() {
		if (_objs.length > 0) {
			_setActive(_curIdx);
		}
	}

	return {
		add: function(id, params) { _add(id, params); return tourNav; },
		start: _start
	};
})();