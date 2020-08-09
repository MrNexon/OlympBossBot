var speed_time = 240000; //240000;
var work_status = false;
function game_reset() {
	start_bet = +$('.TextField-module-itemInputWrapper-ErE').children('[data-test="deal-amount-input"]')[0].value.replace(/ /g, ''); // Размер ставки.
	bet = start_bet; 
	bet_time = +$('.TextField-module-itemInputWrapper-ErE').children('[data-test="deal-duration-input"]')[0].value.replace(/[^\d]/g, ''); // Время ставки в минутах.
	min_profit_percent = 60; //60; //Если процент профита ниже, чем это число, то не ставить ставки.
	bet_click_delay = 0; //Задержка перед ставкой, после скачка. НЕ МЕНЯТЬ!!!
	more = 1; // Умножение при проигрыше.
	randomize = 0; //Рандомизатор
	distance = 0.1; // Размер скачка валюты, на который надо реагировать.
	check_delay = 0; // Время проверки курса валюты в миллисекундах. НЕ МЕНЯТЬ!!!
	dynamic_distance = 1; // 1 - Каждые 5 минут меняем дистанцию на ту, которая была максимальной за это время. 0 - выключено.
	dynamic_distance_x = 1.15; //1.15; // На сколько умножать максимальную дистанцию, которую мы будем вставлять в максимальную.
	dynamic_distance_plus = 0;
	last_max_distances = 4; // Сколько последних максимальных дистанций отображать в истории.
	allow_pause = 1; //Если 1, то скрипт будет делать ставки только если нет активных ставок на данный момент.
	check_active_bet = 5000; // НЕ МЕНЯТЬ !!!
	after_bet_pause = 10000; // Пауза после закрытия ставки продолжается ... миллисекунд.
	pause_check_count = 60000 / check_active_bet;
	wins = 0; 
	loses = 0; 
	refunds = 0;
	max_win = 0; 
	max_lose = 0;
	maxw_count = 0;
	maxl_count = 0;
	bets_count = 0;
	all_bets_count = 0;
	loses_for_dist = 0;
	wins_for_dist = 0;
	bid = 0;
	prev_bid = 0;
	bo_bid = 0;
	mess = '';
	bid_side = '';
	game_profit = 0;
	current_distance = 0;
	max_distance = 0;
	md_array = [];
	md_array_console = [];
	start_time = 0;
	bet_pause = 0;
	check_count = 0;
	btn_up = $('button[data-test="deal-button-up"]')[0];
	btn_down = $('button[data-test="deal-button-down"]')[0];
	random_play = randomInteger(1, 4);
	random_count = 0;
	random_allow = 0;
	random_pause = 0;
	get_pair();
}

function get_pair() {
	if (dynamic_distance > 0) {
		distance = 99999; // НЕ МЕНЯТЬ !!!
	}
	$('button.btn-to-right')[0].click();
	history_pair = $('.pair-assets-select-title')[0].innerText;
	
	pair_label = {"Ripple":"XRPUSD","Ethereum":"ETHUSD","Ethereum Classic":"ETCUSD","Bitcoin":"BTCUSD","Litecoin":"LTCUSD"};
	current_pair = pair_label[history_pair];
	start_balance = +$('.lay-balance-amount__digits')[0].innerText.replace(' ','');
	/*if ($('#tab-user-deals-history tbody tr:contains('+history_pair+'):not(:contains("'+history_pair+' ")):first')[0]) {
		last_bet_date = $('#tab-user-deals-history tbody tr:contains('+history_pair+'):not(:contains("'+history_pair+' ")):first').find($('td.user-deals-table__cell_id span'))[0].innerText;
	} else {
		last_bet_date = '';
	}*/
	history_distance();
	if (check_bets_activity) {
		clearInterval(check_bets_activity);
		check_bets_activity = setInterval(history_distance, speed_time);
	}
	/*if (bet_end_check_timer) {
		clearInterval(bet_end_check_timer);
		bet_end_check_timer = setInterval(bet_end_check, 1000);
	}*/
}	

function start_data() {
	game_reset();
	game_check();
	workStatusUI();
}

function init() {
	if (typeof $('.card_history')[0] === 'undefined') 
		$('.sidebar-menu-vertical__item').children('[data-test="sidebar-btn-trading-bar"]')[0].click();
	drawUI();
	console.log("Консольку можно закрывать))");
}

