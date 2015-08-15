$(document).ready(function() {
	var players = {};
	function formatWeekName(el) {
		var week;
		return $(el).prop('class').replace('ism', '');
	}
	var players = (function() {
		var players = {},
			weeks = {},
			tables, type, player;
		
		//Grab all tables on a page
		tables = $('table');

		$('.prem-players > .ism').each(function(i, week) {
			if(typeof players[formatWeekName(week)] === 'undefined') {
				weeks[formatWeekName(week)] = addPlayers($(week).find('table'));
			}
		});

		return weeks;
	})();

	console.log(players);

	function addPlayers(tables) {
		tables.each(function(i, el) {
			if($(el).hasClass('ismPrintTable')) {
				//Get the type of player heading
				type = $(el).closest('div.ismLine').prev('h2').text().toLowerCase();
				if(typeof players[type] === 'undefined') {
					players[type] = [];
				}
			}

			//Get all players in this table
			$(el).find('tbody tr').each(function(sI, sEl) {
				if($(sEl).children('td:nth-child(3)').text() != 0) {
					players[type][players[type].length + 1] = new Player(sEl);
				}
			});
		});
		return players;
	}
	//Player class
	function Player(el) {
		this.name = null;
		this.team = null;
		this.points = null;
		this.cost = null;
		this.val = null;

		if(typeof el !== 'undefined') {
			this.name = $(el).find('td:nth-child(1)').text();
			this.team = $(el).find('td:nth-child(2)').text();
			this.points = $(el).find('td:nth-child(3)').text();
			this.cost = $(el).find('td:nth-child(4)').text().replace(/\D/, '');
		}

		this.val = round(this.points / this.cost);
	}
	Player.prototype.get = function(prop) {
		if(typeof this.prop !== 'undefined') {
			return this[prop];
		}
		else {
			return 'unknown property '+prop;
		}
	}
	function displayPlayerOption(player) {
		console.log('displaying', player);
	}
	function playerSearch(position, query) {
		if(isNaN(parseFloat(query))) {
			return position.filter(function(pl) {
				if(pl.name.toLowerCase().indexOf(query) > -1 || 
							pl.team.toLowerCase().indexOf(query) > -1) {
					return true;
				}
			});
		}
		else {
			//Search for minimum score or points
			query = parseFloat(query);
			return position.filter(function(pl) {
				if(query < 14) {
					//Assumed cost
					if(pl.cost <= query) {
						return true;
					}
				}
				else {
					//Assumed points
					if(pl.points <= query) {
						return true;
					}
				}
			});
		}
	}
	function keyUpOnInput(e) {
		if((e.keyCode > 45 && e.keyCode < 91) || (e.keyCode >= 8 && e.keyCode <= 13)) {
			console.log('pos', $(this).prop('id'), 'query', $(this).val().toLowerCase());
			var position = players[$(this).prop('id')],
				query = $(this).val().toLowerCase();
			curPlayers = playerSearch(position, query);

			if(curPlayers.length > 0) {
				displayPlayers($(this).prop('id'), curPlayers);
			}
		}
	}
	function displayPlayers(position, players) {
		//Empty the associated player container
		$('div.'+position.slice(0,1)).children('.player').remove();
		$.each(players, function(i, el) {
			$('div.'+position.slice(0,1)).append(playerToDom(el, 'player'));
		});
	}
	function playerToDom(player, divClass) {
		if(typeof divClass === 'undefined') divClass = '';

		var playerCon = $(document.createElement('div')).addClass(divClass)
						.append($(document.createElement('span')).text(player.name).addClass('long'))
						.append($(document.createElement('span')).text(player.team).addClass('long'))
						.append($(document.createElement('span')).text(player.points))
						.append($(document.createElement('span')).text(player.cost))
						.append($(document.createElement('span')).text(player.val));

		return playerCon;
	}
	function round(n) {    
    return +(Math.round(n + "e+2")  + "e-2");
	}
	function selectReplacement() {
		var selection = {
			name: $(this).children(':nth-child(1)').text(),
			team: $(this).children(':nth-child(2)').text(),
			points: $(this).children(':nth-child(3)').text(),
			cost: $(this).children(':nth-child(4)').text(),
			val: $(this).children(':nth-child(5)').text()
		};

		$(this).siblings('.replacement').replaceWith(playerToDom(selection, 'replacement'));
		$(this).siblings('.replacement').prepend(
			$(document.createElement('h2')).text('Replacement Player'),
			$(document.createElement('span')).text('x').addClass('clear-selection')).addClass('show');

		calculateVORP($(this).siblings('label').text().toLowerCase());
	}
	function clearSelectedReplacement() {
		$(this).closest('div').siblings('.player-suggestion').remove();
		$(this).closest('div').html('').removeClass('show');
	}
	function calculateVORP(position) {
		if(!$('div.'+position.slice(0,1)+' div.replacement').hasClass('show')) return;

		var repCon = $('div.'+position.slice(0,1)+' div.replacement'),
			repPlayer = {
				name: repCon.children(':nth-child(3)').text(),
				team: repCon.children(':nth-child(4)').text(),
				points: parseInt(repCon.children(':nth-child(5)').text()),
				cost: parseFloat(repCon.children(':nth-child(6)').text()),
				val: parseFloat(repCon.children(':nth-child(7)').text())
			},
			top5 = [];

		console.log('rep', repPlayer, 'is a', position, 'in', players[position]);

		//Get the top five choices within 1 mill
		players[position].forEach(function(pl) {
			if(parseFloat(pl.cost) >= repPlayer.cost - 1 && parseFloat(pl.cost) <= repPlayer.cost + 1) {
				if(top5.length < 5) {
					top5.push(pl);
				}
				else {
					//Check if this player has a higher plus val than one of the current top 5
					var betterThan = [];
					top5.forEach(function(el, i) {
						if(parseFloat(pl.val) > parseFloat(el.val)) betterThan.push(i);
					});

					if(betterThan.length > 0) {
						//Get the worst of the top 5 players this one is better than
						var worst = betterThan.reduce(function(p, c) {
							return parseFloat(top5[p].val) < parseFloat(top5[c].val) ? p : c;
						}, betterThan[0]);
						top5[worst] = pl;
					}
				}
			}
		});

		displayTop5(top5, position);
	}
	function displayTop5(players, position) {
		$('.player-suggestion').remove();

		var repCon = $('div.'+position.slice(0,1)+' div.replacement');

		players.sort(function(a,b) {
			console.log('comparing', a.val, b.val, a.val < b.val);
			return a.val < b.val ? -1 : 1;
		}).forEach(function(pl) {
			repCon.after(playerToDom(pl, 'player player-suggestion'));
		});

		repCon.after($(document.createElement('h2')).text('Suggestions').addClass('player player-suggestion'));
	}

	//Player search
	$('body').on('keyup', '.suggestions > div > input', keyUpOnInput);
	//Select replacement player
	$('body').on('click', 'div.player', selectReplacement);
	//Clear replacement player
	$('body').on('click', '.clear-selection', clearSelectedReplacement);
});