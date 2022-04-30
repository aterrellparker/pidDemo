/*
 A simple demo of a PID control loop I created to demonstrate the concept to my co-workers.
 Copyright (C) 2015  Eliott Wiener

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function () {
	"use strict";

	// default parameter values
	var proportionalGain = .15;
	var integralGain = 0;
	var derivativeGain = 0.3;
	var controlFrequency = 15;

	var ctx;
	var cnvs;

	var cnvs_size = function (dim) {
		return {
			'x': cnvs.width,
			'y': cnvs.height,
		};
	}

	// helper for calling lineTo, moveTo, etc in flipped dimensions
	var xy_call = function (f, dim, x, y) {
		if (dim === 'x') {
			f(x, y);
		} else {
			f(y, x);
		}
	};

	var setPoint, mouse, ballPos, ballVelo, ballAccel, error, lastError, integral, pastErrorCount, pastErrors;

	var reset = function () {
		var middle = { 'x': cnvs_size()['x'] / 2, 'y': cnvs_size()['y'] / 2 };
		setPoint = copy_xy(middle);
		mouse = { 'x': cnvs_size()['x'] / 2 + 1, 'y': cnvs_size()['y'] / 2 };
		ballPos = copy_xy(middle);
		ballVelo = { 'x': -0.01, 'y': 0.01 };
		ballAccel = { 'x': 0, 'y': 0};
		error = { 'x': 0, 'y': 0 };
		lastError = { 'x': 0, 'y': 0 };
		integral = { 'x': 0, 'y': 0 };
		if (cnvs.width > cnvs.height) {
			pastErrorCount = cnvs.width;
		} else {
			pastErrorCount = cnvs.height;
		}
		pastErrors = [];
		for (var i = 0; i <= pastErrorCount; i++) {
			pastErrors.push({ 'x': 0, 'y': 0 });
		}
	}

	var update_mouse = function (e) {
		var x = 0;
		var y = 0;
		if (e.offsetX) {
			x = e.offsetX;
			y = e.offsetY;
		} else if (e.layerX) {
			x = e.layerX;
			y = e.layerY;
		}
		mouse = {
			'x': x,
			'y': y
		};
		mouseAngle();
	};
	var iHat = { 'x': 1, 'y': 0 };
	var jHat = { 'x': 0, 'y': 1 };
	var mag;
	var theta;
	var mouseAngle = function () {
		mag = Math.sqrt(setPoint['x'] * setPoint['x'] + setPoint['y'] * setPoint['y']);
		document.getElementById('magMouse').innerHTML = mag;
		theta = Math.acos(setPoint['x'] / mag) * 180/3.14;
		document.getElementById('thetaMouse').innerHTML = theta;

    };
	var update_touch = function (e) {
		e.preventDefault();
		var x = e.targetTouches[0].pageX - cnvs.offsetLeft;
		var y = e.targetTouches[0].pageY - cnvs.offsetTop;
		mouse = {
			'x': x,
			'y': y
		};
	}

	var copy_xy = function (v) {
		return {
			'x': v.x,
			'y': v.y
		};
	};

	var control_loop = function () {
		setPoint = copy_xy(mouse);
		['x', 'y'].forEach(function (dim) {
			document.getElementById('log' + dim).innerHTML = setPoint[dim];
			error[dim] = setPoint[dim] - ballPos[dim];		
			integral[dim] = integral[dim] + error[dim] * controlFrequency
			var derivative = (error[dim] - lastError[dim]) / controlFrequency
			var output = proportionalGain * error[dim]
			output += integralGain * integral[dim]
			output += derivativeGain * derivative
			lastError[dim] = error[dim];
			ballVelo[dim] = output;
		});

		// keep these for charting
		pastErrors.unshift(copy_xy(error));
		if (pastErrors.length > pastErrorCount) {
			pastErrors.pop();
		}

		setTimeout(control_loop, 1000 / controlFrequency);
	};

	var world_tick = function () {
		['x', 'y'].forEach(function (dim) {
			ballPos[dim] += ballVelo[dim];
			ballVelo[dim] += ballAccel[dim];
		});
	};

	var draw_chart = function (dim, color) {
		ctx.strokeStyle = color;
		ctx.beginPath();
		xy_call(function (a, b) { ctx.moveTo(a, b) }, dim, cnvs_size()[dim] / 2, 0);
		pastErrors.forEach(function (e, i) {
			xy_call(function (a, b) { ctx.lineTo(a, b) }, dim, cnvs_size()[dim] / 2 + e[dim], i);
		});
		ctx.stroke();
	}

	var draw = function () {
		ctx.clearRect(0, 0, cnvs.width, cnvs.height);
		ctx.font = "10px sans-serif";
		ctx.fillStyle = 'green';
		ctx.fillText("Time ↓", 5, 20);
		ctx.fillStyle = 'orange';
		ctx.fillText("Time →", 5, 10);
		draw_chart('x', 'green');
		draw_chart('y', 'orange');

		

		ctx.beginPath();
		ctx.arc(ballPos.x, ballPos.y, 20, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.stroke();

		
	};

	var main_loop = function () {
		world_tick();
		draw();
		window.requestAnimationFrame(main_loop);
	}

	var update_vars = function () {
		if (window.controls.checkValidity()) {
			proportionalGain = window.proportional_box.value;
			integralGain = window.integral_box.value;
			derivativeGain = window.derivative_box.value;
			controlFrequency = window.frequency_box.value;
			if (controlFrequency > 30) {
				controlFrequency = 30;
				window.frequency_box.value = 30;
			}
			reset();
		}
	};

	var submit = function (e) {
		e.preventDefault()
		update_vars()
	}

	var winch = function () {
		cnvs.width = window.innerWidth;
		cnvs.height = window.innerHeight - window.controls.offsetHeight;
		update_vars();
	};

	window.onload = function () {
		window.proportional_box = document.getElementById('proportional_box');
		window.integral_box = document.getElementById('integral_box');
		window.derivative_box = document.getElementById('derivative_box');
		window.frequency_box = document.getElementById('frequency_box');
		window.controls = document.getElementById('controls');
		window.proportional_box.value = proportionalGain;
		window.integral_box.value = integralGain;
		window.derivative_box.value = derivativeGain;
		window.frequency_box.value = controlFrequency;
		cnvs = document.getElementById('cnvs');
		ctx = cnvs.getContext('2d');
		reset();
		cnvs.addEventListener('mousemove', update_mouse);
		cnvs.addEventListener('touchmove', update_touch);
		window.controls.addEventListener("submit", submit);
		window.addEventListener('resize', winch);
		winch();
		control_loop();
		main_loop();
	};

}).call(this);