function drawUI() {
	$.get("https://raw.githubusercontent.com/MrNexon/OlympBossBot/master/ControllButtons.html")
	.done(function (data) {
		$(data).insertAfter($('.deal-form-alpha__block_no-padding'));
	});
	$.get("https://raw.githubusercontent.com/MrNexon/OlympBossBot/master/InfoBlock.html")
	.done(function (data) {
		$(data).insertAfter($('.chart-status'));
	});
}

function resetUI() {
	$.get("https://raw.githubusercontent.com/MrNexon/OlympBossBot/master/InfoBlock.html")
	.done(function (data) {
		$('.ob_card').remove();
		$(data).insertAfter($('.chart-status'));
	});
}

function workStatusUI() {
	if (typeof $('.ob_status')[0] === 'undefined') return;
	if (work_status) {
		try {
			if (bet_pause < 1 && !(temp < min_profit_percent|| temp1 < min_profit_percent)) {
				$('.ob_status_dot').css('background', '#1fbf75');
				$('.ob_status')[0].innerText = "Статус: Работает";
			}
		} catch {
			$('.ob_status_dot').css('background', '#1fbf75');
			$('.ob_status')[0].innerText = "Статус: Работает";
		}
		
	} else {
		$('.ob_status_dot').css('background', 'red');
		$('.ob_status')[0].innerText = "Статус: Выключен";
	}
}

function updateUI() {
	if (typeof $('.ob_header')[0] === 'undefined') return;
	$('.ob_md_data').remove();

	$('.ob_time')[0].innerText = 			'TIME: '+(performance.now() - start_time).toFixed(1)+' ms';
	$('.ob_binance_ping')[0].innerText = 	'BINANCE PING: '+generation+' ms';
	$('.ob_pair')[0].innerText = 			'PAIR: '+current_pair+' from BINANCE';
	$('.ob_bet_time')[0].innerText = 		'BET: $'+bet+' | BET TIME: '+bet_time+' Min';
	$('.ob_min_percent')[0].innerText = 	'MIN PROFIT PERCENT: '+min_profit_percent+'%';
	$('.ob_bid')[0].innerText = 			'BID: '+prev_bid+' -> '+bid;
	$('.ob_distance')[0].innerText = 		'DISTANCE: '+distance+' | NOW: '+current_distance + ' ('+bid_side+')';
	$('.ob_max_distance')[0].innerText = 	'MAX DISTANCE: '+max_distance+' x '+(dynamic_distance_x+dynamic_distance_plus).toFixed(2)+' ('+dynamic_distance_x+')';

	for (var key in md_array_console) {
		$('<span class="ob_md_data" style="margin-left: 10px;">'+md_array_console[key]+'</span>').insertBefore($('.ob_bets'));
	}

	$('.ob_bets')[0].innerText = 			'BETS: '+bets_count+' | '+all_bets_count;
	$('.ob_stat')[0].innerText = 			'WINS|LOSES: '+wins+' | '+loses;
	$('.ob_max_stat')[0].innerText = 		'MAX WIN: '+max_win.toFixed(2)+' | MAX LOSE: '+max_lose.toFixed(2)
	$('.ob_profit')[0].innerText = 			'PROFIT: $'+game_profit.toFixed(2);

	if (bet_pause > 0) {
		$('.ob_status_dot').css('background', 'yellow');
		$('.ob_status')[0].innerText = "Статус: Нажата клавиша "+bet_pause_side+" - Ожидание";
	} 

	if (temp < min_profit_percent|| temp1 < min_profit_percent) {
		$('.ob_status_dot').css('background', 'yellow');
		$('.ob_status')[0].innerText = "Статус: Низкий процент профита: "+temp1;
	}
}

function errorUI() {
	$('.ob_status_dot').css('background', 'red');
	$('.ob_status')[0].innerText = "Статус: Ошибка (См. подробности в консоли)";
}

function randomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function game_check() {
	if (!work_status) return;
	fetch('http://127.0.0.1/currency/'+current_pair.toLowerCase())
	//fetch('https://pocketoption.ml/binance.php?currency='+current_pair.toLowerCase())
	.then(function (response) {
		response.json().then(function (data) {
			generation = +data.generation;
			generation_status = data.status;
			if (generation_status == 'ok') {
				if ($('.TextField-module-itemInputWrapper-ErE').children('[data-test="deal-duration-input"]')[0].value.replace(/[^\d]/g, '')) {
					bet_time = +$('.TextField-module-itemInputWrapper-ErE').children('[data-test="deal-duration-input"]')[0].value.replace(/[^\d]/g, '');
				} else {
					bet_time = 0;
				}
				if (bet_time == 1) {
					temp_history_pair = $('.pair-assets-select-title')[0].innerText;
					temp = parseFloat( $(".pair-assets-select-label").eq(0).text() );
					temp1 = parseFloat( $(".pair-assets-select-label").eq(0).text() );
					temp_min_profit_percent = +$(".pair-assets-select-label")[0].innerText.slice(0,-1);
					if (temp_history_pair != history_pair) {
						game_reset();
						mess = 'Сменилась валютная пара, обнуляем статистику.';
						on_error(mess);
					} else {
						mess = '';
						prev_bid = bid;
						bo_bid = +$('text.pin_text')[0].innerHTML;
						prev_bid = bo_bid;
						bid = +data.bids[0][0];
						game_log();
					}
				} else {
					mess = 'Время ставки - '+bet_time+' (минут). Смените длительность экспирации до 1ой минуты.';
					on_error(mess);
				}
			} else {
				mess = 'Binance не показывает цену '+current_pair+', возможно её сокращение другое, либо она не поддерживается.';
				on_error(mess);
			}
		}).catch(function() {
			mess = "Хз, такое редко";
			on_error(mess);
		})
	}).catch(function() {
		mess = "Не запущен сервер XAMPP";
		on_error(mess);
	})
}

function on_error(mess){ 
	bid = 0; 
	prev_bid = 0;
	bo_bid = 0;
	console.clear();
	console.log('ОШИБКА: ',mess);
	setTimeout(game_check, 2000)
}

function game_log() {
	current_balance = +$('.lay-balance-amount__digits')[0].innerText.replace(' ','');
	game_profit = +(current_balance - start_balance).toFixed(2);
	if ((prev_bid > 0) && (bid > 0)) {
		if (bid > prev_bid) {
			bid_side = 'up';
		} else if (bid < prev_bid) {
			bid_side = 'down';
		} else {
			bid_side = '';
		}
		current_distance = Math.abs((bid-prev_bid).toFixed(5));
		if (current_distance > max_distance) {
			max_distance = current_distance;
		}
		if (current_distance >= distance) {
			if (random_pause == 0) {
				if (randomize > 0) {
					random_pause = 1;
					setTimeout('random_pause = 0', randomInteger(40000, 90000));
					random_count++;
					if (random_count == random_play) {
						random_count = 0;
						if (random_allow > 0) {
							random_allow = 0;
							random_play = randomInteger(1, 3); //Пропусков
						} else {
							random_allow = 1;
							random_play = randomInteger(2, 5); //Ставок
						}
					}
				} else {
					random_allow = 1;
				}
				if (random_allow > 0) {
					if (check_count > 0) {
						check_count = 0;
						if ((((bid-prev_bid) >= distance) || ((prev_bid-bid) >= distance))&& (bet_pause == 0) && (temp >= min_profit_percent)||(temp1 >=min_profit_percent) && (bet_pause == 0)) {
							temp_bets_count = bets_count;
							bet_pause = 1;
							if ((bid-prev_bid) >= distance) {
								btn_up.click();
								bet_pause_side = 'выше';
							}
							if ((prev_bid-bid) >= distance) {
								btn_down.click();
								bet_pause_side = 'ниже';
							}

							bets_count++;
							//if (randomize > 0) {
								setTimeout('bet_pause = 0; check_count = 0; limit_check()',60000+after_bet_pause);
							//} else {
								//setTimeout('bet_pause = 0; check_count = 0; limit_check()',randomInteger(60000+after_bet_pause, 90000));
							//}
						}
					} else {
						check_count++;
					}
				} else {
					check_count = 0;
				}
			}
		}
	}
	/*console.clear();
	console.log(
		'TIME:',+(performance.now() - start_time).toFixed(1),'(ms)',
		'\nBINANCE PING:',generation,'(ms)',
		'\nPAIR:',current_pair,'from BINANCE',
		'\nBET:',bet,'(USD) | BET TIME:',bet_time,'(m)',
		'\nMIN PROFIT PERCENT:',min_profit_percent,'(%)',
		'\nBID:',prev_bid,'->',bid,
		'\nDISTANCE:',distance,'| NOW:',current_distance,bid_side,
		'\nMAX DISTANCE:',max_distance,'x',+(dynamic_distance_x+dynamic_distance_plus).toFixed(2),'('+dynamic_distance_x+')',
		'\nMDs:','\n '+md_array_console.join('\n '),
		'\nBETS:',bets_count,'|',all_bets_count,
		'\nWINS | LOSES:',wins,'|',loses,
		'\nMAX WIN:',max_win.toFixed(2),'| MAX LOSE:',max_lose.toFixed(2),
		'\nPROFIT:',game_profit.toFixed(2),'(USD)',
		'\nRANDOM:',randomize,
		'\nПРОЦЕНТ:',temp1,
	);*/
	updateUI();
	workStatusUI();
	/*if (bet_pause > 0) {
		console.log('%cCLICKED "'+bet_pause_side+'" - PAUSE','padding: 2px 5px; background: red; color: white;');
	}*/
	/*if (temp < min_profit_percent|| temp1 < min_profit_percent)  {
		console.log('%cLOW PROFIT PERCENT : '+temp1+'%','padding: 2px 5px; background: red; color: white;');
	}*/
	start_time = performance.now();
	setTimeout(game_check, check_delay);
}

function limit_check() {
	/*if (temp_bets_count == bets_count) {
		all_bets_count++
	}*/
	bet_end_check();
}

function bet_end_check() {
	for (var i = 0; i < 2; i++) {
		var card = $('.card_history')[i];
		var header = $(card).children('.card__header')[0];
		var row = $(header).children()[0];

		if (history_pair.toLowerCase() !== row.innerText.toLowerCase()) continue;

		var amount_row = $(header).children()[2];
		var amount_result = $(amount_row).children('.card__amount')[0];
		var result = amount_result.innerText;

		var res_side = result.match(/[\- \+]/g)[0];
		var res_amount = +result.match(/\d+\.\d*/g)[0];

		switch (res_side) {
			case '+':
				wins++;
				if (res_amount > max_win) max_win = res_amount;
				break;
			case '-':
				loses++;
				if (res_amount > max_lose) max_lose = res_amount;
				break;
		}

		all_bets_count++;
		bets_count--;
		break;
	}
	
}

function history_distance() {
	$('button.btn-to-right')[0].click();
	bet = +$('.TextField-module-itemInputWrapper-ErE').children('[data-test="deal-amount-input"]')[0].value.replace(/ /g, '');
	hist_time = new Date();
	hist_hours = hist_time.getHours();
	hist_min = hist_time.getMinutes();
	if (hist_min < 10) {
		hist_min = '0'+hist_min;
	}
	hist_time = hist_hours+':'+hist_min;
	if (md_array.length != 0) {
		if ((prev_bid > 0) && (bid > 0)) {
			md_array[md_array.length] = {"time":hist_time,"max_distance":max_distance};
		} else {
			md_array[md_array.length] = {"time":hist_time,"max_distance":md_array[md_array.length-1].max_distance};
		}
	} else {
		md_array[md_array.length] = {"time":hist_time,"max_distance":"START"};
	}
	md_array_console[md_array_console.length] = md_array[md_array.length-1].time+' - '+md_array[md_array.length-1]	.max_distance;
	if (md_array.length > last_max_distances) {
		md_array.splice(0, 1);
		md_array_console.splice(0, 1);
	}
	if ((dynamic_distance > 0) && (md_array.length > 1)) {
		if (max_distance > 0) {
			distance = (+(dynamic_distance_x + dynamic_distance_plus).toFixed(2) * max_distance).toFixed(5);
		} else {
			distance = 99999;
		}
	}
	max_distance = 0;
}

function onStart() {
	if (work_status) return;
	Date.prototype.format = function(format = 'yyyy-mm-dd') {
	    const replaces = {
	        yyyy: this.getFullYear(),
	        mm: ('0'+(this.getMonth() + 1)).slice(-2),
	        dd: ('0'+this.getDate()).slice(-2),
	        hh: ('0'+this.getHours()).slice(-2),
	        MM: ('0'+this.getMinutes()).slice(-2),
	        ss: ('0'+this.getSeconds()).slice(-2)
	    };
	    let result = format;
	    for(const replace in replaces){
	        result = result.replace(replace,replaces[replace]);
	    }
	    return result;
	};

	$('.ob_start_time')[0].innerText = "START TIME: " + new Date().format('dd.mm.yyyy hh:MM:ss');
	work_status = true;
	start_data();
}

function onStop() {
	if (!work_status) return;
	work_status = false;
	setTimeout(resetUI, 1000);
}

function first_init() {
	//console.log(speed_time);
	check_bets_activity = setInterval(history_distance, speed_time);
	//bet_end_check_timer = setInterval(bet_end_check, speed_time);
	setTimeout(init, 2000);

	var jq = document.createElement('script');
	jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
	document.getElementsByTagName('head')[0].appendChild(jq);
}
